import { useState } from 'react'
import { Link } from 'react-router-dom'
import StatsBar from '../components/dashboard/StatsBar'
import ConversationList from '../components/dashboard/ConversationList'
import ConversationDetail from '../components/dashboard/ConversationDetail'

export default function Dashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
      {/* ── Header ── */}
      <header className="shrink-0 flex items-center justify-between px-6 h-14 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-red-900 flex items-center justify-center shrink-0">
            <span style={{ fontFamily: 'Georgia, serif' }} className="text-white text-xs">S</span>
          </div>
          <span className="text-sm font-semibold tracking-wide text-gray-100">Sovereign</span>
          <span className="text-gray-700 select-none">/</span>
          <span className="text-sm text-gray-400 font-medium">Dashboard</span>
        </div>
        <Link
          to="/"
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors duration-200"
        >
          ← Widget Demo
        </Link>
      </header>

      {/* ── Stats ── */}
      <StatsBar />

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        <ConversationList
          selectedId={selectedId}
          onSelect={setSelectedId}
          search={search}
          onSearchChange={setSearch}
        />
        <ConversationDetail conversationId={selectedId} />
      </div>
    </div>
  )
}
