import { useState } from 'react'
import { X, AlertTriangle, ChevronRight, ChevronLeft, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const STEPS = [
  { key: 'strategy', title: 'Validação Estratégica', desc: 'Por que produzir?' },
  { key: 'type', title: 'Tipo de Produção', desc: 'Fee, Extra, Single ou Pacote' },
  { key: 'briefing', title: 'Briefing', desc: 'Detalhes da produção' },
  { key: 'effort', title: 'Esforço Estimado', desc: 'Horas e prazo' },
]

export function NewRequestModal({ clients, members, onClose, onCreated }) {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    title: '',
    client_id: '',
    objective: '',
    expected_impact: '',
    channel: '',
    target_audience: '',
    prod_type: '',
    video_type: '',
    quantity_deliverables: 1,
    formats: '',
    duration_estimate: '',
    reference_links: '',
    briefing_notes: '',
    has_script: false,
    est_capture_hours: '',
    est_edit_hours: '',
    est_post_hours: '',
    desired_deadline: '',
  })

  const set = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }))
    setErrors(prev => ({ ...prev, [k]: undefined }))
  }

  function validateStep(s) {
    const errs = {}
    if (s === 0) {
      if (!form.title.trim()) errs.title = 'Obrigatório'
      if (!form.client_id) errs.client_id = 'Selecione um cliente'
      if (!form.objective.trim()) errs.objective = 'Sem objetivo claro, a produção não avança'
      if (!form.expected_impact.trim()) errs.expected_impact = 'Qual o impacto esperado?'
    }
    if (s === 1) {
      if (!form.prod_type) errs.prod_type = 'Selecione o tipo'
    }
    if (s === 2) {
      if (!form.video_type) errs.video_type = 'Selecione o tipo de vídeo'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function nextStep() {
    if (validateStep(step)) setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  async function handleSubmit() {
    if (!validateStep(step)) return
    setSaving(true)
    const { error } = await supabase.from('av_requests').insert({
      ...form,
      requested_by: user.id,
      est_capture_hours: Number(form.est_capture_hours) || 0,
      est_edit_hours: Number(form.est_edit_hours) || 0,
      est_post_hours: Number(form.est_post_hours) || 0,
      quantity_deliverables: Number(form.quantity_deliverables) || 1,
      status: 'pending_leader_review'
    })
    setSaving(false)
    if (error) { setErrors({ submit: error.message }); return }
    onCreated()
  }

  const Field = ({ label, error, required, children }) => (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-1.5">
        {label} {required && <span className="text-tgt-red">*</span>}
      </label>
      {children}
      {error && <p className="text-tgt-red text-xs mt-1 flex items-center gap-1"><AlertTriangle size={12}/>{error}</p>}
    </div>
  )

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && null}>
      <div className="modal-content">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-bold">Nova Solicitação</h2>
            <p className="text-xs text-white/40">{STEPS[step].title} — {STEPS[step].desc}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1"><X size={20}/></button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 px-4 pt-3">
          {STEPS.map((s, i) => (
            <div key={s.key} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-tgt-red' : 'bg-white/10'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {step === 0 && (
            <>
              <Field label="Nome da produção" error={errors.title} required>
                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Vídeo institucional Kerry Q2" className="w-full"/>
              </Field>
              <Field label="Cliente" error={errors.client_id} required>
                <select value={form.client_id} onChange={e => set('client_id', e.target.value)} className="w-full">
                  <option value="">Selecione...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.team})</option>)}
                </select>
              </Field>
              <Field label="Objetivo da produção" error={errors.objective} required>
                <textarea value={form.objective} onChange={e => set('objective', e.target.value)}
                  placeholder="O que essa produção precisa comunicar? Qual problema resolve? O que muda depois dela existir?"
                  rows={3} className="w-full resize-none"/>
              </Field>
              <Field label="Impacto esperado" error={errors.expected_impact} required>
                <input value={form.expected_impact} onChange={e => set('expected_impact', e.target.value)}
                  placeholder="Ex: Aumentar engajamento em 20%, gerar leads no evento..." className="w-full"/>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Canal de veiculação">
                  <input value={form.channel} onChange={e => set('channel', e.target.value)} placeholder="Instagram, YouTube, evento..." className="w-full"/>
                </Field>
                <Field label="Público-alvo">
                  <input value={form.target_audience} onChange={e => set('target_audience', e.target.value)} placeholder="Clientes B2B, consumidor final..." className="w-full"/>
                </Field>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <Field label="Tipo de produção" error={errors.prod_type} required>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'fee_prod', label: 'Fee Prod', desc: 'Dentro do fee mensal do cliente', color: 'border-blue-500/40 bg-blue-500/10' },
                    { value: 'extra_prod', label: 'Extra Prod', desc: 'Cliente da casa, fora do escopo', color: 'border-amber-500/40 bg-amber-500/10' },
                    { value: 'single_project', label: 'Single Project', desc: 'Projeto avulso, cliente externo', color: 'border-purple-500/40 bg-purple-500/10' },
                    { value: 'package', label: 'Pacote', desc: 'Recorrente, cliente externo', color: 'border-emerald-500/40 bg-emerald-500/10' },
                  ].map(opt => (
                    <button key={opt.value}
                      onClick={() => set('prod_type', opt.value)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        form.prod_type === opt.value ? opt.color + ' border-2' : 'border-white/10 hover:border-white/20'
                      }`}>
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-xs text-white/40 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </Field>
              {form.prod_type && form.prod_type !== 'fee_prod' && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm text-amber-300">
                  Produções fora do fee geram cobrança. O líder de PROD calculará o orçamento e você receberá os valores para aprovação.
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Tipo de vídeo" error={errors.video_type} required>
                <select value={form.video_type} onChange={e => set('video_type', e.target.value)} className="w-full">
                  <option value="">Selecione...</option>
                  {['interview','product','lifestyle','event','making_of','institutional','tutorial','campaign','other'].map(v => (
                    <option key={v} value={v}>{v === 'interview' ? 'Entrevista' : v === 'product' ? 'Produto' : v === 'lifestyle' ? 'Lifestyle' : v === 'event' ? 'Evento' : v === 'making_of' ? 'Making Of' : v === 'institutional' ? 'Institucional' : v === 'tutorial' ? 'Tutorial' : v === 'campaign' ? 'Campanha' : 'Outro'}</option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Quantidade">
                  <input type="number" min="1" value={form.quantity_deliverables} onChange={e => set('quantity_deliverables', e.target.value)} className="w-full"/>
                </Field>
                <Field label="Formatos">
                  <input value={form.formats} onChange={e => set('formats', e.target.value)} placeholder="9:16, 16:9" className="w-full"/>
                </Field>
                <Field label="Duração estimada">
                  <input value={form.duration_estimate} onChange={e => set('duration_estimate', e.target.value)} placeholder="30s, 1min" className="w-full"/>
                </Field>
              </div>
              <Field label="Notas de briefing">
                <textarea value={form.briefing_notes} onChange={e => set('briefing_notes', e.target.value)}
                  placeholder="Detalhes adicionais: pessoas que aparecem, locação desejada, referências visuais..."
                  rows={3} className="w-full resize-none"/>
              </Field>
              <Field label="Links de referência">
                <input value={form.reference_links} onChange={e => set('reference_links', e.target.value)} placeholder="URLs de referência visual, roteiro..." className="w-full"/>
              </Field>
              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                <input type="checkbox" checked={form.has_script} onChange={e => set('has_script', e.target.checked)} className="accent-tgt-red"/>
                Já existe roteiro pronto
              </label>
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Horas captação">
                  <input type="number" min="0" step="0.5" value={form.est_capture_hours} onChange={e => set('est_capture_hours', e.target.value)} placeholder="0" className="w-full"/>
                </Field>
                <Field label="Horas edição">
                  <input type="number" min="0" step="0.5" value={form.est_edit_hours} onChange={e => set('est_edit_hours', e.target.value)} placeholder="0" className="w-full"/>
                </Field>
                <Field label="Horas pós-prod">
                  <input type="number" min="0" step="0.5" value={form.est_post_hours} onChange={e => set('est_post_hours', e.target.value)} placeholder="0" className="w-full"/>
                </Field>
              </div>
              <div className="stat-card">
                <p className="text-white/40 text-xs mb-1">Total estimado</p>
                <p className="text-xl font-bold">
                  {(Number(form.est_capture_hours || 0) + Number(form.est_edit_hours || 0) + Number(form.est_post_hours || 0)).toFixed(1)}h
                </p>
              </div>
              <Field label="Deadline desejado">
                <input type="date" value={form.desired_deadline} onChange={e => set('desired_deadline', e.target.value)} className="w-full"/>
              </Field>
              {form.prod_type === 'fee_prod' && (Number(form.est_capture_hours || 0) + Number(form.est_edit_hours || 0) + Number(form.est_post_hours || 0)) > 16 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm text-amber-300">
                  Estimativa alta para produção fee. Confirme se o escopo está correto.
                </div>
              )}
              {errors.submit && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">{errors.submit}</div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/[0.06]">
          <button onClick={() => step > 0 ? setStep(s => s - 1) : onClose()} className="btn-ghost flex items-center gap-1">
            <ChevronLeft size={16}/> {step > 0 ? 'Voltar' : 'Cancelar'}
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={nextStep} className="btn-primary flex items-center gap-1">
              Próximo <ChevronRight size={16}/>
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving} className="btn-primary flex items-center gap-2">
              <Send size={16}/> {saving ? 'Enviando...' : 'Enviar para Líder'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
