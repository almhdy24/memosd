import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'

export default function ChannelList({ onSelect }) {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDesc, setNewChannelDesc] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [creating, setCreating] = useState(false)
  const toast = useToast()

  const fetchChannels = async () => {
    try {
      const res = await api.get('/channels')
      setChannels(res.data.data || [])
    } catch (err) {
      toast.showError('Failed to load channels')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChannels()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newChannelName.trim()) return
    setCreating(true)
    try {
      await api.post('/channels', {
        name: newChannelName,
        description: newChannelDesc,
        is_private: isPrivate ? 1 : 0
      })
      toast.showSuccess('Channel created')
      setNewChannelName('')
      setNewChannelDesc('')
      setIsPrivate(false)
      setShowCreate(false)
      fetchChannels()
    } catch (err) {
      toast.showError('Failed to create channel')
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <div className="p-3 text-center">Loading channels...</div>

  return (
    <div className="d-flex flex-column h-100">
      <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-semibold">Channels</h6>
        <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => setShowCreate(!showCreate)}>
          <i className="bi bi-plus-lg"></i>
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="p-3 border-bottom bg-light">
          <input type="text" className="form-control form-control-sm mb-2" placeholder="Channel name" value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} required />
          <textarea className="form-control form-control-sm mb-2" placeholder="Description (optional)" value={newChannelDesc} onChange={(e) => setNewChannelDesc(e.target.value)} rows="2" />
          <div className="form-check form-switch mb-2">
            <input type="checkbox" className="form-check-input" id="privateChannel" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
            <label className="form-check-label small" htmlFor="privateChannel">Private</label>
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-sm btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create'}</button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="flex-grow-1 overflow-auto">
        {channels.length === 0 ? (
          <p className="text-muted text-center py-4">No channels yet</p>
        ) : (
          channels.map(channel => (
            <button key={`channel-${channel.id}`} className="list-group-item list-group-item-action border-0 d-flex align-items-center px-3 py-3" onClick={() => onSelect(channel)}>
              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                <i className="bi bi-people-fill text-primary"></i>
              </div>
              <div className="text-start">
                <div className="fw-semibold">{channel.name}</div>
                {channel.description && <small className="text-secondary">{channel.description}</small>}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
