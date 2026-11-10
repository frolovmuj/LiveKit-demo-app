# 04. Home and join

Status: not started. One commit. Depends on [03](03-meetings-backend.md). Do not start [05](05-meeting-room.md) until this passes typecheck and lint, and the manual check below is done.

Plan: [.cursor/plans/iteration-1-livekit.md](../../.cursor/plans/iteration-1-livekit.md).

## Review

Stop when this spec is ready. Do not commit it, and do not start the next spec, until the user has reviewed it and explicitly approved moving on.

No media layout in this spec. "Token received" or a clear error is enough.

## Work

- [frontend/src/pages/HomePage/ui/HomePage.tsx](../../frontend/src/pages/HomePage/ui/HomePage.tsx): "Create meeting" for a signed-in user only. A guest goes to `/login` and returns to the button after sign-in. Anyone can paste a meeting link. Remove [frontend/src/widgets/P2PBlock/ui/P2PBlock.tsx](../../frontend/src/widgets/P2PBlock/ui/P2PBlock.tsx). Calling by email is out of this iteration.
- Add `/m/:id` in [frontend/app/routes.ts](../../frontend/app/routes.ts). A guest enters a display name. A signed-in user calls `POST /api/meetings/:id/token` immediately. States: connected, meeting not found, meeting full.

## Done

A signed-in user creates a meeting and opens it. A second browser without an account joins from the link after entering a name.
