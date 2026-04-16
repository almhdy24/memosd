import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Avatar from './Avatar'
import beep from '../utils/beep'

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastNotificationId, setLastNotificationId] = useState(null)

  const fetchNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        api.get('/notifications?limit=10'),
        api.get('/notifications/unread-count')
      ])
      const newNotifications = notifRes.data.data || []
      const newCount = countRes.data.data?.count || 0
      
      if (newCount > unreadCount && newNotifications.length > 0) {
        const latestNotif = newNotifications[0]
        if (latestNotif.id !== lastNotificationId) {
          beep()
          setLastNotificationId(latestNotif.id)
        }
      }
      
      setNotifications(newNotifications)
      setUnreadCount(newCount)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [unreadCount, lastNotificationId])

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark read:', err)
    }
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read: 1 })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }

  const getNotificationText = (notif) => {
    switch (notif.type) {
      case 'like': return <><strong>{notif.actor_name}</strong> liked your note</>
      case 'comment': return <><strong>{notif.actor_name}</strong> commented on your note</>
      case 'follow': return <><strong>{notif.actor_name}</strong> followed you</>
      default: return 'New notification'
    }
  }

  const getNotificationLink = (notif) => {
    if (notif.note_id) return `/notes/${notif.note_id}`
    if (notif.type === 'follow') return `/profile/${notif.actor_id}`
    return '#'
  }

  if (loading) return null

  return (
    <div className="dropdown">
      <button 
        className="btn btn-outline-light position-relative" 
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <i className="bi bi-bell"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div 
          className="dropdown-menu dropdown-menu-end show p-0" 
          style={{ 
            minWidth: window.innerWidth < 576 ? '100vw' : '360px', 
            maxHeight: '70vh', 
            overflowY: 'auto',
            right: 0,
            left: window.innerWidth < 576 ? 0 : 'auto',
            position: 'fixed',
            top: '56px'
          }}
        >
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom sticky-top bg-white">
            <h6 className="mb-0 fw-bold">Notifications</h6>
            {unreadCount > 0 && (
              <button className="btn btn-sm btn-link text-primary" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-muted text-center py-5">No notifications yet</p>
          ) : (
            notifications.map(notif => (
              <Link 
                key={`center-${notif.id}`}
                to={getNotificationLink(notif)}
                className={`text-decoration-none d-block p-3 border-bottom ${!notif.read ? 'bg-light' : ''}`}
                onClick={() => {
                  if (!notif.read) markAsRead(notif.id)
                  setShowDropdown(false)
                }}
              >
                <div className="d-flex">
                  <Avatar src={notif.actor_avatar} name={notif.actor_name} size={40} className="me-3" />
                  <div className="flex-grow-1">
                    <div className="mb-1">
                      {getNotificationText(notif)}
                    </div>
                    <small className="text-secondary">
                      {notif.created_at ? new Date(notif.created_at).toLocaleString() : ''}
                    </small>
                  </div>
                  {!notif.read && (
                    <div className="ms-2">
                      <span className="badge bg-primary rounded-circle p-1" style={{ width: '8px', height: '8px' }}></span>
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
          <div className="p-2 text-center border-top">
            <Link to="/notifications" className="text-decoration-none small" onClick={() => setShowDropdown(false)}>
              See all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
