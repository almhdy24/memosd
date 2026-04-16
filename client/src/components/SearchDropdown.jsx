import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Avatar from './Avatar'

export default function SearchDropdown({ autoFocus = false, onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ users: [], notes: [] })
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], notes: [] })
      return
    }
    const delayDebounce = setTimeout(() => {
      setLoading(true)
      api.get(`/search?q=${encodeURIComponent(query)}&limit=5`)
        .then(res => {
          setResults(res.data.data)
          setShowDropdown(true)
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(delayDebounce)
  }, [query])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
      setShowDropdown(false)
      setQuery('')
      if (onSelect) onSelect()
    }
  }

  const handleSelect = () => {
    setShowDropdown(false)
    setQuery('')
    if (onSelect) onSelect()
  }

  return (
    <div className="position-relative w-100" ref={wrapperRef}>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <span className="input-group-text bg-white border-0 rounded-start-pill">
            <i className="bi bi-search"></i>
          </span>
          <input
            ref={inputRef}
            type="text"
            className="form-control border-0 rounded-end-pill py-2"
            placeholder="Search people or notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setShowDropdown(true)}
          />
        </div>
      </form>

      {showDropdown && (results.users.length > 0 || results.notes.length > 0) && (
        <div className="dropdown-menu show w-100 p-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {results.users.length > 0 && (
            <>
              <h6 className="dropdown-header">People</h6>
              {results.users.map(user => (
                <Link
                  key={`user-${user.id}`}
                  to={`/profile/${user.id}`}
                  className="dropdown-item d-flex align-items-center"
                  onClick={handleSelect}
                >
                  <Avatar src={user.avatar} name={user.name} size={32} className="me-2" />
                  <div>
                    <div className="fw-semibold">{user.name}</div>
                    <small className="text-secondary">@{user.email.split('@')[0]}</small>
                  </div>
                </Link>
              ))}
            </>
          )}
          {results.notes.length > 0 && (
            <>
              <h6 className="dropdown-header mt-2">Notes</h6>
              {results.notes.map(note => (
                <Link
                  key={`note-${note.id}`}
                  to={`/notes/${note.id}`}
                  className="dropdown-item"
                  onClick={handleSelect}
                >
                  <div className="fw-semibold text-truncate">{note.title}</div>
                  <small className="text-secondary text-truncate">{note.content?.substring(0, 60)}</small>
                </Link>
              ))}
            </>
          )}
          <div className="dropdown-divider"></div>
          <button
            className="dropdown-item text-primary text-center"
            onClick={handleSubmit}
          >
            See all results
          </button>
        </div>
      )}
    </div>
  )
}
