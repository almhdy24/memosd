import { useState, useEffect, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import ConversationList from '../components/ConversationList'
import ChatArea from '../components/ChatArea'

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8300'

export default function Chat() {
  const { user } = useAuth()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [socket, setSocket] = useState(null)
  const typingTimeoutRef = useRef(null)

  // Socket.IO connection
  useEffect(() => {
    if (!user) return

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      query: { userId: user.id }
    })

    newSocket.on('connect', () => {
      console.log('Socket.IO connected')
      newSocket.emit('auth', user.id)
    })

    newSocket.on('message', (data) => {
      // Handle incoming private message
      setMessages(prev => [...prev, {
        id: Date.now(), // temporary ID; server should send real ID
        sender_id: data.from,
        content: data.message,
        created_at: new Date().toISOString(),
        read: false
      }])
      fetchConversations()
    })

    newSocket.on('typing', (data) => {
      if (data.from === otherUser?.id) {
        setIsTyping(data.isTyping)
      }
    })

    newSocket.on('user_status', (data) => {
      setConversations(prev => prev.map(conv => {
        if (conv.other_user.id === data.userId) {
          return {
            ...conv,
            other_user: {
              ...conv.other_user,
              is_online: data.status === 'online'
            }
          }
        }
        return conv
      }))
      if (otherUser?.id === data.userId) {
        setOtherUser(prev => ({ ...prev, is_online: data.status === 'online' }))
      }
    })

    newSocket.on('disconnect', () => {
      console.log('Socket.IO disconnected')
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [user])

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/chat/conversations')
      setConversations(res.data.data)
      
      const userIdParam = searchParams.get('user')
      if (userIdParam) {
        const targetUserId = parseInt(userIdParam)
        const existingConv = res.data.data.find(c => c.other_user.id === targetUserId)
        if (existingConv) {
          handleSelectConv(existingConv)
        } else {
          try {
            const userRes = await api.get(`/profile/${targetUserId}`)
            setOtherUser({
              ...userRes.data.data.user,
              is_online: false
            })
            setSelectedConv(null)
            setMessages([])
            setShowChat(true)
          } catch (e) {
            toast.showError('User not found')
          }
        }
      }
    } catch (err) {
      toast.showError('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [searchParams, toast])

  const fetchMessages = useCallback(async (convId) => {
    try {
      const res = await api.get(`/chat/conversations/${convId}`)
      setMessages(res.data.data.messages)
      setOtherUser(res.data.data.other_user)
      await api.put(`/chat/read/${convId}`)
    } catch (err) {
      toast.showError('Failed to load messages')
    }
  }, [toast])

  useEffect(() => {
    fetchConversations()
    const convInterval = setInterval(fetchConversations, 10000)
    return () => clearInterval(convInterval)
  }, [fetchConversations])

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv)
    }
  }, [selectedConv, fetchMessages])

  const handleSelectConv = (conv) => {
    setSelectedConv(conv.id)
    setOtherUser(conv.other_user)
    setShowChat(true)
  }

  const handleBack = () => {
    setShowChat(false)
    setSelectedConv(null)
    setMessages([])
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !otherUser || !socket) return

    const tempMessage = {
      id: Date.now(),
      sender_id: user.id,
      content: newMessage,
      created_at: new Date().toISOString(),
      pending: true,
      read: false
    }

    setMessages(prev => [...prev, tempMessage])
    setNewMessage('')

    socket.emit('message', {
      to: otherUser.id,
      message: newMessage
    })

    // Save message to backend via REST as fallback
    try {
      await api.post(`/chat/messages/${otherUser.id}`, {
        content: newMessage,
        recipient_id: otherUser.id
      })
      fetchMessages(selectedConv)
    } catch (err) {
      toast.showError('Failed to save message')
    }
  }

  const handleTyping = (typing) => {
    if (!socket || !otherUser) return
    socket.emit('typing', {
      to: otherUser.id,
      isTyping: typing
    })
  }

  if (loading) return <div className="p-3 text-center">Loading...</div>

  return (
    <div className="d-flex h-100 w-100 overflow-hidden">
      <div 
        className={`bg-white border-end d-flex flex-column ${
          showChat ? 'd-none d-md-flex' : 'd-flex'
        }`}
        style={{ 
          width: '100%', 
          maxWidth: showChat ? '0' : '100%',
          transition: 'max-width 0.3s ease'
        }}
      >
        <div className="p-3 border-bottom">
          <h5 className="mb-0 fw-semibold">Messages</h5>
        </div>
        <div className="flex-grow-1 overflow-auto">
          <ConversationList 
            conversations={conversations} 
            selectedId={selectedConv} 
            onSelect={handleSelectConv}
            currentUserId={user?.id}
          />
        </div>
      </div>

      <div 
        className={`flex-grow-1 d-flex flex-column bg-white ${
          !showChat ? 'd-none d-md-flex' : 'd-flex'
        }`}
      >
        {selectedConv || otherUser ? (
          <ChatArea 
            otherUser={otherUser}
            messages={messages}
            currentUserId={user?.id}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSend={handleSend}
            sending={sending}
            onBack={handleBack}
            isTyping={isTyping}
            onTyping={handleTyping}
          />
        ) : (
          <div className="d-none d-md-flex align-items-center justify-content-center w-100 h-100 text-muted">
            <div className="text-center">
              <i className="bi bi-chat-dots fs-1 mb-3"></i>
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
