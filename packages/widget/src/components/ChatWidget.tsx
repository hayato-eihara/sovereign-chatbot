import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ChatMessage } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'

interface Config {
  apiKey: string
  storeUrl: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const API_URL     = 'https://muuvnfiqoxgnhoviivwn.supabase.co/functions/v1/chat'
const WIDGET_ID   = 'japanclassic'
const SESSION_KEY = 'sovereign-session-id'

function getSessionId(): string {
  const stored = localStorage.getItem(SESSION_KEY)
  if (stored) return stored
  const id = crypto.randomUUID()
  localStorage.setItem(SESSION_KEY, id)
  return id
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Welcome to Japan Classic. I\'m here to help with questions about our handmade ceramics, shipping, returns, and care. How can I assist you today?',
  timestamp: new Date(),
}

const CLOSE_DURATION = 280

export function ChatWidget({ config: _config }: { config: Config }) {
  const [isOpen, setIsOpen]       = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [messages, setMessages]   = useState<Message[]>([WELCOME])
  const [isTyping, setIsTyping]   = useState(false)
  const [input, setInput]         = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen && !isClosing) {
      const t = setTimeout(() => inputRef.current?.focus(), 120)
      return () => clearTimeout(t)
    }
  }, [isOpen, isClosing])

  function openPanel() {
    setIsOpen(true)
    setIsClosing(false)
  }

  function closePanel() {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, CLOSE_DURATION)
  }

  const sendMessage = useCallback(async () => {
    const content = input.trim()
    if (!content || isTyping) return

    setMessages(prev => [...prev, {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    }])
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widget_id: WIDGET_ID,
          session_id: getSessionId(),
          message: content,
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json() as { reply: string; session_id: string; conversation_id: string }

      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date(),
      }])
    } finally {
      setIsTyping(false)
    }
  }, [input, isTyping])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const canSend = input.trim().length > 0 && !isTyping

  return (
    <div style={{
      position: 'absolute',
      bottom: '1.5rem',
      right: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '12px',
      pointerEvents: 'auto',
    }}>

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          className={`sovereign-panel ${isClosing ? 'sovereign-panel-exit' : 'sovereign-panel-enter'}`}
          style={{
            width: '400px',
            height: '600px',
            background: '#ffffff',
            borderRadius: '16px 16px 12px 12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            background: '#1a1a1a',
            borderBottom: '2px solid #8b0000',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <span style={{
              color: '#ffffff',
              fontFamily: '"Georgia", "Times New Roman", serif',
              fontSize: '13px',
              fontWeight: 400,
              letterSpacing: '0.15em',
            }}>
              JAPAN CLASSIC
            </span>
            <button
              className="sovereign-close-btn"
              onClick={closePanel}
              aria-label="Close chat"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.7)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="sovereign-messages" style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            {messages.map(msg => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="sovereign-input-area" style={{
            padding: '12px 14px',
            background: '#ffffff',
            borderTop: '1px solid #eee',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              className="sovereign-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about shipping, returns, care…"
              aria-label="Message input"
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                borderRadius: '24px',
                fontSize: '0.875rem',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                background: '#f9f9f9',
                color: '#1a1a1a',
                transition: 'box-shadow 0.3s',
              }}
            />
            <button
              className="sovereign-send-btn"
              onClick={sendMessage}
              disabled={!canSend}
              aria-label="Send message"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: canSend ? '#8b0000' : '#e8e8e8',
                border: 'none',
                cursor: canSend ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.3s, transform 0.15s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div style={{
            padding: '5px 0 7px',
            textAlign: 'center',
            background: '#ffffff',
          }}>
            <span style={{
              fontSize: '10px',
              color: '#ccc',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '0.04em',
            }}>
              Powered by Sovereign
            </span>
          </div>
        </div>
      )}

      {/* ── Floating button — hidden while panel is open ── */}
      {!isOpen && (
        <button
          className="sovereign-toggle-btn sovereign-btn-pop"
          onClick={openPanel}
          aria-label="Open chat"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#1a1a1a',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.12)',
            flexShrink: 0,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      )}
    </div>
  )
}
