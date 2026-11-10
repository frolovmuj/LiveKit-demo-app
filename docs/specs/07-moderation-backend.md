# 07. Host moderation API

Status: not started. One commit. Depends on [06](06-chat.md). Do not start [08](08-host-controls.md) until this passes typecheck, lint, and the Jest test below.

Plan: [.cursor/plans/iteration-1-livekit.md](../../.cursor/plans/iteration-1-livekit.md).

## Review

Stop when this spec is ready. Do not commit it, and do not start the next spec, until the user has reviewed it and explicitly approved moving on.

## Work

- `POST /api/meetings/:id/mute` and `POST /api/meetings/:id/remove` succeed only when the JWT user is `hostId`. Otherwise 403.
- The server calls `mutePublishedTrack` and `removeParticipant`. The client token still has no `roomAdmin` grant.
- Jest: a user id that is not the host fails the host check.

## Done

The host can mute and remove through these requests. Another participant receives 403.
