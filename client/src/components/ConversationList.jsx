import { Link } from 'react-router-dom'

export default function ConversationList({ conversations, selectedId, onSelect, currentUserId }) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-5 px-3">
        <i className="bi bi-chat-dots fs-1 text-muted"></i>
        <p className="text-muted mt-3">No conversations yet</p>
        <Link to="/discover" className="btn btn-primary btn-sm rounded-pill px-4">
          Discover People
        </Link>
      </div>
    )
  }

  return (
    <div className="list-group list-group-flush">
      {conversations.map(conv => (
        <button
          key={conv.id}
          className={`list-group-item list-group-item-action d-flex align-items-center px-3 py-3 border-0 ${selectedId === conv.id ? 'bg-light' : ''}`}
          onClick={() => onSelect(conv)}
          style={{ transition: 'all 0.2s ease' }}
        >
          <div className="position-relative me-3 flex-shrink-0">
            <img 
              src={conv.other_user.avatar || 'https://via.placeholder.com/48'} 
              className="rounded-circle" 
              width="52" 
              height="52" 
              alt="" 
              style={{ objectFit: 'cover' }}
            />
            {conv.other_user.is_online && (
              <span className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white" style={{ width: '14px', height: '14px' }}></span>
            )}
            {conv.unread_count > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                {conv.unread_count}
              </span>
            )}
          </div>
          <div className="flex-grow-1 text-start min-w-0">
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-semibold text-dark text-truncate">{conv.other_user.name}</span>
              {conv.last_message?.created_at && (
                <small className="text-secondary flex-shrink-0 ms-2" style={{ fontSize: '0.7rem' }}>
                  {new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              )}
            </div>
            <div className="d-flex align-items-center">
              {conv.last_message?.sender_id === currentUserId && (
                <i className={`bi ${conv.last_message?.read ? 'bi-check-all text-info' : 'bi-check text-secondary'} me-1`} style={{ fontSize: '0.9rem' }}></i>
              )}
              <small className="text-secondary text-truncate">
                {conv.last_message?.content || 'Start a conversation'}
              </small>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
