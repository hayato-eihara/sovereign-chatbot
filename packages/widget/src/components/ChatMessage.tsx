import React from 'react'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function parseMarkdown(raw: string): string {
  const safe = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  return safe
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="sovereign-msg-link">$1</a>'
    )
    .replace(/\n/g, '<br>')
}

const JC_AVATAR = (
  <div style={{
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#8b0000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }}>
    <span style={{
      color: '#fff',
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontSize: '10px',
      fontWeight: 400,
      letterSpacing: '0.05em',
      userSelect: 'none',
    }}>JC</span>
  </div>
)

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      gap: '5px',
    }}>
      {!isUser && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          {JC_AVATAR}
          <div
            style={{
              padding: '11px 15px',
              background: '#f5f5f0',
              border: '1px solid #e8e5df',
              borderRadius: '16px 16px 16px 4px',
              maxWidth: '80%',
              fontSize: '0.875rem',
              lineHeight: '1.6',
              color: '#1a1a1a',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
          />
        </div>
      )}

      {isUser && (
        <div style={{
          padding: '11px 15px',
          background: '#1a1a1a',
          borderRadius: '16px 16px 4px 16px',
          maxWidth: '80%',
          fontSize: '0.875rem',
          lineHeight: '1.6',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {content}
        </div>
      )}

      <span style={{
        fontSize: '10px',
        color: '#999',
        marginLeft: isUser ? 0 : '40px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        {formatTime(timestamp)}
      </span>
    </div>
  )
}
