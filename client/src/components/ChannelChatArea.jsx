import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'

export default function ChannelChatArea({ channel, currentUserId, socket, onBack }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [joining, setJoining] = useState(false)
  const messagesEndRef = useRef(null)
  const toast = useToast()

  const fetchChannelData = async () => {
    try {
      const [msgsRes, membersRes] = await Promise.all([
        api.get(`/channels/${channel.id}/messages`),
        api.get(`/channels/${channel.id}/members`)
      ])
      setMessages(msgsRes.data.data || [])
      setMembers(membersRes.data.data || [])
    } catch (err) {
      toast.showError('Failed to load channel data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (channel) fetchChannelData()
  }, [channel])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // WebSocket message handling
  useEffect(() => {
    if (!socket || !channel) return

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'channel_message' && data.message.channel_id === channel.id) {
          setMessages(prev => [...prev, data.message])
        }
      } catch (e) {}
    }

    // Subscribe to channel messages
    if (socket.isConnected) {
      socket.send(JSON.stringify({ type: 'join_channel', channelId: channel.id }))
    }

    // Note: WebSocket message handling is already done globally in Chat.jsx
    // This is just for cleanup

    return () => {
      if (socket.isConnected) {
        socket.send(JSON.stringify({ type: 'leave_channel', channelId: channel.id }))
      }
    }
  }, [socket, channel])

  const handleSend = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket) return

    const messageData = {
      type: 'channel_message',
      channelId: channel.id,
      content: newMessage
    }

    if (socket.isConnected) {
      socket.send(JSON.stringify(messageData))
      setNewMessage('')
    } else {
      // Fallback to REST (if needed)
      toast.showError('Cannot send message: offline')
    }
  }

  const handleJoin = async () => {
    setJoining(true)
    try {
      await api.post(`/channels/${channel.id}/join`)
      toast.showSuccess('Joined channel')
      await fetchChannelData()
    } catch (err) {
      toast.showError(err.response?.data?.message || 'Failed to join channel')
    } finally {
      setJoining(false)
    }
  }

  const isMember = members.some(m => m.user_id === currentUserId)

  if (loading) return <div className="p-3 text-center">Loading...</div>

  return (
    <div className="d-flex flex-column h-100 w-100 bg-white">
      <div className="d-flex align-items-center px-3 py-2 border-bottom">
        <button className="btn btn-link text-dark d-md-none me-2 p-0" onClick={onBack}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
          <i className="bi bi-people-fill text-primary"></i>
        </div>
        <div className="flex-grow-1">
          <h6 className="mb-0 fw-semibold">{channel.name}</h6>
          <small className="text-secondary">{members.length} members</small>
        </div>
        <button className="btn btn-sm btn-outline-secondary rounded-pill me-2" onClick={() => setShowMembers(!showMembers)}>
          <i className="bi bi-people"></i>
        </button>
        {!isMember && (
          <button className="btn btn-sm btn-primary rounded-pill" onClick={handleJoin} disabled={joining}>
            {joining ? 'Joining...' : 'Join'}
          </button>
        )}
      </div>

      {showMembers && (
        <div className="border-bottom p-3 bg-light" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          <h6 className="small text-secondary mb-2">Members</h6>
          {members.map(m => (
            <div key={m.user_id} className="d-flex align-items-center mb-2">
              <Avatar src={m.avatar} name={m.name} size={24} className="me-2" />
              <span className="small">{m.name}</span>
              {m.role === 'admin' && <span className="badge bg-primary ms-2">Admin</span>}
            </div>
          ))}
        </div>
      )}

      <div className="flex-grow-1 p-3 overflow-auto" style={{ backgroundColor: '#f0f2f5' }}>
        {messages.length === 0 ? (
          <p className="text-muted text-center mt-5">No messages yet.</p>
        ) : (
          messages.map(msg => {
            const isOwn = msg.sender_id === currentUserId
            return (
              <div key={msg.id} className={`d-flex mb-2 ${isOwn ? 'justify-content-end' : ''}`}>
                {!isOwn && <Avatar src={msg.sender_avatar} name={msg.sender_name} size={28} className="me-2 align-self-end" />}
                <div className={`p-2 rounded-3 ${isOwn ? 'bg-primary text-white' : 'bg-white border'}`} style={{ maxWidth: '75%' }}>
                  {!isOwn && <div className="small fw-semibold mb-1">{msg.sender_name}</div>}
                  <div>{msg.content}</div>
                  <small className={isOwn ? 'text-white-50' : 'text-secondary'} style={{ fontSize: '0.65rem' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </div>
                {isOwn && <Avatar src={msg.sender_avatar} name={msg.sender_name} size={28} className="ms-2 align-self-end" />}
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {isMember && (
        <form onSubmit={handleSend} className="p-3 border-top d-flex gap-2">
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-primary rounded-circle" style={{ width: '40px', height: '40px' }} disabled={sending}>
            <i className="bi bi-send-fill"></i>
          </button>
        </form>
      )}
    </div>
  )
}
