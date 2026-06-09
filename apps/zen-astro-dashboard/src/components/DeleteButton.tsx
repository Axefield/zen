import { useState } from "preact/hooks"

interface Props {
  collection: string
  id: number
  title: string
  apiUrl: string
}

export default function DeleteButton({ collection, id, title, apiUrl }: Props) {
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    const match = document.cookie.match(/(?:^|;\s*)zen_token=([^;]*)/)
    const token = match ? decodeURIComponent(match[1]) : null
    if (!token) return

    try {
      const res = await fetch(`${apiUrl}/api/content/${collection}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (res.ok) {
        window.location.reload()
      } else {
        const data = await res.json().catch(() => ({}))
        alert((data as Record<string, unknown>).error as string ?? "Failed to delete")
      }
    } catch {
      alert("Failed to delete")
    }
  }

  if (confirming) {
    return (
      <span className="delete-confirm">
        <button className="btn-yes" onClick={handleDelete}>Delete</button>
        <button className="btn-no" onClick={() => setConfirming(false)}>Cancel</button>
      </span>
    )
  }

  return (
    <button
      className="btn-delete"
      onClick={() => setConfirming(true)}
      title={`Delete ${title}`}
    >
      Delete
    </button>
  )
}
