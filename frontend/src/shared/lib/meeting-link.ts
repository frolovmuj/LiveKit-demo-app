const MEETING_ID = /^[A-Za-z0-9_-]{22}$/;

export function meetingIdFromLink(input: string): string | null {
  const value = input.trim();

  if (!value) {
    return null;
  }

  if (MEETING_ID.test(value)) {
    return value;
  }

  const path = pathnameOf(value);

  if (!path) {
    return null;
  }

  const match = path.match(/^\/m\/([A-Za-z0-9_-]{22})\/?$/);

  return match?.[1] ?? null;
}

function pathnameOf(value: string): string | null {
  if (value.startsWith('/')) {
    return value.split(/[?#]/)[0] ?? null;
  }

  try {
    const url = new URL(value.includes('://') ? value : `http://${value}`);
    return url.pathname;
  } catch {
    return null;
  }
}
