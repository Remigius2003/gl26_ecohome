# ────────────────────────────────────────
# Stage 1 — Build
# ────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# ────────────────────────────────────────
# Stage 2 — Serve (nginx)
# ────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove the default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our SPA-friendly config
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy the build output from Stage 1
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
