import React from 'react'
import { createRoot } from 'react-dom/client'
import { ChatWidget } from './components/ChatWidget'
import styles from './styles/widget.css?inline'

interface SovereignChatbotConfig {
  apiKey: string
  storeUrl: string
}

function init(config: SovereignChatbotConfig): void {
  if (document.getElementById('sovereign-chatbot-host')) return

  const host = document.createElement('div')
  host.id = 'sovereign-chatbot-host'
  // Cover the full viewport with pointer-events:none so the transparent overlay
  // does not block the host page. Interactive widget elements opt back in with pointer-events:auto.
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647'
  document.body.appendChild(host)

  const shadow = host.attachShadow({ mode: 'open' })

  // Inject all widget styles (Tailwind + animations) into the shadow root
  const styleEl = document.createElement('style')
  styleEl.textContent = styles
  shadow.appendChild(styleEl)

  const mountPoint = document.createElement('div')
  shadow.appendChild(mountPoint)

  createRoot(mountPoint).render(<ChatWidget config={config} />)
}

declare global {
  interface Window {
    SovereignChatbot: { init: typeof init }
  }
}

window.SovereignChatbot = { init }
