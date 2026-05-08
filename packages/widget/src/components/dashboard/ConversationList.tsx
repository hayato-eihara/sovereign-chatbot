import React, { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

interface ConversationItem {
  id: string
  session_id: string
  created_at: string
  messageCount: number
  firstUserMessage: string
}

interface Props {
  selectedId: string | null
  onSelect: (id: string) => void
  search: string
  onSearchChange: (s: string) => void
}

type MsgRow = { id: string; role: string; content: string; created_at: string }
type ConvRow = { id: string; session_id: string; created_at: string; messages: MsgRow[] }

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (m < 1)  return 'たった今'
  if (m < 60) return `${m}分前`
  if (h < 24) return `${h}時間前`
  if (d < 7)  return `${d}日前`
  return new Date(iso).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

export default function ConversationList({ selectedId, onSelect, search, onSearchChange }: Props) {
  const [items, setItems] = useState<ConversationItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)

    // When searching, first resolve which conversation IDs match
    let idFilter: string[] | null = null
    if (search.trim()) {
      const { data: hits } = await supabase
        .from('messages')
        .select('conversation_id')
        .ilike('content', `%${search.trim()}%`)

      idFilter = [...new Set((hits ?? []).map((r: { conversation_id: string }) => r.conversation_id))]
      if (idFilter.length === 0) {
        setItems([])
        setLoading(false)
        return
      }
    }

    let query = supabase
      .from('conversations')
      .select('id, session_id, created_at, messages(id, role, content, created_at)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (idFilter) query = query.in('id', idFilter)

    const { data } = await query

    setItems(
      ((data ?? []) as ConvRow[]).map(conv => {
        const msgs = conv.messages ?? []
        return {
          id: conv.id,
          session_id: conv.session_id ?? '',
          created_at: conv.created_at,
          messageCount: msgs.length,
          firstUserMessage: msgs.find(m => m.role === 'user')?.content ?? '',
        }
      })
    )
    setLoading(false)
  }, [search])

  // Debounce search by 300 ms; fetch immediately when search is cleared
  useEffect(() => {
    const delay = search.trim() ? 300 : 0
    const t = setTimeout(load, delay)
    return () => clearTimeout(t)
  }, [load, search])

  return (
    <div className="w-[380px] shrink-0 flex flex-col border-r border-gray-800 bg-gray-900 overflow-hidden">

      {/* Search */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-gray-800">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="メッセージを検索…"
            className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm placeholder-gray-600 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-600 transition-colors"
          />
        </div>
      </div>

      {/* Row count */}
      <div className="shrink-0 px-4 py-2 border-b border-gray-800/60">
        <span className="text-[11px] font-medium text-gray-600 uppercase tracking-wider">
          {loading ? '読込中…' : `${items.length} 件の会話`}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto sovereign-scroll">
        {loading ? (
          <div className="p-4 space-y-2.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg h-[72px] animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-700">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">{search ? '一致する会話がありません' : '会話がまだありません'}</p>
          </div>
        ) : (
          items.map(item => {
            const isSelected = item.id === selectedId
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={[
                  'w-full text-left px-4 py-3 border-b border-gray-800/50 transition-colors duration-150',
                  'border-l-2',
                  isSelected
                    ? 'bg-gray-800 border-l-red-800'
                    : 'border-l-transparent hover:bg-gray-800/50',
                ].join(' ')}
              >
                {/* Top row: session id + badge + time */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[11px] text-gray-400 font-medium tracking-tight">
                    {item.session_id.slice(0, 8)}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center bg-gray-700 text-gray-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums">
                      {item.messageCount}
                    </span>
                    <span className="text-[11px] text-gray-600 whitespace-nowrap">
                      {timeAgo(item.created_at)}
                    </span>
                  </div>
                </div>
                {/* Preview */}
                <p className="text-[13px] text-gray-400 truncate leading-snug">
                  {item.firstUserMessage
                    ? `"${item.firstUserMessage.slice(0, 40)}"`
                    : <span className="italic text-gray-600 text-xs">メッセージなし</span>
                  }
                </p>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
