import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'

export default function CommentSection({ noteId, allowComments }) {
  const { user } = useAuth()
  const toast = useToast()
  const confirm = useConfirm()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const fetchComments = async () => {
    try {
      const res = await api.get(`/notes/${noteId}/comments`)
      const data = res.data.data || res.data
      setComments(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError('Could not load comments')
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (allowComments) fetchComments()
    else setLoading(false)
  }, [noteId, allowComments])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return
    setSubmitting(true)
    try {
      const res = await api.post(`/notes/${noteId}/comments`, { content: newComment })
      const newCommentData = res.data.data || res.data
      setComments(prev => [...prev, newCommentData])
      setNewComment('')
      toast.showSuccess('Comment posted')
    } catch (err) {
      toast.showError('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    const confirmed = await confirm('Delete Comment', 'Are you sure?')
    if (!confirmed) return
    try {
      await api.delete(`/notes/${noteId}/comments/${commentId}`)
      setComments(prev => prev.filter(c => c.id !== commentId))
      toast.showSuccess('Comment deleted')
    } catch (err) {
      toast.showError('Failed to delete comment')
    }
  }

  if (!allowComments) return <p className="text-muted fst-italic">Comments disabled</p>
  if (loading) return <p className="text-muted">Loading comments...</p>
  if (error) return <p className="text-danger">{error}</p>

  return (
    <div className="mt-4">
      <h5 className="mb-3 d-flex align-items-center">
        <i className="bi bi-chat-dots me-2"></i>
        Comments <span className="ms-2 text-secondary fw-normal">({comments.length})</span>
      </h5>
      
      {user && (
        <form onSubmit={handleSubmit} className="mb-4 d-flex gap-2">
          <input
            type="text"
            className="form-control rounded-pill bg-light border-0"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
            style={{ boxShadow: 'none' }}
          />
          <button 
            type="submit" 
            className="btn btn-primary rounded-pill px-4"
            disabled={submitting}
          >
            {submitting ? <span className="spinner-border spinner-border-sm" /> : 'Post'}
          </button>
        </form>
      )}

      {comments.length === 0 ? (
        <p className="text-muted text-center py-3">No comments yet. Be the first!</p>
      ) : (
        <div className="list-group list-group-flush">
          {comments.map(comment => (
            <div key={`comment-${comment.id}`} className="list-group-item px-0 py-3 border-bottom">
              <div className="d-flex">
                <Avatar src={comment.user_avatar} name={comment.user_name} size={40} className="me-3" />
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <Link to={`/profile/${comment.user_id}`} className="fw-semibold text-dark text-decoration-none">
                        {comment.user_name || 'User'}
                      </Link>
                      <span className="text-secondary ms-2 small">
                        {comment.created_at ? new Date(comment.created_at).toLocaleString() : ''}
                      </span>
                    </div>
                    {user?.id === comment.user_id && (
                      <button 
                        className="btn btn-sm btn-link text-secondary p-0" 
                        onClick={() => handleDelete(comment.id)}
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    )}
                  </div>
                  <p className="mb-0 mt-1">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
