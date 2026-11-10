# 05. Meeting room

Status: not started. One commit. Depends on [04](04-home-and-join.md). Do not start [06](06-chat.md) until this passes typecheck, lint, and the Vitest below, and the manual check is done.

Plan: [.cursor/plans/iteration-1-livekit.md](../../.cursor/plans/iteration-1-livekit.md).

## Review

Stop when this spec is ready. Do not commit it, and do not start the next spec, until the user has reviewed it and explicitly approved moving on.

Dependencies: `livekit-client`, `@livekit/components-react`. Build the layout here. Do not use LiveKit's stock grid.

## Work

- One main tile and a side panel. Pure function `selectMainSpeaker`, tested with Vitest (the frontend has no test runner yet): a screen share takes the center immediately, and the newest share wins when several are active; a new loudest speaker replaces the previous one only after 1.2 seconds; silence does not clear the last tile.
- Bottom bar: copy link, microphone, camera, screen share, leave. A chevron beside microphone and camera opens `MediaDeviceMenu`. Draw the chat button. The chat panel itself is [06](06-chat.md).

## Done

Two people on desktop see each other. The active speaker becomes the large tile without flicker. Screen share takes the center. Microphone and camera selection works.
