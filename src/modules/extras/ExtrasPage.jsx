import { useState, useEffect } from 'react'
import { FileText, Send, Check, Clock, DollarSign } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const MAKE_WEBHOOK = 'https://hook.us2.make.com/f8udalcn1tphq9ums02x2aoxgx79r0lm'

export function ExtrasPage() {
  const { user, isAdmin, isAccount } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [history, setHistory] = useState([])
  const [form, setForm] = useState({
    client:'', description:'', type:'extra_fee', estimated_hours:'', estimated_value:'', urgency:'normal', notes:''
  })

  useEffect(() => { loadData() }, [user])

  async function loadData() {
    if (!user) return
    const { data } = await supabase.from('tt_clients').select('id,name,team').eq('is_active',true).order('name')
    if (data) setClients(data)
    setLoading(false)
  }

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setSent(false) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.client || !form.description) return
    setSending(true)
    try {
      await fetch(MAKE_WEBHOOK, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          account: user.name,
          account_email: user.email,
          client: form.client,
          description: form.description,
          type: form.type,
          estimated_hours: Number(form.estimated_hours)||0,
          estimated_value: Number(form.estimated_value)||0,
          urgency: form.urgency,
          notes: form.notes,
          submitted_at: new Date().toISOString()
        })
      })
      setSent(true)
      setForm({ client:'', description:'', type:'extra_fee', estimated_hours:'', estimated_value:'', urgency:'normal', notes:'' })
    } catch(err) { console.error(err) }
    setSending(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-white/30">Carregando...</div>

  return (
    <div className="max-w-3xl animate-fade">
      <div className="flex items-center gap-3 mb-6">
        <FileText size={24} className="text-tgt-red"/>
        <h1 className="text-xl font-bold">Extras & Comissões</h1>
      </div>

      {sent && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 mb-4 flex items-center gap-2 text-emerald-400 text-sm animate-fade">
          <Check size={16}/> Solicitação enviada com sucesso! O Monday será atualizado automaticamente.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Nova solicitação extra</p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Cliente <span className="text-tgt-red">*</span></label>
              <select value={form.client} onChange={e=>set('client',e.target.value)} className="w-full" required>
                <option value="">Selecione...</option>
                {clients.map(c=><option key={c.id} value={c.name}>{c.name} ({c.team})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1.5">Descrição do trabalho <span className="text-tgt-red">*</span></label>
              <textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="O que precisa ser feito?" rows={3} className="w-full resize-none" required/>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Tipo</label>
                <select value={form.type} onChange={e=>set('type',e.target.value)} className="w-full">
                  <option value="extra_fee">Extra Fee</option>
                  <option value="single_project">Projeto Avulso</option>
                  <option value="package">Pacote</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Horas estimadas</label>
                <input type="number" min="0" step="0.5" value={form.estimated_hours} onChange={e=>set('estimated_hours',e.target.value)} placeholder="0" className="w-full"/>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Valor estimado (R$)</label>
                <input type="number" min="0" step="100" value={form.estimated_value} onChange={e=>set('estimated_value',e.target.value)} placeholder="0" className="w-full"/>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Urgência</label>
                <select value={form.urgency} onChange={e=>set('urgency',e.target.value)} className="w-full">
                  <option value="low">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Observações</label>
                <input value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Info adicional..." className="w-full"/>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={sending || !form.client || !form.description} className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40">
          <Send size={16}/> {sending ? 'Enviando...' : 'Enviar Solicitação'}
        </button>
      </form>
    </div>
  )
}
