import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type {} from 'temporal-spec/global';

import { PrismaService } from '../prisma/prisma.service.js';
import { LiveKitService } from './livekit.service.js';
import {
  accountName,
  canIssueToken,
  createGuestIdentity,
  createMeetingId,
  isMeetingExpired,
  isMeetingId,
  meetingExpiresAt,
  userIdentity,
} from './meeting-rules.js';

const GUEST_NAME_MAX_LENGTH = 40;

function instantFromDate(date: Date): Temporal.Instant {
  return Temporal.Instant.fromEpochMilliseconds(date.getTime());
}

function dateFromInstant(instant: Temporal.Instant): Date {
  return new Date(instant.epochMilliseconds);
}

export type MeetingUser = {
  id: number;
  email: string;
  name: string | null;
  username: string | null;
};

@Injectable()
export class MeetingsService {
  private readonly logger = new Logger(MeetingsService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly livekit: LiveKitService,
    configService: ConfigService,
  ) {
    this.frontendUrl = configService
      .getOrThrow<string>('FRONTEND_URL')
      .replace(/\/$/, '');
  }

  async create(hostId: number) {
    const id = createMeetingId();
    const createdAt = new Date();
    const expiresAt = meetingExpiresAt(createdAt);

    await this.prisma.db.Meeting.create({
      id,
      hostId,
      createdAt: instantFromDate(createdAt),
      expiresAt: instantFromDate(expiresAt),
    });

    return {
      id,
      url: `${this.frontendUrl}/m/${id}`,
      expiresAt,
    };
  }

  async issueToken(input: {
    meetingId: string;
    user?: MeetingUser | null;
    displayName?: string;
  }) {
    const participant = this.participant(input.user, input.displayName);

    if (!isMeetingId(input.meetingId)) {
      throw new NotFoundException('meeting_not_found');
    }

    const meeting = await this.prisma.db.Meeting.first({
      id: input.meetingId,
    });

    if (!meeting) {
      throw new NotFoundException('meeting_not_found');
    }

    if (isMeetingExpired(dateFromInstant(meeting.expiresAt), new Date())) {
      await this.deleteMeeting(meeting.id);
      throw new NotFoundException('meeting_not_found');
    }

    const identities = await this.livekit.participantIdentities(meeting.id);

    if (!canIssueToken(identities, participant.identity)) {
      throw new ConflictException('meeting_full');
    }

    const token = await this.livekit.createToken({
      room: meeting.id,
      identity: participant.identity,
      name: participant.name,
    });

    return {
      token,
      livekitUrl: this.livekit.url(),
    };
  }

  async purgeExpired(now = new Date()) {
    const expired = await this.prisma.db.Meeting.where((meeting) =>
      meeting.expiresAt.lte(instantFromDate(now)),
    ).all();

    for (const meeting of expired) {
      try {
        await this.deleteMeeting(meeting.id);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'unknown error';
        this.logger.error(
          `Failed to delete expired meeting ${meeting.id}: ${message}`,
        );
      }
    }
  }

  private participant(
    user: MeetingUser | null | undefined,
    displayName: string | undefined,
  ) {
    if (user) {
      return {
        identity: userIdentity(user.id),
        name: accountName(user),
      };
    }

    const name = displayName?.trim() ?? '';

    if (!name || name.length > GUEST_NAME_MAX_LENGTH) {
      throw new BadRequestException('display_name_required');
    }

    return {
      identity: createGuestIdentity(),
      name,
    };
  }

  private async deleteMeeting(id: string) {
    if (this.livekit.isConfigured()) {
      await this.livekit.deleteRoom(id);
    }

    await this.prisma.db.Meeting.where({ id }).delete();
  }
}
