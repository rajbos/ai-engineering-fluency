/**
 * Standalone entry point for the OSS sharing server.
 *
 * Kept deliberately thin: all reusable pieces live in `app.ts` / `lifecycle.ts` so a
 * downstream server can import them from the package root (see `index.ts`).
 */
import { createApp } from "./app.js";
import { startServer } from "./lifecycle.js";

startServer(createApp()).catch(err => {
	console.error("Fatal startup error:", err);
	process.exit(1);
});
