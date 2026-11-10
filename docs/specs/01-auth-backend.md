# 01. Finish backend auth

Status: in review. One commit. Do not start [02](02-auth-frontend.md) until this passes typecheck, lint, and tests.

Plan: [.cursor/plans/iteration-1-livekit.md](../../.cursor/plans/iteration-1-livekit.md).

## Review

Stop when this spec is ready. Do not commit it, and do not start the next spec, until the user has reviewed it and explicitly approved moving on.

## Already there

`POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/github`, `GET /api/auth/github/callback`, `GET /api/auth/update-token`.

## Work

- Rewrite the GitHub code exchange in [backend/src/auth/github-auth.service.ts](../../backend/src/auth/github-auth.service.ts) with Arctic (`arctic`). Keep the current behavior: no verified email is an error; an email that already belongs to a password account returns `account_exists` and is not linked.
- The refresh cookie in [backend/src/auth/auth.service.ts](../../backend/src/auth/auth.service.ts) is always `secure: true`, so a browser will not store it on `http://localhost`. Set `secure` only in production, matching the OAuth state cookie.
- Add `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_CALLBACK_URL` to `backend/.env.example`. Do not log secrets.
- Record the auth stack choice in `docs/decisions.md`.

## Done

Login, registration, and the GitHub callback still return an access token and a refresh cookie, and local HTTP accepts that cookie.
