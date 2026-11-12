import { ApiError, api } from './client';

export type CreatedMeeting = {
  id: string;
  url: string;
  expiresAt: string;
};

export type MeetingAccess = {
  token: string;
  livekitUrl: string;
};

export type MeetingJoinFailure = 'not_found' | 'full' | 'name' | 'other';

export async function createMeeting() {
  const { data } = await api.post<CreatedMeeting>('/api/meetings');
  return data;
}

export async function issueMeetingToken(meetingId: string, displayName?: string) {
  const { data } = await api.post<MeetingAccess>(
    `/api/meetings/${encodeURIComponent(meetingId)}/token`,
    displayName === undefined ? {} : { displayName },
  );

  return data;
}

export function meetingJoinFailure(error: unknown): MeetingJoinFailure {
  if (!(error instanceof ApiError)) {
    return 'other';
  }

  if (error.status === 404) {
    return 'not_found';
  }

  if (error.status === 409) {
    return 'full';
  }

  if (error.status === 400) {
    return 'name';
  }

  return 'other';
}
