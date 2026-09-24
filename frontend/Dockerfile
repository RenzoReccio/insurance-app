# Multi-stage Dockerfile for frontend
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json vite.config.ts index.html ./
COPY src/ ./src/

ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_GO_API_URL=http://localhost:8080
ENV VITE_GO_API_URL=$VITE_GO_API_URL

RUN npm run build

# Production Server Stage
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 8080

CMD ["nginx", "-g", "daemon off;"]
