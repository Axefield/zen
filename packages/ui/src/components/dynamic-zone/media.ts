export function strapiImage(url: string | undefined | null, baseUrl?: string): string | undefined {
  if (!url) return undefined
  if (url.startsWith("http")) return url
  const base = baseUrl || ""
  return `${base}${url}`
}

export function bestImageUrl(
  media: { url: string; formats?: Record<string, { url: string }> } | undefined | null,
  preferredFormat: "thumbnail" | "small" | "medium" | "large" = "medium"
): string | undefined {
  if (!media) return undefined
  if (media.formats?.[preferredFormat]) return media.formats[preferredFormat].url
  if (media.formats?.small) return media.formats.small.url
  if (media.formats?.thumbnail) return media.formats.thumbnail.url
  return media.url
}
