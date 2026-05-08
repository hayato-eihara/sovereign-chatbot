import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '../../supabaseClient'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function ConversationDetail({ conversationId }: { conversationId: string | null }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!conversationId) { setMessages([]); return }

    setLoading(true)
    supabase
      .from('messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages((data ?? []) as Message[])
        setLoading(false)
      })
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Empty state ──────────────────────────────────────────
  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-950 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center">
          <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500">会話を選択してください</p>
          <p className="text-xs text-gray-700 mt-1">左のリストから会話を選ぶと詳細が表示されます</p>
        </div>
      </div>
    )
  }

  // ── Loading state ────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gray-700 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  // ── Detail ───────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col bg-gray-950 overflow-hidden">

      {/* Sub-header */}
      <div className="shrink-0 px-6 py-3.5 border-b border-gray-800 bg-gray-900/40 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400">
            {messages.length} 件のメッセージ
          </p>
          {messages[0] && (
            <p className="text-[11px] text-gray-600 mt-0.5">{fmtDate(messages[0].created_at)}</p>
          )}
        </div>
        <div className="flex gap-2 text-[11px] font-medium">
          <span className="bg-blue-950 text-blue-400 px-2 py-0.5 rounded-full border border-blue-900/50">
            {messages.filter(m => m.role === 'user').length} user
          </span>
          <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700/50">
            {messages.filter(m => m.role === 'assistant').length} assistant
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto sovereign-scroll px-6 py-5 space-y-3">
        {messages.map(msg => {
          const isUser = msg.role === 'user'
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex flex-col gap-1 max-w-[68%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={[
                  'px-4 py-2.5 text-sm leading-relaxed',
                  isUser
                    ? 'bg-blue-700 text-white rounded-2xl rounded-br-sm'
                    : 'bg-gray-800 text-gray-200 rounded-2xl rounded-bl-sm border border-gray-700/60',
                ].join(' ')}>
                  {msg.content}
                </div>
                <span className="text-[11px] text-gray-600 px-1">
                  {fmt(msg.created_at)}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
