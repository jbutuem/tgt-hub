import { useState, useEffect } from 'react'
import { Film, Plus, Calendar, List, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { NewRequestModal } from './NewRequestModal'
import { RequestDetail } from './RequestDetail'
import { ProdCalendar } from './ProdCalendar'

const STATUS_MAP = {
  draft:{label:'Rascunho',class:'badge-gray'},
  pending_leader_review:{label:'Aguardando Líder',class:'badge-blue'},
  leader_reviewing:{label:'Em Análise',class:'badge-blue'},
  budget_sent:{label:'Orçamento Enviado',class:'badge-yellow'},
  account_approved:{label:'Aprovado',class:'badge-green'},
  account_rejected:{label:'Rejeitado',class:'badge-red'},
  scheduling:{label:'Programando',class:'badge-purple'},
  scheduled:{label:'Agendado',class:'badge-green'},
  in_capture:{label:'Em Captação',class:'badge-red'},
  in_edit:{label:'Em Edição',class:'badge-purple'},
  in_review:{label:'Em Revisão',class:'badge-yellow'},
  delivered:{label:'Entregue',class:'badge-green'},
  cancelled:{label:'Cancelado',class:'badge-gray'},
}
const TYPE_MAP = {
  fee_prod:{label:'Fee Prod',class:'badge-blue'},
  extra_prod:{label:'Extra Prod',class:'badge-yellow'},
  single_project:{label:'Single',class:'badge-purple'},
  package:{label:'Pacote',class:'badge-green'},
}

export function ProdPage() {
  const { user, isAdmin, isAccount, isProdLeader } = useAuth()
  const [requests, setRequests] = useState([])
  const [clients, setClients] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [showNew, setShowNew] = useState(false)
  const [selectedReq, setSelectedReq] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => { loadData() }, [user])

  async function loadData() {
    if (!user) return
    const [rR, cR, mR] = await Promise.all([
      supabase.from('av_requests').select('*,client:tt_clients(name,team),requester:tt_members!requested_by(name)').order('created_at',{ascending:false}),
      supabase.from('tt_clients').select('id,name,team').eq('is_active',true).order('name'),
      supabase.from('tt_members').select('id,name,team,role,access_level').eq('is_active',true).order('name')
    ])
    if (rR.data) setRequests(rR.data)
    if (cR.data) setClients(cR.data)
    if (mR.data) setMembers(mR.data)
    setLoading(false)
  }

  const filtered = requests.filter(r => {
    if (filterStatus!=='all' && r.status!==filterStatus) return false
    if (search) {
      const s = search.toLowerCase()
      return r.title.toLowerCase().includes(s) || r.client?.name?.toLowerCase().includes(s) || r.requester?.name?.toLowerCase().includes(s)
    }
    if (!isAdmin && !isProdLeader && isAccount) return r.requested_by===user.id
    return true
  })

  const counts = requests.reduce((a,r) => { a[r.status]=(a[r.status]||0)+1; return a }, {})

  if (loading) return <div className="flex items-center justify-center h-64 text-white/30">Carregando...</div>

  return (
    <div className="max-w-5xl animate-fade">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Film size={24} className="text-tgt-red"/>
          <h1 className="text-xl font-bold">Produção AV</h1>
          <span className="badge-gray">{requests.length}</span>
        </div>
        {(isAccount||isAdmin) && <button onClick={()=>setShowNew(true)} className="btn-primary flex items-center gap-2"><Plus size={16}/>Nova Solicitação</button>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
        {[{k:'pending_leader_review',l:'Aguardando',c:'text-blue-400'},{k:'budget_sent',l:'Orçamento',c:'text-amber-400'},{k:'scheduled',l:'Agendados',c:'text-emerald-400'},{k:'in_capture',l:'Captação',c:'text-tgt-red'},{k:'in_edit',l:'Edição',c:'text-purple-400'}].map(s=>(
          <div key={s.k} className="stat-card cursor-pointer hover:bg-white/[0.05]" onClick={()=>setFilterStatus(filterStatus===s.k?'all':s.k)}>
            <p className="text-white/40 text-xs mb-1">{s.l}</p>
            <p className={`text-xl font-bold ${s.c}`}>{counts[s.k]||0}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-9"/>
        </div>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="w-auto">
          <option value="all">Todos</option>
          {Object.entries(STATUS_MAP).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
        <div className="flex border border-white/10 rounded-lg overflow-hidden ml-auto">
          <button onClick={()=>setView('list')} className={`px-3 py-1.5 text-sm ${view==='list'?'bg-white/10 text-white':'text-white/40'}`}><List size={16}/></button>
          <button onClick={()=>setView('calendar')} className={`px-3 py-1.5 text-sm ${view==='calendar'?'bg-white/10 text-white':'text-white/40'}`}><Calendar size={16}/></button>
        </div>
      </div>

      {view==='list' ? (
        <div className="space-y-1">
          {filtered.map(r=>(
            <div key={r.id} onClick={()=>setSelectedReq(r)} className="card-hover flex items-center gap-3 p-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium truncate">{r.title}</p>
                  <span className={TYPE_MAP[r.prod_type]?.class||'badge-gray'}>{TYPE_MAP[r.prod_type]?.label||r.prod_type}</span>
                </div>
                <p className="text-xs text-white/40 truncate">{r.client?.name||'—'} · {r.requester?.name?.split(' ')[0]||'—'}{r.desired_deadline?` · Deadline: ${r.desired_deadline.substring(0,10)}`:''}</p>
              </div>
              <span className={STATUS_MAP[r.status]?.class||'badge-gray'}>{STATUS_MAP[r.status]?.label||r.status}</span>
            </div>
          ))}
          {filtered.length===0 && (
            <div className="card text-center py-12">
              <Film size={40} className="mx-auto text-white/20 mb-3"/>
              <p className="text-white/40 mb-1">Nenhuma produção encontrada.</p>
              {isAccount && <p className="text-white/30 text-sm">Clique em "Nova Solicitação" para começar.</p>}
            </div>
          )}
        </div>
      ) : <ProdCalendar requests={requests} onSelect={setSelectedReq}/>}

      {showNew && <NewRequestModal clients={clients} members={members} onClose={()=>setShowNew(false)} onCreated={()=>{setShowNew(false);loadData()}}/>}
      {selectedReq && <RequestDetail request={selectedReq} clients={clients} members={members} onClose={()=>setSelectedReq(null)} onUpdated={()=>{setSelectedReq(null);loadData()}}/>}
    </div>
  )
}
