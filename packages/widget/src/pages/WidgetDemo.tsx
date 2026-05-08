import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function WidgetDemo() {
  useEffect(() => {
    // Dynamically load the widget library so the Shadow DOM init works correctly
    import('../main').then(() => {
      if (!document.getElementById('sovereign-chatbot-host')) {
        window.SovereignChatbot?.init({
          apiKey: 'dev-key',
          storeUrl: 'https://japanclassic.shop',
        })
      }
    })

    return () => {
      document.getElementById('sovereign-chatbot-host')?.remove()
    }
  }, [])

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2.5rem',
      background: '#f5f5f5',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '560px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 600, color: '#111', marginBottom: '0.5rem' }}>
            Sovereign Chatbot — Dev Demo
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
            Widget mounted in a Shadow DOM (bottom-right corner).
            Inspect <code style={{ background: '#e8e8e8', padding: '1px 5px', borderRadius: '3px', fontSize: '0.8rem' }}>#sovereign-chatbot-host</code> in DevTools.
          </p>
        </div>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.5rem 1.125rem',
            background: '#1a1a1a',
            color: 'white',
            borderRadius: '7px',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          会話ログ ダッシュボード →
        </Link>
      </div>
    </div>
  )
}
