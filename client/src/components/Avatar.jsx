import { useState } from 'react'

export default function Avatar({ src, name, size = 40, className = '' }) {
  const [error, setError] = useState(false)
  
  const getInitials = (fullName) => {
    if (!fullName) return '?'
    const parts = fullName.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  const getColorFromName = (fullName) => {
    if (!fullName) return '#2A6F97'
    const colors = ['#2A6F97', '#6BAA75', '#E6A817', '#C44536', '#7B6C8C', '#4A7A9C']
    let hash = 0
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const handleError = () => setError(true)

  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    color: 'white',
    backgroundColor: getColorFromName(name),
    fontSize: Math.floor(size * 0.4),
  }

  if (error || !src) {
    return (
      <div className={`avatar-fallback ${className}`} style={style}>
        {getInitials(name)}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name || 'Avatar'}
      className={`avatar-image ${className}`}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      onError={handleError}
      loading="lazy"
    />
  )
}
