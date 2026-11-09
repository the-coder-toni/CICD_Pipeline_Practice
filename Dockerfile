# --- Stage 1: Build & Dependencies ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# --- Stage 2: Final Light Runtime ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy package profiles and production components from builder
COPY package*.json ./
RUN npm ci --only=production
COPY server.js ./

EXPOSE 3000
CMD ["npm", "start"]
