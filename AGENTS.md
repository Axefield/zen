# Truligon's Zen — Agent Guide

## Overview

A modular, type-safe Business Operating System built around **Astro**, **Strapi**, **TypeScript**, **PostgreSQL**, **Redis**, **Meilisearch**, and **AI services**.

Designed to power any digital product (SaaS, e-commerce, publishing, education, trading, fundraising) from a shared, reusable core. Domains are configurations, not separate products.

### Guiding Principles

| Principle | Rule |
|-----------|------|
| **Type Safety** | Every entity defined once in `packages/types`. Never duplicated. |
| **Contracts First** | Define input/output contracts before any implementation. |
| **Module Isolation** | Packages depend on types, never on another package's internals. |
| **Observability By Default** | Every request, job, and agent run produces structured logs and metrics. |
| **Evidence Over Opinion** | Experiments are the default decision-making mechanism. |
| **Reusability** | If you write it twice, extract it. |
| **Domain Agnostic** | No module presumes a specific domain. Domains are configuration. |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    zen-astro-web                          │
│              Public / Product Frontend                    │
│              Astro + TypeScript + Islands                 │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────┼─────────────────────────────────┐
│                    zen-astro-dashboard                    │
│              Operations / Analytics Frontend               │
│              Astro + TypeScript + Islands                 │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────┼─────────────────────────────────┐
│                       ai-engine                           │
│           API Gateway + AI Agent Runtime                  │
│              Node.js + TypeScript + Hono                  │
└────────────────────────┬─────────────────────────────────┘
                         │
┌──────────┬──────────┬──┴──────────┬──────────┬───────────┐
│          │          │             │          │           │
│  Strapi  │PostgreSQL│   Redis     │Meilisearch│ Trading  │
│  Content │ Primary  │ Cache/Queue │  Search   │ Engine   │
│   Layer  │   Data   │             │           │ (future) │
└──────────┴──────────┴─────────────┴───────────┴───────────┘
```

### Services

| Service | Port (Internal) | Port (External) | Description |
|---------|----------------|----------------|-------------|
| `zen-astro-web` | 4321 | 3000 | Public/product frontend (Astro SSR) |
| `zen-astro-dashboard` | 4321 | 3001 | Operations dashboard (Astro SSR) |
| `ai-engine` | 4000 | 4000 | API gateway and AI agent runtime |
| `strapi` | 1337 | 1337 | Content management layer |
| `postgres` | 5432 | 5432 | Primary database |
| `redis` | 6379 | 6379 | Cache, queue, session store |
| `meilisearch` | 7700 | 7700 | Full-text and vector search |
| `strapi-mcp` | 1338 | 1338 | Strapi MCP relay (proxies /mcp to Strapi with Admin token injection, auto-provisions token) |

### Package Dependency Graph

```
@truligon/types (zod, typescript)     ← Canonical type system
    ↑
    ├── @truligon/ui                    ← Design system (tokens + components)
    │       ↑
    │       ├── @truligon/zen-astro-web      ← Public frontend
    │       └── @truligon/zen-astro-dashboard ← Dashboard
    ├── @truligon/ai                    ← AI workflow contracts (stub)
    ├── @truligon/analytics             ← Metric contracts (stub)
    ├── @truligon/auth                  ← Identity/roles (stub)
    └── @truligon/payments              ← Revenue contracts (stub)

