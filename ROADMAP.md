# Truligon Business Operating System — Roadmap

---

## Design Philosophy

This is not a product roadmap for a specific business. It is the evolution of a **domain-agnostic operating system** — a set of modular, type-safe, observable capabilities that can be composed into any digital product.

The system does not prescribe what you build. It prescribes how you build it:

- Types before implementation
- Contracts before code
- Modules before monoliths
- Observability before scale
- Reusability before speed

A "design system approach" means the system itself is the designed artifact — the module boundaries, the type contracts, the data flow, the agent interfaces, the analytics schema. Everything else (the domain products, the business model, the go-to-market) is a **configuration layer** on top.

---

## Current State

**Phase 0: Foundation Scaffolding — Complete ✅**

All 7 Docker services run (postgres, redis, meilisearch, strapi, ai-engine, zen-astro-web, zen-astro-dashboard). `.gitignore`, `.env.example`, `.dockerignore` are set up.

| Service | Port | Status |
|---|---|---|
| zen-astro-web | 3000 | Article listing + detail from Strapi data |
| zen-astro-dashboard | 3001 | Overview with ai-engine health + Strapi counts |
| ai-engine | 4000 | Health endpoint only |
| strapi | 1337 | 10 content types, 13 components, 3 seed articles |
| postgres | 5432 | Healthy |
| redis | 6379 | Healthy |
| meilisearch | 7700 | Healthy |

**Packages:** 6 packages exist (`types`, `ui`, `analytics`, `ai`, `auth`, `payments`). Types package has 49 entity interfaces + 40 Zod schemas. All compile with 0 errors.

**Modules with zero code:** Research, UX (types defined, no service code).

**Org gaps:** No monorepo tooling (Turborepo/Nx), no CI/CD, no tests anywhere.

---

## Phase 1 — Type System & Canonical Contracts

**Objective:** Define every entity once in `packages/types`. Types are the shared language across Astro, Strapi, services, AI agents, and analytics.

### Design Approach

Each module's entities are defined as TypeScript interfaces in their own file under `packages/types/src/modules/`. All entities share a common base pattern:

- `id: string` — UUID primary key
- `createdAt: string` — ISO 8601
- `updatedAt: string` — ISO 8601

Relationships are expressed as optional reference fields, never as nested objects. This keeps the type system flat and composable — Strapi, Astro, and the AI engine each hydrate relations differently.

### Entities by Module

| Module | Entities |
|---|---|
| Research | `Competitor`, `ResearchItem`, `Opportunity`, `Interview`, `Keyword`, `Trend` |
| UX | `Persona`, `Journey`, `TaskFlow`, `PainPoint`, `Experiment` |
| Design System | `Component`, `DesignToken`, `Typography`, `Color`, `Icon`, `Layout` |
| Content | `Page`, `Article`, `Campaign`, `Product`, `Artwork`, `FAQ`, `Course`, `Event` |
| Revenue | `Offer`, `Subscription`, `Transaction`, `Invoice`, `PricingTier` |
| Analytics | `Metric`, `Event`, `Report`, `Dashboard`, `ConversionFunnel` |
| AI | `AgentConfig`, `AgentRun`, `AgentMemory`, `AgentWorkflow` |

### Deliverables

- [x] `packages/types/src/modules/*.ts` — 8 files, 49 entity interfaces across all bounded contexts
- [x] Zod validation schemas for every entity (40+ schemas, 569 lines)
- [x] Relationship map — references between entities defined via optional relation fields
- [x] `packages/types/tsconfig.json` — strict mode, `declaration: true`
- [x] Root `tsconfig.json` with project references
- [x] `.gitignore`
- [ ] Monorepo tool (Turborepo or Nx) for orchestration
- [ ] CI check: `tsc --noEmit` across all packages

### Risk

Type systems can become exercises in premature abstraction. Mitigation: every entity must have at least one identified consumer before it is defined. If nothing needs it, it does not exist.

