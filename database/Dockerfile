FROM postgres:15-alpine

# Any .sql or .sh file copied to docker-entrypoint-initdb.d/
# is automatically run on the very first startup (when the data volume is empty)
COPY init.sql /docker-entrypoint-initdb.d/init.sql
