# Stage 1: Build the Go app
FROM golang:1.24.4-alpine AS builder

# Install necessary packages
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy go.mod and go.sum
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the Go app (replace 'main.go' with your actual main file if different)
RUN go build -o app .

# Stage 2: Run the app in a minimal Alpine container
FROM alpine:latest

# Install certificates (needed for HTTPS calls in Go)
RUN apk add --no-cache ca-certificates

# Set working directory
WORKDIR /root/

# Copy built Go binary from builder
COPY --from=builder /app/app .

# Expose port (change as per your app)
EXPOSE 8080

# Command to run the app
CMD ["./app"]
