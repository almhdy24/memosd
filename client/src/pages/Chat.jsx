import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import ConversationList from '../components/ConversationList'
import ChatArea from '../components/ChatArea'
import ChannelList from '../components/ChannelList'
import ChannelChatArea from '../components/ChannelChatArea'
import { useWebSocket } from '../hooks/useWebSocket'

export default function Chat() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('direct')
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  // WebSocket with auto-reconnect
  const { isConnected, send } = useWebSocket('ws://localhost:8082', user?.id, (data) => {
    if (data.type === 'message') {
      if (selectedConv) setMessages(prev => [...prev, data.message])
      fetchConversations()
    } else if (data.type === 'channel_message') {
      if (selectedChannel && data.message.channel_id === selectedChannel.id) {
        setMessages(prev => [...prev, data.message])
      }
    } else if (data.type === 'typing') {
      setIsTyping(data.isTyping)
    }
  })

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/chat/conversations')
      setConversations(res.data.data)
      const userIdParam = searchParams.get('user')
      if (userIdParam && activeTab === 'direct') {
        const targetUserId = parseInt(userIdParam)
        const existingConv = res.data.data.find(c => c.other_user.id === targetUserId)
        if (existingConv) {
          handleSelectConv(existingConv)
        } else {
          try {
            const [userRes, statusRes] = await Promise.all([
              api.get(`/profile/${targetUserId}`),
              api.get(`/user-status/${targetUserId}`)
            ])
            setOtherUser({
              ...userRes.data.data.user,
              is_online: statusRes.data.data?.is_online || false,
              last_seen: statusRes.data.data?.last_seen
            })
            setSelectedChannel(null)
            setShowChat(true)
          } catch (e) {}
        }
      }
    } catch (err) {
      toast.showError('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [toast, searchParams, activeTab])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  const fetchMessages = useCallback(async (convId) => {
    try {
      const res = await api.get(`/chat/conversations/${convId}`)
      setMessages(res.data.data.messages)
      setOtherUser(res.data.data.other_user)
      await api.put(`/chat/read/${convId}`)
    } catch (err) {}
  }, [])

  useEffect(() => {
    if (selectedConv) fetchMessages(selectedConv)
  }, [selectedConv, fetchMessages])

  const handleSelectConv = (conv) => {
    setSelectedConv(conv.id)
    setOtherUser(conv.other_user)
    setSelectedChannel(null)
    setShowChat(true)
  }

  const handleSelectChannel = (channel) => {
    setSelectedChannel(channel)
    setSelectedConv(null)
    setOtherUser(null)
    setShowChat(true)
  }

  const handleBack = () => {
    if (showChat) {
      setShowChat(false)
      setSelectedConv(null)
      setSelectedChannel(null)
    } else {
      navigate(-1)
    }
  }

  const handleSendDirect = async () => {
    if (!newMessage.trim() || !otherUser) return
    
    const tempId = Date.now()
    const tempMessage = {
      id: tempId,
      sender_id: user.id,
      content: newMessage,
      created_at: new Date().toISOString(),
      sender_name: user.name,
      sender_avatar: user.avatar,
      pending: true,
      read: false
    }
    setMessages(prev => [...prev, tempMessage])
    setNewMessage('')
    setSending(true)

    // Try WebSocket first
    const sent = send({
      type: 'message',
      recipientId: otherUser.id,
      content: newMessage,
      tempId
    })

    if (!sent) {
      // Fallback to REST
      try {
        const res = await api.post(`/chat/messages/${otherUser.id}`, {
          content: newMessage,
          recipient_id: otherUser.id
        })
        setMessages(prev => prev.map(m => m.id === tempId ? { ...res.data.data, pending: false } : m))
        await fetchConversations()
        if (!selectedConv) {
          const updatedRes = await api.get('/chat/conversations')
          const newConv = updatedRes.data.data.find(c => c.other_user.id === otherUser.id)
          if (newConv) {
            setSelectedConv(newConv.id)
            setOtherUser(newConv.other_user)
          }
        }
      } catch (err) {
        setMessages(prev => prev.filter(m => m.id !== tempId))
        toast.showError(err.response?.data?.message || 'Failed to send message')
      }
    }
    setSending(false)
  }

  const handleTyping = (typing) => {
    if (!otherUser) return
    send({
      type: 'typing',
      recipientId: otherUser.id,
      isTyping: typing
    })
  }

  const handleNewChatSearch = async (q) => {
    setSearchQuery(q)
    if (!q.trim()) {
      setSearchResults([])
      return
    }
    try {
      const res = await api.get(`/discover?q=${encodeURIComponent(q)}&limit=20`)
      setSearchResults(res.data.data || [])
    } catch (err) {}
  }

  const startNewChat = (targetUser) => {
    setOtherUser(targetUser)
    setSelectedConv(null)
    setSelectedChannel(null)
    setMessages([])
    setShowChat(true)
    setShowNewChatModal(false)
    setSearchQuery('')
    setSearchResults([])
  }

  if (loading) return <div className="p-3 text-center">Loading...</div>

  return (
    <div className="d-flex h-100 w-100 overflow-hidden bg-white position-relative">
      <div className={`border-end d-flex flex-column bg-white ${showChat ? 'd-none d-md-flex' : 'd-flex'}`} style={{ width: '100%', maxWidth: showChat ? '0' : '100%', transition: 'all 0.3s ease' }}>
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          <div className="d-flex align-items-center">
            <button className="btn btn-link text-dark d-md-none me-2 p-0" onClick={handleBack}>
              <i className="bi bi-arrow-left fs-5"></i>
            </button>
            <h5 className="mb-0 fw-bold">Chats</h5>
          </div>
          <button className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }} onClick={() => setShowNewChatModal(true)}>
            <i className="bi bi-plus-lg fs-5"></i>
          </button>
        </div>
        <div className="border-bottom">
          <ul className="nav nav-tabs nav-fill">
            <li className="nav-item">
              <button className={`nav-link py-3 ${activeTab === 'direct' ? 'active' : ''}`} onClick={() => setActiveTab('direct')}>
                <i className="bi bi-chat-dots me-1"></i>Direct
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link py-3 ${activeTab === 'channels' ? 'active' : ''}`} onClick={() => setActiveTab('channels')}>
                <i className="bi bi-people-fill me-1"></i>Channels
              </button>
            </li>
          </ul>
        </div>
        {activeTab === 'direct' ? (
          <ConversationList conversations={conversations} selectedId={selectedConv} onSelect={handleSelectConv} currentUserId={user?.id} />
        ) : (
          <ChannelList onSelect={handleSelectChannel} />
        )}
      </div>

      <div className={`flex-grow-1 d-flex flex-column bg-white ${!showChat ? 'd-none d-md-flex' : 'd-flex'}`}>
        {selectedConv || otherUser ? (
          <ChatArea 
            otherUser={otherUser} 
            messages={messages} 
            currentUserId={user?.id} 
            newMessage={newMessage} 
            setNewMessage={setNewMessage} 
            onSend={handleSendDirect} 
            sending={sending} 
            onBack={handleBack} 
            isTyping={isTyping} 
            onTyping={handleTyping} 
          />
        ) : selectedChannel ? (
          <ChannelChatArea channel={selectedChannel} currentUserId={user?.id} socket={{ send, isConnected }} onBack={handleBack} />
        ) : (
          <div className="d-none d-md-flex align-items-center justify-content-center h-100 text-muted">
            <div className="text-center">
              <i className="bi bi-chat-dots fs-1 mb-3"></i>
              <p>Select a conversation or channel to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {showNewChatModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-white" style={{ zIndex: 1100 }}>
          <div className="d-flex flex-column h-100">
            <div className="d-flex align-items-center p-3 border-bottom">
              <button className="btn btn-link text-dark me-2 p-0" onClick={() => setShowNewChatModal(false)}>
                <i className="bi bi-arrow-left fs-5"></i>
              </button>
              <input type="text" className="form-control border-0 bg-transparent" placeholder="Search for people..." value={searchQuery} onChange={(e) => handleNewChatSearch(e.target.value)} autoFocus />
            </div>
            <div className="flex-grow-1 overflow-auto">
              {searchResults.map(user => (
                <button key={user.id} className="list-group-item list-group-item-action d-flex align-items-center p-3 border-0" onClick={() => startNewChat(user)}>
                  <img src={user.avatar || 'https://via.placeholder.com/48'} className="rounded-circle me-3" width="48" height="48" alt="" />
                  <div className="text-start">
                    <div className="fw-semibold">{user.name}</div>
                    <small className="text-secondary">@{user.email.split('@')[0]}</small>
                  </div>
                </button>
              ))}
              {searchQuery && searchResults.length === 0 && <p className="text-muted text-center py-4">No users found</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
