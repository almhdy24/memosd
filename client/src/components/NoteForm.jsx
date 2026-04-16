import { useState } from 'react'
import EmojiPicker from './EmojiPicker'

export default function NoteForm({ initialData = {}, onSubmit, buttonText = 'Post', currentUser }) {
  const [title, setTitle] = useState(initialData.title || '')
  const [content, setContent] = useState(initialData.content || '')
  const [category, setCategory] = useState(initialData.category || '')
  const [tagsInput, setTagsInput] = useState(initialData.tags?.map(t => t.name).join(', ') || '')
  const [isPublic, setIsPublic] = useState(initialData.is_public !== 0)
  const [allowLikes, setAllowLikes] = useState(initialData.allow_likes !== 0)
  const [allowComments, setAllowComments] = useState(initialData.allow_comments !== 0)
  const [expanded, setExpanded] = useState(!!initialData.title)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() && !content.trim()) return
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t)
    onSubmit({ 
      title: title || content.substring(0, 30), 
      content, 
      category, 
      tags, 
      is_public: isPublic ? 1 : 0,
      allow_likes: allowLikes ? 1 : 0,
      allow_comments: allowComments ? 1 : 0
    })
    // Reset if not editing
    if (!initialData.id) {
      setTitle('')
      setContent('')
      setTagsInput('')
      setExpanded(false)
    }
  }

  const addEmoji = (emoji) => setContent(prev => prev + emoji)

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-3">
        <form onSubmit={handleSubmit}>
          {/* Header: Avatar + "What's on your mind?" */}
          <div className="d-flex align-items-start gap-3">
            <img 
              src={currentUser?.avatar || 'https://via.placeholder.com/40'} 
              className="rounded-circle" 
              width="40" 
              height="40" 
              alt="" 
            />
            <div className="flex-grow-1">
              {!expanded ? (
                <button
                  type="button"
                  className="btn btn-light rounded-pill w-100 text-start text-secondary px-4 py-2"
                  onClick={() => setExpanded(true)}
                >
                  What's on your mind, {currentUser?.name?.split(' ')[0] || 'there'}?
                </button>
              ) : (
                <>
                  <input
                    type="text"
                    className="form-control border-0 fs-5 fw-semibold p-0 mb-2"
                    placeholder="Title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ boxShadow: 'none' }}
                  />
                  <div className="position-relative">
                    <textarea
                      className="form-control border-0 p-0"
                      rows="3"
                      placeholder="What's on your mind?"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      style={{ boxShadow: 'none', resize: 'none' }}
                    />
                    <div className="position-absolute bottom-0 end-0 mb-2 me-2">
                      <EmojiPicker onSelect={addEmoji} position="top" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Expanded options */}
          {expanded && (
            <>
              <hr className="my-3" />
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-folder"></i>
                    </span>
                    <select className="form-select bg-light border-0" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="">Category</option>
                      <option value="study">📚 Study</option>
                      <option value="programming">💻 Programming</option>
                      <option value="personal">📝 Personal</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-tags"></i>
                    </span>
                    <input 
                      type="text" 
                      className="form-control bg-light border-0" 
                      placeholder="Tags (comma separated)" 
                      value={tagsInput} 
                      onChange={(e) => setTagsInput(e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              {/* Action bar – only functional icons */}
              <div className="d-flex flex-wrap align-items-center justify-content-between mt-3">
                <div className="dropdown">
                  <button 
                    type="button"
                    className="btn btn-sm btn-link text-secondary text-decoration-none p-0 dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-gear me-1"></i>Options
                  </button>
                  <div className="dropdown-menu p-3" style={{ minWidth: '220px' }}>
                    <div className="form-check form-switch mb-2">
                      <input type="checkbox" className="form-check-input" id="publicCheck" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                      <label className="form-check-label" htmlFor="publicCheck">🌐 Public note</label>
                    </div>
                    <div className="form-check form-switch mb-2">
                      <input type="checkbox" className="form-check-input" id="allowLikes" checked={allowLikes} onChange={(e) => setAllowLikes(e.target.checked)} />
                      <label className="form-check-label" htmlFor="allowLikes">❤️ Allow likes</label>
                    </div>
                    <div className="form-check form-switch">
                      <input type="checkbox" className="form-check-input" id="allowComments" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} />
                      <label className="form-check-label" htmlFor="allowComments">💬 Allow comments</label>
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  {!initialData.id && (
                    <button 
                      type="button" 
                      className="btn btn-sm btn-link text-secondary"
                      onClick={() => setExpanded(false)}
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="btn btn-primary rounded-pill px-4"
                    disabled={!title.trim() && !content.trim()}
                  >
                    {buttonText}
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
