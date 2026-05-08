import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

interface Stats {
  totalConversations: number
  totalMessages: number
  todayConversations: number
  avgMessages: number
}

function StatCard({
  emoji,
  label,
  value,
  loading,
}: {
  emoji: string
  label: string
  value: number
  loading: boolean
}) {
  return (
    <div className="flex items-center gap-4 flex-1 bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
      <span className="text-2xl leading-none">{emoji}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider leading-none mb-1.5">
          {label}
        </p>
        {loading ? (
          <div className="h-7 w-14 bg-gray-800 rounded-md animate-pulse" />
        ) : (
          <p className="text-[1.625rem] font-semibold text-gray-100 leading-none tabular-nums">
            {value.toLocaleString('ja-JP')}
          </p>
        )}
      </div>
    </div>
  )
}

export default function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [convRes, msgRes, todayRes] = await Promise.all([
        supabase.from('conversations').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString()),
      ])

      const tc = convRes.count ?? 0
      const tm = msgRes.count ?? 0
      const td = todayRes.count ?? 0

      setStats({
        totalConversations: tc,
        totalMessages: tm,
        todayConversations: td,
        avgMessages: tc > 0 ? Math.round((tm / tc) * 10) / 10 : 0,
      })
      setLoading(false)
    }

    load()
  }, [])

  return (
    <div className="shrink-0 flex gap-3 px-6 py-4 border-b border-gray-800 bg-gray-950">
      <StatCard emoji="💬" label="総会話数"          value={stats?.totalConversations ?? 0} loading={loading} />
      <StatCard emoji="📨" label="総メッセージ数"    value={stats?.totalMessages ?? 0}      loading={loading} />
      <StatCard emoji="📅" label="今日の会話"        value={stats?.todayConversations ?? 0} loading={loading} />
      <StatCard emoji="📊" label="平均メッセージ/会話" value={stats?.avgMessages ?? 0}        loading={loading} />
    </div>
  )
}
