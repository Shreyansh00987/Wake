# Multi-stage production Dockerfile for Wake
# Stage 1: Build dependencies & compilation
FROM node:22-slim AS builder

WORKDIR /app

# Install git and build essentials
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

# Run Next.js production build
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV OLLAMA_HOST=http://host.docker.internal:11434
ENV WAKE_MODEL=gemma3:1b

# Install git and ripgrep in runtime
RUN apt-get update && apt-get install -y git ripgrep && rm -rf /var/lib/apt/lists/*

# Copy built application and production artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/samples ./samples
COPY --from=builder /app/data ./data
COPY --from=builder /app/src ./src

EXPOSE 3000

CMD ["npm", "start"]
