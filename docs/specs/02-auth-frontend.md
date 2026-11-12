# 02. Wire frontend auth

Status: done. One commit. Depends on [01](01-auth-backend.md). Do not start [03](03-meetings-backend.md) until this passes typecheck and lint, and the manual check below is done.

Plan: [.cursor/plans/iteration-1-livekit.md](../../.cursor/plans/iteration-1-livekit.md).

## Review

Stop when this spec is ready. Do not commit it, and do not start the next spec, until the user has reviewed it and explicitly approved moving on.

## Already there

[frontend/src/shared/ui/LoginForm.tsx](../../frontend/src/shared/ui/LoginForm.tsx) logs the submitted values. [frontend/src/shared/ui/SignupForm.tsx](../../frontend/src/shared/ui/SignupForm.tsx) does not submit.

## Work

- Email login calls `POST /api/auth/login`. Email registration calls `POST /api/auth/register`.
- "Sign in with GitHub" is a plain link to `GET /api/auth/github`. The client secret never reaches the frontend.
- Keep the access token in memory only. On load, call `GET /api/auth/update-token` with the httpOnly refresh cookie.
- The header shows whether someone is signed in. Show API errors on the form, including `?error=` after GitHub.

## Done

Registration, sign-in, sign-out, and a reload that keeps the session work in the browser. GitHub sends the user to the provider and brings them back signed in.
