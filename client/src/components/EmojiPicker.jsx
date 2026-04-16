import { useState } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

export default function EmojiPicker({ onSelect, position = 'bottom' }) {
  const [showPicker, setShowPicker] = useState(false)

  const handleEmojiSelect = (emoji) => {
    onSelect(emoji.native)
    setShowPicker(false)
  }

  return (
    <div className="position-relative d-inline-block">
      <button
        type="button"
        className="btn btn-link text-secondary p-0"
        onClick={() => setShowPicker(!showPicker)}
        style={{ fontSize: '1.25rem', lineHeight: 1 }}
      >
        <i className="bi bi-emoji-smile"></i>
      </button>
      {showPicker && (
        <div
          className="position-absolute"
          style={{
            bottom: position === 'bottom' ? '100%' : 'auto',
            top: position === 'top' ? '100%' : 'auto',
            right: 0,
            zIndex: 1060,
            marginBottom: '8px'
          }}
        >
          <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" />
        </div>
      )}
    </div>
  )
}
