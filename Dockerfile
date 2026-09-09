# ==========================================
# GenericMed Enterprise Production Dockerfile
# Multi-stage build for Separated Frontend & Backend
# ==========================================

# Stage 1: Build Frontend Assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Prepare Backend Dependencies & Prisma Engine
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
COPY backend/prisma ./prisma
RUN npm ci
RUN npx prisma generate

COPY backend/ ./

# Stage 3: Minimal Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=5000
ENV FRONTEND_DIST_PATH=/app/backend/dist

# Install production dependencies for backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy generated Prisma client from backend-builder
COPY --from=backend-builder /app/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-builder /app/backend/node_modules/@prisma ./node_modules/@prisma
COPY --from=backend-builder /app/backend/prisma ./prisma
COPY --from=backend-builder /app/backend/src ./src
COPY --from=backend-builder /app/backend/tsconfig.json ./

# Copy built frontend assets from frontend-builder
COPY --from=frontend-builder /app/frontend/dist ./dist

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start enterprise healthcare API server via tsx
CMD ["npx", "tsx", "src/server.ts"]