### Success Metric

`packages/types` compiles with 0 errors. Exports >40 entity interfaces. Every entity has a Zod schema and at least one consumer identified.

---

## Phase 2 — Content Layer (Strapi)

**Objective:** Implement the Content Module as a component-based Strapi architecture. Strapi becomes the single source of truth for all authored content.

### Design Approach

Content types mirror the Type System entities but are implemented as Strapi collection types with component-based dynamic zones. This ensures content authors have flexibility while the canonical types enforce structural contracts at the API boundary.

Components are reusable content fragments that compose into multiple content types:

- `seo` — embedded in every public content type
- `rich-text-block` — markdown/HTML with embedded media
- `media-gallery` — ordered media with captions
- `call-to-action` — headline, body, button
- `pricing-table` — tiered pricing with feature lists
- `testimonial-card` — quote, attribution, avatar
- `hero` — headline, subheadline, background, CTA

### Content Types

| Type | Dynamic Zones | Purpose |
|---|---|---|
| Page | Full page builder | Any marketing or landing page |
| Article | Rich text + media | Blog posts, news, thought leadership |
| Campaign | Hero, CTA, tiers | Fundraising, marketing campaigns |
| Product | Gallery, pricing | Commerce, digital goods, services |
| Artwork | Gallery, rich text | Portfolio, licensing catalog |
| FAQ | Structured Q&A | Knowledge base, support |
| Course | Modules, lessons | Educational content |
| Event | CTA, pricing | Calendar events, ticketed gatherings |

### Integration

- [x] REST API endpoints for all 10 content types
- [x] Auto-generated TypeScript types (1417 lines)
- [x] Bootstrap seed data (3 categories + 3 articles via lifecycle hook)
- [ ] Strapi → Meilisearch sync (full-text search on all public types)
- [ ] Strapi webhooks → ai-engine (content lifecycle events)
- [ ] API tokens with scoped permissions per service
- [ ] Role-based access: admin, editor, contributor, viewer
- [ ] Review workflows for content publishing gates

### Success Metric

8 content types defined with component-based structures. REST API returns structured data. Meilisearch indexes on content save. Webhooks fire on publish/unpublish.

---

## Phase 3 — Frontend Foundation

**Objective:** Build the Astro architecture — layouts, components, routing, data fetching. Both apps render real data from Strapi and the ai-engine.

### Design Approach

Frontends consume data, never own it. The Astro apps import types from `packages/types` and fetch from Strapi (content) and ai-engine (data, AI, analytics). The UI package (`packages/ui`) provides design primitives. No duplicated types, no hardcoded content.

Two apps, single design system:

| App | Purpose | Consumer |
|---|---|---|
| `zen-astro-web` | Public-facing pages | End users |
| `zen-astro-dashboard` | Operations and administration | Internal team |

### zen-astro-web

- [x] Base layout: header (nav, logo), footer (links, social)
- [x] Articles index (`/articles`) — Strapi-powered listing page
- [x] Article detail (`/articles/[slug]`) — SSR with slug filter
- [x] Strapi data fetching library (`src/lib/strapi.ts`)
- [x] Per-page SEO meta: title, description, OG tags
- [ ] Dynamic route for `/[slug]` (generic Page content type)
- [ ] Product, Course, Event frontend routes
- [ ] Strapi data caching strategy
- [ ] Islands architecture: interactive elements hydrate on client
- [ ] Responsive, mobile-first, accessible

### zen-astro-dashboard

- [x] Dashboard layout: sidebar navigation + main content area
- [x] Routes: `/`, `/analytics`, `/content`, `/experiments`
- [x] API client library (`src/lib/api.ts`)
- [x] Metric cards: ai-engine health, Strapi content counts
- [ ] Authenticated layout: sidebar, top bar, user menu
- [ ] Settings and Agents route pages
- [ ] Content management views: list, create, edit, delete
- [ ] Experiment creation and tracking UI
- [ ] AI agent run history

