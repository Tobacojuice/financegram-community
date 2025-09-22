# Multi-stage build: compile TypeScript, ship compact runtime
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json tsconfig.json ./
COPY src ./src

# Install all deps (including dev) to compile
RUN npm ci && npm run build

# --- Runtime image ---
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Copy built JS
COPY --from=build /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/server.js"]
