import { useState, useEffect } from 'react'
import { BarChart3, Film, Clock, Package, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function DashboardPage() {
  const { user, isAdmin, isProdLeader } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStats() }, [user])

  async function loadStats() {
    if (!user) return
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [reqRes, entriesRes, eqRes] = await Promise.all([
      supabase.from('av_requests').select('id, status, prod_type, created_at'),
      supabase.from('tt_time_entries').select('hours, member_id').gte('started_at', monthStart),
      supabase.from('equipment').select('id, status'),
    ])

    const requests = reqRes.data || []
    const entries = entriesRes.data || []
    const equipment = eqRes.data || []

    const prodActive = requests.filter(r => !['delivered','cancelled','draft'].includes(r.status)).length
    const prodMonth = requests.filter(r => r.created_at >= monthStart).length
    const prodDelivered = requests.filter(r => r.status === 'delivered').length
    const totalHours = entries.reduce((s, e) => s + (Number(e.hours) || 0), 0)
    const eqAvailable = equipment.filter(e => e.status === 'available').length
    const eqInUse = equipment.filter(e => e.status === 'in_use' || e.status === 'reserved').length

    const byStatus = {}
    requests.forEach(r => { byStatus[r.status] = (byStatus[r.status] || 0) + 1 })

    const byType = {}
    requests.forEach(r => { byType[r.prod_type] = (byType[r.prod_type] || 0) + 1 })

    setStats({ prodActive, prodMonth, prodDelivered, totalHours, eqAvailable, eqInUse, byStatus, byType, totalEquip: equipment.length })
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-white/30">Carregando...</div>
  if (!stats) return null

  const STATUS_LABELS = {
    pending_leader_review: 'Aguardando Líder',
    leader_reviewing: 'Em Análise',
    budget_sent: 'Orçamento Enviado',
    account_approved: 'Aprovado',
    scheduling: 'Programando',
    scheduled: 'Agendado',
    in_capture: 'Em Captação',
    in_edit: 'Em Edição',
    in_review: 'Em Revisão',
    delivered: 'Entregue',
  }

  const TYPE_LABELS = { fee_prod: 'Fee Prod', extra_prod: 'Extra Prod', single_project: 'Single', package: 'Pacote' }

  return (
    <div className="max-w-5xl animate-fade">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 size={24} className="text-tgt-red" />
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Film size={14} className="text-tgt-red" />
            <p className="text-white/40 text-xs">Prods ativas</p>
          </div>
          <p className="text-2xl font-bold">{stats.prodActive}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-emerald-400" />
            <p className="text-white/40 text-xs">Novas (mês)</p>
          </div>
          <p className="text-2xl font-bold">{stats.prodMonth}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Film size={14} className="text-emerald-400" />
            <p className="text-white/40 text-xs">Entregues</p>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{stats.prodDelivered}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-blue-400" />
            <p className="text-white/40 text-xs">Horas (mês)</p>
          </div>
          <p className="text-2xl font-bold">{stats.totalHours.toFixed(0)}h</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Package size={14} className="text-emerald-400" />
            <p className="text-white/40 text-xs">Equip. livres</p>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{stats.eqAvailable}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Package size={14} className="text-amber-400" />
            <p className="text-white/40 text-xs">Equip. em uso</p>
          </div>
          <p className="text-2xl font-bold text-amber-400">{stats.eqInUse}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Produções por status */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white/50 mb-4">Produções por status</h3>
          <div className="space-y-2">
            {Object.entries(stats.byStatus)
              .filter(([k]) => k !== 'draft' && k !== 'cancelled')
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => {
                const total = Object.values(stats.byStatus).reduce((a, b) => a + b, 0) || 1
                const pct = (count / total) * 100
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/60">{STATUS_LABELS[status] || status}</span>
                      <span className="font-mono">{count}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-tgt-red/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            {Object.keys(stats.byStatus).length === 0 && (
              <p className="text-white/30 text-sm text-center py-4">Nenhuma produção registrada.</p>
            )}
          </div>
        </div>

        {/* Produções por tipo */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white/50 mb-4">Produções por tipo</h3>
          <div className="space-y-3">
            {Object.entries(stats.byType).map(([type, count]) => {
              const colors = {
                fee_prod: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                extra_prod: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                single_project: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                package: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
              }
              return (
                <div key={type} className={`flex items-center justify-between p-3 rounded-lg border ${colors[type] || 'bg-white/5 border-white/10'}`}>
                  <span className="text-sm font-medium">{TYPE_LABELS[type] || type}</span>
                  <span className="text-xl font-bold">{count}</span>
                </div>
              )
            })}
            {Object.keys(stats.byType).length === 0 && (
              <p className="text-white/30 text-sm text-center py-4">Nenhuma produção registrada.</p>
            )}
          </div>
        </div>
      </div>

      {/* Financial section — admin only */}
      {isAdmin && (
        <div className="mt-6 card border-amber-500/10 bg-amber-500/[0.02]">
          <h3 className="text-sm font-semibold text-amber-400/70 mb-2">Financeiro (em breve)</h3>
          <p className="text-xs text-white/30">Margem por produção, receita extra-fee acumulada e comissões serão exibidos aqui após as primeiras produções serem finalizadas.</p>
        </div>
      )}
    </div>
  )
}
