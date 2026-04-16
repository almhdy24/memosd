import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'

export default function Following() {
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const confirm = useConfirm()
  const [following, setFollowing] = useState([])
  const [loading, setLoading] = useState(true)
  const [unfollowLoading, setUnfollowLoading] = useState({})

  const fetchFollowing = async () => {
    try {
      const res = await api.get('/discover?limit=100')
      const allUsers = res.data.data
      const followingUsers = allUsers.filter(u => u.is_following)
      setFollowing(followingUsers)
    } catch (err) {
      toast.showError('Failed to load following')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFollowing()
  }, [])

  const handleUnfollow = async (userId, userName) => {
    const confirmed = await confirm('Unfollow', `Stop following ${userName}?`)
    if (!confirmed) return
    setUnfollowLoading(prev => ({ ...prev, [userId]: true }))
    try {
      await api.delete(`/follow/${userId}`)
      setFollowing(following.filter(u => u.id !== userId))
      toast.showInfo(`Unfollowed @${userName}`)
    } catch (err) {
      toast.showError('Failed to unfollow')
    } finally {
      setUnfollowLoading(prev => ({ ...prev, [userId]: false }))
    }
  }

  if (loading) return <div className="p-3">Loading...</div>

  return (
    <div className="container-fluid px-0 px-md-2">
      <h2 className="fs-4 mb-3">
        <i className="bi bi-people me-2"></i>Following
      </h2>
      {following.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-person-x fs-1 text-muted"></i>
          <h4 className="mt-3">Not following anyone</h4>
          <p className="text-secondary">Discover people to see their notes.</p>
          <Link to="/discover" className="btn btn-primary mt-3">
            <i className="bi bi-compass me-1"></i>Discover People
          </Link>
        </div>
      ) : (
        <div className="list-group list-group-flush">
          {following.map(user => (
            <div key={`following-${user.id}`} className="list-group-item bg-transparent px-0 py-3">
              <div className="d-flex align-items-start">
                <Link to={`/profile/${user.id}`} className="me-3">
                  <Avatar src={user.avatar} name={user.name} size={48} />
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
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleUnfollow(user.id, user.email.split('@')[0])}
                      disabled={unfollowLoading[user.id]}
                    >
                      <i className="bi bi-person-dash me-1"></i>Unfollow
                    </button>
                  </div>
                  {user.bio && <p className="text-secondary small mt-2 mb-0">{user.bio}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
