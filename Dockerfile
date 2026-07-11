# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1: deps — install dependencies only (cached separately from source)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app

# Prisma's query engine needs openssl; libc6-compat helps some native deps
# (e.g. sharp) behave correctly on Alpine's musl libc.
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
# Stage 2: builder — generate the Prisma client, then build Next.js
# ---------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# .env is intentionally NOT copied into the image (see .dockerignore).
# DATABASE_URL is only needed here because `next build` prerenders/type-checks
# routes that import the Prisma client; it does not need a *working* DB
# connection at build time, just the variable to be present.
ARG DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"
ENV DATABASE_URL=${DATABASE_URL}

# Custom output path (app/generated/prisma) means this MUST run explicitly —
# Next's build won't trigger it automatically the way it would for the
# default node_modules/.prisma/client location.
RUN npx prisma generate

# Disable Next.js telemetry during the build (keeps CI/build logs clean)
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: runner — minimal production image, non-root, standalone output
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user — standard security practice for production containers,
# and something interviewers specifically look for.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Next.js standalone output: a pruned server bundle with only the
# node_modules actually needed at runtime (this is what output:"standalone"
# in next.config.ts enables — without it this directory wouldn't exist).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# The Prisma client lives at a custom path (app/generated/prisma) outside
# node_modules, so Next's file-tracing for standalone output does not
# automatically pick it up — it has to be copied in explicitly.
COPY --from=builder --chown=nextjs:nodejs /app/app/generated/prisma ./app/generated/prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma/schema.prisma ./prisma/schema.prisma

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
