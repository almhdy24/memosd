import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TypingIndicator from './TypingIndicator'

export default function ChatArea({ 
  otherUser, 
  messages, 
  currentUserId, 
  newMessage, 
  setNewMessage, 
  onSend, 
  sending,
  onBack,
  isTyping,
  onTyping 
}) {
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleScroll = () => {
    if (!messagesContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newMessage.trim()) {
      onSend()
    }
  }

  const handleInputChange = (e) => {
    setNewMessage(e.target.value)
    if (onTyping) {
      if (typingTimeout) clearTimeout(typingTimeout)
      onTyping(true)
      setTypingTimeout(setTimeout(() => onTyping(false), 1500))
    }
  }

  const groupMessagesByDate = (msgs) => {
    const groups = []
    let lastDate = null
    msgs.forEach(msg => {
      const date = new Date(msg.created_at).toLocaleDateString()
      if (date !== lastDate) {
        groups.push({ type: 'date', date })
        lastDate = date
      }
      groups.push({ type: 'message', ...msg })
    })
    return groups
  }

  const groupedItems = groupMessagesByDate(messages)

  return (
    <>
      <style>{`
        .message-bubble {
          background: white;
          border-radius: 18px 18px 18px 4px;
          max-width: 75%;
          word-break: break-word;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .message-bubble-own {
          background: #2A6F97;
          color: white;
          border-radius: 18px 18px 4px 18px;
          max-width: 75%;
          word-break: break-word;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
      `}</style>
      <div className="d-flex flex-column h-100 w-100" style={{ backgroundColor: '#e5ded8' }}>
        {/* Header */}
        <div className="d-flex align-items-center px-3 py-2 border-bottom bg-white">
          <button className="btn btn-link text-dark d-md-none me-2 p-0" onClick={onBack}>
            <i className="bi bi-arrow-left fs-5"></i>
          </button>
          <div className="position-relative me-2">
            <img src={otherUser?.avatar || 'https://via.placeholder.com/40'} className="rounded-circle" width="40" height="40" alt="" />
            {otherUser?.is_online && (
              <span className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white" style={{ width: '12px', height: '12px' }}></span>
            )}
          </div>
          <div className="flex-grow-1">
            <Link to={`/profile/${otherUser?.id}`} className="text-decoration-none text-dark fw-semibold">{otherUser?.name}</Link>
            <div className="small">
              {otherUser?.is_online ? (
                <span className="text-success">Online</span>
              ) : (
                <span className="text-secondary">
                  {otherUser?.last_seen ? `Last seen ${new Date(otherUser.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-grow-1 p-3 overflow-auto position-relative" ref={messagesContainerRef} onScroll={handleScroll} style={{ backgroundColor: '#e5ded8' }}>
          {groupedItems.length === 0 ? (
            <div className="text-center text-muted mt-5">
              <i className="bi bi-chat-dots fs-1"></i>
              <p className="mt-3">No messages yet. Say hello!</p>
            </div>
          ) : (
            groupedItems.map((item, index) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${index}`} className="text-center my-3">
                    <span className="bg-white bg-opacity-75 px-3 py-1 rounded-pill small text-secondary">{item.date}</span>
                  </div>
                )
              }
              const msg = item
              const isOwn = msg.sender_id === currentUserId
              return (
                <div key={msg.id} className={`d-flex mb-2 ${isOwn ? 'justify-content-end' : ''}`}>
                  {!isOwn && (
                    <img src={msg.sender_avatar || otherUser?.avatar || 'https://via.placeholder.com/32'} className="rounded-circle me-2 align-self-end" width="32" height="32" alt="" />
                  )}
                  <div className={`position-relative p-3 ${isOwn ? 'message-bubble-own' : 'message-bubble'}`}>
                    <div>{msg.content}</div>
                    <div className="d-flex align-items-center justify-content-end gap-1 mt-1">
                      <small className={isOwn ? 'text-white-50' : 'text-secondary'} style={{ fontSize: '0.65rem' }}>
                        {msg.pending ? 'Sending...' : new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                      {isOwn && (
                        <i className={`bi ${msg.read ? 'bi-check-all text-info' : 'bi-check text-white-50'}`}></i>
                      )}
                    </div>
                  </div>
                  {isOwn && (
                    <img src={msg.sender_avatar || currentUserId?.avatar || 'https://via.placeholder.com/32'} className="rounded-circle ms-2 align-self-end" width="32" height="32" alt="" />
                  )}
                </div>
              )
            })
          )}
          <TypingIndicator isTyping={isTyping} userName={otherUser?.name} />
          <div ref={messagesEndRef} />
          {showScrollButton && (
            <button className="btn btn-light rounded-circle shadow position-absolute bottom-0 end-0 m-3" onClick={scrollToBottom} style={{ width: '40px', height: '40px' }}>
              <i className="bi bi-chevron-down"></i>
            </button>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 bg-white d-flex gap-2 align-items-center">
          <input type="text" className="form-control rounded-pill border-0 bg-light" placeholder="Message" value={newMessage} onChange={handleInputChange} />
          <button type="submit" className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '44px', height: '44px' }} disabled={sending || !newMessage.trim()}>
            <i className="bi bi-send-fill"></i>
          </button>
        </form>
      </div>
    </>
  )
}
