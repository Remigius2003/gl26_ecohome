# Use official lightweight nginx
FROM nginx:alpine

# Install bash (optional but useful for debugging)
RUN apk add --no-cache bash

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Create directory for certbot ACME challenge
RUN mkdir -p /var/www/certbot

# Make sure nginx can read certificates (mounted via volume)
RUN chmod -R 755 /var/www/certbot
