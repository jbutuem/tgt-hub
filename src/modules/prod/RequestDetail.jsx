import { useState, useEffect } from 'react'
import { X, Send, Check, XCircle, Calendar, Package, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { EquipmentPicker, EquipmentList } from './EquipmentPicker'

export function RequestDetail({ request, clients, members, onClose, onUpdated }) {
  const { user, isAdmin, isProdLeader, isAccount } = useAuth()
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [showEquipPicker, setShowEquipPicker] = useState(false)

  useEffect(() => { loadDetails() }, [request.id])

  async function loadDetails() {
    const { data } = await supabase.from('av_budgets').select('*').eq('request_id', request.id).maybeSingle()
    if (data) setBudget(data)
    setLoading(false)
  }

  const canReview = isProdLeader || isAdmin
  const canApprove = ((request.requested_by === user?.id) || isAdmin) && request.status === 'budget_sent'
  const canEditEquip = isProdLeader || isAdmin

  const TYPE_L = { fee_prod:'Fee Prod', extra_prod:'Extra Prod', single_project:'Single Project', package:'Pacote' }
  const VIDEO_L = { interview:'Entrevista', product:'Produto', lifestyle:'Lifestyle', event:'Evento', making_of:'Making Of', institutional:'Institucional', tutorial:'Tutorial', campaign:'Campanha', other:'Outro' }

  async function updateStatus(s) {
    await supabase.from('av_requests').update({ status:s, updated_at: new Date().toISOString() }).eq('id', request.id)
    onUpdated()
  }

  const Row = ({l,v}) => <div className="flex justify-between items-start py-2 border-b border-white/[0.04]"><span className="text-xs text-white/40 shrink-0">{l}</span><span className="text-sm text-right ml-4">{v||'—'}</span></div>

  const tabs = [
    { key:'overview', label:'Resumo' },
    ...(canReview||budget ? [{ key:'budget', label:'Orçamento' }] : []),
    { key:'equipment', label:'Equipamentos' },
  ]

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold truncate pr-4">{request.title}</h2>
            <button onClick={onClose} className="text-white/40 hover:text-white p-1 shrink-0"><X size={20}/></button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge-blue">{TYPE_L[request.prod_type]}</span>
            <span className="text-xs text-white/40">{request.client?.name||'—'} · {request.requester?.name?.split(' ')[0]}</span>
          </div>
        </div>

        <div className="flex gap-0 border-b border-white/[0.06] px-4">
          {tabs.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)}
              className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab===t.key?'border-tgt-red text-white':'border-transparent text-white/40 hover:text-white/60'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? <div className="flex items-center justify-center h-32 text-white/30">Carregando...</div>

          : tab==='overview' ? (
            <div className="space-y-4 animate-fade">
              <div className="card">
                <p className="text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">Estratégico</p>
                <Row l="Objetivo" v={request.objective}/>
                <Row l="Impacto" v={request.expected_impact}/>
                <Row l="Canal" v={request.channel}/>
                <Row l="Público" v={request.target_audience}/>
              </div>
              <div className="card">
                <p className="text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">Briefing</p>
                <Row l="Tipo vídeo" v={VIDEO_L[request.video_type]}/>
                <Row l="Entregáveis" v={request.quantity_deliverables}/>
                <Row l="Formatos" v={request.formats}/>
                <Row l="Duração" v={request.duration_estimate}/>
                <Row l="Roteiro" v={request.has_script?'Sim':'Não'}/>
                {request.briefing_notes && <div className="mt-2 p-2 bg-white/[0.03] rounded-lg"><p className="text-xs text-white/60">{request.briefing_notes}</p></div>}
              </div>
              <div className="card">
                <p className="text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">Esforço (Account)</p>
                <div className="grid grid-cols-4 gap-2">
                  <div><p className="text-xs text-white/40">Captação</p><p className="font-mono">{request.est_capture_hours}h</p></div>
                  <div><p className="text-xs text-white/40">Edição</p><p className="font-mono">{request.est_edit_hours}h</p></div>
                  <div><p className="text-xs text-white/40">Pós</p><p className="font-mono">{request.est_post_hours}h</p></div>
                  <div><p className="text-xs text-white/40">Total</p><p className="font-mono font-bold">{(Number(request.est_capture_hours)+Number(request.est_edit_hours)+Number(request.est_post_hours)).toFixed(1)}h</p></div>
                </div>
              </div>
            </div>

          ) : tab==='equipment' ? (
            <div className="animate-fade">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2"><Package size={14}/>Equipamentos da produção</p>
                {canEditEquip && (
                  <button onClick={()=>setShowEquipPicker(true)} className="btn-secondary text-xs flex items-center gap-1">
                    <Settings size={14}/>Editar
                  </button>
                )}
              </div>
              <EquipmentList requestId={request.id}/>
            </div>

          ) : tab==='budget' ? (
            <BudgetTab request={request} budget={budget} canReview={canReview} canApprove={canApprove}
              isAdmin={isAdmin} isProdLeader={isProdLeader} members={members} userId={user?.id} onUpdated={onUpdated}/>
          ) : null}
        </div>

        <div className="p-4 border-t border-white/[0.06] flex items-center gap-2 justify-end">
          {canReview && request.status==='pending_leader_review' && (
            <button onClick={()=>updateStatus('leader_reviewing')} className="btn-primary flex items-center gap-1"><Check size={16}/>Iniciar Análise</button>
          )}
          {canApprove && (
            <>
              <button onClick={()=>updateStatus('account_rejected')} className="btn-ghost text-red-400 flex items-center gap-1"><XCircle size={16}/>Não Segue</button>
              <button onClick={()=>updateStatus('account_approved')} className="btn-primary flex items-center gap-1"><Check size={16}/>Segue</button>
            </>
          )}
        </div>
      </div>

      {showEquipPicker && <EquipmentPicker requestId={request.id} onClose={()=>setShowEquipPicker(false)} onSaved={()=>setShowEquipPicker(false)}/>}
    </div>
  )
}

