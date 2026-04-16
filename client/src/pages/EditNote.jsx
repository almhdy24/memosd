import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import NoteForm from '../components/NoteForm'
import { useToast } from '../context/ToastContext'

export default function EditNote() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/notes/${id}`)
      .then(res => setNote(res.data.data))
      .catch(() => {
        toast.showError('Note not found')
        navigate('/notes')
      })
      .finally(() => setLoading(false))
  }, [id, navigate, toast])

  const handleSubmit = async (formData) => {
    try {
      await api.put(`/notes/${id}`, formData)
      toast.showSuccess('Note updated!')
      navigate('/notes')
    } catch (err) {
      toast.showError('Update failed')
    }
  }

  if (loading) return <div className="p-3">Loading...</div>
  if (!note) return null

  return (
    <div className="container-fluid px-0 px-md-2">
      <div className="d-flex align-items-center gap-2 mb-4">
        <button 
          className="btn btn-outline-secondary btn-sm py-2 px-3" 
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <h2 className="fs-4 mb-0">Edit Note</h2>
      </div>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <NoteForm initialData={note} onSubmit={handleSubmit} buttonText="Update Note" />
        </div>
      </div>
    </div>
  )
}
