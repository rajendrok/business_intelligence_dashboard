# Use official Node.js image as the base
FROM node:20-alpine AS builder

# Install OS packages needed for building node modules (if any native deps)
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json or yarn.lock
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the React Native app for web
RUN npm run web-build

# Stage 2: Serve the static build using NGINX
FROM nginx:stable-alpine AS production

# Copy build output to NGINX's html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom NGINX config (optional, skip if not needed)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose the port NGINX will serve on
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
