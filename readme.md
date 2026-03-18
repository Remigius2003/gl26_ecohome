# Portfolio — Matys Grangaud

Interactive 3D portfolio built around a navigable cube. Each face of the cube is a section of the portfolio; clicking an object on the scene opens the corresponding page.

**Stack:** React + Three.js · FastAPI · PostgreSQL · Nginx · Docker Compose

---

## Architecture

```text
Internet
   │
   ▼
Nginx (80 → 443 redirect, TLS termination)
   ├── /static/, /         → front  (React/Vite, port 3000)
   ├── /api/               → core   (FastAPI, port 5002)
   └── /ws                 → core   (WebSocket)

Anubis (PoW bot protection) sits in front of core on the Docker network.

Networks:
  public   — nginx, front, anubis, core
  internal — core, database  (no external routing)
```

| Service    | Role                          |
|------------|-------------------------------|
| `nginx`    | Reverse proxy + TLS           |
| `front`    | React SPA (Three.js scene)    |
| `core`     | FastAPI REST API              |
| `database` | PostgreSQL                    |
| `anubis`   | PoW bot mitigation            |

---

## Cube faces

| Face     | Content          |
|----------|------------------|
| Front    | Profile / About  |
| Left     | Experience       |
| Top      | Education        |
| Bottom   | Skills           |
| Right    | Projects         |
| Back     | Mini Game        |

The scene also has a **Reading** object that opens a community book-recommendation page.

---

## Getting started

### 1. Secrets

Copy the example env file and fill in your values (or generate them):

```bash
cp .env.example .env
# then edit .env — replace both change_me values
# tip: openssl rand -hex 32
```

The `.env` file is gitignored. It must be present before running Docker Compose.

### 2. TLS certificates

Place your certificates in `certificats/`:

```text
certificats/certif.pem
certificats/certif-key.pem
```

For local dev you can generate a self-signed cert:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certificats/certif-key.pem \
  -out certificats/certif.pem
```

### 3. Run

```bash
docker compose up -d --build
```

Build and restart a single service (e.g. after editing the backend):

```bash
docker compose up -d --build core
```

Stop everything:

```bash
docker compose down
```

Wipe the database volume too:

```bash
docker compose down -v
```

---

## API

All endpoints are under `/api/`. Read endpoints are public. Write endpoints require an `X-Admin-Key` header matching `ADMIN_API_KEY` from your `.env`.

| Method   | Path                              | Auth     | Description                        |
|----------|-----------------------------------|----------|------------------------------------|
| GET      | `/api/objects?face=<face>`        | —        | Scene objects for a cube face      |
| PATCH    | `/api/objects/{id}/position`      | Admin    | Move a scene object                |
| GET      | `/api/books`                      | —        | Book recommendations (top 20)      |
| POST     | `/api/books`                      | —        | Recommend a book (5 req/min/IP)    |
| GET      | `/health`                         | —        | Health check                       |

Example admin call:

```bash
curl -X PATCH https://your-domain/api/objects/3/position \
  -H "X-Admin-Key: <your key>" \
  -H "Content-Type: application/json" \
  -d '{"x": 1.5, "z": -2.0}'
```
