# Use Node.js 20 Alpine as base image
FROM node:20-alpine AS base

# Install dependencies needed for yt-dlp, FFmpeg, and POT provider
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    curl \
    git \
    yarn \
    && pip3 install --break-system-packages yt-dlp bgutil-ytdlp-pot-provider \
    && rm -rf /var/cache/apk/*

# Setup POT provider server
RUN cd /tmp && \
    git clone --single-branch --depth 1 https://github.com/Brainicism/bgutil-ytdlp-pot-provider.git && \
    cd bgutil-ytdlp-pot-provider/server && \
    yarn install --frozen-lockfile && \
    npx tsc && \
    mkdir -p /opt/pot-provider && \
    cp -r build /opt/pot-provider/ && \
    cp -r node_modules /opt/pot-provider/ && \
    cd / && rm -rf /tmp/bgutil-ytdlp-pot-provider

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy POT provider from base
COPY --from=base /opt/pot-provider /opt/pot-provider

# yt-dlp and ffmpeg are already in PATH from the base image
# Start POT provider server in background and then start the app
CMD sh -c "node /opt/pot-provider/build/main.js &>/dev/null & sleep 2 && node server.js"
