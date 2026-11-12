# AGENTS.md

## Project

Web app for video meetings, built on top of **LiveKit**. Iteration 1 is a basic but working conference app: auth, create/join a meeting, and a room with a speaker-focused layout and a control bar.

Planned for later (do NOT build now): a P2P mode, and an AI agent that joins a room as a participant. Keep room/participant code clean so these can be added later, but do not design for them yet.

## Iteration 1 scope

### Auth
- Sign up / sign in with email.
- Sign in with a GitHub account.
- Use an established auth library or provider. Never hand-roll password hashing, sessions or OAuth.
- Access model: **creating a meeting requires being signed in; joining does not.** Anyone with the meeting link can join as a guest by entering a display name (no account needed). Signed-in users join under their account name.

### Home page
- "Create meeting" action (signed-in users only; guests are prompted to sign in): creates a room and takes the user into it.
- A small block where anyone (guest or signed-in) can paste a meeting link and join.

### Meeting room

Layout:
- The active speaker's tile takes the largest area. All other participants are shown in a side panel.
- When someone starts speaking, their tile becomes the main one. Avoid flicker when speakers alternate quickly (details are decided in the plan).

Bottom control bar:
- Copy meeting link
- Microphone on/off
- Camera on/off
- Screen share on/off
- Leave meeting
- Chat open/close

Device selection:
- Next to the microphone and camera buttons there is a small triangle (chevron). Clicking it opens a list of available devices (microphones / cameras) to choose from.

Chat:
- Realtime, in-session only. No database: messages are not persisted and are gone when the session ends.
- Prefer LiveKit's built-in realtime messaging; confirm this in the plan.

### Out of scope for iteration 1
Recording, persisted chat history, P2P without LiveKit, AI agent participant, waiting room / meeting passwords, anything not listed above.

## Tech stack

- Frontend: React Router 7, React 19, TanStack Query, Axios, MobX.
- Backend: NestJS 12, Prisma Next on Postgres, `@nestjs/jwt`, bcrypt, Arctic for GitHub OAuth.
- Meetings: LiveKit Cloud. The API issues room tokens with `livekit-server-sdk`. `@nestjs/throttler` limits creation and token issuance. `@nestjs/schedule` deletes expired meetings hourly.
- Prisma `DateTime` values need `temporal-polyfill` on Node 24.

Room rules are in `docs/decisions.md`. Do not reopen them without the user.

## Commands

Run from the repository root.

```
install: yarn --cwd backend && yarn --cwd frontend
dev: yarn --cwd backend start:dev
     yarn --cwd frontend dev
build: yarn --cwd backend build && yarn --cwd frontend build
typecheck: yarn --cwd backend exec tsc --noEmit --incremental false && yarn --cwd frontend typecheck
lint: yarn --cwd backend lint
test: yarn --cwd backend test
e2e: yarn --cwd backend test:e2e
```

## How we work

**Plan before code.** For any non-trivial task:
1. Read the relevant code and docs first.
2. Ask clarifying questions about anything ambiguous.
3. Produce a plan with file paths and wait for approval before implementing.

**Specs and plans.** Feature specs live in `docs/specs/`, saved plans in `.cursor/plans/`. If code and spec disagree, stop and ask which one is right.

**Small vertical slices.** One slice = one small, reviewable, committable unit with a clear "done" condition. Do not implement the whole plan in one go.

**Review before the next slice.** When a slice is ready, run its checks and stop. Do not commit it, and do not start the next slice, until the user has reviewed it and explicitly approved moving on.

**Verify, don't claim.** Before saying a task is done, run typecheck, lint and tests (see Commands) and report the results. Never modify a test just to make it pass; if a test looks wrong, say so.

**Tests.** Write tests for pure logic (e.g. active-speaker selection, chat message handling). For media and UI behavior, prefer e2e checks where feasible (e.g. headless browser with fake media devices) and tell the user what could only be verified manually.

**Stay in scope.** No unrelated refactors, no features beyond the current slice, no new dependencies without a one-line justification.

**Record decisions.** Any architectural or library decision goes into `docs/decisions.md` (date, decision, why, alternatives considered).

**Ask when unsure.** If a requirement is unclear, ask. Do not guess and build.

## Security rules (hard)
- LiveKit API key/secret live only on the server, in environment variables. Never in client code, never committed. Commit `.env.example` only.
- LiveKit access tokens are generated server-side, and only after validating the request (the room exists; the caller is a signed-in user or a guest with a display name).
- Anyone with a meeting link can join, so room IDs must be long and unguessable (never sequential). Rate-limit room creation and token issuance.
- Never log secrets or tokens.

## Communication
- Reply to the user in Russian.
- Code, comments, identifiers, commit messages and docs in English.
- Commits: small, imperative mood, one logical change each.

## Maintaining this file
Keep it short. If you notice yourself repeating the same mistake or the user correcting the same thing twice, propose a new rule here instead of silently working around it.
