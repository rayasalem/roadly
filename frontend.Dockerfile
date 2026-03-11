# MechNow Frontend (Web) – build static assets for Nginx
# Uses Expo web build. For native builds use EAS Build separately.
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci

# Build-time env (override in CI for staging/production API URL)
ARG EXPO_PUBLIC_API_URL=http://localhost:4000
ARG EXPO_PUBLIC_ENVIRONMENT=production
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_ENVIRONMENT=$EXPO_PUBLIC_ENVIRONMENT

COPY . .
# Skip native deps for web-only build
RUN npx expo export --platform web

# Stage 2: serve with nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
# Default config; override with docker-compose volume if needed
RUN echo 'server { root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
