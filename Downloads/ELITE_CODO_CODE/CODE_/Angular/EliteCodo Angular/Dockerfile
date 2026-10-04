# ==========================================================
# EliteCodo Angular 16 Frontend Dockerfile
# ==========================================================
# Stage 1: Build the Angular distribution
FROM node:18-bullseye-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npx ng build --configuration production

# Stage 2: Serve via high-performance Nginx Alpine
FROM nginx:alpine

COPY --from=builder /app/dist/elitecodo /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
