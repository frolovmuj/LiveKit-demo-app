# Decisions

## 2026-11-12 — Frontend API client, queries, and session state

**Decision.** Talk to the API through one Axios instance. Run server reads and writes through TanStack Query. Keep the signed-in user and access token in a MobX store, not in React context and not in `localStorage`.

**Why.** Axios interceptors attach the in-memory access token and, on 401, call `GET /api/auth/update-token` with the refresh cookie, store the new access token, and retry the request. The same call runs once on load, because a reload drops the access token from memory while the cookie remains. Query owns loading, errors, and cache for each request. The store is the place the header and the request interceptor both read, without a provider around the tree.

**Alternatives.** `fetch` in each call site would repeat credentials, headers, and error parsing. A React context would put session state back into the component tree. Persisting the access token in `localStorage` would keep it after the tab closes, which this iteration does not want.

## 2026-11-10 — Auth stack for iteration 1

**Decision.** Keep NestJS with `@nestjs/jwt` and `bcrypt`. Use Arctic for the GitHub OAuth code exchange. Do not adopt Better Auth or Clerk.

**Why.** Email/password sign-in and the user table already exist. Arctic replaces the hand-written token request with an OAuth client and does not need `express-session`. Passwords stay on `bcrypt`, which is a hashing library, not a custom hash.

**Alternatives.** Better Auth has no adapter for Prisma Next (`@prisma/orm-postgres`), so adopting it would mean changing the database layer for auth that already works. Clerk would move users to a vendor even though guests join a meeting without an account. `passport-github2` wants `express-session`, which this API does not use.
