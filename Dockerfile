# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Build tooling for native deps (bcrypt) + openssl for prisma
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY prisma.config.ts tsconfig.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Reuse installed deps (incl. generated prisma client) and build output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./package.json

EXPOSE 5000

CMD ["node", "dist/server.js"]
