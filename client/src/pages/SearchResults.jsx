import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'
import Avatar from '../components/Avatar'
import NoteCard from '../components/NoteCard'
import { useAuth } from '../context/AuthContext'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const query = searchParams.get('q') || ''
  const [activeTab, setActiveTab] = useState('all')
  const [users, setUsers] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!query) {
      setLoading(false)
      return
    }
    const fetchResults = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}&limit=50`)
        setUsers(res.data.data.users || [])
        setNotes(res.data.data.notes || [])
      } catch (err) {
        console.error('Search failed', err)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [query])

  if (!query) return <div className="p-3">Enter a search term</div>
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Searching...</span>
        </div>
      </div>
    )
  }

  const totalResults = users.length + notes.length

  return (
    <div className="container-fluid px-0 px-md-2">
      <h4 className="mb-3">Results for "{query}"</h4>
      <ul className="nav nav-pills mb-3 gap-2 flex-nowrap overflow-auto pb-2">
        <li className="nav-item">
          <button className={`nav-link text-nowrap ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            All ({totalResults})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link text-nowrap ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            People ({users.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link text-nowrap ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
            Notes ({notes.length})
          </button>
        </li>
      </ul>

      {activeTab === 'all' && (
        <>
          {users.length > 0 && (
            <>
              <h5 className="mt-3 fs-6 fw-semibold">People</h5>
              <div className="list-group list-group-flush mb-4">
                {users.map(u => (
                  <Link key={`user-${u.id}`} to={`/profile/${u.id}`} className="list-group-item list-group-item-action d-flex align-items-center px-0 py-3">
                    <Avatar src={u.avatar} name={u.name} size={48} className="me-3" />
                    <div>
                      <div className="fw-semibold">{u.name}</div>
                      <small className="text-secondary">@{u.email.split('@')[0]}</small>
                      {u.bio && <p className="mb-0 small text-secondary text-truncate" style={{ maxWidth: '200px' }}>{u.bio}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
          {notes.length > 0 && (
            <>
              <h5 className="mt-3 fs-6 fw-semibold">Notes</h5>
              <div>
                {notes.map(note => (
                  <NoteCard key={`note-${note.id}`} note={note} currentUserId={user?.id} onDelete={() => {}} />
                ))}
              </div>
            </>
          )}
          {totalResults === 0 && <p className="text-muted text-center py-5">No results found.</p>}
        </>
      )}

      {activeTab === 'users' && (
        <div className="list-group list-group-flush">
          {users.length === 0 ? (
            <p className="text-muted text-center py-5">No people found.</p>
          ) : (
            users.map(u => (
              <Link key={`user-${u.id}`} to={`/profile/${u.id}`} className="list-group-item list-group-item-action d-flex align-items-center px-0 py-3">
                <Avatar src={u.avatar} name={u.name} size={48} className="me-3" />
                <div>
                  <div className="fw-semibold">{u.name}</div>
                  <small className="text-secondary">@{u.email.split('@')[0]}</small>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div>
          {notes.length === 0 ? (
            <p className="text-muted text-center py-5">No notes found.</p>
          ) : (
            notes.map(note => (
              <NoteCard key={`note-${note.id}`} note={note} currentUserId={user?.id} onDelete={() => {}} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
