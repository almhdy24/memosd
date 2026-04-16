import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import TagBadge from './TagBadge'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'

export default function NoteCard({ note, onDelete, onShare, currentUserId, showAuthor = true }) {
  const navigate = useNavigate()
  const isOwner = currentUserId && note.user_id === currentUserId
  const [liked, setLiked] = useState(note.liked_by_user || false)
  const [likeCount, setLikeCount] = useState(note.like_count || 0)
  const [likeLoading, setLikeLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()

  const shareUrl = note.share_token 
    ? `${window.location.origin}/shared/${note.share_token}`
    : null

  const handleShare = async () => {
    if (shareUrl) {
      navigator.clipboard?.writeText(shareUrl)
      toast.showSuccess('Share link copied!')
    } else if (onShare) {
      try {
        await onShare(note.id)
      } catch (err) {
        toast.showError('Failed to share')
      }
    }
    setShowMenu(false)
  }

  const handleDeleteClick = async () => {
    const confirmed = await confirm('Delete Note', 'Are you sure?')
    if (!confirmed) return
    if (onDelete) {
      onDelete(note.id)
    }
    setShowMenu(false)
  }

  const handleLike = async () => {
    if (!currentUserId || likeLoading) return
    setLikeLoading(true)
    try {
      await api.post(`/notes/${note.id}/like`)
      setLiked(!liked)
      setLikeCount(liked ? likeCount - 1 : likeCount + 1)
    } catch (err) {
      toast.showError('Failed to like note')
    } finally {
      setLikeLoading(false)
    }
  }

  const toggleMenu = () => setShowMenu(!showMenu)

  const navigateToDetail = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return
    navigate(`/notes/${note.id}`)
  }

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body" onClick={navigateToDetail} style={{ cursor: 'pointer' }}>
        {showAuthor && (
          <div className="d-flex align-items-center mb-2">
            <Link to={`/profile/${note.user_id}`} onClick={(e) => e.stopPropagation()}>
              <img 
                src={note.author_avatar || 'https://via.placeholder.com/40'} 
                className="rounded-circle me-2" 
                width="40" 
                height="40" 
                alt="" 
                style={{ objectFit: 'cover' }}
              />
            </Link>
            <div>
              <Link to={`/profile/${note.user_id}`} className="fw-semibold text-dark text-decoration-none" onClick={(e) => e.stopPropagation()}>
                {note.author_name || 'User'}
              </Link>
              <div className="d-flex align-items-center">
                <small className="text-secondary">
                  {note.updated_at && new Date(note.updated_at).toLocaleDateString()}
                </small>
                <span className="mx-1 text-secondary">·</span>
                <small className="text-secondary">
                  <i className="bi bi-eye me-1"></i>{note.views || 0}
                </small>
              </div>
            </div>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-start">
          <h5 className="card-title fs-6 fs-md-5 mb-1">{note.title}</h5>
          {isOwner && (
            <div className="dropdown" onClick={(e) => e.stopPropagation()}>
              <button 
                className="btn btn-sm btn-link text-secondary p-0" 
                onClick={toggleMenu}
                style={{ fontSize: '1.25rem' }}
              >
                <i className="bi bi-three-dots-vertical"></i>
              </button>
              {showMenu && (
                <div className="dropdown-menu dropdown-menu-end show" style={{ position: 'absolute', right: 0, top: '100%', zIndex: 1000 }}>
                  <Link to={`/notes/${note.id}/edit`} className="dropdown-item">
                    <i className="bi bi-pencil me-2"></i>Edit
                  </Link>
                  <button className="dropdown-item" onClick={handleShare}>
                    <i className="bi bi-share me-2"></i>{note.share_token ? 'Copy Link' : 'Share'}
                  </button>
                  <button className="dropdown-item text-danger" onClick={handleDeleteClick}>
                    <i className="bi bi-trash3 me-2"></i>Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="card-text text-muted small mb-2" style={{ whiteSpace: 'pre-wrap' }}>
          {note.content?.substring(0, 200) + (note.content?.length > 200 ? '...' : '')}
        </div>
        
        <div className="mb-2">
          {note.tags?.map(tag => <TagBadge key={`tag-${tag.id}`} name={tag.name} />)}
        </div>
        
        <div className="d-flex align-items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <div className="d-flex align-items-center text-secondary">
            <i className="bi bi-eye me-1"></i>
            <small>{note.views || 0}</small>
          </div>
          
          {note.allow_likes !== 0 && (
            <button 
              className={`btn btn-link p-0 d-flex align-items-center text-decoration-none ${liked ? 'text-danger' : 'text-secondary'}`}
              onClick={handleLike}
              disabled={likeLoading}
            >
              <i className={`bi ${liked ? 'bi-heart-fill' : 'bi-heart'} fs-6`}></i>
              {likeCount > 0 && <span className="ms-1 small">{likeCount}</span>}
            </button>
          )}
          
          {note.allow_comments !== 0 && (
            <Link to={`/notes/${note.id}`} className="text-secondary text-decoration-none d-flex align-items-center">
              <i className="bi bi-chat fs-6"></i>
              {note.comment_count > 0 && <span className="ms-1 small">{note.comment_count}</span>}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
