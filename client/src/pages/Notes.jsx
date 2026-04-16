import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api/axios'
import NoteCard from '../components/NoteCard'
import NoteForm from '../components/NoteForm'
import Avatar from '../components/Avatar'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'
import { useAuth } from '../context/AuthContext'

export default function Notes() {
  const location = useLocation()
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(location.state?.openForm || false)
  const toast = useToast()
  const confirm = useConfirm()

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes')
      setNotes(res.data.data)
    } catch (err) {
      toast.showError('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleCreate = async (formData) => {
    try {
      await api.post('/notes', formData)
      setShowForm(false)
      fetchNotes()
      toast.showSuccess('Note posted!')
    } catch (err) {
      toast.showError('Failed to create note')
    }
  }

  const handleDelete = async (id) => {
    const confirmed = await confirm('Delete Note', 'Are you sure?')
    if (!confirmed) return
    try {
      await api.delete(`/notes/${id}`)
      fetchNotes()
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
      fetchNotes()
    } catch (err) {
      toast.showError('Failed to generate share link')
    }
  }

  if (loading) return <div className="p-3">Loading...</div>

  return (
    <div className="container-fluid px-0 px-md-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fs-4 fs-md-2">
          <i className="bi bi-file-earmark-text me-2"></i>
          My Notes
        </h2>
        <button 
          className="btn btn-primary rounded-pill px-4 d-none d-lg-flex align-items-center" 
          onClick={() => setShowForm(!showForm)}
        >
          <i className="bi bi-plus-lg me-1"></i>
          {showForm ? 'Cancel' : 'New Note'}
        </button>
      </div>

      {/* Facebook-style composer card */}
      {showForm && (
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-3">
            <div className="d-flex mb-3">
              <Avatar src={user?.avatar} name={user?.name} size={40} className="me-3" />
              <div className="flex-grow-1">
                <NoteForm onSubmit={handleCreate} buttonText="Post" compact />
              </div>
            </div>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-journal-bookmark fs-1 text-muted"></i>
          <h4 className="mt-3">No notes yet</h4>
          <p className="text-secondary">Tap the <i className="bi bi-plus-circle"></i> button to create your first note.</p>
          <button 
            className="btn btn-primary mt-2 d-lg-none rounded-pill px-4" 
            onClick={() => setShowForm(true)}
          >
            <i className="bi bi-plus-lg me-1"></i>Create Note
          </button>
        </div>
      ) : (
        notes.map(note => (
          <NoteCard showAuthor={false} 
            key={`note-${note.id}`} 
            note={note} 
            onDelete={handleDelete} 
            onShare={handleShare}
            currentUserId={user?.id}
          />
        ))
      )}
    </div>
  )
}
