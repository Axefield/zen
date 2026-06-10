import { z } from "zod"

// ─── Base Schemas ───────────────────────────────────

export const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const EntityStatusSchema = z.enum(["draft", "published", "archived"])

export const EntityVisibilitySchema = z.enum(["public", "private", "unlisted"])

export const SeoMetadataSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(320),
  ogImage: z.string().url().optional(),
  canonicalUrl: z.string().url().optional(),
  noindex: z.boolean().optional(),
})

export const DateRangeSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime().optional(),
})

export const MoneySchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.string().length(3),
})

export const MediaRefSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  width: z.number().positive().int().optional(),
  height: z.number().positive().int().optional(),
  mimeType: z.string().optional(),
  size: z.number().positive().optional(),
})

export const AddressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  region: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().length(2),
})

// ─── Research Module ─────────────────────────────────

export const CompetitorSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  website: z.string().url().optional(),
  description: z.string().optional(),
  marketPosition: z.string().optional(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  lastAnalyzedAt: z.string().datetime().optional(),
})

export const ResearchItemSchema = BaseEntitySchema.extend({
  title: z.string().min(1),
  url: z.string().url().optional(),
  source: z.string().min(1),
  summary: z.string().min(1),
  tags: z.array(z.string()),
  relevanceScore: z.number().min(0).max(100).optional(),
  status: EntityStatusSchema,
})

export const OpportunitySchema = BaseEntitySchema.extend({
  title: z.string().min(1),
  description: z.string().min(1),
  estimatedImpact: z.enum(["low", "medium", "high"]),
  effort: z.enum(["low", "medium", "high"]),
  timeframe: z.string().optional(),
  status: z.enum(["identified", "evaluating", "pursuing", "completed", "declined"]),
})

export const InterviewSchema = BaseEntitySchema.extend({
  subject: z.string().min(1),
  date: z.string().datetime(),
  summary: z.string().min(1),
  keyInsights: z.array(z.string()),
  transcriptUrl: z.string().url().optional(),
  tags: z.array(z.string()),
})

export const KeywordSchema = BaseEntitySchema.extend({
  term: z.string().min(1),
  searchVolume: z.number().int().nonnegative().optional(),
  difficulty: z.number().min(0).max(100).optional(),
  relevance: z.number().min(0).max(100).optional(),
  module: z.string().optional(),
  lastUpdated: z.string().datetime().optional(),
})

export const TrendSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  momentum: z.enum(["rising", "stable", "declining"]),
  sources: z.array(z.string()),
  firstDetectedAt: z.string().datetime(),
})

// ─── UX Module ───────────────────────────────────────

export const JourneyStageSchema = z.object({
  name: z.string().min(1),
  order: z.number().int().nonnegative(),
  description: z.string().min(1),
  goals: z.array(z.string()),
  touchpoints: z.array(z.string()),
  emotions: z.array(z.string()),
})

export const TaskStepSchema = z.object({
  order: z.number().int().nonnegative(),
  action: z.string().min(1),
  decision: z.string().optional(),
  duration: z.string().optional(),
  systemInteraction: z.string().optional(),
})

export const PersonaSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  title: z.string().optional(),
  role: z.string().min(1),
  goals: z.array(z.string()),
  painPoints: z.array(z.string()),
  behaviors: z.array(z.string()),
  skills: z.array(z.string()),
  avatarUrl: z.string().url().optional(),
})

export const JourneySchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  personaId: z.string().uuid(),
  stages: z.array(JourneyStageSchema),
  description: z.string().optional(),
})

export const TaskFlowSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  personaId: z.string().uuid(),
  steps: z.array(TaskStepSchema),
  description: z.string().optional(),
})

export const PainPointSchema = BaseEntitySchema.extend({
  description: z.string().min(1),
  severity: z.enum(["low", "medium", "high", "critical"]),
  frequency: z.enum(["rare", "occasional", "frequent", "always"]),
  personaId: z.string().uuid().optional(),
  journeyStage: z.string().optional(),
})

// ─── Design System Module ────────────────────────────

