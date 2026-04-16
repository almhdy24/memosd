import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import TagBadge from '../components/TagBadge'
import CommentSection from '../components/CommentSection'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'

export default function NoteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const confirm = useConfirm()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likeLoading, setLikeLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const fetchNote = async () => {
    try {
      const res = await api.get(`/notes/${id}`)
      const data = res.data.data
      setNote(data)
      setLiked(data.liked_by_user || false)
      setLikeCount(data.like_count || 0)
      setError(null)
    } catch (err) {
      setError('Note not found or you do not have permission to view it.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNote() }, [id])

  const handleLike = async () => {
    if (!currentUser || likeLoading) return
    setLikeLoading(true)
    try {
      await api.post(`/notes/${id}/like`)
      setLiked(!liked)
      setLikeCount(liked ? likeCount - 1 : likeCount + 1)
    } catch (err) {
      toast.showError('Failed to like note')
    } finally {
      setLikeLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = await confirm('Delete Note', 'Are you sure?')
    if (!confirmed) return
    try {
      await api.delete(`/notes/${id}`)
      toast.showSuccess('Note deleted')
      navigate('/notes')
    } catch (err) {
      toast.showError('Failed to delete')
    }
  }

  const handleShare = async () => {
    if (note?.share_token) {
      navigator.clipboard?.writeText(`${window.location.origin}/shared/${note.share_token}`)
      toast.showSuccess('Share link copied!')
    } else {
      try {
        const res = await api.post(`/notes/${id}/share`)
        const token = res.data.data.share_token
        navigator.clipboard?.writeText(`${window.location.origin}/shared/${token}`)
        toast.showSuccess('Share link generated!')
        fetchNote()
      } catch (err) {
        toast.showError('Failed to generate share link')
      }
    }
    setShowMenu(false)
  }

  const toggleMenu = () => setShowMenu(!showMenu)

  if (loading) return <div className="p-3 text-center">Loading note...</div>
  
  if (error) {
    return (
      <div className="container mt-5 text-center">
        <i className="bi bi-file-earmark-x fs-1 text-muted"></i>
        <h3 className="mt-3">Note not found</h3>
        <p className="text-secondary">The note you're looking for doesn't exist or is private.</p>
        <button className="btn btn-primary mt-3 rounded-pill px-4" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-1"></i>Go Back
        </button>
      </div>
    )
  }

  if (!note) return null

  const isOwner = currentUser && note.user_id === currentUser.id

  return (
    <div className="container-fluid px-0 px-md-2">
      <div className="d-flex align-items-center gap-2 mb-3">
        <button className="btn btn-outline-secondary btn-sm py-2 px-3 rounded-pill" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <div className="d-flex align-items-center justify-content-between flex-grow-1">
          <h2 className="fs-4 mb-0">{note.title}</h2>
          {isOwner && (
            <div className="dropdown">
              <button className="btn btn-link text-secondary p-0" onClick={toggleMenu}>
                <i className="bi bi-three-dots-vertical fs-5"></i>
              </button>
              {showMenu && (
                <div className="dropdown-menu dropdown-menu-end show" style={{ position: 'absolute', right: 0, top: '100%', zIndex: 1000 }}>
                  <Link to={`/notes/${id}/edit`} className="dropdown-item">
                    <i className="bi bi-pencil me-2"></i>Edit
                  </Link>
                  <button className="dropdown-item" onClick={handleShare}>
                    <i className="bi bi-share me-2"></i>{note.share_token ? 'Copy Link' : 'Share'}
                  </button>
                  <button className="dropdown-item text-danger" onClick={handleDelete}>
                    <i className="bi bi-trash3 me-2"></i>Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card shadow-sm mb-3 rounded-4">
        <div className="card-body">
          {note.category && <p className="text-secondary mb-3"><i className="bi bi-folder me-1"></i>{note.category}</p>}
          <div className="note-content mb-4" style={{ whiteSpace: 'pre-wrap' }}>{note.content}</div>
          <div className="mb-3">{note.tags?.map(tag => <TagBadge key={tag.id} name={tag.name} />)}</div>
          <div className="d-flex align-items-center gap-3 border-top pt-3">
            {note.allow_likes !== 0 && (
              <button className={`btn btn-link p-0 d-flex align-items-center text-decoration-none ${liked ? 'text-danger' : 'text-secondary'}`} onClick={handleLike} disabled={likeLoading}>
                <i className={`bi ${liked ? 'bi-heart-fill' : 'bi-heart'} fs-5`}></i>
                {likeCount > 0 && <span className="ms-1 small">{likeCount}</span>}
              </button>
            )}
            {note.allow_comments !== 0 && (
              <span className="text-secondary d-flex align-items-center">
                <i className="bi bi-chat fs-5"></i>
                {note.comment_count > 0 && <span className="ms-1 small">{note.comment_count}</span>}
              </span>
            )}
            {!isOwner && <span className="text-secondary ms-auto"><i className="bi bi-info-circle"></i> Shared note</span>}
          </div>
        </div>
      </div>
      
      {note.allow_comments !== 0 && <CommentSection noteId={id} allowComments={true} />}
    </div>
  )
}
