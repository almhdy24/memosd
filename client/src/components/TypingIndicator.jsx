export default function TypingIndicator({ isTyping, userName }) {
  if (!isTyping) return null
  return (
    <div className="d-flex align-items-center text-secondary small mb-2">
      <span className="me-2">{userName} is typing</span>
      <div className="spinner-grow spinner-grow-sm text-secondary me-1" role="status" style={{ animationDuration: '1s' }} />
      <div className="spinner-grow spinner-grow-sm text-secondary me-1" role="status" style={{ animationDuration: '1s', animationDelay: '0.2s' }} />
      <div className="spinner-grow spinner-grow-sm text-secondary" role="status" style={{ animationDuration: '1s', animationDelay: '0.4s' }} />
    </div>
  )
}