export const DesignTokenSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  value: z.string().min(1),
  category: z.enum(["color", "typography", "spacing", "layout", "shadow", "radius", "transition"]),
  description: z.string().optional(),
})

export const TypographySchema = BaseEntitySchema.extend({
  family: z.string().min(1),
  weight: z.number().int().positive(),
  size: z.string().min(1),
  lineHeight: z.string().min(1),
  letterSpacing: z.string().optional(),
  category: z.enum(["display", "heading", "body", "small", "caption"]),
})

export const ColorSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  rgb: z.string().optional(),
  hsl: z.string().optional(),
  purpose: z.string().min(1),
  category: z.enum(["primary", "neutral", "success", "warning", "error", "info"]),
})

export const IconSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()),
  svgContent: z.string().optional(),
})

export const LayoutSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  description: z.string().min(1),
  regions: z.array(z.string()),
  template: z.string().optional(),
})

export const ComponentSpecSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(["draft", "ready", "deprecated"]),
  category: z.string().min(1),
  props: z.array(z.string()),
  dependencies: z.array(z.string()),
})

// ─── Content Module ──────────────────────────────────

export const ContentComponentSchema = z.object({
  type: z.string().min(1),
  props: z.record(z.unknown()),
  order: z.number().int().nonnegative(),
})

export const CampaignTierSchema = z.object({
  name: z.string().min(1),
  amount: MoneySchema,
  description: z.string().min(1),
  maxBackers: z.number().int().positive().optional(),
})

export const CourseModuleSchema = z.object({
  name: z.string().min(1),
  order: z.number().int().nonnegative(),
  lessons: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    videoUrl: z.string().url().optional(),
    duration: z.number().positive().optional(),
    order: z.number().int().nonnegative(),
  })),
})

export const EventLocationSchema = z.object({
  type: z.enum(["physical", "virtual", "hybrid"]),
  address: z.string().optional(),
  virtualUrl: z.string().url().optional(),
})

export const TicketTierSchema = z.object({
  name: z.string().min(1),
  price: MoneySchema,
  capacity: z.number().int().positive().optional(),
  description: z.string().min(1),
})

export const PageSchema = BaseEntitySchema.extend({
  title: z.string().min(1),
  slug: z.string().min(1),
  components: z.array(ContentComponentSchema),
  seo: SeoMetadataSchema.optional(),
  status: EntityStatusSchema,
  visibility: EntityVisibilitySchema,
  publishedAt: z.string().datetime().optional(),
})

export const ArticleSchema = BaseEntitySchema.extend({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().min(1),
  body: z.string().min(1),
  authorId: z.string().uuid().optional(),
  categoryIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  seo: SeoMetadataSchema.optional(),
  status: EntityStatusSchema,
  publishedAt: z.string().datetime().optional(),
  featuredImage: MediaRefSchema.optional(),
})

export const CampaignSchema = BaseEntitySchema.extend({
  title: z.string().min(1),
  slug: z.string().min(1),
  goal: MoneySchema,
  raised: MoneySchema,
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  tiers: z.array(CampaignTierSchema),
  status: EntityStatusSchema,
  seo: SeoMetadataSchema.optional(),
})

export const ProductSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  price: MoneySchema,
  compareAtPrice: MoneySchema.optional(),
  variantIds: z.array(z.string()),
  media: z.array(MediaRefSchema),
  status: EntityStatusSchema,
  seo: SeoMetadataSchema.optional(),
})

export const ArtworkSchema = BaseEntitySchema.extend({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  media: z.array(MediaRefSchema),
  license: z.string().optional(),
  price: MoneySchema.optional(),
  artistId: z.string().uuid().optional(),
  status: EntityStatusSchema,
  seo: SeoMetadataSchema.optional(),
})

export const FaqSchema = BaseEntitySchema.extend({
  question: z.string().min(1),
  answer: z.string().min(1),
  categoryId: z.string().uuid().optional(),
  order: z.number().int().nonnegative(),
  searchWeight: z.number().int().nonnegative(),
})

