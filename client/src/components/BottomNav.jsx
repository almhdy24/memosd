import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function BottomNav() {
  const { user } = useAuth()
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    if (!user) return
    const fetchUnread = async () => {
      try {
        const res = await api.get('/chat/unread')
        setUnreadMessages(res.data.data?.count || 0)
      } catch (err) {
        console.error('Failed to fetch unread count', err)
      }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 10000)
    return () => clearInterval(interval)
  }, [user])

  return (
    <nav className="d-lg-none fixed-bottom bg-white border-top shadow-sm">
      <div className="d-flex justify-content-around align-items-end px-2" style={{ paddingBottom: '6px' }}>
        <NavItem to="/feed" icon="newspaper" label="Feed" />
        <NavItem to="/discover" icon="compass" label="Discover" />
        <div className="d-flex flex-column align-items-center mx-1" style={{ marginTop: '-20px' }}>
          <NavLink to="/notes" state={{ openForm: true }} className="btn btn-primary rounded-circle shadow d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', transition: 'transform 0.2s' }}>
            <i className="bi bi-plus-lg fs-3"></i>
          </NavLink>
          <span className="small text-secondary mt-1" style={{ fontSize: '0.7rem' }}>New</span>
        </div>
        <NavItem to="/chat" icon="chat-dots" label="Chat" badge={unreadMessages > 0 ? unreadMessages : null} />
        <NavItem to={`/profile/${user?.id}`} icon="person" label="Profile" />
      </div>
    </nav>
  )
}

function NavItem({ to, icon, label, badge }) {
  return (
    <NavLink to={to} className={({ isActive }) => `text-decoration-none text-center d-flex flex-column align-items-center py-1 px-2 position-relative ${isActive ? 'text-primary fw-semibold' : 'text-secondary'}`} style={{ minWidth: '64px' }}>
      {({ isActive }) => (
        <>
          <div className="position-relative">
            <i className={`bi bi-${icon} fs-5`} style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s' }}></i>
            {badge && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>{badge > 9 ? '9+' : badge}</span>}
          </div>
          <span className="small mt-1" style={{ fontSize: '0.7rem' }}>{label}</span>
          {isActive && <span className="position-absolute bottom-0 start-50 translate-middle-x bg-primary rounded-pill" style={{ width: '30px', height: '3px' }} />}
        </>
      )}
    </NavLink>
  )
}
