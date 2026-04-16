import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Discover() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const { user: currentUser } = useAuth()
  const toast = useToast()

  const fetchUsers = async (search = '') => {
    try {
      const res = await api.get(`/discover?limit=50${search ? `&search=${encodeURIComponent(search)}` : ''}`)
      setUsers(res.data.data)
    } catch (err) {
      toast.showError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const query = searchParams.get('search') || ''
    setSearchQuery(query)
    fetchUsers(query)
  }, [searchParams])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams({ search: searchQuery })
  }

  const handleFollow = async (userId) => {
    setFollowLoading(prev => ({ ...prev, [userId]: true }))
    try {
      const user = users.find(u => u.id === userId)
      if (user.is_following) {
        await api.delete(`/follow/${userId}`)
        toast.showInfo(`Unfollowed @${user.email.split('@')[0]}`)
      } else {
        await api.post(`/follow/${userId}`)
        toast.showSuccess(`Following @${user.email.split('@')[0]}`)
      }
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_following: !u.is_following } : u
      ))
    } catch (err) {
      toast.showError('Action failed')
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }))
    }
  }

  if (loading) return <div className="p-3 text-center">Loading...</div>

  return (
    <div className="container-fluid px-0 px-md-2">
      <div className="d-flex align-items-center gap-2 mb-4">
        <h2 className="fs-4 mb-0">
          <i className="bi bi-compass me-2"></i>Discover
        </h2>
        <form className="flex-grow-1 d-flex d-md-none" onSubmit={handleSearch}>
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary rounded-pill ms-2">
            <i className="bi bi-search"></i>
          </button>
        </form>
      </div>
      
      {users.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-people fs-1 text-muted"></i>
          <p className="text-secondary mt-3">No users found.</p>
        </div>
      ) : (
        <div className="row g-3">
          {users.map(user => (
            <div className="col-12" key={`discover-${user.id}`}>
              <div className="card border-0 shadow-sm">
                <div className="card-body p-3">
                  <div className="d-flex align-items-start">
                    <Link to={`/profile/${user.id}`} className="me-3">
                      <Avatar src={user.avatar} name={user.name} size={56} />
                    </Link>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <Link to={`/profile/${user.id}`} className="text-decoration-none">
                            <h6 className="mb-0 fw-semibold text-dark">{user.name}</h6>
                          </Link>
                          <small className="text-secondary">@{user.email.split('@')[0]}</small>
                        </div>
                        <button
                          className={`btn btn-sm ${user.is_following ? 'btn-outline-secondary' : 'btn-primary'}`}
                          onClick={() => handleFollow(user.id)}
                          disabled={followLoading[user.id]}
                        >
                          <i className={`bi ${user.is_following ? 'bi-person-dash' : 'bi-person-plus'} me-1`}></i>
                          {user.is_following ? 'Unfollow' : 'Follow'}
                        </button>
                      </div>
                      {user.bio && <p className="text-secondary small mt-2 mb-0">{user.bio}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