export const CourseSchema = BaseEntitySchema.extend({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  modules: z.array(CourseModuleSchema),
  price: MoneySchema.optional(),
  instructorId: z.string().uuid().optional(),
  status: EntityStatusSchema,
  publishedAt: z.string().datetime().optional(),
  seo: SeoMetadataSchema.optional(),
})

export const EventSchema = BaseEntitySchema.extend({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  date: z.string().datetime(),
  location: EventLocationSchema,
  capacity: z.number().int().positive().optional(),
  ticketTiers: z.array(TicketTierSchema),
  status: EntityStatusSchema,
  seo: SeoMetadataSchema.optional(),
})

// ─── Revenue Module ──────────────────────────────────

export const OfferSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  description: z.string().min(1),
  monetizationType: z.enum(["subscription", "product-sale", "consulting", "licensing", "affiliate", "donation", "advertising"]),
  price: MoneySchema,
  interval: z.enum(["monthly", "yearly", "one-time"]),
  features: z.array(z.string()),
  status: EntityStatusSchema,
})

export const PricingTierSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  description: z.string().min(1),
  amount: MoneySchema,
  interval: z.enum(["monthly", "yearly", "one-time"]),
  features: z.array(z.string()),
  maxUsers: z.number().int().positive().optional(),
  maxEvents: z.number().int().positive().optional(),
  offerIds: z.array(z.string()),
})

export const SubscriptionSchema = BaseEntitySchema.extend({
  offerId: z.string().uuid(),
  principalId: z.string().uuid(),
  status: z.enum(["active", "canceled", "past_due", "trialing", "incomplete"]),
  currentPeriodStart: z.string().datetime(),
  currentPeriodEnd: z.string().datetime(),
  cancelAtPeriodEnd: z.boolean(),
  trialEnd: z.string().datetime().optional(),
})

export const TransactionSchema = BaseEntitySchema.extend({
  offerId: z.string().uuid().optional(),
  subscriptionId: z.string().uuid().optional(),
  principalId: z.string().uuid(),
  amount: MoneySchema,
  status: z.enum(["pending", "completed", "failed", "refunded"]),
  paymentMethod: z.string().min(1),
  invoiceId: z.string().uuid().optional(),
  description: z.string().optional(),
})

export const InvoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: MoneySchema,
  total: MoneySchema,
})

export const InvoiceSchema = BaseEntitySchema.extend({
  principalId: z.string().uuid(),
  number: z.string().min(1),
  items: z.array(InvoiceItemSchema),
  subtotal: MoneySchema,
  tax: MoneySchema,
  total: MoneySchema,
  status: z.enum(["draft", "sent", "paid", "overdue", "canceled"]),
  dueDate: z.string().datetime(),
  paidAt: z.string().datetime().optional(),
})

// ─── Analytics Module ────────────────────────────────

export const MetricSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  category: z.enum(["business", "product", "system"]),
  description: z.string().min(1),
  unit: z.string().min(1),
  aggregation: z.enum(["sum", "avg", "count", "min", "max", "p50", "p95", "p99"]),
  query: z.string().optional(),
})

export const MetricEventSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  properties: z.record(z.unknown()),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  timestamp: z.string().datetime(),
  source: z.string().min(1),
})

export const ReportSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  description: z.string().min(1),
  metrics: z.array(z.string()),
  dateRange: DateRangeSchema,
  filters: z.record(z.unknown()),
  createdBy: z.string().uuid(),
})

export const DashboardWidgetSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1),
  metricIds: z.array(z.string()),
  position: z.object({
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
    w: z.number().int().positive(),
    h: z.number().int().positive(),
  }),
  config: z.record(z.unknown()),
})

export const DashboardSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  description: z.string().min(1),
  widgets: z.array(DashboardWidgetSchema),
  layout: z.record(z.unknown()),
  createdBy: z.string().uuid(),
})

export const FunnelStepSchema = z.object({
  name: z.string().min(1),
  event: z.string().min(1),
  order: z.number().int().nonnegative(),
  description: z.string().optional(),
})

