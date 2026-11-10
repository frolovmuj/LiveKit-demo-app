# 03. Meetings API

Status: not started. One commit. Depends on [02](02-auth-frontend.md). Do not start [04](04-home-and-join.md) until this passes typecheck, lint, and the Jest tests below.

Plan: [.cursor/plans/iteration-1-livekit.md](../../.cursor/plans/iteration-1-livekit.md).

## Review

Stop when this spec is ready. Do not commit it, and do not start the next spec, until the user has reviewed it and explicitly approved moving on.

## Work

New module `backend/src/meetings`. Also write the room rules into `docs/decisions.md` and fill Tech stack and Commands in [AGENTS.md](../../AGENTS.md).

- `Meeting` model: `id`, `hostId`, `createdAt`, `expiresAt`. `id` is 128 random bits, `base64url`, not an autoincrement. Lifetime is 3 days.
- Jest for the pure helpers: id shape, whether a link is expired, whether a token may be issued for the current participant list, whether a user id is the host.
- `POST /api/meetings` requires a JWT. `@nestjs/throttler`: 10 rooms per hour per user. Response: id, url, expiresAt.
- `POST /api/meetings/:id/token` accepts a JWT or a guest display name of 1–40 characters. Reject when the row is missing, the meeting is expired (delete the row in that case), or 8 other identities are already in the room. Allow an identity that is already present. Signed-in identity: `user:{id}`. Guest identity: `guest:{random}`. Grants: join, publish, subscribe, data. No `roomAdmin`. Limit: 30 issuances per minute per IP.
- The first token for a meeting calls `createRoom` with `emptyTimeout` of 300 seconds when LiveKit does not already have that room.
- Once an hour, delete expired rows and call `deleteRoom`. Add `@nestjs/schedule` for this cron only.
- `livekit-server-sdk` stays on the server. `backend/.env.example` lists `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET`. Do not log tokens.

Mute and remove are [07](07-moderation-backend.md), not this spec. The host check helper covered by Jest here is what that spec will call.

## Done

A signed-in request creates a meeting and receives a token. A guest name receives a token. A ninth new participant and an expired link do not.
