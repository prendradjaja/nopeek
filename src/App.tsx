import { useState, useRef, useEffect } from 'react'
import { useLocalStorage } from '@uidotdev/usehooks'

const DOUBLE_TAP_MS = 300

function App() {
  const [text, setText] = useLocalStorage('editor-text', '')
  const [overlayVisible, setOverlayVisible] = useState(true)
  const [holdingBacktick, setHoldingBacktick] = useState(false)
  const lastBacktickTime = useRef(0)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const syncScroll = () => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.style.top = `-${textareaRef.current.scrollTop}px`
    }
  }

  useEffect(() => {
    syncScroll()
  }, [text])

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

    if (e.ctrlKey && (e.key === 'm' || e.key === 'j')) {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newText = text.slice(0, start) + '\n' + text.slice(end)
      setText(newText)

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1
      })
    }

    if (e.ctrlKey && e.key === 'w') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return

      const end = textarea.selectionStart
      let start = end

      // Skip whitespace backwards
      while (start > 0 && /\s/.test(text[start - 1])) {
        start--
      }
      // Skip non-whitespace backwards
      while (start > 0 && !/\s/.test(text[start - 1])) {
        start--
      }

      const newText = text.slice(0, start) + text.slice(end)
      setText(newText)

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start
      })
    }

    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return

      const pos = textarea.selectionStart
      const lineStart = text.lastIndexOf('\n', pos - 1) + 1
      const newText = text.slice(0, lineStart) + text.slice(pos)
      setText(newText)

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = lineStart
      })
    }

    if (e.ctrlKey && e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return

      const pos = textarea.selectionStart
      const lineStart = text.lastIndexOf('\n', pos - 1) + 1
      const lineEnd = text.indexOf('\n', pos)
      const currentLineEnd = lineEnd === -1 ? text.length : lineEnd

      if (e.key === 'ArrowUp' && lineStart > 0) {
        const prevLineStart = text.lastIndexOf('\n', lineStart - 2) + 1
        const prevLine = text.slice(prevLineStart, lineStart - 1)
        const currentLine = text.slice(lineStart, currentLineEnd)
        const newText = text.slice(0, prevLineStart) + currentLine + '\n' + prevLine + text.slice(currentLineEnd)
        const newLineStart = prevLineStart
        setText(newText)
        requestAnimationFrame(() => {
          textarea.selectionStart = newLineStart
          textarea.selectionEnd = newLineStart + currentLine.length
        })
      }

      if (e.key === 'ArrowDown' && currentLineEnd < text.length) {
        const nextLineEnd = text.indexOf('\n', currentLineEnd + 1)
        const actualNextEnd = nextLineEnd === -1 ? text.length : nextLineEnd
        const nextLine = text.slice(currentLineEnd + 1, actualNextEnd)
        const currentLine = text.slice(lineStart, currentLineEnd)
        const newText = text.slice(0, lineStart) + nextLine + '\n' + currentLine + text.slice(actualNextEnd)
        const newLineStart = lineStart + nextLine.length + 1
        setText(newText)
        requestAnimationFrame(() => {
          textarea.selectionStart = newLineStart
          textarea.selectionEnd = newLineStart + currentLine.length
        })
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
          <span key={i} className={i === lines.length - 1 ? 'line last-line' : 'line'}>
            {line}
            {i < lines.length - 1 && '\n'}
          </span>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        className="editor-textarea"
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onScroll={syncScroll}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        style={{ color: showOverlay ? 'transparent' : 'inherit', caretColor: 'black' }}
      />
    </div>
  )
}

export default App
