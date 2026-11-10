# Decisions

## 2026-11-10 — Auth stack for iteration 1

**Decision.** Keep NestJS with `@nestjs/jwt` and `bcrypt`. Use Arctic for the GitHub OAuth code exchange. Do not adopt Better Auth or Clerk.

**Why.** Email/password sign-in and the user table already exist. Arctic replaces the hand-written token request with an OAuth client and does not need `express-session`. Passwords stay on `bcrypt`, which is a hashing library, not a custom hash.

**Alternatives.** Better Auth has no adapter for Prisma Next (`@prisma/orm-postgres`), so adopting it would mean changing the database layer for auth that already works. Clerk would move users to a vendor even though guests join a meeting without an account. `passport-github2` wants `express-session`, which this API does not use.
