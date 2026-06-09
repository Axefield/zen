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

### Verify

```powershell
Invoke-RestMethod http://localhost:4000/health
Invoke-RestMethod http://localhost:7700/health
```

### Strapi Admin

Navigate to `http://localhost:1337/admin` and create the admin account on first visit.

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