function BudgetTab({ request, budget, canReview, canApprove, isAdmin, isProdLeader, members, userId, onUpdated }) {
  const [form, setForm] = useState(budget || {
    cost_crew_daily:0, cost_travel:0, cost_food:0, cost_equipment:0, cost_talent:0, cost_location:0, cost_other:0, cost_other_desc:'',
    cost_edit:0, cost_motion:0, cost_color_grade:0, cost_audio:0,
    client_price:0, has_external_budget: request.prod_type!=='fee_prod',
    refined_capture_hours: request.est_capture_hours||0, refined_edit_hours: request.est_edit_hours||0, refined_post_hours: request.est_post_hours||0,
    suggested_capture_date:'', suggested_delivery_date:'', briefing_approved:false, briefing_feedback:'', leader_notes:'',
    commission_account_pct:0, commission_leader_pct:0, margin_tgt_pct:0,
  })
  const [saving, setSaving] = useState(false)
  const [rules, setRules] = useState(null)

  useEffect(() => {
    if (request.prod_type!=='fee_prod') {
      supabase.from('commission_rules').select('*').eq('prod_type',request.prod_type).eq('is_active',true).maybeSingle()
        .then(({data})=>{ if(data) { setRules(data); if(!budget) setForm(f=>({...f,commission_account_pct:data.account_pct,commission_leader_pct:data.leader_pct,margin_tgt_pct:data.tgt_margin_pct})) } })
    }
  }, [request.prod_type])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const tc = [form.cost_crew_daily,form.cost_travel,form.cost_food,form.cost_equipment,form.cost_talent,form.cost_location,form.cost_other,form.cost_edit,form.cost_motion,form.cost_color_grade,form.cost_audio].reduce((a,b)=>a+Number(b||0),0)
  const cp = Number(form.client_price||0)
  const tax = cp*0.18
  const net = cp - tax - tc
  const commA = cp>0 ? cp*(Number(form.commission_account_pct)/100) : 0
  const commL = cp>0 ? cp*(Number(form.commission_leader_pct)/100) : 0
  const margin = net - commA - commL

  async function saveBudget(send=false) {
    setSaving(true)
    const p = { request_id:request.id, prepared_by:userId, ...form,
      commission_account_value:commA, commission_leader_value:commL, margin_tgt_value:margin,
      budget_status: send?'sent_to_account':'draft' }
    if (budget) await supabase.from('av_budgets').update(p).eq('id',budget.id)
    else await supabase.from('av_budgets').insert(p)
    if (send) await supabase.from('av_requests').update({status:'budget_sent',updated_at:new Date().toISOString()}).eq('id',request.id)
    setSaving(false); onUpdated()
  }

  // Account view (no commissions)
  if (!canReview && !canApprove) {
    if (!budget) return <p className="text-white/40 text-sm text-center py-8">Orçamento ainda não disponível.</p>
    return (
      <div className="space-y-4 animate-fade">
        <div className="card">
          <p className="text-xs font-semibold text-white/40 mb-3 uppercase tracking-wider">Resumo</p>
          {budget.has_external_budget && <div className="flex justify-between py-2 border-b border-white/[0.04]"><span className="text-sm text-white/60">Valor</span><span className="text-sm font-bold">R$ {Number(budget.client_price).toLocaleString('pt-BR')}</span></div>}
          <div className="flex justify-between py-2 border-b border-white/[0.04]"><span className="text-sm text-white/60">Captação</span><span className="font-mono text-sm">{budget.refined_capture_hours}h</span></div>
          <div className="flex justify-between py-2 border-b border-white/[0.04]"><span className="text-sm text-white/60">Edição</span><span className="font-mono text-sm">{budget.refined_edit_hours}h</span></div>
          <div className="flex justify-between py-2"><span className="text-sm text-white/60">Data captação</span><span className="text-sm">{budget.suggested_capture_date?new Date(budget.suggested_capture_date+'T12:00').toLocaleDateString('pt-BR'):'—'}</span></div>
        </div>
        {budget.briefing_feedback && <div className="card"><p className="text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">Feedback</p><p className="text-sm text-white/70">{budget.briefing_feedback}</p></div>}
      </div>
    )
  }

  const CF = ({l,f}) => <div className="flex items-center justify-between gap-2"><span className="text-xs text-white/50 shrink-0">{l}</span><input type="number" min="0" step="10" value={form[f]} onChange={e=>set(f,e.target.value)} className="w-28 text-right text-sm font-mono"/></div>

  return (
    <div className="space-y-4 animate-fade">
      <div className="card">
        <p className="text-xs font-semibold text-white/40 mb-3 uppercase tracking-wider">Horas (líder)</p>
        <div className="grid grid-cols-3 gap-3">
          {[['Captação','refined_capture_hours'],['Edição','refined_edit_hours'],['Pós','refined_post_hours']].map(([l,f])=>(
            <div key={f}><label className="text-xs text-white/40">{l}</label><input type="number" min="0" step="0.5" value={form[f]} onChange={e=>set(f,e.target.value)} className="w-full font-mono"/></div>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="text-xs font-semibold text-white/40 mb-3 uppercase tracking-wider">Custos</p>
        <div className="space-y-2">
          {[['Diárias','cost_crew_daily'],['Deslocamento','cost_travel'],['Alimentação','cost_food'],['Equip. externo','cost_equipment'],['Casting','cost_talent'],['Locação','cost_location'],['Outros','cost_other']].map(([l,f])=><CF key={f} l={l} f={f}/>)}
        </div>
        <p className="text-xs font-semibold text-white/40 mt-3 mb-2">Pós-produção</p>
        <div className="space-y-2">
          {[['Edição','cost_edit'],['Motion','cost_motion'],['Color','cost_color_grade'],['Áudio','cost_audio']].map(([l,f])=><CF key={f} l={l} f={f}/>)}
        </div>
        <div className="mt-3 pt-2 border-t border-white/[0.06] flex justify-between"><span className="text-sm font-medium">Total</span><span className="text-sm font-bold font-mono">R$ {tc.toLocaleString('pt-BR')}</span></div>
      </div>

      {form.has_external_budget && (
        <div className="card">
          <p className="text-xs font-semibold text-white/40 mb-3 uppercase tracking-wider">Receita</p>
          <div className="flex items-center justify-between gap-2 mb-3"><span className="text-sm">Valor cliente</span><input type="number" min="0" step="100" value={form.client_price} onChange={e=>set('client_price',e.target.value)} className="w-36 text-right font-mono font-bold"/></div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-white/50"><span>Impostos (18%)</span><span className="font-mono">-R$ {Math.round(tax).toLocaleString('pt-BR')}</span></div>
            <div className="flex justify-between text-white/50"><span>Custos</span><span className="font-mono">-R$ {tc.toLocaleString('pt-BR')}</span></div>
            <div className="flex justify-between font-medium pt-1 border-t border-white/[0.06]"><span>Líquido</span><span className={`font-mono ${net>=0?'text-emerald-400':'text-red-400'}`}>R$ {Math.round(net).toLocaleString('pt-BR')}</span></div>
          </div>
          {(isProdLeader||isAdmin) && cp>0 && (
            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <p className="text-xs font-semibold text-amber-400/70 mb-2 uppercase tracking-wider">Comissões</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-white/50">Account ({form.commission_account_pct}%)</span><span className="font-mono text-amber-400">R$ {Math.round(commA).toLocaleString('pt-BR')}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Líder ({form.commission_leader_pct}%)</span><span className="font-mono text-amber-400">R$ {Math.round(commL).toLocaleString('pt-BR')}</span></div>
                <div className="flex justify-between font-medium pt-1 border-t border-white/[0.06]"><span>Margem TGT</span><span className={`font-mono ${margin>=0?'text-emerald-400':'text-red-400'}`}>R$ {Math.round(margin).toLocaleString('pt-BR')}</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <p className="text-xs font-semibold text-white/40 mb-3 uppercase tracking-wider">Resposta</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div><label className="text-xs text-white/40">Data captação</label><input type="date" value={form.suggested_capture_date} onChange={e=>set('suggested_capture_date',e.target.value)} className="w-full"/></div>
          <div><label className="text-xs text-white/40">Data entrega</label><input type="date" value={form.suggested_delivery_date} onChange={e=>set('suggested_delivery_date',e.target.value)} className="w-full"/></div>
        </div>
        <div className="mb-3"><label className="text-xs text-white/40">Feedback</label><textarea value={form.briefing_feedback} onChange={e=>set('briefing_feedback',e.target.value)} rows={2} className="w-full resize-none"/></div>
        <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
          <input type="checkbox" checked={form.briefing_approved} onChange={e=>set('briefing_approved',e.target.checked)} className="accent-tgt-red"/>Briefing aprovado
        </label>
      </div>

      <div className="flex gap-2">
        <button onClick={()=>saveBudget(false)} disabled={saving} className="btn-secondary flex-1">{saving?'Salvando...':'Rascunho'}</button>
        <button onClick={()=>saveBudget(true)} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-1"><Send size={16}/>Enviar ao Account</button>
      </div>
    </div>
  )
}
