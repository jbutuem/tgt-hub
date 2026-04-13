import { useState, useEffect } from 'react'
import { Settings, Save, DollarSign, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function SettingsPage() {
  const { isAdmin } = useAuth()
  const [tab, setTab] = useState('costs')
  const [costs, setCosts] = useState([])
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { loadSettings() }, [])

  async function loadSettings() {
    const [costsRes, rulesRes] = await Promise.all([
      supabase.from('cost_defaults').select('*').order('cost_type'),
      supabase.from('commission_rules').select('*').eq('is_active', true).order('prod_type'),
    ])
    if (costsRes.data) setCosts(costsRes.data)
    if (rulesRes.data) setRules(rulesRes.data)
    setLoading(false)
  }

  async function saveCosts() {
    setSaving(true)
    for (const c of costs) {
      await supabase.from('cost_defaults').update({ default_value: c.default_value }).eq('id', c.id)
    }
    setMsg('Custos salvos.')
    setSaving(false)
    setTimeout(() => setMsg(''), 2000)
  }

  async function saveRules() {
    setSaving(true)
    for (const r of rules) {
      await supabase.from('commission_rules').update({
        account_pct: r.account_pct, leader_pct: r.leader_pct, tgt_margin_pct: r.tgt_margin_pct
      }).eq('id', r.id)
    }
    setMsg('Comissões salvas.')
    setSaving(false)
    setTimeout(() => setMsg(''), 2000)
  }

  const updateCost = (id, val) => setCosts(prev => prev.map(c => c.id === id ? { ...c, default_value: val } : c))
  const updateRule = (id, field, val) => setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r))

  if (!isAdmin) return <div className="text-center py-12 text-white/40">Acesso restrito a administradores.</div>
  if (loading) return <div className="flex items-center justify-center h-64 text-white/30">Carregando...</div>

  const TYPE_LABELS = { extra_prod: 'Extra Prod', single_project: 'Single Project', package: 'Pacote' }

  return (
    <div className="max-w-3xl animate-fade">
      <div className="flex items-center gap-3 mb-6">
        <Settings size={24} className="text-tgt-red" />
        <h1 className="text-xl font-bold">Configurações</h1>
      </div>

      <div className="flex gap-0 border-b border-white/[0.06] mb-6">
        {[
          { key: 'costs', label: 'Custos Padrão', icon: DollarSign },
          { key: 'commissions', label: 'Comissões', icon: Users },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-tgt-red text-white' : 'border-transparent text-white/40 hover:text-white/60'
            }`}>
            <t.icon size={14}/> {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-emerald-400 text-sm mb-4">{msg}</div>
      )}

      {tab === 'costs' && (
        <div className="space-y-2">
          {costs.map(c => (
            <div key={c.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03]">
              <div className="flex-1 min-w-0">
                <p className="text-sm">{c.label}</p>
                <p className="text-xs text-white/30">{c.unit === 'percent' ? 'Percentual' : `R$ / ${c.unit}`}</p>
              </div>
              <input type="number" min="0" step="0.01" value={c.default_value}
                onChange={e => updateCost(c.id, Number(e.target.value))}
                className="w-28 text-right font-mono text-sm"/>
            </div>
          ))}
          <button onClick={saveCosts} disabled={saving} className="btn-primary flex items-center gap-2 mt-4">
            <Save size={16}/> {saving ? 'Salvando...' : 'Salvar custos'}
          </button>
        </div>
      )}

      {tab === 'commissions' && (
        <div className="space-y-4">
          {rules.map(r => (
            <div key={r.id} className="card">
              <h3 className="text-sm font-semibold mb-3">{TYPE_LABELS[r.prod_type] || r.prod_type}</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-white/40">Account %</label>
                  <input type="number" min="0" max="100" step="0.5" value={r.account_pct}
                    onChange={e => updateRule(r.id, 'account_pct', Number(e.target.value))} className="w-full font-mono"/>
                </div>
                <div>
                  <label className="text-xs text-white/40">Líder %</label>
                  <input type="number" min="0" max="100" step="0.5" value={r.leader_pct}
                    onChange={e => updateRule(r.id, 'leader_pct', Number(e.target.value))} className="w-full font-mono"/>
                </div>
                <div>
                  <label className="text-xs text-white/40">TGT %</label>
                  <input type="number" min="0" max="100" step="0.5" value={r.tgt_margin_pct}
                    onChange={e => updateRule(r.id, 'tgt_margin_pct', Number(e.target.value))} className="w-full font-mono"/>
                </div>
              </div>
              <p className="text-xs text-white/30 mt-2">Total: {(Number(r.account_pct) + Number(r.leader_pct) + Number(r.tgt_margin_pct)).toFixed(1)}%</p>
            </div>
          ))}
          <button onClick={saveRules} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save size={16}/> {saving ? 'Salvando...' : 'Salvar comissões'}
          </button>
        </div>
      )}
    </div>
  )
}
