# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Installation des dépendances système nécessaires
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    openssh

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Installation des dépendances système pour la production
RUN apk add --no-cache \
    python3 \
    openssh-client

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create necessary directories
RUN mkdir -p /app/data /app/logs && \
    chown -R node:node /app/data /app/logs

# Environment variables
ENV NODE_ENV=production \
    TZ=UTC \
    WS_HEARTBEAT_INTERVAL=30000 \
    WS_HEARTBEAT_TIMEOUT=120000

# Switch to non-root user
USER node

EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "dist/main.js"] 