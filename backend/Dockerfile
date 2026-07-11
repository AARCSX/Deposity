# ============================================================
# Stage 1: Build the Go binary
# ============================================================
FROM golang:1.25-alpine AS builder

RUN apk add --no-cache git ca-certificates

WORKDIR /app

# Cache dependencies first (Docker layer caching optimization)
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build a static binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/server ./cmd/api

# ============================================================
# Stage 2: Minimal runtime image
# ============================================================
FROM alpine:3.21

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /bin/server /app/server
COPY --from=builder /app/migrations /app/migrations

# Cloud Run injects $PORT at runtime
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/app/server"]