@truligon/ai-engine   (standalone, no workspace deps)
@truligon/strapi      (standalone Strapi v5, no workspace deps)
```

---

## Current State

### Phase 0 — Foundation Scaffolding (100% Complete)

All 8 Docker services run. Module directories exist. `.gitignore`, `.env.example`, `.dockerignore` are set up.

### Phase 1 — Type System (100% Complete)

**Done:**
- 49 entity interfaces across 8 modules (research, ux, design-system, content, revenue, analytics, ai, experimentation)
- 12 sub-types, 6 base types
- 40+ Zod validation schemas in `packages/types/src/validation.ts`
- All 6 packages compile with 0 errors (`tsc --noEmit`)
- Turborepo 2.9.17 configured with `turbo.json` task pipeline (`build`, `typecheck`, `dev`, `lint`, `test`)
- Root `package.json` scripts use turbo for `build` and `dev`; `typecheck` runs `tsc --noEmit` (root, excludes `services/`)
- `typecheck` and `build` scripts added to all 6 packages, 2 apps, and ai-engine
- GitHub Actions CI workflow (`.github/workflows/ci.yml`) — validates typecheck + build on push/PR to `main`

### Phase 2 — Content Layer — Strapi (80% Complete)

**Done:**
- 10 content types (Article, Page, Campaign, Product, Artwork, FAQ, Course, Event, Category, Tag)
- 13 reusable components across 3 categories (seo, shared, content)
- All 10 CRUD API endpoints working
- Strapi auto-generated TypeScript types (1417 lines)
- Bootstrap seed data (3 categories + 3 articles + 3 products + 2 courses + 2 events)
- Bootstrap lifecycle hook in `services/strapi/src/index.js`
- Seed-new script `scripts/seed-new.mjs` — full reseed via admin JWT -> API token -> content API

**Not done:** Meilisearch sync, webhooks to ai-engine, role-based access, review workflows.

### Phase 3 — Frontend Foundation (95% Complete)

**zen-astro-web:**
- ✅ Base layout (Header + Footer + SEO meta)
- ✅ Homepage — fetches articles from Strapi, lists in card grid
- ✅ Articles listing (`/articles`) — Strapi-powered index page
- ✅ Article detail (`/articles/[slug]`) — renders title, date, body
- ✅ Products listing (`/products`) — card grid with name + price + compare-at price
- ✅ Product detail (`/products/[slug]`) — name, price, rich description
- ✅ Courses listing (`/courses`) — card grid with title + price
- ✅ Course detail (`/courses/[slug]`) — title, price, modules/lessons, rich description
- ✅ Events listing (`/events`) — card grid with title + date + location badge
- ✅ Event detail (`/events/[slug]`) — date, location, capacity, ticket tiers, rich description
- ✅ Dynamic page (`/[slug]`) — renders Strapi dynamic zones via DynamicZone renderer. Populates all 6 shared component types with deep nested population.
- ✅ Search results page (`/search`) — grouped results from Meilisearch via ai-engine
- ✅ Search link in header navigation
- ✅ Strapi data fetching library (`src/lib/strapi.ts`) — `fetchCollection`, `fetchSingle`, `strapiImage`
- ❌ No client-side interactivity (Islands)

**zen-astro-dashboard:**
- ✅ Dashboard layout (Sidebar + main content area)
- ✅ Overview page (`/`) — feeds from ai-engine health + Strapi content counts
- ✅ Login page (`/login`) — form-based auth, POSTs to ai-engine `/api/auth/login`
- ✅ Auth middleware — protects all routes, redirects to login if unauthenticated
- ✅ Agents page (`/agents`) — chat interface with Ollama via ai-engine
- ✅ Sidebar — shows logged-in user name/role, logout button. Content section highlights on all `/content/*` sub-pages.
- ✅ Content hub page (`/content`) — card grid nav to each content type with item counts
- ✅ Content list views — Pages (`/content/pages`), Articles (`/content/articles`), Products (`/content/products`), Courses (`/content/courses`), Events (`/content/events`) — table-based views with sorting, badges, metadata
- ✅ API client library (`src/lib/api.ts`) — `fetchStrapiCollection<T>` for generic Strapi data fetching

**packages/ui:**
- ✅ Design tokens CSS (99 custom properties — colors, typography, spacing, radii, shadows)
- ✅ 12 reusable components: Button, Card, Input, Badge, Select, Heading, Text, Prose, Container, Grid, Stack
- ✅ Heading — level (1-4), size (display/h1-h4), weight
- ✅ Text — size (body/small/caption), color (primary/secondary/muted/inverse)
- ✅ Prose — rich text rendering with `set:html`, heading/blockquote/code/pre/list styles
- ✅ Container — size (sm/md/lg/full), padding
- ✅ Grid — cols (1-4/auto), gap
- ✅ Stack — direction (vertical/horizontal), gap, alignment
- ✅ 6 Strapi dynamic zone components: Hero, RichTextBlock, CallToAction, MediaGallery, PricingTable, TestimonialCard
- ✅ DynamicZone renderer — maps `__component` to Astro components, resolves media URLs via `resolveMediaUrl` callback

### Phase 4 — AI Engine — Search + Auth + AI (Complete)

**Done:**
- ✅ Meilisearch integration via `services/ai-engine/src/search.ts`
- ✅ 4 search API endpoints: `/api/search/query`, `/api/search/index`, `/api/search/reindex`, `/api/search/stats`
- ✅ Strapi lifecycle hooks sync content on create/update/delete
- ✅ Cross-collection search (articles, products, courses, events) returned grouped by type
- ✅ Search results page at `/search?q=<term>` in `zen-astro-web`
- ✅ Search link in header navigation
- ✅ 11 documents indexed (4 articles, 3 products, 2 courses, 2 events)
- ✅ Auth endpoints: POST `/api/auth/login`, POST `/api/auth/register`, GET `/api/auth/me`
- ✅ JWT-based authentication with bcrypt password hashing
- ✅ In-memory user store with seeded default admin user
- ✅ AI provider abstraction with Ollama provider
- ✅ AI endpoints: POST `/api/ai/chat`, GET `/api/ai/models`
- ✅ Provider interface supports future providers (OpenAI, Anthropic, etc.)

### Phase 5-8 — Not Started (Stubs Only)
- Payments: pure type re-exports, no Stripe integration
- Analytics: pure type re-exports, no event tracking
- Auth: defines 3 interfaces only, no middleware
- No tests, no CI/CD, no Terraform, no production readiness

---

## Key Decisions & Rationale

### esbuild Version Pinning

**Decision:** Root `package.json` overrides `esbuild` to `0.25.12`.

**Why:** Astro 5.18.2 bundles Vite 6.4.3, which ships esbuild 0.25.12. But Astro's dependency tree also includes a newer esbuild (0.27.x). npm hoists the newer version to root `node_modules`, causing "Host version does not match binary version" runtime errors in Docker containers. The override ensures only 0.25.12 is installed.

**When to revisit:** When upgrading Astro or Vite to a version that ships a matching esbuild.

### Docker Volume Strategy

**Decision:** Named volumes for `node_modules` in each service/app.

**Why:** The repo is mounted as a bind mount (`.:/app`), which would overlay the container's `node_modules` if not separated. Named volumes prevent the host's `node_modules` (Windows) from conflicting with the container's (Linux).

**Important:** When `package.json` dependencies change, the named volume must be deleted with `docker compose down -v <volume_name>` and recreated, or rebuild with `--force-recreate`.

### Strapi Content API vs Admin API

**Decision:** Use the full-access **Admin API Token** (created via `/admin/api-tokens`) for content seeding, NOT the admin user JWT.

**Why:** Strapi 5's Content API (`/api/*`) checks role-based permissions. Even admin users' JWTs do NOT automatically grant `create`/`update` permissions for content types unless the Authenticated Role explicitly has those permissions. An Admin API Token bypasses this restriction and has full CRUD access.

### Inter-Container Networking

**Decision:** Astro apps use `http://strapi:1337` and `http://ai-engine:4000` as `PUBLIC_STRAPI_URL` / `PUBLIC_API_URL` inside Docker.

**Why:** Docker Compose service names resolve via the internal DNS. `localhost` from inside a container refers to the container itself, not the host. Using service names ensures SSR data fetching works correctly.

### Astro SSR vs Static

**Decision:** Both Astro apps use `output: "server"` (SSR mode).

**Why:** Content comes from Strapi at request time. Static generation would require pre-building every page at image build time, which doesn't work when Strapi data changes independently of deployments.

### Turborepo 2.x Task Pipeline

**Decision:** Use `tasks` (v2 API) in `turbo.json`, not the deprecated `pipeline` key.

**Why:** Turbo 2.x requires the `tasks` key and `packageManager` field in root `package.json`. The task graph defines `build` (dependsOn `^build`), `typecheck` (dependsOn `^build`), `dev` (persistent), `lint`, and `test`.

**CI context:** The entire `turbo run typecheck` pipeline only works from a single context where all workspace dependencies are installed (i.e., GitHub Actions with `npm ci`). In local Docker development, each service container has its own `node_modules` volume — use `docker compose exec <service> npm run typecheck` for standalone services (ai-engine, strapi).

**When to revisit:** When adding new workspaces or upgrading Turbo.

---

## Docker Environment

### Quick Start

```powershell
Copy-Item .env.example .env
docker compose up --build
```

### Services Startup

| Service | Started | Depends On | Notes |
|---------|---------|------------|-------|
| postgres | First | — | Health check: pg_isready |
| redis | First | — | Health check: redis-cli ping |
| meilisearch | First | — | Health check: wget /health |
| strapi | After DB | postgres | Runs `npm run develop` |
| ai-engine | After DB/redis/meili | postgres, redis, meilisearch | Runs `npm run dev` |
| strapi-mcp | After strapi | strapi | Runs `npm run dev` |
| zen-astro-web | After ai-engine, strapi | ai-engine, strapi | Runs `astro dev` |
| zen-astro-dashboard | After ai-engine | ai-engine | Runs `astro dev` |

### Strapi First-Time Setup

1. Start all containers: `docker compose up -d`
2. Navigate to `http://localhost:1337/admin`
3. Create admin account: `admin@truligon.io` / `<password>`
4. **Alternatively**, create via CLI:
   ```
   docker compose exec strapi npx strapi admin:create-user --email=admin@truligon.io --password=<password> --firstname=Admin --lastname=User
   ```
5. Create an Admin API Token with full access (for content seeding):
   ```
   docker compose exec strapi npx strapi admin:api-token:create --name=FullAccess --description="Full access API token" --permissions-all
   ```
6. Bootstrap script creates seed content automatically via `services/strapi/src/index.js` bootstrap hook.

### Rebuild Individual Service

```powershell
# After changing code in a service
docker compose up -d --build --force-recreate <service_name>

# After changing package.json (need fresh node_modules)
docker compose down -v <volume_name>
docker compose up -d --build <service_name>
```

### Logs

```powershell
# All services
docker compose logs -f

# Single service
docker compose logs -f <service_name>

# Tail
docker compose logs --tail=50 <service_name>
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

### Adding a New Module

1. Add module name to `SystemModule` in `packages/types/src/modules/*.ts`
2. Create entity interfaces in `packages/types/src/modules/`
3. Create corresponding `packages/<module>` with contracts
4. Implement business logic in `services/` or `apps/`
5. Define success metrics in `packages/analytics`

### Code Style

- **No comments in code** unless explaining a non-obvious decision. Code should be self-documenting.
- **TypeScript strict mode** everywhere.
- **Zod schemas** for every entity at the API boundary.
- **No secrets or keys** in code or committed files.
- **Use `Write` tool for new files**, `Edit` tool for changes to existing files.
- **Prefer existing patterns** — examine neighboring files before implementing.

---

## Important Files

### Root

| File | Purpose |
|------|---------|
| `docker-compose.yml` | All 7 services, volumes, networks |
| `package.json` | Workspace root, esbuild override |
| `tsconfig.json` | Base TypeScript config with project references |
| `.env.example` | All required environment variables |
| `ROADMAP.md` | Implementation roadmap by phase |
| `README.md` | Project overview and quick start |
| `.github/workflows/ci.yml` | CI pipeline (typecheck + build on push/PR) |
| `turbo.json` | Turborepo task pipeline configuration |

### packages/types

| File | Purpose |
|------|---------|
| `src/base.ts` | Base entity interfaces (BaseEntity, SeoMetadata, Money, MediaRef, Address) |
| `src/validation.ts` | 40+ Zod validation schemas (569 lines) |
| `src/modules/research.ts` | Research module entities |
| `src/modules/content.ts` | Content module entities (11 interfaces) |
| `src/modules/analytics.ts` | Analytics module entities |
| `src/modules/ai.ts` | AI module entities |
| `src/modules/experimentation.ts` | Experimentation module entities |
| `src/modules/design-system.ts` | Design system entities |
| `src/modules/revenue.ts` | Revenue module entities |
| `src/modules/ux.ts` | UX module entities |
| `src/modules/auth.ts` | Auth module entities (User, LoginRequest, SystemRole) |

### apps/zen-astro-web

| File | Purpose |
|------|---------|
| `astro.config.mjs` | Astro config (SSR, host/port) |
| `Dockerfile` | Monorepo-aware multi-stage build |
| `src/layouts/BaseLayout.astro` | Shared layout (header, nav, footer, SEO) |
| `src/components/Header.astro` | Site header with navigation |
| `src/components/Footer.astro` | Site footer |
| `src/lib/strapi.ts` | Strapi content API client |
| `src/pages/index.astro` | Homepage with latest articles |
| `src/pages/articles/index.astro` | Articles listing |
| `src/pages/articles/[slug].astro` | Article detail (SSR, slug filter) |
| `src/pages/search.astro` | Search results page from Meilisearch |
| `src/pages/[slug].astro` | Dynamic page with DynamicZone renderer (Hero, CTA, Pricing, etc.) |

### apps/zen-astro-dashboard

| File | Purpose |
|------|---------|
| `astro.config.mjs` | Astro config (SSR, host/port) |
| `Dockerfile` | Monorepo-aware multi-stage build |
| `src/layouts/DashboardLayout.astro` | Dashboard layout (sidebar + main) |
| `src/components/Sidebar.astro` | Dashboard sidebar navigation |
| `src/lib/api.ts` | ai-engine + Strapi data fetching |
| `src/lib/auth.ts` | Client-side auth helpers (login, token, user fetch) |
| `src/middleware.ts` | Auth + security headers middleware |
| `src/pages/index.astro` | Overview with health + content counts |
| `src/pages/login.astro` | Login form page |
| `src/pages/agents.astro` | Agent chat interface with Ollama |
| `src/pages/analytics.astro` | Placeholder |
| `src/pages/content.astro` | Content hub with card grid to each content type |
| `src/pages/content/pages.astro` | Pages list table with visibility/status badges |
| `src/pages/content/articles.astro` | Articles list table with excerpt and date |
| `src/pages/content/products.astro` | Products list table with name and price |
| `src/pages/content/courses.astro` | Courses list table with title and price |
| `src/pages/content/events.astro` | Events list table with date, location, capacity |
| `src/pages/experiments.astro` | Placeholder |

### packages/ui

| File | Purpose |
|------|---------|
| `src/tokens.css` | Design tokens (99 CSS custom properties) |
| `src/index.ts` | Package entry — type re-exports |
| `src/components/Button.astro` | Button (primary/secondary/ghost/danger, sm/md/lg) |
| `src/components/Card.astro` | Card (default/elevated/bordered, padding) |
| `src/components/Input.astro` | Input (text/email/password/etc., with label) |
| `src/components/Badge.astro` | Badge (default/success/warning/error/info) |
| `src/components/Select.astro` | Select dropdown |
| `src/components/Heading.astro` | Heading (level 1-4, size display/h1-h4, weight) |
| `src/components/Text.astro` | Text (body/small/caption, colors, weight) |
| `src/components/Prose.astro` | Rich text renderer with `set:html` support |
| `src/components/Container.astro` | Layout container (sm/md/lg/full, padding) |
| `src/components/Grid.astro` | Responsive grid (cols 1-4/auto, gap) |
| `src/components/Stack.astro` | Flex stack (vertical/horizontal, gap, align) |
| `src/components/dynamic-zone/DynamicZone.astro` | Dynamic zone renderer — maps `__component` to Astro components |
| `src/components/dynamic-zone/Hero.astro` | Hero block (headline, subheadline, background, CTA) |
| `src/components/dynamic-zone/RichTextBlock.astro` | Rich text + media block |
| `src/components/dynamic-zone/CallToAction.astro` | CTA block (headline, body, button, variant) |
| `src/components/dynamic-zone/MediaGallery.astro` | Media gallery (grid/carousel/masonry/single) |
| `src/components/dynamic-zone/PricingTable.astro` | Pricing table (tiers, features, intervals, CTAs) |
| `src/components/dynamic-zone/TestimonialCard.astro` | Testimonial (quote, author, role, avatar) |
| `src/components/dynamic-zone/types.ts` | Shared dynamic zone types |

### services/strapi

| File | Purpose |
|------|---------|
| `src/index.js` | Bootstrap lifecycle hook (auto-seeds content on first start) |
| `scripts/bootstrap.mjs` | CLI-based seed script (for re-seeding, uses API token env) |
| `scripts/seed-new.mjs` | Full seed script — creates an API token from admin JWT then seeds all content |
| `scripts/create-token.sh` | Shell helper to create admin API token via admin API |
| `config/admin.js` | Admin panel configuration |
| `config/server.js` | Server configuration |
| `config/database.js` | PostgreSQL connection config |
| `src/api/*/content-types/*/schema.json` | Content type definitions |
| `src/components/*/*.json` | Component definitions |
| `types/generated/contentTypes.d.ts` | Auto-generated TypeScript types |

### services/strapi-mcp

| File | Purpose |
|------|---------|
| `src/index.ts` | MCP relay proxy (Hono, auto-provisions token) |
| `Dockerfile` | Multi-stage (deps/dev/prod) |
| `package.json` | Standalone package |

---

## Known Issues & Fixes

### esbuild Binary Mismatch

**Symptom:** `Host version does not match binary version` error in Docker containers.

**Fix:** Root `package.json` has `"overrides": { "esbuild": "0.25.12" }`. If you upgrade Astro, verify the bundled Vite's esbuild version matches. If it changes, update the override.

### Strapi Content API 401 on POST

**Symptom:** Admin user JWT returns 401 when POSTing to `/api/*` endpoints.

**Fix:** Use an Admin API Token (created via the Strapi admin API or UI) instead of a user JWT. The token has full write permissions by default. Pass it as `Authorization: Bearer <token>`.

### Docker Volume Stale node_modules

**Symptom:** After changing `package.json`, Docker containers still have old dependencies.

**Fix:** Delete the named volume and recreate:
```powershell
docker compose down -v zen_astro_web_node_modules
docker compose up -d --build zen-astro-web
```

### Astro Dev Not Picking Up File Changes

**Symptom:** Edited files in the host don't trigger HMR in the container.

**Fix:** Restart the container: `docker compose restart <service>`. Docker bind mounts on Windows sometimes have delayed file event propagation.

### Turbo Typecheck Fails for Standalone Services

**Symptom:** `turbo run typecheck` run from the web or dashboard container fails for `ai-engine` with module resolution errors (`Cannot find module 'meilisearch'`, `Cannot find name 'process'`).

**Fix:** This is expected. The shared Astro containers (web, dashboard) mount their own `node_modules` volumes and don't have access to standalone service dependencies. Run typecheck for standalone services in their own container: `docker compose exec ai-engine npm run typecheck`. In CI (GitHub Actions), `turbo run typecheck` works because `npm ci` installs all workspace dependencies in a single context.

### Astro SSR Routes Return 404/307

**Symptom:** Dynamic routes like `/articles/[slug]` return 307 redirect or 404.

**Fix:**
1. Ensure `astro.config.mjs` has `output: "server"` (not static)
2. Remove `getStaticPaths()` from SSR pages (it's ignored but may cause confusion)
3. For Strapi slug lookups, use `fetchCollection()` with `filters[slug][$eq]` — Strapi does not serve by URL path segment

---

## Ports Reference

| Port | Service | URL |
|------|---------|-----|
| 3000 | zen-astro-web | http://localhost:3000 |
| 3001 | zen-astro-dashboard | http://localhost:3001 |
| 4000 | ai-engine | http://localhost:4000 |
| 1337 | strapi | http://localhost:1337 |
| 5432 | postgres | internal only |
| 6379 | redis | internal only |
| 7700 | meilisearch | http://localhost:7700 |
| 1338 | strapi-mcp | http://localhost:1338 |

---

## Environment Variables Reference

| Variable | Default | Required | Used By |
|----------|---------|----------|---------|
| `OPENAI_API_KEY` | — | No | ai-engine |
| `MEILI_MASTER_KEY` | `local_master_key` | Yes* | ai-engine, meilisearch |
| `STRAPI_APP_KEYS` | `localKeyA,localKeyB` | Yes* | strapi |
| `STRAPI_API_TOKEN_SALT` | `localApiTokenSalt` | Yes* | strapi |
| `STRAPI_ADMIN_JWT_SECRET` | `localAdminJwtSecret` | Yes* | strapi |
| `STRAPI_ADMIN_ENCRYPTION_KEY` | `localAdminEncryptionKey` | Yes* | strapi |
| `STRAPI_TRANSFER_TOKEN_SALT` | `localTransferTokenSalt` | Yes* | strapi |
| `STRAPI_JWT_SECRET` | `localJwtSecret` | Yes* | strapi |
| `PUBLIC_API_URL` | `http://localhost:4000` | No | zen-astro-web, zen-astro-dashboard |
| `PUBLIC_STRAPI_URL` | `http://localhost:1337` | No | zen-astro-web, zen-astro-dashboard |
| `STRAPI_MCP_TOKEN` | — | Yes* | strapi-mcp, strapi |

`*` Required for production; defaults are provided for local development.

---

## Git Workflow

- **Branch from `main`**, name descriptively (e.g., `feature/strapi-webhooks`, `fix/esbuild-version`)
- **Commit messages** summarize what and why in 1-2 sentences
- **No commits** containing secrets, `.env` files, or credentials
- **PR descriptions** explain the problem, solution, and testing approach
- **Before committing**: run `npm run typecheck` (root) to verify packages and apps compile; run `docker compose exec ai-engine npm run typecheck` for ai-engine typecheck
- **CI**: pushes to `main` and PRs trigger `.github/workflows/ci.yml` (typecheck + build)

---

## Strapi Admin

- **URL:** http://localhost:1337/admin
- **First-time setup:** Create admin account via UI (first visit) or CLI

### Admin Account Management

The initial admin password is set during first-time UI setup. If it's unknown, create a **new admin user** via CLI (login credentials unknown):

```powershell
docker compose exec strapi npx strapi admin:create-user --email=ops@truligon.io --password=<new_password> --firstname=Ops --lastname=User
```

> **Note:** The bootstrap hook in `src/index.js` previously broke CLI commands because it queried `strapi::core_store` at load time (the table doesn't exist during CLI execution). The query is now wrapped in try/catch to handle this gracefully.

### API Token Creation (for Content Seeding)

Admin user JWTs do NOT grant write access to the Content API (`/api/*`). You must create a **full-access API token**:

```powershell
# 1. Login with an admin user to get a JWT
$JWT = docker compose exec -T strapi node -e "
async function main() {
  const res = await fetch('http://localhost:1337/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ops@truligon.io', password: '<password>' })
  });
  const data = await res.json();
  process.stdout.write(data.data?.token || 'FAILED');
}
main().catch(console.error);
"

# 2. Create a full-access API token using the admin JWT
$TOKEN = docker compose exec -T -e STRAPI_ADMIN_JWT=$JWT strapi node -e "
const STRAPI_URL = 'http://localhost:1337';
async function main() {
  const res = await fetch(STRAPI_URL + '/admin/api-tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.STRAPI_ADMIN_JWT },
    body: JSON.stringify({ name: 'Seed Token', description: 'For content seeding', type: 'full-access' })
  });
  const data = await res.json();
  process.stdout.write(data.data?.accessKey || 'FAILED: ' + JSON.stringify(data));
}
main().catch(console.error);
"

# 3. Use the token for content API calls
docker compose exec -T -e STRAPI_API_TOKEN=$TOKEN strapi node scripts/seed-new.mjs
```

> **Important:** The `accessKey` returned by the token creation API is the **only time you see the full key**. It's encrypted before storage (`encrypted_key` column in `strapi_api_tokens`). Grabbing `access_key` directly from PostgreSQL will NOT work — the key in the DB is a reference/prefix, not the usable token string.

### API Tokens (Manual)

- **UI:** Settings → API Tokens → Create new API Token
- **Admin API:** `POST /admin/api-tokens` with JWT auth (see above)
- **Type:** Use `full-access` for content seeding/scripting

### Content Seeding

- **Automatic:** On first Strapi start, `src/index.js` bootstrap creates categories, articles, products, courses, and events
- **Manual re-seed:** Run `scripts/seed-new.mjs` with a valid API token
  ```powershell
  docker compose exec -T -e STRAPI_API_TOKEN=<token> strapi node scripts/seed-new.mjs
  ```
- **Reset:** Delete the `strapi::core_store` entry and restart:
  ```sql
  DELETE FROM strapi_core_store WHERE key = 'bootstrap_seeded';
  ```

### Content API

- All endpoints at `http://localhost:1337/api/{pluralName}`
- Query params: `filters[slug][$eq]=value`, `sort=field:asc`, `pagination[limit]=N`, `populate[relation]=true`
- Requires `Authorization: Bearer <api_token>` for write operations

### Type Generation

After schema changes, regenerate Strapi TypeScript types:

```powershell
docker compose exec strapi npx strapi ts:generate-types
```

---

## Testing

Currently there are **zero tests** in the project. Testing strategy is defined in Phase 7 of ROADMAP.md:
- Unit tests: vitest, >80% coverage
- Integration tests: API route testing
- E2E tests: Playwright, critical flows
- Visual regression: design system components

---

## Infrastructure

Current infrastructure is 100% Docker-based for local development. Production infrastructure (Terraform) is not yet defined.

- `infrastructure/docker/` — local orchestration notes
- `infrastructure/github-actions/` — CI/CD stubs (README only)
- `infrastructure/terraform/` — cloud IaC stubs (README only)

---

## License

Proprietary. All rights reserved.
