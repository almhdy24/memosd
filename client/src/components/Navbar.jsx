import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import NotificationCenter from './NotificationCenter'
import Avatar from './Avatar'
import SearchDropdown from './SearchDropdown'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand navbar-dark bg-primary px-2 px-md-3 sticky-top">
      {!showMobileSearch && (
        <Link to="/dashboard" className="navbar-brand text-white text-decoration-none">
          <i className="bi bi-journal-bookmark-fill me-2"></i>
          MemoSD
        </Link>
      )}
      
      {/* Desktop Search */}
      <div className="d-none d-md-block mx-auto" style={{ width: '40%', maxWidth: '400px' }}>
        <SearchDropdown />
      </div>
      
      {/* Mobile Search Bar (Collapsible) */}
      {showMobileSearch && (
        <div className="d-flex d-md-none w-100 align-items-center">
          <button 
            className="btn btn-link text-white p-0 me-2"
            onClick={() => setShowMobileSearch(false)}
          >
            <i className="bi bi-arrow-left fs-5"></i>
          </button>
          <div className="flex-grow-1">
            <SearchDropdown autoFocus={true} onSelect={() => setShowMobileSearch(false)} />
          </div>
        </div>
      )}
      
      <div className="ms-auto d-flex align-items-center gap-2">
        {!showMobileSearch && (
          <>
            <button 
              className="btn btn-link text-white d-md-none p-0"
              onClick={() => setShowMobileSearch(true)}
            >
              <i className="bi bi-search fs-5"></i>
            </button>
            
            {user && <NotificationCenter />}
            <div className="dropdown">
              <button 
                className="btn btn-link text-white p-0 d-flex align-items-center"
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ textDecoration: 'none' }}
              >
                <Avatar src={user?.avatar} name={user?.name} size={32} />
                <span className="text-white ms-2 d-none d-sm-inline">{user?.name}</span>
                <i className="bi bi-chevron-down ms-1"></i>
              </button>
              {showDropdown && (
                <div className="dropdown-menu dropdown-menu-end show" style={{ position: 'absolute', right: 0 }}>
                  <Link to={`/profile/${user?.id}`} className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <i className="bi bi-person me-2"></i>Profile
                  </Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <i className="bi bi-gear me-2"></i>Settings
                  </Link>
                  <Link to="/following" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <i className="bi bi-people me-2"></i>Following
                  </Link>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
