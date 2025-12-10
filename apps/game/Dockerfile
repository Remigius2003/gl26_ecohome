# Build the apps
FROM golang:1.25 AS builder

# Set working dir
WORKDIR /app

# Copy go.mod and go.sum first (for dependency caching)
COPY go.mod go.sum ./
RUN go mod download

# Copy & build the source code
COPY . .
ENV CGO_ENABLED=0
RUN go build -o main ./cmd/server
    
# Final image, all cleaned up
FROM alpine:latest

# Set working dir
WORKDIR /root/
RUN apk add --no-cache curl ca-certificates

# Copy compiled binary from builder stage
COPY --from=builder /app/main .

# Expose the port
EXPOSE 5001

# Run the Go binary
CMD ["./main"]