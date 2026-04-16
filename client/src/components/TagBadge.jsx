export default function TagBadge({ name }) {
  return (
    <span className="badge bg-light text-secondary border me-1 mb-1">
      <i className="bi bi-tag-fill me-1 small"></i>
      {name}
    </span>
  )
}
