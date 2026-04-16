import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import TagBadge from '../components/TagBadge'

// Use relative URL – Vite proxy forwards /api to backend
const api = axios.create({
  baseURL: '/api',
})

export default function SharedNote() {
  const { token } = useParams()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/shared/${token}`)
      .then(res => setNote(res.data.data))
      .catch(() => setError('Note not found or link expired'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <div className="p-3 text-center">Loading shared note...</div>
  if (error) return (
    <div className="container mt-5 text-center">
      <i className="bi bi-file-earmark-x fs-1 text-muted"></i>
      <h3 className="mt-3">Note not found</h3>
      <p className="text-secondary">This link may have expired or been revoked.</p>
      <Link to="/" className="btn btn-primary mt-3">Go to MemoSD</Link>
    </div>
  )
  if (!note) return null

  return (
    <div className="min-vh-100 bg-light py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-share fs-4 text-success me-2"></i>
                  <span className="text-success fw-semibold">Shared Note</span>
                </div>
                <h1 className="h3 mb-3">{note.title}</h1>
                {note.category && (
                  <p className="text-secondary mb-3">
                    <i className="bi bi-folder me-1"></i>
                    Category: <span className="text-capitalize">{note.category}</span>
                  </p>
                )}
                <div className="mb-4">
                  <p style={{ whiteSpace: 'pre-wrap' }}>{note.content}</p>
                </div>
                <div className="mb-4">
                  {note.tags?.map(tag => <TagBadge key={tag.id} name={tag.name} />)}
                </div>
                <hr />
                <p className="text-secondary mb-0 text-center">
                  <i className="bi bi-journal-bookmark-fill me-1"></i>
                  Shared via MemoSD — 
                  <Link to="/" className="ms-1">Create your own notes</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