### packages/ui (Design System)

- [x] Design tokens as CSS custom properties (99 properties):
  - Color: primary + neutral 9-step scale, semantic (success, warning, error, info)
  - Typography: family, scale (display → caption), weight, line-height
  - Spacing: 4px base, geometric scale (4, 8, 12, 16, 24, 32, 48, 64)
  - Shadows, radii, transitions, layout variables
- [ ] Primitives: Button, Card, Badge, Input, Select, Table, Modal, Toast, Spinner
- [ ] Component status lifecycle: draft → ready → deprecated
- [ ] No framework lock-in — components are Astro/HTML + CSS, framework-agnostic islands where interactivity is required

### Success Metric

Both apps render real data from their respective sources. All routes resolve. Lighthouse >90. Design system covers 90%+ of UI primitives.

---

## Phase 4 — AI Engine & Services

**Objective:** Transform ai-engine from a health-check stub into the intelligence layer — a service boundary for AI agents, not a monolith.

### Design Approach

Each AI agent is an independent workflow with defined inputs, context sources, memory, outputs, and validation. Agents are not autonomous actors — they are augmentations that produce drafts, suggestions, and reports which enter human workflows.

The ai-engine is a routing and orchestration layer, not where intelligence lives. Individual agents can be small, focused, and independently testable.

### API Framework

- [ ] Replace bare `node:http` with Hono (lightweight, TypeScript-native)
- [ ] Route structure: `/api/v1/{module}/{action}`
- [ ] Zod validation on every route (body, query, params)
- [ ] OpenAPI documentation
- [ ] Structured error responses: `{ error: { code, message, details } }`

### AI Agents

| Agent | Input | Context Sources | Output | Validation |
|---|---|---|---|---|
| Research | Topic, industry, competitors | Strapi articles, web search, trend data | Competitor brief, opportunity report | Human review |
| Content | Topic, tone, persona, format | Strapi content, brand guide, SEO data | Draft, SEO meta, multi-language variant | Editor approval |
| UX | Page URL, persona, task | Persona data, journey maps, analytics | Heuristic audit, usability report | Designer review |
| Product | Feature requests, usage, revenue | Analytics events, support tickets | Priority suggestion, churn flags | PM review |
| Analytics | Time range, metrics, events | Analytics DB, past reports | Anomaly alert, trend report, insight | Auto-publish with confidence |

### Infrastructure

- [ ] OpenAI integration (reasoning + embeddings)
- [ ] Redis: rate limiting, job queue (Bull/BullMQ), caching
- [ ] Meilisearch: full-text + vector search
- [ ] Agent run persistence (input, output, duration, token cost, status)
- [ ] Structured logging with request/run tracing
- [ ] Cost tracking per agent run

### Success Metric

At least 3 agents operational. ai-engine handles 100+ concurrent requests. Agent run data persisted and queryable.

---

## Phase 5 — Revenue & Auth

**Objective:** Secure all endpoints and enable monetization. The Revenue Module provides payment processing and subscription management; the Auth Module provides identity and access control.

### Design Approach

The Revenue Module is domain-agnostic. It does not prescribe what you sell or how you price. It provides primitives:

- **Offers** — what you sell (subscriptions, products, licenses)
- **Transactions** — what was paid, when, by whom
- **Invoices** — billing records
- **Pricing tiers** — amount, interval, currency, feature access

The Auth Module provides identity (Strapi users-permissions) + authorization (JWT validation, role guards). The same auth flow protects the dashboard and the API.

### Authentication

- [ ] Strapi as identity provider
- [ ] JWT validation in ai-engine middleware
- [ ] Roles: owner, admin, operator, viewer
- [ ] Redis session management

### Payments

