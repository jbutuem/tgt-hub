import { useState, useEffect, useRef } from 'react'
import { Clock, Play, Square, Plus, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const ACTIONS = ['Análise Estratégica','Reunião','Digital Comm','Design Gráfico','Webdesign','Apresentação','Embalagem','Branding','Campanha/Tráfego','Produção AV','Evento','Brand Review','ADM']

export function TimePage() {
  const { user, isAdmin, isAccount } = useAuth()
  const [clients, setClients] = useState([])
  const [members, setMembers] = useState([])
  const [entries, setEntries] = useState([])
  const [running, setRunning] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showManual, setShowManual] = useState(false)
  const [filterMember, setFilterMember] = useState('')
  const [filterClient, setFilterClient] = useState('')
  const [viewMonth, setViewMonth] = useState(() => {
    const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`
  })
  const timerRef = useRef(null)
  const [manual, setManual] = useState({ client_id:'', description:'', hours:'', date: new Date().toISOString().substring(0,10), action:'' })

  useEffect(() => { loadData() }, [user, viewMonth])
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - new Date(running.started_at).getTime()) / 1000))
      }, 1000)
    } else { clearInterval(timerRef.current); setElapsed(0) }
    return () => clearInterval(timerRef.current)
  }, [running])

  async function loadData() {
    if (!user) return
    const ms = `${viewMonth}-01T00:00:00`
    const [y, mo] = viewMonth.split('-').map(Number)
    const me = new Date(y, mo, 1).toISOString()
    const [cR, mR, eR, rR] = await Promise.all([
      supabase.from('tt_clients').select('id,name,team').eq('is_active',true).order('name'),
      supabase.from('tt_members').select('id,name,team,role,access_level,capacity_hours_month').eq('is_active',true).order('name'),
      supabase.from('tt_time_entries').select('*,client:tt_clients(name),member:tt_members(name,team)').gte('started_at',ms).lt('started_at',me).order('started_at',{ascending:false}).limit(500),
      supabase.from('tt_time_entries').select('*,client:tt_clients(name)').eq('is_running',true).eq('member_id',user.id).limit(1)
    ])
    if (cR.data) setClients(cR.data)
    if (mR.data) setMembers(mR.data)
    if (eR.data) setEntries(eR.data)
    if (rR.data?.[0]) setRunning(rR.data[0]); else setRunning(null)
    setLoading(false)
  }

  async function startTimer(cid) {
    if (running) await stopTimer()
    const { data } = await supabase.from('tt_time_entries').insert({
      member_id: user.id, client_id: cid||null, started_at: new Date().toISOString(),
      is_running: true, date: new Date().toISOString().substring(0,10)
    }).select('*,client:tt_clients(name)').single()
    if (data) setRunning(data)
    loadData()
  }

  async function stopTimer() {
    if (!running) return
    const dur = Math.floor((Date.now() - new Date(running.started_at).getTime())/60000)
    await supabase.from('tt_time_entries').update({
      is_running:false, ended_at: new Date().toISOString(),
      duration_minutes: dur, hours: Math.round(dur/60*100)/100
    }).eq('id', running.id)
    setRunning(null); loadData()
  }

  async function saveManual() {
    if (!manual.hours || Number(manual.hours)<=0) return
    const h = Number(manual.hours)
    await supabase.from('tt_time_entries').insert({
      member_id: user.id, client_id: manual.client_id||null,
      description: manual.description, hours: h, duration_minutes: Math.round(h*60),
      date: manual.date, action: manual.action||null,
      started_at: `${manual.date}T09:00:00Z`, ended_at: `${manual.date}T09:00:00Z`,
      is_running:false, is_manual:true
    })
    setManual({ client_id:'', description:'', hours:'', date: new Date().toISOString().substring(0,10), action:'' })
    setShowManual(false); loadData()
  }

  async function deleteEntry(id) { await supabase.from('tt_time_entries').delete().eq('id',id); loadData() }

  const fmt = s => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s%3600/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const vis = entries.filter(e => {
    if (!isAdmin && !isAccount && e.member_id !== user.id) return false
    if (filterMember && e.member_id !== filterMember) return false
    if (filterClient && e.client_id !== filterClient) return false
    return true
  })

  const my = entries.filter(e => e.member_id === user.id)
  const td = new Date().toISOString().substring(0,10)
  const todayH = my.filter(e => e.date === td).reduce((s,e) => s+(Number(e.hours)||0),0)
  const ws = new Date(); ws.setDate(ws.getDate()-ws.getDay())
  const weekH = my.filter(e => new Date(e.started_at) >= ws).reduce((s,e) => s+(Number(e.hours)||0),0)
  const monthH = my.reduce((s,e) => s+(Number(e.hours)||0),0)
  const cap = Number(user?.capacity_hours_month) || 140

  const byClient = {}
  vis.forEach(e => { const n = e.client?.name||'Sem cliente'; byClient[n]=(byClient[n]||0)+(Number(e.hours)||0) })

  if (loading) return <div className="flex items-center justify-center h-64 text-white/30">Carregando...</div>

  return (
    <div className="max-w-5xl animate-fade">
      <div className="flex items-center gap-3 mb-6"><Clock size={24} className="text-tgt-red"/><h1 className="text-xl font-bold">Time</h1></div>

      <div className="card mb-6">
        {running ? (
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-tgt-red animate-pulse-dot"/>
            <div className="flex-1">
              <p className="font-mono text-2xl font-bold">{fmt(elapsed)}</p>
              <p className="text-xs text-white/40">{running.client?.name||'Sem cliente'}</p>
            </div>
            <button onClick={stopTimer} className="btn-primary flex items-center gap-2 bg-red-600 hover:bg-red-700"><Square size={16}/>Parar</button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-white/50 mb-3">Iniciar timer</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => startTimer(null)} className="btn-secondary text-xs">Sem cliente</button>
              {clients.map(c => <button key={c.id} onClick={() => startTimer(c.id)} className="btn-secondary text-xs">{c.name}</button>)}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[{l:'Hoje',v:todayH},{l:'Semana',v:weekH},{l:'Mês',v:monthH}].map(s => (
          <div key={s.l} className="stat-card"><p className="text-white/40 text-xs mb-1">{s.l}</p><p className="text-2xl font-bold">{s.v.toFixed(1)}h</p></div>
        ))}
        <div className="stat-card">
          <p className="text-white/40 text-xs mb-1">Capacidade</p>
          <p className="text-2xl font-bold">{cap}h</p>
          <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div className={`h-full rounded-full ${monthH/cap>0.9?'bg-red-500':monthH/cap>0.7?'bg-amber-500':'bg-emerald-500'}`} style={{width:`${Math.min(monthH/cap*100,100)}%`}}/>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <input type="month" value={viewMonth} onChange={e => setViewMonth(e.target.value)} className="w-auto text-sm"/>
        {(isAdmin||isAccount) && (
          <select value={filterMember} onChange={e => setFilterMember(e.target.value)} className="w-auto text-sm">
            <option value="">Todos</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name.split(' ').slice(0,2).join(' ')}</option>)}
          </select>
        )}
        <select value={filterClient} onChange={e => setFilterClient(e.target.value)} className="w-auto text-sm">
          <option value="">Todos os clientes</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={() => setShowManual(!showManual)} className="btn-secondary flex items-center gap-1 ml-auto text-xs"><Plus size={14}/>Manual</button>
      </div>

      {showManual && (
        <div className="card mb-4 animate-fade">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <select value={manual.client_id} onChange={e => setManual(m=>({...m,client_id:e.target.value}))}><option value="">Cliente...</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <select value={manual.action} onChange={e => setManual(m=>({...m,action:e.target.value}))}><option value="">Ação...</option>{ACTIONS.map(a=><option key={a} value={a}>{a}</option>)}</select>
            <input type="number" step="0.5" min="0.5" placeholder="Horas" value={manual.hours} onChange={e => setManual(m=>({...m,hours:e.target.value}))}/>
            <input type="date" value={manual.date} onChange={e => setManual(m=>({...m,date:e.target.value}))}/>
          </div>
          <div className="flex gap-2">
            <input placeholder="Descrição" value={manual.description} onChange={e => setManual(m=>({...m,description:e.target.value}))} className="flex-1"/>
            <button onClick={saveManual} className="btn-primary text-xs">Salvar</button>
            <button onClick={() => setShowManual(false)} className="btn-ghost text-xs">Cancelar</button>
          </div>
        </div>
      )}

      {(isAdmin||isAccount) && Object.keys(byClient).length>0 && (
        <div className="card mb-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Por cliente</p>
          {Object.entries(byClient).sort((a,b)=>b[1]-a[1]).map(([n,h])=>(
            <div key={n} className="flex justify-between text-sm px-1 py-1"><span className="text-white/70">{n}</span><span className="font-mono">{h.toFixed(1)}h</span></div>
          ))}
          <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/[0.06] px-1 mt-1"><span>Total</span><span className="font-mono">{Object.values(byClient).reduce((a,b)=>a+b,0).toFixed(1)}h</span></div>
        </div>
      )}

      <div className="space-y-0.5">
        {vis.filter(e=>!e.is_running).map(e=>(
          <div key={e.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] group">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm truncate">{e.description||e.client?.name||'Sem descrição'}</p>
                {e.action && <span className="badge-gray text-[10px]">{e.action}</span>}
                {e.is_manual && <span className="badge-blue text-[10px]">manual</span>}
              </div>
              <p className="text-xs text-white/30">{(isAdmin||isAccount)&&e.member?.name?e.member.name.split(' ')[0]+' · ':''}{e.date}{e.client?.name?' · '+e.client.name:''}</p>
            </div>
            <span className="text-sm font-mono text-white/60">{Number(e.hours||0).toFixed(1)}h</span>
            {(isAdmin||e.member_id===user.id) && <button onClick={()=>deleteEntry(e.id)} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400"><X size={14}/></button>}
          </div>
        ))}
        {vis.length===0 && <div className="text-center py-8 text-white/30 text-sm">Nenhum lançamento.</div>}
      </div>
    </div>
  )
}
