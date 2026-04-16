import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Avatar from '../components/Avatar'
import { useToast } from '../context/ToastContext'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=100')
      setNotifications(res.data.data)
    } catch (err) {
      toast.showError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n))
    } catch (err) {
      toast.showError('Failed to mark as read')
    }
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read: 1 })))
      toast.showSuccess('All notifications marked read')
    } catch (err) {
      toast.showError('Failed to mark all read')
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

  if (loading) return <div className="p-3 text-center">Loading...</div>

  return (
    <div className="container-fluid px-0 px-md-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fs-4">
          <i className="bi bi-bell me-2"></i>Notifications
        </h2>
        {notifications.some(n => !n.read) && (
          <button className="btn btn-sm btn-outline-primary" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-bell-slash fs-1 text-muted"></i>
          <h4 className="mt-3">No notifications</h4>
          <p className="text-secondary">We'll let you know when something happens.</p>
        </div>
      ) : (
        <div className="list-group list-group-flush">
          {notifications.map(notif => (
            <Link
              key={`notif-${notif.id}`}
              to={getNotificationLink(notif)}
              className={`list-group-item list-group-item-action d-flex align-items-start px-0 py-3 ${!notif.read ? 'bg-light' : ''}`}
              onClick={() => !notif.read && markAsRead(notif.id)}
            >
              <Avatar src={notif.actor_avatar} name={notif.actor_name} size={48} className="me-3" />
              <div className="flex-grow-1">
                <div className="mb-1">
                  {getNotificationText(notif)}
                </div>
                <small className="text-secondary">
                  {notif.created_at ? new Date(notif.created_at).toLocaleString() : ''}
                </small>
              </div>
              {!notif.read && (
                <span className="badge bg-primary rounded-circle p-1 ms-2" style={{ width: '8px', height: '8px' }}></span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
