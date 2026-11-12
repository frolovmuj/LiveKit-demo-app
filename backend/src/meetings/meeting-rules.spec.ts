import {
  accountName,
  canIssueToken,
  createMeetingId,
  isMeetingExpired,
  isMeetingHost,
  isMeetingId,
  meetingExpiresAt,
  userIdentity,
} from './meeting-rules';

describe('meeting rules', () => {
  describe('id', () => {
    it('encodes 128 random bits as base64url', () => {
      const id = createMeetingId();

      expect(isMeetingId(id)).toBe(true);
      expect(Buffer.from(id, 'base64url')).toHaveLength(16);
    });

    it('is not a sequence', () => {
      const first = createMeetingId();
      const second = createMeetingId();

      expect(first).not.toBe(second);
      expect(Number.isInteger(Number(first))).toBe(false);
      expect(isMeetingId('1')).toBe(false);
      expect(isMeetingId('a'.repeat(21))).toBe(false);
      expect(isMeetingId(`${'a'.repeat(21)}+`)).toBe(false);
    });
  });

  describe('expiry', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const expiresAt = meetingExpiresAt(createdAt);

    it('lasts three days from creation', () => {
      expect(expiresAt.toISOString()).toBe('2026-01-04T00:00:00.000Z');
    });

    it('stays live until expiresAt', () => {
      expect(
        isMeetingExpired(expiresAt, new Date(expiresAt.getTime() - 1)),
      ).toBe(false);
    });

    it('is expired once now reaches expiresAt', () => {
      expect(isMeetingExpired(expiresAt, expiresAt)).toBe(true);
      expect(
        isMeetingExpired(expiresAt, new Date(expiresAt.getTime() + 1)),
      ).toBe(true);
    });
  });

  describe('canIssueToken', () => {
    const identities = (count: number) =>
      Array.from({ length: count }, (_, index) => `user:${index}`);

    it('allows a new participant while the room is under the cap', () => {
      expect(canIssueToken(identities(7), 'user:new')).toBe(true);
    });

    it('rejects a ninth new participant', () => {
      expect(canIssueToken(identities(8), 'user:new')).toBe(false);
    });

    it('allows an identity that is already in a full room', () => {
      expect(canIssueToken(identities(8), 'user:0')).toBe(true);
    });

    it('counts each identity once', () => {
      expect(
        canIssueToken(
          Array.from({ length: 8 }, () => 'user:0'),
          'user:new',
        ),
      ).toBe(true);
    });
  });

  describe('isMeetingHost', () => {
    it('matches only the host id', () => {
      expect(isMeetingHost(4, 4)).toBe(true);
      expect(isMeetingHost(4, 5)).toBe(false);
    });
  });

  describe('participant names', () => {
    it('uses the account name, then the username, then the email', () => {
      expect(
        accountName({ name: 'Ada', username: 'ada', email: 'ada@example.com' }),
      ).toBe('Ada');
      expect(
        accountName({ name: '  ', username: 'ada', email: 'ada@example.com' }),
      ).toBe('ada');
      expect(
        accountName({ name: null, username: null, email: 'ada@example.com' }),
      ).toBe('ada@example.com');
    });

    it('builds a stable signed-in identity', () => {
      expect(userIdentity(12)).toBe('user:12');
    });
  });
});
