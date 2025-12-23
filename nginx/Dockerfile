FROM nginx:alpine

RUN apk add --no-cache openssl
RUN mkdir -p /etc/certificats
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Copy YOUR script (not in a fake "init.d" folder)
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Keep official ENTRYPOINT, but override CMD
CMD ["/entrypoint.sh"]