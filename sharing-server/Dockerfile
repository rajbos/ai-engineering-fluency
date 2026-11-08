# syntax=docker/dockerfile:1

# ── Build stage ──────────────────────────────────────────────────────────────
# Uses node:sqlite (built-in, no native compilation needed)
FROM node:24-slim@sha256:03eae3ef7e88a9de535496fb488d67e02b9d96a063a8967bae657744ecd513f2 AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.2.2 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build:production

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:24-slim@sha256:03eae3ef7e88a9de535496fb488d67e02b9d96a063a8967bae657744ecd513f2 AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the compiled bundle (no node_modules needed — no native deps)
COPY --from=builder /app/dist ./dist

# Run as the image's unprivileged `node` user (uid 1000). Only the data directory is
# handed to it: DATA_DIR=/data holds the SQLite database (Docker volume) or the backup
# copy (Azure Files, with the live database under LOCAL_DATA_DIR=/tmp/db). /app stays
# root-owned so the server cannot rewrite its own code. A fresh named volume inherits
# this ownership; a volume created by an older root image needs a one-time chown (README).
RUN mkdir -p /data && chown -R node:node /data

VOLUME ["/data"]

EXPOSE 3000

ARG DEPLOY_SHA=unknown
ARG DEPLOY_BRANCH=unknown
ARG DEPLOY_DATE=unknown

ENV NODE_ENV=production \
    DATA_DIR=/data \
    PORT=3000 \
    DEPLOY_SHA=$DEPLOY_SHA \
    DEPLOY_BRANCH=$DEPLOY_BRANCH \
    DEPLOY_DATE=$DEPLOY_DATE

USER node

# Use tini as PID 1 for proper signal handling
ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/server.js"]
