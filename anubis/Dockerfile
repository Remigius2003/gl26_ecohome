FROM ghcr.io/techarohq/anubis:latest

# Metadata
LABEL org.opencontainers.image.title="Anubis Reverse Proxy"
LABEL org.opencontainers.image.description="Hardened Anubis instance with baked policy"
LABEL org.opencontainers.image.source="https://github.com/techarohq/anubis"

# Working directory
WORKDIR /anub

# Copy policy into image
COPY policy.yaml ./policy.yaml

# Default environment (can be overridden)
ENV \
  BIND=:8080 \
  METRICS_BIND=:9090 \
  DIFFICULTY=4 \
  OG_PASSTHROUGH=true \
  OG_EXPIRY_TIME=24h \
  TRUST_PROXY_HEADERS=true \
  SERVE_ROBOTS_TXT=true \
  LOG_LEVEL=info \
  POLICY_FNAME=policy.yaml

# Document exposed ports
EXPOSE 8080 9090

# Entrypoint & command
ENTRYPOINT ["anubis"]
CMD ["serve"]
