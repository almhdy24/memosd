import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <div className="p-3 h-100">
      <h5 className="mb-3 d-none d-lg-block">Menu</h5>
      <ul className="nav nav-pills flex-column">
        <li className="nav-item">
          <NavLink to="/feed" className={({ isActive }) => `nav-link py-2 ${isActive ? 'active' : ''}`}>
            <i className="bi bi-newspaper me-2"></i>Feed
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/discover" className={({ isActive }) => `nav-link py-2 ${isActive ? 'active' : ''}`}>
            <i className="bi bi-compass me-2"></i>Discover
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/following" className={({ isActive }) => `nav-link py-2 ${isActive ? 'active' : ''}`}>
            <i className="bi bi-people me-2"></i>Following
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link py-2 ${isActive ? 'active' : ''}`}>
            <i className="bi bi-speedometer2 me-2"></i>Dashboard
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/notes" className={({ isActive }) => `nav-link py-2 ${isActive ? 'active' : ''}`}>
            <i className="bi bi-file-earmark-text me-2"></i>Notes
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/chat" className={({ isActive }) => `nav-link py-2 ${isActive ? 'active' : ''}`}>
            <i className="bi bi-chat-dots me-2"></i>Chat
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/settings" className={({ isActive }) => `nav-link py-2 ${isActive ? 'active' : ''}`}>
            <i className="bi bi-gear me-2"></i>Settings
          </NavLink>
        </li>
      </ul>
    </div>
  )
}
