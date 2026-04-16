import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import NoteCard from '../components/NoteCard'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, recent: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const notesRes = await api.get('/notes?limit=5')
        setStats({
          total: notesRes.data.meta.pagination.total_items,
          recent: notesRes.data.data
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="p-3">Loading...</div>

  return (
    <div className="container-fluid px-0 px-md-2">
      {/* Welcome Card */}
      <div className="card border-0 shadow-sm mb-4 overflow-hidden">
        <div className="card-body p-4 bg-primary text-white">
          <div className="d-flex align-items-center">
            <div className="me-3">
              <img 
                src={user?.avatar || 'https://via.placeholder.com/60'} 
                className="rounded-circle border border-white border-3" 
                width="60" 
                height="60" 
                alt="" 
              />
            </div>
            <div>
              <h2 className="h5 mb-1">Welcome back, {user?.name}!</h2>
              <p className="mb-0 opacity-75">You have <strong>{stats.total}</strong> notes in total.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-3">
              <i className="bi bi-file-earmark-text fs-1 text-primary"></i>
              <h3 className="h4 mt-2 mb-0">{stats.total}</h3>
              <small className="text-secondary">Total Notes</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-3">
              <i className="bi bi-people fs-1 text-success"></i>
              <h3 className="h4 mt-2 mb-0">{user?.followers_count || 0}</h3>
              <small className="text-secondary">Followers</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-3">
              <i className="bi bi-person-plus fs-1 text-info"></i>
              <h3 className="h4 mt-2 mb-0">{user?.following_count || 0}</h3>
              <small className="text-secondary">Following</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <Link to="/notes" className="text-decoration-none">
            <div className="card border-0 shadow-sm h-100 bg-light">
              <div className="card-body text-center p-3">
                <i className="bi bi-plus-circle fs-1 text-primary"></i>
                <h3 className="h4 mt-2 mb-0 text-dark">New</h3>
                <small className="text-secondary">Create Note</small>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Notes */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fs-5 fs-md-4 mb-0">
          <i className="bi bi-clock-history me-2"></i>
          Recent Notes
        </h4>
        <Link to="/notes" className="btn btn-sm btn-outline-primary py-2">
          View All
        </Link>
      </div>
      
      {stats.recent.length === 0 ? (
        <div className="card p-4 text-center">
          <p className="text-muted mb-3">No notes yet</p>
          <Link to="/notes" className="btn btn-primary">
            Create Your First Note
          </Link>
        </div>
      ) : (
        stats.recent.map(note => (
          <NoteCard 
            key={note.id} 
            note={note} 
            onDelete={() => {}} 
            currentUserId={user?.id}
          />
        ))
      )}
    </div>
  )
}
