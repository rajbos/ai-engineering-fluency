---
name: ai-fluency
description: Show the user's AI Engineering Fluency stats (token usage, cost, sessions, charts, fluency score) in the AI fluency canvas. Use when the user asks about their AI or Copilot token usage, spend, recent sessions, or fluency score.
---

# AI fluency canvas

The `ai-fluency-canvas` plugin provides a canvas with `canvasId` `ai-fluency`.

- To show the stats, open it: `open_canvas({ canvasId: "ai-fluency", instanceId: "ai-fluency" })`.
- To answer questions in chat, open the canvas as above, then call
  `invoke_canvas_action({ instanceId: "ai-fluency", actionName: "get_summary" })`
  (optional input `{ "topSessions": 0-25 }`). It returns the cached snapshot and never runs the CLI.
- To update the numbers, call the `refresh` action. It runs in the background and can take several
  minutes; pass `{ "wait": true }` only when the user wants to wait for fresh numbers.
- If `get_summary` returns `available: false`, no snapshot exists yet: tell the user the first run
  parses all local session logs and takes a few minutes, then start a `refresh`.

All data comes from local session logs on this machine; nothing is uploaded.
