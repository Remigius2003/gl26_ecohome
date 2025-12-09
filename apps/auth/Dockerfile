# Build the apps
FROM golang:1.24 AS builder

# Set working dir
WORKDIR /app

# Copy go.mod and go.sum first (for dependency caching)
COPY go.mod go.sum ./
RUN go mod download

# Copy & build the source code
COPY . .
RUN go build -o main .
    
# Final image, all cleaned up
FROM alpine:latest

# Set working dir
WORKDIR /root/

# Copy compiled binary from builder stage
COPY --from=builder /app/main .

# Expose the port
EXPOSE 5000

# Run the Go binary
CMD ["./main"]