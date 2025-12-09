# Use postgress image
FROM postgres:13

# Go into entrypoint workdir
WORKDIR /docker-entrypoint-initdb.d/

# Copy all .sql init files into the init dir
COPY init/ /docker-entrypoint-initdb.d/

# Set permission
RUN chmod -R 644 /docker-entrypoint-initdb.d/*.sql

# Expose port
EXPOSE 5432