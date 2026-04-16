import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import NoteCard from '../components/NoteCard'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'

function SkeletonCard() {
  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <div className="d-flex mb-2">
          <div className="skeleton rounded-circle me-2" style={{ width: '32px', height: '32px' }}></div>
          <div className="skeleton" style={{ width: '120px', height: '16px' }}></div>
        </div>
        <div className="skeleton mb-2" style={{ width: '80%', height: '20px' }}></div>
        <div className="skeleton mb-2" style={{ width: '60%', height: '16px' }}></div>
        <div className="d-flex gap-3">
          <div className="skeleton" style={{ width: '40px', height: '32px' }}></div>
          <div className="skeleton" style={{ width: '40px', height: '32px' }}></div>
        </div>
      </div>
    </div>
  )
}

export default function Feed() {
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const confirm = useConfirm()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchFeed = async (pageNum, refresh = false) => {
    try {
      const res = await api.get(`/feed?page=${pageNum}&limit=10`)
      const newNotes = res.data.data
      setNotes(prev => pageNum === 1 ? newNotes : [...prev, ...newNotes])
      setHasMore(res.data.meta.pagination.current_page < res.data.meta.pagination.total_pages)
    } catch (err) {
      toast.showError('Failed to load feed')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFeed(page)
  }, [page])

  const handleRefresh = async () => {
    setRefreshing(true)
    setPage(1)
    await fetchFeed(1, true)
  }

  const loadMore = () => setPage(p => p + 1)

  const handleDelete = async (id) => {
    const confirmed = await confirm('Delete Note', 'Are you sure?')
    if (!confirmed) return
    try {
      await api.delete(`/notes/${id}`)
      fetchFeed(1, true)
      toast.showSuccess('Note deleted')
    } catch (err) {
      toast.showError('Failed to delete')
    }
  }

  const handleShare = async (id) => {
    try {
      const res = await api.post(`/notes/${id}/share`)
      const token = res.data.data.share_token
      const shareUrl = `${window.location.origin}/shared/${token}`
      navigator.clipboard?.writeText(shareUrl)
      toast.showSuccess('Share link copied!')
    } catch (err) {
      toast.showError('Failed to share')
    }
  }

  if (loading && page === 1) {
    return (
      <div className="container-fluid px-0 px-md-2">
        <h2 className="fs-4 mb-3"><i className="bi bi-newspaper me-2"></i>Your Feed</h2>
        {[1,2,3].map(i => <SkeletonCard key={i} />)}
      </div>
    )
  }

  return (
    <div className="container-fluid px-0 px-md-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fs-4 mb-0">
          <i className="bi bi-newspaper me-2"></i>Your Feed
        </h2>
        <button className="btn btn-outline-primary btn-sm rounded-pill" onClick={handleRefresh} disabled={refreshing}>
          <i className={`bi bi-arrow-clockwise ${refreshing ? 'spin' : ''}`}></i>
        </button>
      </div>
      
      {notes.length === 0 && !loading ? (
        <div className="empty-state">
          <i className="bi bi-newspaper"></i>
          <h4>Your feed is empty</h4>
          <p className="text-secondary">Follow people to see their public notes here.</p>
          <div className="d-flex gap-2 justify-content-center mt-3">
            <Link to="/discover" className="btn btn-primary rounded-pill px-4">
              <i className="bi bi-compass me-1"></i>Discover People
            </Link>
            <Link to="/notes" className="btn btn-outline-primary rounded-pill px-4">
              <i className="bi bi-plus-circle me-1"></i>Create Note
            </Link>
          </div>
        </div>
      ) : (
        <>
          {notes.map(note => (
            <div key={`feed-${note.id}`} className="mb-4">
              <div className="d-flex align-items-center mb-2">
                <Link to={`/profile/${note.user_id}`} className="text-decoration-none d-flex align-items-center">
                  <Avatar src={note.author_avatar} name={note.author_name} size={32} className="me-2" />
                  <span className="fw-semibold text-dark">{note.author_name || 'User'}</span>
                </Link>
                <span className="text-secondary ms-2 small">· {note.updated_at && new Date(note.updated_at).toLocaleDateString()}</span>
              </div>
              <NoteCard 
                note={note} 
                onDelete={handleDelete} 
                onShare={handleShare}
                currentUserId={currentUser?.id}
              />
            </div>
          ))}
          {hasMore && (
            <div className="text-center mt-3">
              <button className="btn btn-outline-primary rounded-pill px-4" onClick={loadMore}>
                <i className="bi bi-arrow-down me-1"></i>Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
