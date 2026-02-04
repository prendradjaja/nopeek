import { useState, useRef } from 'react'

const DOUBLE_TAP_MS = 300

function App() {
  const [text, setText] = useState('')
  const [overlayVisible, setOverlayVisible] = useState(true)
  const [holdingBacktick, setHoldingBacktick] = useState(false)
  const lastBacktickTime = useRef(0)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '`') {
      e.preventDefault()

      if (!holdingBacktick) {
        const now = Date.now()
        if (now - lastBacktickTime.current < DOUBLE_TAP_MS) {
          setOverlayVisible((v) => !v)
          lastBacktickTime.current = 0
        } else {
          lastBacktickTime.current = now
          setHoldingBacktick(true)
        }
      }
    }
  }

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === '`') {
      setHoldingBacktick(false)
    }
  }

  const showOverlay = holdingBacktick ? !overlayVisible : overlayVisible
  const lines = text.split('\n')

  return (
    <div className="editor-wrapper">
      <div
        ref={overlayRef}
        className="editor-overlay"
        style={{ visibility: showOverlay ? 'visible' : 'hidden' }}
      >
        {lines.map((line, i) => (
          <span key={i} className="line">
            {line}
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
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        style={{ color: showOverlay ? 'transparent' : 'inherit', caretColor: 'black' }}
      />
    </div>
  )
}

export default App