export const ConversionFunnelSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  steps: z.array(FunnelStepSchema),
  attribution: z.enum(["first", "last", "linear"]),
})

// ─── AI Module ───────────────────────────────────────

export const AgentConfigSchema = BaseEntitySchema.extend({
  kind: z.enum(["research", "content", "ux", "product", "analytics"]),
  name: z.string().min(1),
  model: z.string().min(1),
  systemPrompt: z.string().min(1),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().int().positive(),
  enabled: z.boolean(),
})

export const AgentRunSchema = BaseEntitySchema.extend({
  agentConfigId: z.string().uuid(),
  input: z.string().min(1),
  output: z.string().optional(),
  contextSources: z.array(z.string()),
  tokensUsed: z.number().int().nonnegative().optional(),
  cost: z.number().nonnegative().optional(),
  duration: z.number().nonnegative().optional(),
  status: z.enum(["queued", "running", "completed", "failed", "cancelled"]),
  error: z.string().optional(),
  triggeredBy: z.string().optional(),
})

export const AgentMemorySchema = BaseEntitySchema.extend({
  agentConfigId: z.string().uuid(),
  type: z.enum(["session", "episodic", "semantic", "procedural"]),
  key: z.string().min(1),
  value: z.string().min(1),
  expiresAt: z.string().datetime().optional(),
})

export const AgentWorkflowSchema = BaseEntitySchema.extend({
  kind: z.enum(["research", "content", "ux", "product", "analytics"]),
  inputs: z.array(z.string()),
  contextSources: z.array(z.string()),
  memorySources: z.array(z.string()),
  outputs: z.array(z.string()),
  validationProcess: z.string().min(1),
})

// ─── Experimentation Module ──────────────────────────

export const HypothesisSchema = BaseEntitySchema.extend({
  title: z.string().min(1),
  description: z.string().min(1),
  metricId: z.string().uuid(),
  expectedOutcome: z.string().min(1),
  reasoning: z.string().min(1),
})

export const VariantSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  config: z.record(z.unknown()),
  trafficWeight: z.number().min(0).max(100),
})

export const VariantMetricSchema = z.object({
  value: z.number(),
  sampleSize: z.number().int().nonnegative(),
  improvement: z.number().optional(),
  significant: z.boolean(),
})

export const ExperimentResultSchema = z.object({
  winner: z.string().optional(),
  confidence: z.number().min(0).max(100),
  metrics: z.record(VariantMetricSchema),
  concludedAt: z.string().datetime(),
})

export const ExperimentSchema = BaseEntitySchema.extend({
  hypothesisId: z.string().uuid(),
  name: z.string().min(1),
  status: z.enum(["draft", "running", "paused", "completed", "cancelled"]),
  variants: z.array(VariantSchema),
  dateRange: DateRangeSchema,
  results: ExperimentResultSchema.optional(),
})

export const FlagVariantSchema = z.object({
  name: z.string().min(1),
  config: z.record(z.unknown()),
  weight: z.number().min(0).max(100),
})

export const TargetingRuleSchema = z.object({
  attribute: z.string().min(1),
  operator: z.enum(["eq", "neq", "in", "not_in", "gt", "lt", "contains"]),
  value: z.unknown(),
})

export const FeatureFlagSchema = BaseEntitySchema.extend({
  key: z.string().min(1),
  description: z.string().min(1),
  enabled: z.boolean(),
  variants: z.array(FlagVariantSchema),
  targetingRules: z.array(TargetingRuleSchema),
})

// ─── Auth Schemas ─────────────────────────────────────

export const SystemRoleSchema = z.enum(["owner", "admin", "operator", "viewer"])

export const UserSchema = BaseEntitySchema.extend({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  role: SystemRoleSchema,
  isActive: z.boolean(),
})

export const AuthSessionSchema = z.object({
  userId: z.string().uuid(),
  token: z.string().min(1),
  expiresAt: z.string().datetime(),
})

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

export const LoginResponseSchema = z.object({
  token: z.string().min(1),
  user: UserSchema,
  expiresAt: z.string().datetime(),
})

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(200),
})
