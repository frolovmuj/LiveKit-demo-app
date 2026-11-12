import { randomBytes } from 'node:crypto';

export const MAX_PARTICIPANTS = 8;
export const MEETING_LIFETIME_MS = 3 * 24 * 60 * 60 * 1000;
export const EMPTY_ROOM_TIMEOUT_SECONDS = 300;
export const MEETING_TOKEN_TTL = '6h';

const MEETING_ID_PATTERN = /^[A-Za-z0-9_-]{22}$/;

export function createMeetingId(): string {
  return randomBytes(16).toString('base64url');
}

export function isMeetingId(id: string): boolean {
  return MEETING_ID_PATTERN.test(id);
}

export function meetingExpiresAt(createdAt: Date): Date {
  return new Date(createdAt.getTime() + MEETING_LIFETIME_MS);
}

export function isMeetingExpired(expiresAt: Date, now: Date): boolean {
  return now.getTime() >= expiresAt.getTime();
}

export function canIssueToken(
  participantIdentities: readonly string[],
  identity: string,
): boolean {
  const identities = new Set(participantIdentities);

  if (identities.has(identity)) {
    return true;
  }

  return identities.size < MAX_PARTICIPANTS;
}

export function isMeetingHost(hostId: number, userId: number): boolean {
  return hostId === userId;
}

export function userIdentity(userId: number): string {
  return `user:${userId}`;
}

export function createGuestIdentity(): string {
  return `guest:${randomBytes(16).toString('base64url')}`;
}

export function accountName(user: {
  name: string | null;
  username: string | null;
  email: string;
}): string {
  const name = user.name?.trim();

  if (name) {
    return name;
  }

  const username = user.username?.trim();

  if (username) {
    return username;
  }

  return user.email.trim();
}
