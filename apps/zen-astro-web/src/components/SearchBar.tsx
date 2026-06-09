import { useState, useRef, useEffect } from "preact/hooks"

interface SearchHit {
  id: string
  collection: string
  title: string
  slug: string
  text: string
}

interface SearchResult {
  collection: string
  hits: SearchHit[]
  total: number
}

interface Props {
  apiUrl: string
}

function linkFor(collection: string, slug: string): string {
  const routes: Record<string, string> = {
    articles: "/articles",
    products: "/products",
    courses: "/courses",
    events: "/events",
  }
  return `${routes[collection] || "/"}/${slug}`
}

export default function SearchBar({ apiUrl }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleInput(value: string) {
    setQuery(value)
    if (timerRef.current) clearTimeout(timerRef.current)

    if (!value.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    timerRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`${apiUrl}/api/search/query?q=${encodeURIComponent(value)}`)
        if (!res.ok) return
        const data = await res.json()
        const r = (data.results || []) as SearchResult[]
        setResults(r)
        setIsOpen(true)
      } catch {
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)
  }

  function totalResults(): number {
    return results.reduce((sum, r) => sum + r.total, 0)
  }

  return (
    <div className="search-bar" ref={wrapperRef}>
      <div className="search-input-wrap">
        <input
          type="search"
          className="search-input"
          placeholder="Search articles, products, courses..."
          value={query}
          onInput={(e) => handleInput((e.target as HTMLInputElement).value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
        />
        {isLoading && <span className="spinner" />}
      </div>

      {isOpen && totalResults() > 0 && (
        <div className="dropdown">
          {results.map((group) => (
            <div className="group">
              <div className="group-header">
                {group.collection.charAt(0).toUpperCase() + group.collection.slice(1)} ({group.total})
              </div>
              {group.hits.slice(0, 5).map((hit) => (
                <a href={linkFor(hit.collection, hit.slug)} className="hit" onClick={() => setIsOpen(false)}>
                  <span className="hit-title">{hit.title}</span>
                  <span className="hit-text">{hit.text}</span>
                </a>
              ))}
            </div>
          ))}
          {totalResults() > 0 && (
            <a href={`/search?q=${encodeURIComponent(query)}`} className="view-all">
              View all {totalResults()} results
            </a>
          )}
        </div>
      )}
    </div>
  )
}
