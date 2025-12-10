# gl26_EcoHome

This is a project for the Genie Logiciel course of Polytech Paris-Saclay.

# Usage

## Normal mode

Build and run all services:

```bash
docker compose -f docker-compose.yml up -d --build
```

Build and run a single service (e.g., `auth`):

```bash
docker compose -f docker-compose.yml up -d --build auth
```

## Development mode

Build and run all services with dev overrides:

```bash
docker compose -f docker-compose.yml -f docker-compose-dev.yml up -d --build
```

Build and run a single service in dev mode (e.g., `auth`):

```bash
docker compose -f docker-compose.yml -f docker-compose-dev.yml up -d --build auth
```

## Reset

Stop all running containers:

```bash
docker compose down
```

Then rebuild and start:

```bash
docker compose -f docker-compose.yml -f docker-compose-dev.yml up -d --build
```
