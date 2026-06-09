# Truligon's Zen

A modular, type-safe Business Operating System built around **Astro**, **Strapi**, **TypeScript**, **PostgreSQL**, **Redis**, **Meilisearch**, and **AI services**. Truligon's Zen is designed to power any digital product (SaaS, e-commerce, publishing, education, trading, fundraising) from a shared, reusable core where domains are configurations, not separate products.

Designed to power SaaS products, AI products, trading platforms, e-commerce, content publishing, fundraising campaigns, community systems, educational products, and game studio operations — all from a shared, reusable core.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    zen-astro-web                         │
│              Public / Product Frontend                   │
│              Astro + TypeScript + Islands                │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────┐
│                    zen-astro-dashboard                   │
│              Operations / Analytics Frontend              │
│              Astro + TypeScript + Islands                │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────┐
│                       ai-engine                          │
│           API Gateway + AI Agent Runtime                 │
│              Node.js + TypeScript + OpenAI               │
└────────────────────────┬────────────────────────────────┘
                         │
┌──────────┬──────────┬──┴──────────┬──────────┬──────────┐
│          │          │             │          │          │
│  Strapi  │PostgreSQL│   Redis     │Meilisearch│ Trading  │
│  Content │ Primary  │ Cache/Queue │  Search   │ Engine   │
│   Layer  │   Data   │             │           │ (future) │
└──────────┴──────────┴─────────────┴───────────┴──────────┘
```

---

## Module Architecture

| Module | Directory | Purpose |
|---|---|---|
| **Research** | (future) | Market intelligence, competitor analysis, opportunity capture |
| **UX** | `apps/zen-astro-web` | Personas, journeys, task flows, experiments |
| **Design System** | `packages/ui` | Design tokens, component library, visual consistency |
| **Type System** | `packages/types` | Canonical data model — every entity defined once |
| **API** | `services/ai-engine` | Domain functionality, REST endpoints, event-driven processing |
| **Content** | `services/strapi` | Organizational memory — pages, articles, products, courses, events |
| **Frontend** | `apps/zen-astro-web`, `apps/zen-astro-dashboard` | User experience delivery via Astro |
| **Analytics** | `packages/analytics` | Business, product, and system metrics |
| **AI** | `packages/ai`, `services/ai-engine` | AI agents, workflows, augmentation |
| **Revenue** | `packages/payments` | Monetization, subscriptions, transactions |
| **Experimentation** | `apps/zen-astro-dashboard` | Hypothesis-driven decision making |

---

## Services

| Service | Port | Description |
|---|---|---|
| `zen-astro-web` | `3000` | Public/product frontend |
| `zen-astro-dashboard` | `3001` | Operating dashboard |
| `ai-engine` | `4000` | API gateway and AI agent runtime |
| `strapi` | `1337` | Content management layer |
| `postgres` | `5432` | Primary database |
| `redis` | `6379` | Cache, queue, session store |
| `meilisearch` | `7700` | Full-text and vector search |

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 22+ (for local development outside Docker)

### Quick Start

```powershell
Copy-Item .env.example .env
docker compose up --build
```

### First-Time Setup

Once all containers are running (may take a minute on first build):

**1. Create the Strapi admin account**

Navigate to `http://localhost:1337/admin` and create an admin account on first visit. Save these credentials.

Alternatively, create via CLI (useful if the admin password is lost):

```powershell
docker compose exec strapi npx strapi admin:create-user --email=admin@truligon.io --password=<your_password> --firstname=Admin --lastname=User
```

**2. Verify content auto-seeded**

On first start, Strapi's bootstrap hook automatically creates sample content:
- 3 Categories: Technology, Design, Business
- 3 Articles: Welcome, Design Tokens, Modular Business OS
- 3 Products: Zen Starter Kit, Enterprise License, AI Agent Pack
- 2 Courses: Getting Started, Advanced Type System
- 2 Events: Developer Summit, Community Call

Visit `http://localhost:3000` to see articles listed on the homepage.

**3. Create an API token (for content scripting)**

Admin user JWTs do NOT grant write access to the Content API (`/api/*`). Create a full-access API token:

```powershell
# 1. Login to get a JWT
$JWT = docker compose exec -T strapi node -e "
async function main() {
  const res = await fetch('http://localhost:1337/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@truligon.io', password: '<your_password>' })
  });
  const data = await res.json();
  process.stdout.write(data.data?.token || 'FAILED');
}
main().catch(console.error);
"

# 2. Create a full-access API token
$TOKEN = docker compose exec -T -e STRAPI_ADMIN_JWT=$JWT strapi node -e "
const STRAPI_URL = 'http://localhost:1337';
async function main() {
  const res = await fetch(STRAPI_URL + '/admin/api-tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.STRAPI_ADMIN_JWT },
    body: JSON.stringify({ name: 'Dev Token', description: 'Local development token', type: 'full-access' })
  });
  const data = await res.json();
  process.stdout.write(data.data?.accessKey || 'FAILED: ' + JSON.stringify(data));
}
main().catch(console.error);
"
```

The `accessKey` printed is the **only time you'll see the full key**. Save it.

**4. Re-seed content (optional)**

If you need to reset or re-seed content:

```powershell
docker compose exec -T -e STRAPI_API_TOKEN=<your_token> strapi node scripts/seed-new.mjs
```

### Verify Services

```powershell
# Frontend
Invoke-RestMethod http://localhost:3000/

# Dashboard
Invoke-RestMethod http://localhost:3001/

# AI Engine
Invoke-RestMethod http://localhost:4000/api/health

# Strapi Content API
Invoke-RestMethod http://localhost:1337/api/articles

# Meilisearch
Invoke-RestMethod http://localhost:7700/health
```

### Rebuild Individual Service

```powershell
# After changing code in a service
docker compose up -d --build --force-recreate <service_name>

# After changing package.json (need fresh node_modules)
docker compose down -v <volume_name>
docker compose up -d --build <service_name>
```

### View Logs

```powershell
# All services
docker compose logs -f

# Single service
docker compose logs -f <service_name>

# Tail last N lines
docker compose logs --tail=50 <service_name>
```

### Stopping

```powershell
docker compose down          # Stop all containers
docker compose down -v       # Stop and remove volumes (deletes DB data)
```

---

## Development Workflow

### Canonical Order of Implementation

1. **Define types** in `packages/types` — entities, relationships, validation
2. **Define contracts** in the relevant `packages/*` — inputs, outputs, error conditions
3. **Implement services** in `services/*` — API routes, business logic
4. **Define content types** in Strapi — content model matching canonical types
5. **Build frontends** in `apps/*` — Astro pages, components, data fetching
6. **Instrument analytics** — events, metrics, dashboards
7. **Document** — success metrics, risks, revenue impact

### Type Sharing

Types flow from `packages/types` outward:

```
packages/types  →  packages/*  →  services/*  →  apps/*
     ↑                                        ↓
     └──────────── Strapi generated ──────────┘
```

Strapi content type generation targets `services/strapi/types/generated/` and should be reconciled with canonical types.

### Adding a New Module

1. Add module name to `SystemModule` in `packages/types`
2. Create entity interfaces in `packages/types/src/modules/`
3. Create corresponding `packages/<module>` with contracts
4. Implement business logic in `services/` or `apps/`
5. Define success metrics in `packages/analytics`

---

## Guiding Principles

- **Type Safety** — Every entity defined once in the canonical type system
- **Separation of Concerns** — Each module has a single bounded context
- **Domain Driven Design** — Ubiquitous language flows from types through UI
- **Reusability** — Packages are shared, not duplicated
- **Contracts First** — Input/output contracts precede implementation
- **Observability By Default** — Every request and job produces telemetry
- **Revenue Awareness** — Every feature is evaluated against revenue impact
- **Evidence Over Opinion** — Decisions are validated through experiments

---

## Project Structure

```
/
├── apps/
│   ├── zen-astro-web/           # Public Astro frontend
│   └── zen-astro-dashboard/     # Operations Astro dashboard
├── packages/
│   ├── ai/                      # AI workflow and agent contracts
│   ├── analytics/               # Metric contracts and events
│   ├── auth/                    # Identity, roles, authorization
│   ├── payments/                # Revenue and monetization contracts
│   ├── types/                   # Canonical type system
│   └── ui/                      # Design system primitives and tokens
├── services/
│   ├── ai-engine/               # API gateway and AI runtime
│   ├── strapi/                  # Content management
│   └── trading-engine/          # Trading workflows (future)
├── infrastructure/
│   ├── docker/                  # Local orchestration notes
│   ├── github-actions/          # CI/CD definitions
│   └── terraform/               # Cloud infrastructure as code
├── docker-compose.yml           # Local development environment
├── .env.example                 # Environment variable template
└── ROADMAP.md                   # Implementation roadmap
```

---

## License

Proprietary. All rights reserved.
