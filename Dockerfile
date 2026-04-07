# ── Stage 1: builder ──────────────────────────────────────────────────────────
# Build the Vite app into static files
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first — npm install layer gets cached
# Only re-runs if package.json or package-lock.json changes
COPY package.json package-lock.json ./

RUN npm ci --silent

# Copy source and build
COPY . .

RUN npm run build
# Output → /app/dist


# ── Stage 2: runtime ──────────────────────────────────────────────────────────
# Serve static files with nginx — tiny image, battle-tested
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing config — same as vercel.json rewrites
# Without this, reloading /day-tracker returns 404 from nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
