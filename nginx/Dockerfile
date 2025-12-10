# Use official lightweight nginx
FROM nginx:alpine

# Install openssl (needed to generate self-signed cert)
RUN apk add --no-cache openssl

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Generate self-signed localhost certificate
RUN printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth" \
   > /tmp/openssl.cnf

RUN openssl req -x509 -out /etc/nginx/ssl/localhost.crt -keyout /etc/nginx/ssl/localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj "/CN=localhost" -extensions EXT -config /tmp/openssl.cnf

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Allow nginx to read the certificate
RUN chmod 600 /etc/nginx/ssl/localhost.key

# Create directory for certbot ACME challenge
RUN mkdir -p /var/www/certbot

# Make sure nginx can read certificates (mounted via volume)
RUN chmod -R 755 /var/www/certbot
