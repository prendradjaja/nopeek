import { useState, useRef } from 'react'

function App() {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  const lines = text.split('\n')

  return (
    <div className="editor-wrapper">
        <div ref={overlayRef} className="editor-overlay">
          {lines.map((line, i) => (
            <span key={i} className="line">
              {line || '\u00A0'}
              {i < lines.length - 1 && '\n'}
            </span>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onScroll={handleScroll}
        />
    </div>
  )
}

export default App
