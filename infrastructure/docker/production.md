# Production Deployment

## Prerequisites

- Docker Engine 24+ with Compose v2
- A Linux VM (Ubuntu 22.04+, 4GB+ RAM, 2+ vCPUs)
- Domain pointing to the server (DNS A record)
- GitHub Container Registry access (or your Docker registry of choice)

## Quick Start

```bash
# 1. Clone on the server
git clone https://github.com/Axefield/zen.git /opt/zen
cd /opt/zen

# 2. Create production env file (fill with real secrets)
cp .env.prod.example .env.prod
nano .env.prod

# 3. Build and start all services
docker compose -f docker-compose.prod.yml up -d --build

# 4. Check health
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=50 ai-engine
```

## Environment Variables

All secrets go in `.env.prod` (never committed). Required:

| Variable | Where | Notes |
|----------|-------|-------|
| `DB_PASSWORD` | postgres, strapi, ai-engine | 64+ chars, random |
| `MEILI_MASTER_KEY` | meilisearch, ai-engine | 40+ chars, random |
| `STRAPI_APP_KEYS` | strapi | 4 comma-separated random strings |
| `STRAPI_API_TOKEN_SALT` | strapi | random |
| `STRAPI_ADMIN_JWT_SECRET` | strapi | random |
| `STRAPI_ADMIN_ENCRYPTION_KEY` | strapi | random |
| `STRAPI_TRANSFER_TOKEN_SALT` | strapi | random |
| `STRAPI_JWT_SECRET` | strapi | random |
| `JWT_SECRET` | ai-engine | random, different from strapi's |
| `OPENAI_API_KEY` | ai-engine | optional, for OpenAI provider |

Generate secrets with:
```bash
openssl rand -base64 48
```

## Service Access

| Service | Internal URL | External |
|---------|-------------|----------|
| Web frontend | `http://zen-astro-web:4321` | Port 80 |
| Dashboard | `http://zen-astro-dashboard:4321` | Internal only (via reverse proxy or SSH tunnel) |
| ai-engine | `http://ai-engine:4000` | Internal only |
| Strapi admin | `http://strapi:1337/admin` | Internal only (via reverse proxy) |
| PostgreSQL | `postgres:5432` | Internal only |
| Redis | `redis:6379` | Internal only |
| Meilisearch | `meilisearch:7700` | Internal only |

**Security:** The dashboard, Strapi admin, and ai-engine are on the `internal` network only — no exposed ports. Only the web frontend (port 80) is exposed to the host. For admin access, use an SSH tunnel or a reverse proxy (nginx, Caddy, Traefik) with auth.

## Reverse Proxy (Recommended)

```nginx
# /etc/nginx/sites-available/zen.example.com
server {
    listen 443 ssl;
    server_name zen.example.com;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /admin {
        proxy_pass http://127.0.0.1:1337;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /dashboard {
        proxy_pass http://127.0.0.1:4321;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Image Registry

The `docker-compose.prod.yml` uses `ghcr.io/axefield/*` image names for tagged releases. To push:

```bash
# Tag and push after CI builds
docker tag zen-astro-web:latest ghcr.io/axefield/zen-astro-web:v0.1.0
docker push ghcr.io/axefield/zen-astro-web:v0.1.0
```

To use a different registry, update the `image:` fields in `docker-compose.prod.yml`.

## Strapi First-Time Setup

Strapi requires admin user creation on first start:

```bash
docker compose -f docker-compose.prod.yml exec strapi npx strapi admin:create-user \
  --email=admin@truligon.io \
  --password=<strong-password> \
  --firstname=Admin \
  --lastname=User
```

Then create an API token for content seeding:

```bash
# Login to get admin JWT
JWT=$(docker compose -f docker-compose.prod.yml exec -T strapi node -e "
  fetch('http://localhost:1337/admin/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email: 'admin@truligon.io', password: '<strong-password>'})
  }).then(r => r.json()).then(d => process.stdout.write(d.data.token))
")

# Create full-access API token
TOKEN=$(docker compose -f docker-compose.prod.yml exec -T -e STRAPI_ADMIN_JWT=$JWT strapi node -e "
  fetch('http://localhost:1337/admin/api-tokens', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.STRAPI_ADMIN_JWT},
    body: JSON.stringify({name: 'FullAccess', description: 'Production API token', type: 'full-access'})
  }).then(r => r.json()).then(d => process.stdout.write(d.data.accessKey))
")

# Seed content
docker compose -f docker-compose.prod.yml exec -T -e STRAPI_API_TOKEN=$TOKEN strapi node scripts/seed-new.mjs
```

## Updates

```bash
git pull origin main
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

## Backup

```bash
# Database
docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U truligon truligon > backup_$(date +%Y%m%d).sql

# Uploads
docker cp $(docker compose -f docker-compose.prod.yml ps -q strapi):/app/public/uploads ./uploads_backup

# Meilisearch index (export via API)
curl http://localhost:7700/indexes/articles/documents > meili_articles.json
```

## Monitoring

Check service health:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100 -f
```

ai-engine exposes a health endpoint:

```bash
curl http://localhost:4000/health
```

## Architecture Decisions

**Why two networks (internal + external)?** The `internal` network has no external access — only containers on the same network can reach it. The web frontend is attached to both networks so it can reach internal services AND serve external traffic. This means even if a container is compromised, the attacker can't reach the database or Redis from outside.

**Why no port exposure for admin services?** Strapi, dashboard, and ai-engine are operations/admin tools. In production, access them via SSH tunnel or a VPN rather than exposing them to the internet. Add a reverse proxy with HTTP Basic Auth if web-based admin access is required.

**Why json-file logging?** Simpler than a logging driver agent. Logs rotate at 10MB per file, 3 files retained. For centralized logging, add the `gelf` or `syslog` driver.
