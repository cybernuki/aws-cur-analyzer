# Stage 1: Build
FROM node:22.16-slim AS builder
WORKDIR /app

# Copy configuration and dependency files
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
# If you have other configuration files in the frontend root, copy them as well

RUN npm install

# Copy the public directory and the source code (src)
COPY ./public ./public
COPY ./src ./src

RUN npm run build

# Stage 2: Production
FROM node:22.16-slim
WORKDIR /app

# Copy only necessary artifacts from the build stage
# Paths here must match how Next.js organizes build artifacts
# and where the original files were in the builder stage.
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
# If next.config.js is needed at runtime (usually not for basic `npm start`), copy it:
# COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000

# NEXT_PUBLIC_API_URL will be provided by docker-compose or the deployment environment
CMD ["npm", "start"]