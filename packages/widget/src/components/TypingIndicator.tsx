import React from 'react'

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

export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
      {JC_AVATAR}
      <div style={{
        display: 'flex',
        gap: '5px',
        alignItems: 'center',
        padding: '11px 15px',
        background: '#f5f5f0',
        border: '1px solid #e8e5df',
        borderRadius: '16px 16px 16px 4px',
      }}>
        <span className="sovereign-dot" />
        <span className="sovereign-dot" />
        <span className="sovereign-dot" />
      </div>
    </div>
  )
}
