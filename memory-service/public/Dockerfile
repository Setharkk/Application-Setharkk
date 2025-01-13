# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Installation des dépendances système nécessaires
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

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
RUN apk add --no-cache python3

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create data directory
RUN mkdir -p /app/data && chown -R node:node /app/data

# Environment variables
ENV NODE_ENV=production \
    TZ=UTC

# Switch to non-root user
USER node

EXPOSE 6000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:6000/health || exit 1

CMD ["node", "dist/main.js"] 