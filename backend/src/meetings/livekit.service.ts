import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AccessToken,
  RoomServiceClient,
  ServerError,
} from 'livekit-server-sdk';

import {
  EMPTY_ROOM_TIMEOUT_SECONDS,
  MEETING_TOKEN_TTL,
} from './meeting-rules.js';

@Injectable()
export class LiveKitService {
  private rooms: RoomServiceClient | null = null;
  private websocketUrl: string | null = null;

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return this.readConfig() !== null;
  }

  url(): string {
    return this.client().url;
  }

  async participantIdentities(roomName: string): Promise<string[]> {
    const rooms = this.client().rooms;
    const existing = await rooms.listRooms([roomName]);

    if (!existing.some((room) => room.name === roomName)) {
      await rooms.createRoom({
        name: roomName,
        emptyTimeout: EMPTY_ROOM_TIMEOUT_SECONDS,
      });
      return [];
    }

    const participants = await rooms.listParticipants(roomName);
    return participants.map((participant) => participant.identity);
  }

  async deleteRoom(roomName: string): Promise<void> {
    try {
      await this.client().rooms.deleteRoom(roomName);
    } catch (error) {
      if (!isLiveKitNotFound(error)) {
        throw error;
      }
    }
  }

  async createToken(input: {
    room: string;
    identity: string;
    name: string;
  }): Promise<string> {
    const { apiKey, apiSecret } = this.client();
    const token = new AccessToken(apiKey, apiSecret, {
      identity: input.identity,
      name: input.name,
      ttl: MEETING_TOKEN_TTL,
    });

    token.addGrant({
      roomJoin: true,
      room: input.room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    return token.toJwt();
  }

  private client(): {
    rooms: RoomServiceClient;
    url: string;
    apiKey: string;
    apiSecret: string;
  } {
    const config = this.readConfig();

    if (!config) {
      throw new ServiceUnavailableException('livekit_not_configured');
    }

    if (!this.rooms || this.websocketUrl !== config.url) {
      this.rooms = new RoomServiceClient(
        config.url,
        config.apiKey,
        config.apiSecret,
      );
      this.websocketUrl = config.url;
    }

    return {
      rooms: this.rooms,
      url: config.url,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    };
  }

  private readConfig(): {
    url: string;
    apiKey: string;
    apiSecret: string;
  } | null {
    const url = this.configService.get<string>('LIVEKIT_URL');
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');

    if (!url || !apiKey || !apiSecret) {
      return null;
    }

    return { url, apiKey, apiSecret };
  }
}

function isLiveKitNotFound(error: unknown): boolean {
  return (
    error instanceof ServerError &&
    (error.status === 404 || error.code === 'not_found')
  );
}
