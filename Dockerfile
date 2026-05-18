# ============================================================
# Blue Orbit Backend — NestJS Dev Dockerfile
# Used by: orbital-service, pathfinding-service, mission-service
# Runs "nest start --watch" (dev mode) — no production build.
# ============================================================

FROM node:22-alpine

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

WORKDIR /app

# Copy workspace root manifests
COPY package.json package-lock.json turbo.json ./

# Copy all workspace package.json files (npm workspaces needs them all)
COPY apps/orbital-service/package.json       apps/orbital-service/package.json
COPY apps/pathfinding-service/package.json   apps/pathfinding-service/package.json
COPY apps/mission-service/package.json       apps/mission-service/package.json
COPY apps/api-gateway-ts/package.json        apps/api-gateway-ts/package.json
COPY packages/ packages/

# Install ALL dependencies (including devDependencies — needed for nest CLI, typescript, etc.)
RUN npm ci

# Copy the full source code
COPY . .

# Generate Prisma client if this service uses Prisma
RUN if [ -d "apps/${SERVICE_NAME}/prisma" ]; then \
      npx prisma generate --schema=apps/${SERVICE_NAME}/prisma/schema.prisma; \
    fi

# Run the dev server — nest start --watch compiles TypeScript on the fly
CMD ["sh", "-c", "cd apps/${SERVICE_NAME} && npm run start:dev"]
