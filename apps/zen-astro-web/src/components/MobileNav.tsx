import { useState } from "preact/hooks"

interface NavItem {
  label: string
  href: string
}

interface Props {
  items: NavItem[]
}

export default function MobileNav({ items }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mobile-nav">
      <button
        className="hamburger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        <span className={`bar ${isOpen ? "open" : ""}`} />
        <span className={`bar ${isOpen ? "open" : ""}`} />
        <span className={`bar ${isOpen ? "open" : ""}`} />
      </button>

      {isOpen && (
        <div className="mobile-menu">
          {items.map((item) => (
            <a href={item.href} className="mobile-link" onClick={() => setIsOpen(false)}>
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
