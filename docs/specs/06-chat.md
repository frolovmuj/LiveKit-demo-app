# 06. Chat

Status: not started. One commit. Depends on [05](05-meeting-room.md). Do not start [07](07-moderation-backend.md) until this passes typecheck and lint, and the manual check below is done.

Plan: [.cursor/plans/iteration-1-livekit.md](../../.cursor/plans/iteration-1-livekit.md).

## Review

Stop when this spec is ready. Do not commit it, and do not start the next spec, until the user has reviewed it and explicitly approved moving on.

## Work

- A panel built on `useChat` from `@livekit/components-react`, opened from the bottom bar. Messages exist only for the LiveKit session. Do not write them to Postgres.
- After the LiveKit room empties and the same link opens a new session, the history is empty.

## Done

Two participants exchange messages in an open room and do not see those messages in a new session on the same link.
