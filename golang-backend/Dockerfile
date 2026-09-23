# Multi-stage Dockerfile for golang-backend
FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server ./cmd/server

# Minimal Runtime Stage
FROM alpine:3.20 AS runner

WORKDIR /app

RUN apk --no-cache add ca-certificates tzdata

COPY --from=builder /app/server /app/server

ENV PORT=8080
EXPOSE 8080

CMD ["/app/server"]
