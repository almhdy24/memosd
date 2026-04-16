import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import Avatar from '../components/Avatar'
import EmojiPicker from '../components/EmojiPicker'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'

export default function Settings() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({ name: '', bio: '', allow_follow: true })
  const [loading, setLoading] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState([])
  const [blockedLoading, setBlockedLoading] = useState(true)
  const [unblockLoading, setUnblockLoading] = useState({})
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')
  const [uploading, setUploading] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', bio: user.bio || '', allow_follow: user.allow_follow !== 0 })
      setAvatarPreview(user.avatar || '')
    }
    fetchBlockedUsers()
  }, [user])

  const fetchBlockedUsers = async () => {
    try {
      const res = await api.get('/blocked')
      setBlockedUsers(res.data.data || [])
    } catch (err) {
      toast.showError('Failed to load blocked users')
    } finally {
      setBlockedLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const uploadAvatar = async () => {
    if (!avatarFile) return null
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', avatarFile)
      const res = await api.post('/upload/avatar', formData)
      return res.data.data.avatar
    } catch (err) {
      toast.showError('Failed to upload avatar')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let avatarUrl = user.avatar
      if (avatarFile) {
        const uploaded = await uploadAvatar()
        if (uploaded) avatarUrl = uploaded
      }
      const res = await api.put('/profile', {
        name: formData.name,
        bio: formData.bio,
        allow_follow: formData.allow_follow ? 1 : 0,
        ...(avatarUrl && { avatar: avatarUrl })
      })
      setUser({ ...res.data.data, avatar: avatarUrl })
      toast.showSuccess('Profile updated')
    } catch (err) {
      toast.showError('Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUnblock = async (userId, userName) => {
    const confirmed = await confirm('Unblock User', `Unblock ${userName}?`)
    if (!confirmed) return
    setUnblockLoading(prev => ({ ...prev, [userId]: true }))
    try {
      await api.delete(`/block/${userId}`)
      setBlockedUsers(prev => prev.filter(u => u.id !== userId))
      toast.showSuccess(`${userName} unblocked`)
    } catch (err) {
      toast.showError('Failed to unblock')
    } finally {
      setUnblockLoading(prev => ({ ...prev, [userId]: false }))
    }
  }

  const addEmojiToBio = (emoji) => {
    setFormData(prev => ({ ...prev, bio: prev.bio + emoji }))
  }

  return (
    <div className="container-fluid px-0 px-md-2">
      <h2 className="fs-4 mb-4"><i className="bi bi-gear me-2"></i>Settings</h2>
      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button className={`nav-link rounded-pill px-4 ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <i className="bi bi-person me-1"></i>Profile
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link rounded-pill px-4 ${activeTab === 'blocked' ? 'active' : ''}`} onClick={() => setActiveTab('blocked')}>
            <i className="bi bi-shield-slash me-1"></i>Blocked
          </button>
        </li>
      </ul>

      {activeTab === 'profile' && (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            <form onSubmit={handleProfileSubmit}>
              <div className="text-center mb-4">
                <div className="position-relative d-inline-block">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="rounded-circle" style={{ width: '120px', height: '120px', objectFit: 'cover' }} />
                  ) : (
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px' }}>
                      <i className="bi bi-person fs-1 text-primary"></i>
                    </div>
                  )}
                  <label className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-3" style={{ cursor: 'pointer' }}>
                    <i className="bi bi-camera"></i>
                    <input type="file" accept="image/*" className="d-none" onChange={handleAvatarChange} />
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Name</label>
                <input type="text" className="form-control rounded-3" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Bio</label>
                <div className="position-relative">
                  <textarea
                    className="form-control rounded-3 pe-5"
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell others about yourself..."
                  />
                  <div className="position-absolute top-0 end-0 mt-2 me-2">
                    <EmojiPicker onSelect={addEmojiToBio} position="bottom" />
                  </div>
                </div>
              </div>
              <div className="mb-3 form-check form-switch">
                <input type="checkbox" className="form-check-input" id="allowFollow" name="allow_follow" checked={formData.allow_follow} onChange={handleChange} />
                <label className="form-check-label" htmlFor="allowFollow">Allow others to follow me</label>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={loading || uploading}>
                  {loading || uploading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  Save Changes
                </button>
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate(-1)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'blocked' && (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            <h5 className="mb-3"><i className="bi bi-shield-slash me-2"></i>Blocked Users</h5>
            {blockedLoading ? (
              <p className="text-muted">Loading...</p>
            ) : blockedUsers.length === 0 ? (
              <p className="text-muted">You haven't blocked anyone yet.</p>
            ) : (
              <div className="list-group list-group-flush">
                {blockedUsers.map(user => (
                  <div key={`blocked-${user.id}`} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <div className="d-flex align-items-center">
                      <Avatar src={user.avatar} name={user.name} size={40} className="me-3" />
                      <div>
                        <Link to={`/profile/${user.id}`} className="text-decoration-none fw-semibold">{user.name}</Link>
                        <p className="text-secondary small mb-0">@{user.email?.split('@')[0]}</p>
                      </div>
                    </div>
                    <button 
                      className="btn btn-sm btn-outline-danger rounded-pill px-3" 
                      onClick={() => handleUnblock(user.id, user.name)}
                      disabled={unblockLoading[user.id]}
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
