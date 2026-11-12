export function createMeetingTracker(req: Record<string, any>): string {
  const user = req.user;

  if (
    user &&
    typeof user === 'object' &&
    'id' in user &&
    typeof user.id === 'number'
  ) {
    return `user:${user.id}`;
  }

  return 'anonymous';
}