- [ ] Stripe integration (or Paddle for global tax handling)
- [ ] Subscription plans mapped to Offer entities
- [ ] One-time product purchases
- [ ] Webhooks: checkout, invoice, subscription lifecycle
- [ ] Invoice generation and email receipts
- [ ] Revenue analytics: MRR, churn, LTV, CAC

### Deliverables

- [ ] `packages/payments` — Stripe client, webhook handlers
- [ ] `packages/auth` — JWT middleware, role guards
- [ ] Billing portal in dashboard
- [ ] Pricing page in public site

### Success Metric

End-to-end payment flow: offer → checkout → webhook confirmation → access granted. MRR tracked in analytics.

---

## Phase 6 — Analytics & Experimentation

**Objective:** Instrument everything. Every event, metric, and experiment feeds back into the system, enabling evidence-based decisions.

### Design Approach

Analytics is a first-class module with its own entity types, event schema, and query layer. It does not depend on any specific analytics vendor. Events are structured, typed, and stored in PostgreSQL (with optional forwarding to a dedicated analytics service at scale).

Experimentation is built on top of the analytics layer. Every experiment is a hypothesis with a metric, an expected outcome, and a validation window. Results persist and feed into the InitiativeContract type that tracks every feature.

### Analytics Pipeline

- [ ] Event schema: `{ event, userId, sessionId, properties, timestamp, source }`
- [ ] Tracking: page views, API calls, agent runs, content actions, payment events
- [ ] Business metrics: revenue, conversion, CAC, LTV, MRR, churn
- [ ] Product metrics: adoption, retention (D1/D7/D30), engagement, feature usage
- [ ] System metrics: latency (p50/p95/p99), error rate, throughput, agent cost/run
- [ ] Dashboards with date range filtering

### Experimentation Framework

- [ ] Hypothesis lifecycle: hypothesis → metric → expected outcome → window → result
- [ ] Feature flags (flag-based, not branch-based)
- [ ] A/B test: split traffic, compare variant metrics, significance test
- [ ] Experiment results feed into InitiativeContract

### Deliverables

- [ ] `packages/analytics` — event schema, tracking SDK, query builder
- [ ] Dashboard views for business, product, and system metrics
- [ ] Experiment creation flow
- [ ] Automated insight generation (Analytics Agent)

### Success Metric

Every route and user action generates an event. >10 events/s sustained. At least one experiment active at all times.

---

## Phase 7 — Production Readiness

**Objective:** CI/CD, IaC, observability, security, and testing. Everything required to ship with confidence.

### CI/CD

- [ ] GitHub Actions: lint → typecheck → test → build → deploy
- [ ] Docker image build and registry push
- [ ] Staging with preview deployments per PR
- [ ] Database migration CI

### Infrastructure (Terraform)

- [ ] Network: VPC, subnets, security groups
- [ ] Data: RDS (PostgreSQL), ElastiCache (Redis)
- [ ] Compute: ECS/Fargate or equivalent
- [ ] CDN: CloudFront or Cloudflare
- [ ] Secrets: Doppler or AWS Secrets Manager

### Observability

- [ ] Structured logging → Axiom / Better Stack
- [ ] Distributed tracing (OpenTelemetry)
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring + alerts
- [ ] PagerDuty / OpsGenie for severity

### Security

- [ ] CORS, CSP, rate limiting, security headers
- [ ] Parameterized queries (always)
- [ ] Dependency scanning (Dependabot / Snyk)
- [ ] Token and secret audit process

### Testing

- [ ] Unit tests (vitest, >80% coverage)
- [ ] Integration tests (API routes)
- [ ] E2E tests (Playwright, critical flows)
- [ ] Visual regression tests (design system)

### Success Metric

Green CI on every PR. Zero critical vulnerabilities. 99.9% uptime. Test coverage >80%.

---

## Phase 8 — Domain Configuration Layer

**Objective:** The OS becomes a platform. Domains are configurations on top of the core modules — not separate products or codebases.

### Design Approach

