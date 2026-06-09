export const HEALTH = {
  status: "ok" as const,
  service: "ai-engine" as const,
  modules: ["api", "analytics", "ai", "type-system", "search"] as string[],
}
