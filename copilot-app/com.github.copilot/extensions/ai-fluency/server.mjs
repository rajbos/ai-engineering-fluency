import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const assets = new Map([
    ["/", ["index.html", "text/html; charset=utf-8"]],
    ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
    ["/style.css", ["style.css", "text/css; charset=utf-8"]],
]);

const SECURITY_HEADERS = {
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    // The Copilot app injects its theme (CSS variables + palette) as inline <style> elements, so inline styles must be
    // allowed for the canvas to follow the app theme. Scripts stay same-origin only.
    "Content-Security-Policy":
        "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'",
};

function send(res, status, contentType, body) {
    res.writeHead(status, { "Content-Type": contentType, ...SECURITY_HEADERS });
    res.end(body);
}

const json = (res, status, value) => send(res, status, "application/json; charset=utf-8", JSON.stringify(value));

/**
 * Loopback-only server for one canvas panel. `refresher` is shared across
 * panels; the server only reads its state and asks it to refresh.
 */
export async function startServer({ refresher, keepAliveMs = 25_000 }) {
    const clients = new Set();
    const broadcast = (state) => {
        const frame = `event: state\ndata: ${JSON.stringify(state)}\n\n`;
        for (const res of clients) res.write(frame);
    };
    refresher.on("change", broadcast);
    const keepAlive = setInterval(() => {
        for (const res of clients) res.write(": keep-alive\n\n");
    }, keepAliveMs);
    keepAlive.unref?.();

    const server = createServer((req, res) => {
        void (async () => {
            const origin = `http://127.0.0.1:${server.address().port}`;
            if (req.headers.host !== origin.slice("http://".length)) {
                send(res, 403, "text/plain; charset=utf-8", "Invalid host");
                return;
            }
            const path = new URL(req.url, origin).pathname;
            if (req.method === "POST" && path === "/api/refresh") {
                if (req.headers.origin !== origin) {
                    send(res, 403, "text/plain; charset=utf-8", "Invalid origin");
                    return;
                }
                void refresher.refresh();
                json(res, 202, refresher.state().status);
                return;
            }
            if (req.method !== "GET") {
                res.setHeader("Allow", "GET");
                send(res, 405, "text/plain; charset=utf-8", "Method not allowed");
                return;
            }
            if (path === "/api/state") {
                await refresher.load();
                json(res, 200, refresher.state());
            } else if (path === "/events") {
                res.writeHead(200, { "Content-Type": "text/event-stream; charset=utf-8", Connection: "keep-alive", ...SECURITY_HEADERS });
                res.write(`event: state\ndata: ${JSON.stringify(refresher.state())}\n\n`);
                clients.add(res);
                req.on("close", () => clients.delete(res));
            } else if (assets.has(path)) {
                const [file, contentType] = assets.get(path);
                send(res, 200, contentType, await readFile(new URL(`./assets/${file}`, import.meta.url)));
            } else {
                send(res, 404, "text/plain; charset=utf-8", "Not found");
            }
        })().catch((error) => {
            if (!res.headersSent) json(res, 500, { error: error.message });
            else res.end();
        });
    });
    server.on("close", () => {
        clearInterval(keepAlive);
        refresher.off("change", broadcast);
        for (const res of clients) res.end();
        clients.clear();
    });
    const close = () =>
        new Promise((resolve) => {
            for (const res of clients) res.end();
            server.close(() => resolve());
            server.closeAllConnections?.();
        });
    await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", () => {
            server.off("error", reject);
            resolve();
        });
    });
    return { server, close, url: `http://127.0.0.1:${server.address().port}/` };
}
