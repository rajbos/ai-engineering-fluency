// Extension: ai-fluency
// Canvas over the AI Engineering Fluency CLI (`@rajbos/ai-engineering-fluency`):
// usage overview, recent sessions, and fluency score. Ships in the
// `ai-fluency-canvas` Copilot plugin (copilot-app/ in the repo) and can also be
// copied into `$COPILOT_HOME/extensions/ai-fluency/` by hand. See README.md.

import { createCanvas, CanvasError, joinSession } from "@github/copilot-sdk/extension";
import { killTree } from "./cli.mjs";
import { Panels } from "./panels.mjs";
import { OPEN_REFRESH_MIN_AGE_MS, Refresher } from "./refresher.mjs";
import { startServer } from "./server.mjs";
import { summarize } from "./store.mjs";

const refresher = new Refresher();
const panels = new Panels({
    start: () => startServer({ refresher }),
    acquire: () => refresher.acquire(),
    release: () => refresher.release(),
});

let session;
refresher.on("change", ({ status }) => {
    if (status.state === "error") {
        void session?.log(`AI fluency refresh failed: ${status.error}`, { level: "warning", ephemeral: true });
    }
});

async function shutdown() {
    await panels.closeAll();
    await refresher.dispose(killTree);
}
process.once("SIGTERM", () => void shutdown().finally(() => process.exit(0)));
process.once("SIGINT", () => void shutdown().finally(() => process.exit(0)));

session = await joinSession({
    canvases: [
        createCanvas({
            id: "ai-fluency",
            displayName: "AI fluency",
            description:
                "Your AI Engineering Fluency stats across AI tools: token usage, cost, recent sessions, and fluency score (read from local session logs).",
            inputSchema: { type: ["object", "null"], additionalProperties: false },
            actions: [
                {
                    name: "get_summary",
                    description:
                        "Return the latest cached stats: per-period tokens/sessions/cost/CO2, top models, editors and fluency stages with tips. Does not run the CLI. " +
                        "Session titles (often the user's first prompt) and project names are only included when topSessions > 0 — request them only when the user asks about specific sessions.",
                    inputSchema: {
                        type: ["object", "null"],
                        properties: {
                            topSessions: {
                                type: "integer",
                                minimum: 0,
                                maximum: 25,
                                description: "Number of top sessions of the last 7 days (by tokens) to include, with their titles and project names. Default 0.",
                            },
                        },
                        additionalProperties: false,
                    },
                    handler: async ({ input }) => {
                        await refresher.load();
                        const { status } = refresher.state();
                        return { ...summarize(refresher.snapshot, { topSessions: input?.topSessions ?? 0 }), refresh: status };
                    },
                },
                {
                    name: "refresh",
                    description:
                        "Re-run the CLI in the background to refresh the stats (takes several minutes). Returns immediately with the refresh status; set wait=true to block until it finishes " +
                        "(including a refresh another Copilot session is already running).",
                    inputSchema: {
                        type: ["object", "null"],
                        properties: { wait: { type: "boolean" } },
                        additionalProperties: false,
                    },
                    handler: async ({ input }) => {
                        const pending = refresher.refresh();
                        if (!input?.wait) {
                            return { started: true, message: "Refresh is running in the background (several minutes). The canvas updates when it finishes; call get_summary afterwards." };
                        }
                        let { status, snapshot } = await pending;
                        if (status.state === "running" && status.byOtherSession) ({ status, snapshot } = await refresher.waitForOtherSession());
                        if (status.state === "error") throw new CanvasError("refresh_failed", status.error);
                        if (status.state === "running") {
                            return { status, fetchedAt: snapshot?.fetchedAt ?? null, message: "Another Copilot session's refresh is still running; call get_summary later." };
                        }
                        return { status, fetchedAt: snapshot?.fetchedAt ?? null };
                    },
                },
            ],
            open: async ({ instanceId }) => {
                const entry = await panels.open(instanceId);
                void refresher.maybeRefresh(OPEN_REFRESH_MIN_AGE_MS);
                return { title: "AI fluency", url: entry.url };
            },
            onClose: ({ instanceId }) => panels.close(instanceId),
        }),
    ],
});
