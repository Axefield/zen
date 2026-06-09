// Base
export type {
  BaseEntity,
  EntityStatus,
  EntityVisibility,
  SeoMetadata,
  DateRange,
  Money,
  MediaRef,
  Address,
} from "./base.js"

// Research Module
export type {
  Competitor,
  ResearchItem,
  Opportunity,
  Interview,
  Keyword,
  Trend,
} from "./modules/research.js"

// UX Module
export type {
  Persona,
  Journey,
  JourneyStage,
  TaskFlow,
  TaskStep,
  PainPoint,
} from "./modules/ux.js"

// Design System Module
export type {
  ComponentStatus,
  TokenCategory,
  DesignToken,
  Typography,
  Color,
  Icon,
  Layout,
  ComponentSpec,
} from "./modules/design-system.js"

// Content Module
export type {
  Page,
  ContentComponent,
  Article,
  Campaign,
  CampaignTier,
  Product,
  Artwork,
  Faq,
  Course,
  CourseModule,
  Lesson,
  Event,
  EventLocation,
  TicketTier,
} from "./modules/content.js"

// Revenue Module
export type {
  MonetizationType,
  BillingInterval,
  Offer,
  PricingTier,
  Subscription,
  Transaction,
  Invoice,
  InvoiceItem,
} from "./modules/revenue.js"

// Analytics Module
export type {
  MetricCategory,
  MetricAggregation,
  Metric,
  MetricEvent,
  Report,
  Dashboard,
  DashboardWidget,
  ConversionFunnel,
  FunnelStep,
} from "./modules/analytics.js"

// AI Module
export type {
  AgentKind,
  AgentRunStatus,
  MemoryType,
  AgentConfig,
  AgentRun,
  AgentMemory,
  AgentWorkflow,
} from "./modules/ai.js"

// Experimentation Module
export type {
  Hypothesis,
  Experiment,
  Variant,
  ExperimentResult,
  VariantMetric,
  FeatureFlag,
  FlagVariant,
  TargetingRule,
} from "./modules/experimentation.js"

// Validation Schemas
export {
  BaseEntitySchema,
  EntityStatusSchema,
  EntityVisibilitySchema,
  SeoMetadataSchema,
  DateRangeSchema,
  MoneySchema,
  MediaRefSchema,
  AddressSchema,
  CompetitorSchema,
  ResearchItemSchema,
  OpportunitySchema,
  InterviewSchema,
  KeywordSchema,
  TrendSchema,
  PersonaSchema,
  JourneyStageSchema,
  JourneySchema,
  TaskStepSchema,
  TaskFlowSchema,
  PainPointSchema,
  DesignTokenSchema,
  TypographySchema,
  ColorSchema,
  IconSchema,
  LayoutSchema,
  ComponentSpecSchema,
  ContentComponentSchema,
  PageSchema,
  ArticleSchema,
  CampaignTierSchema,
  CampaignSchema,
  ProductSchema,
  ArtworkSchema,
  FaqSchema,
  CourseModuleSchema,
  CourseSchema,
  EventLocationSchema,
  TicketTierSchema,
  EventSchema,
  OfferSchema,
  PricingTierSchema,
  SubscriptionSchema,
  TransactionSchema,
  InvoiceItemSchema,
  InvoiceSchema,
  MetricSchema,
  MetricEventSchema,
  ReportSchema,
  DashboardWidgetSchema,
  DashboardSchema,
  FunnelStepSchema,
  ConversionFunnelSchema,
  AgentConfigSchema,
  AgentRunSchema,
  AgentMemorySchema,
  AgentWorkflowSchema,
  HypothesisSchema,
  VariantSchema,
  VariantMetricSchema,
  ExperimentResultSchema,
  ExperimentSchema,
  FlagVariantSchema,
  TargetingRuleSchema,
  FeatureFlagSchema,
} from "./validation.js"
