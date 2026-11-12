# Decisions

## 2026-11-12 — LiveKit rooms

**Decision.** Meetings run on LiveKit Cloud. Only a signed-in user can create one. Anyone with the link can join: a signed-in user under their account name, a guest after a display name of 1–40 characters. The link is `{FRONTEND_URL}/m/{id}`, where `id` is 128 random bits encoded as base64url.

A meeting row lasts 3 days. After `expiresAt` the API deletes the row and the LiveKit room and does not issue another token. LiveKit closes an empty room after 5 minutes (`emptyTimeout` 300). The same link can open a new LiveKit room until the row expires. Chat from the previous session is not kept.

At most 8 participants. Issuing a token for an identity that is already in the room does not take a new seat. A signed-in identity is `user:{id}`. A guest identity is `guest:{random}`. The token lasts 6 hours and may join, publish, subscribe, and send data. It has no `roomAdmin` grant. Mute and remove stay on the server, and only for the host, in a later spec.

Creating a meeting is limited to 10 rooms per hour per user. Issuing a token is limited to 30 requests per minute per IP. `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` stay in `backend/.env`. The browser receives `LIVEKIT_URL` and the token.

A screen share takes the main area as soon as it is published. If several shares are active, the newest one is main. When sharing stops, the main tile returns to speaker selection. Speaker selection keeps the previous camera tile for 1.2 seconds. Silence does not clear it. Those client rules are implemented in later specs.

`Meeting.hostId` stores the creator's user id. It is not a foreign key. Prisma Next 8.0.0-rc.11 emits a to-one relation whose TypeScript contract omits `nullable`, and `tsc` then rejects the client.

**Why.** LiveKit Cloud avoids operating a media server. Unguessable ids and the two rate limits matter because anyone with the link can join. Admin actions stay on the server so a participant token cannot mute or remove anyone. A 6-hour token covers a meeting and expires the same day.

**Alternatives.** Self-hosted LiveKit would mean running the media server. A token that lasts all 3 days would stay valid after the holder leaves. Putting `roomAdmin` on the participant token would let any client mute and remove. A real foreign key is the better host link once the contract generator emits `nullable`.

## 2026-11-12 — Temporal polyfill for Prisma DateTime

**Decision.** Load `temporal-polyfill/full/global` from `backend/src/prisma/db.ts` before the Prisma client is created.

**Why.** Prisma Next reads and writes `DateTime` as `Temporal.Instant`. Node 24 does not provide `Temporal`, so the first read or write of `User.createdAt` or `Meeting.expiresAt` throws `RUNTIME.TEMPORAL_UNAVAILABLE`. This is the polyfill Prisma documents for that runtime.

**Alternatives.** `TimestamptzString` would avoid Temporal for new columns and would leave the existing `User` timestamps broken. Node 26.8.2 ships `Temporal`, which this machine does not run.

## 2026-11-12 — Frontend API client, queries, and session state

**Decision.** Talk to the API through one Axios instance. Run server reads and writes through TanStack Query. Keep the signed-in user and access token in a MobX store, not in React context and not in `localStorage`.

**Why.** Axios interceptors attach the in-memory access token and, on 401, call `GET /api/auth/update-token` with the refresh cookie, store the new access token, and retry the request. The same call runs once on load, because a reload drops the access token from memory while the cookie remains. Query owns loading, errors, and cache for each request. The store is the place the header and the request interceptor both read, without a provider around the tree.

**Alternatives.** `fetch` in each call site would repeat credentials, headers, and error parsing. A React context would put session state back into the component tree. Persisting the access token in `localStorage` would keep it after the tab closes, which this iteration does not want.

## 2026-11-10 — Auth stack for iteration 1

**Decision.** Keep NestJS with `@nestjs/jwt` and `bcrypt`. Use Arctic for the GitHub OAuth code exchange. Do not adopt Better Auth or Clerk.

**Why.** Email/password sign-in and the user table already exist. Arctic replaces the hand-written token request with an OAuth client and does not need `express-session`. Passwords stay on `bcrypt`, which is a hashing library, not a custom hash.

**Alternatives.** Better Auth has no adapter for Prisma Next (`@prisma/orm-postgres`), so adopting it would mean changing the database layer for auth that already works. Clerk would move users to a vendor even though guests join a meeting without an account. `passport-github2` wants `express-session`, which this API does not use.
