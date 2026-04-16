import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import NoteCard from '../components/NoteCard'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Profile() {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const [profile, setProfile] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockedBy, setBlockedBy] = useState(false)
  const [canMessage, setCanMessage] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [blockLoading, setBlockLoading] = useState(false)

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/profile/${id}`)
      const data = res.data.data
      setProfile(data.user)
      setNotes(data.notes || [])
      setIsFollowing(data.is_following)
      setIsBlocked(data.is_blocked)
      setBlockedBy(data.blocked_by)
      setCanMessage(data.can_message || false)
    } catch (err) {
      toast.showError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProfile() }, [id])

  const handleFollow = async () => {
    if (!currentUser) return
    setFollowLoading(true)
    try {
      if (isFollowing) {
        await api.delete(`/follow/${id}`)
        setIsFollowing(false)
        setProfile(p => ({ ...p, followers_count: p.followers_count - 1 }))
        toast.showInfo('Unfollowed')
      } else {
        await api.post(`/follow/${id}`)
        setIsFollowing(true)
        setProfile(p => ({ ...p, followers_count: p.followers_count + 1 }))
        toast.showSuccess('Following')
      }
    } catch (err) {
      toast.showError('Action failed')
    } finally {
      setFollowLoading(false)
    }
  }

  const handleBlock = async () => {
    if (!currentUser) return
    setBlockLoading(true)
    try {
      if (isBlocked) {
        await api.delete(`/block/${id}`)
        setIsBlocked(false)
        toast.showInfo('Unblocked')
      } else {
        await api.post(`/block/${id}`)
        setIsBlocked(true)
        toast.showSuccess('Blocked')
      }
      fetchProfile()
    } catch (err) {
      toast.showError('Action failed')
    } finally {
      setBlockLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-person-x fs-1 text-muted"></i>
        <h3 className="mt-3">User not found</h3>
      </div>
    )
  }

  const isOwnProfile = currentUser && currentUser.id === parseInt(id)

  return (
    <div className="container-fluid px-0 px-md-2">
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="bg-primary bg-opacity-10" style={{ height: '120px' }}></div>
        <div className="card-body position-relative pt-0">
          <div className="d-flex flex-column flex-md-row align-items-md-end">
            <div className="position-relative" style={{ marginTop: '-50px' }}>
              <Avatar 
                src={profile.avatar} 
                name={profile.name} 
                size={100} 
                className="border border-white border-3"
              />
            </div>
            <div className="ms-md-3 mt-2 mt-md-0 flex-grow-1">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                <h2 className="h2 mb-0 fw-bold">{profile.name}</h2>
                <span className="text-secondary">@{profile.email?.split('@')[0]}</span>
              </div>
              {profile.bio && <p className="mb-3 text-secondary">{profile.bio}</p>}
              <div className="d-flex gap-4 mb-3">
                <div>
                  <span className="fw-bold">{profile.followers_count}</span>{' '}
                  <span className="text-secondary">followers</span>
                </div>
                <div>
                  <span className="fw-bold">{profile.following_count}</span>{' '}
                  <span className="text-secondary">following</span>
                </div>
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-3 mt-md-0">
              {!isOwnProfile && (
                <>
                  {profile.allow_follow !== 0 && !blockedBy && !isBlocked && (
                    <button 
                      className={`btn ${isFollowing ? 'btn-outline-secondary' : 'btn-primary'} rounded-pill px-4`} 
                      onClick={handleFollow} 
                      disabled={followLoading}
                    >
                      <i className={`bi ${isFollowing ? 'bi-person-dash' : 'bi-person-plus'} me-1`}></i>
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                  <button 
                    className={`btn ${isBlocked ? 'btn-outline-danger' : 'btn-outline-secondary'} rounded-pill px-4`} 
                    onClick={handleBlock} 
                    disabled={blockLoading}
                  >
                    <i className={`bi ${isBlocked ? 'bi-shield-check' : 'bi-shield-slash'} me-1`}></i>
                    {isBlocked ? 'Unblock' : 'Block'}
                  </button>
                  {canMessage && (
                    <Link to={`/chat?user=${profile.id}`} className="btn btn-outline-success rounded-pill px-4">
                      <i className="bi bi-chat-dots me-1"></i>Message
                    </Link>
                  )}
                </>
              )}
              {isOwnProfile && (
                <Link to="/settings" className="btn btn-outline-primary rounded-pill px-4">
                  <i className="bi bi-pencil me-1"></i>Edit Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <h4 className="mb-3 fw-semibold">
        <i className="bi bi-file-earmark-text me-2"></i>Public Notes
      </h4>
      {blockedBy ? (
        <div className="text-center py-5">
          <i className="bi bi-shield-slash fs-1 text-muted"></i>
          <p className="text-muted mt-3">You cannot view this user's notes.</p>
        </div>
      ) : isBlocked ? (
        <div className="text-center py-5">
          <i className="bi bi-shield-slash fs-1 text-muted"></i>
          <p className="text-muted mt-3">You have blocked this user.</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-journal-bookmark fs-1 text-muted"></i>
          <p className="text-muted mt-3">No public notes yet.</p>
        </div>
      ) : (
        notes.map(note => (
          <NoteCard 
            key={note.id} 
            note={note} 
            onDelete={() => {}} 
            currentUserId={currentUser?.id} 
          />
        ))
      )}
    </div>
  )
}