A **domain** is a set of configuration parameters that select and configure which modules are active, which content types are exposed, which agents are available, and how they compose. Domains are data, not code.

A domain configuration includes:

- **Module selection** — which of the 11 modules are active
- **Content type filters** — which Strapi content types are exposed
- **Agent enablement** — which AI agents are available
- **Design tokens** — color palette, typography, logos for white-labeling
- **Route configuration** — which Astro routes are generated
- **Role definitions** — who can do what in this domain
- **Revenue model** — which Offer entities are active

Examples of domain configurations (data, not separate products):

| Domain | Modules | Content | Agents | Revenue |
|---|---|---|---|---|
| SaaS analytics | All | Articles, Pages | Content, Analytics, Research | Subscription |
| E-commerce | Content, Revenue, Analytics | Products, Pages, Articles | Content, Product | Product sale |
| Education | Content, Revenue, UX, Analytics | Courses, Articles, Events | Content, UX | Subscription + sale |
| Publishing | Content, Revenue, Analytics | Articles, Pages, Campaigns | Content, Research | Subscription + ads |
| Trading | Research, AI, Analytics | ResearchItems, Articles | Research, Analytics | Subscription |
| Fundraising | Content, Revenue, UX | Campaigns, Pages, Events | Content, UX | Donations |

Each domain is independently deployable. The same Strapi instance, the same ai-engine, the same Postgres — different configuration.

### Deliverables

- [ ] `DomainConfig` entity type in `packages/types`
- [ ] Domain configuration stored in PostgreSQL or as JSON files
- [ ] Module registry — which modules are available and how they compose
- [ ] Feature toggles driven by domain config
- [ ] White-label theming (design tokens per domain)
- [ ] Domain-scoped API routes
- [ ] Domain-scoped Strapi content type visibility
- [ ] Domain-scoped AI agent enablement

### Success Metric

At least 2 distinct domain configurations running on the same OS instance with different module setups, content types, and agent availability.

---

## Architectural Invariants

These rules apply at every phase and every module. They are not negotiable.

| Principle | Rule |
|---|---|
| **Type Safety** | Every entity defined once in `packages/types`. Never duplicated. |
| **Contracts First** | Define input/output contracts before any implementation. |
| **Module Isolation** | Packages depend on types, never on another package's internals. |
| **Observability By Default** | Every request, job, and agent run produces structured logs and metrics. |
| **Evidence Over Opinion** | Experiments are the default decision-making mechanism. |
| **Reusability** | If you write it twice, extract it. |
| **Domain Agnostic** | No module presumes a specific domain. Domains are configuration. |

---

## Risk Registry

| Risk | Phase | Likelihood | Mitigation |
|---|---|---|---|
| Type system over-engineering | 1 | Medium | Only define types with an identified consumer. |
| Strapi performance at scale | 2 | Low | Redis cache, CDN for assets, Meilisearch offload. |
| AI agent quality insufficient | 4 | Medium | Human-in-the-loop validation. Narrow scope first. |
| Analytics pipeline event loss | 6 | Low | Buffer writes, dead-letter queue, alert on lag. |
| Domain config complexity | 8 | Medium | Start with one domain, extract config incrementally. |
| Monorepo without tooling | All | High | Add Turborepo or Nx during Phase 1. |

---

## Phase Dependency Graph

```
Phase 1 (Types)
    │
    ├──→ Phase 2 (Strapi Content) → Phase 3 (Frontends)
    │
    └──→ Phase 4 (AI Engine) → Phase 5 (Revenue & Auth)
                                       │
                                  Phase 6 (Analytics)
                                       │
                                  Phase 7 (Production)
                                       │
                                  Phase 8 (Domain Config Layer)
```

Phases 2 and 4 can proceed in parallel. Phase 6 requires Phase 4 and Phase 5 to have real data. Phase 7 gates production deployment. Phase 8 is ongoing — domain configuration is never finished.
