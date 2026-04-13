import { useState, useEffect } from 'react'
import { Package, Search, Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function EquipmentPicker({ requestId, onClose, onSaved }) {
  const [categories, setCategories] = useState([])
  const [equipment, setEquipment] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [catR, eqR, selR] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('equipment').select('*,category:categories(name,icon)').order('name'),
      requestId ? supabase.from('av_equipment').select('equipment_id').eq('request_id', requestId) : { data: [] }
    ])
    if (catR.data) setCategories(catR.data)
    if (eqR.data) setEquipment(eqR.data)
    if (selR.data) setSelected(new Set(selR.data.map(s => s.equipment_id)))
    setLoading(false)
  }

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  async function save() {
    if (!requestId) { onSaved?.(Array.from(selected)); onClose(); return }
    setSaving(true)
    await supabase.from('av_equipment').delete().eq('request_id', requestId)
    if (selected.size > 0) {
      await supabase.from('av_equipment').insert(
        Array.from(selected).map(eid => ({ request_id: requestId, equipment_id: eid }))
      )
    }
    setSaving(false)
    onSaved?.(Array.from(selected))
    onClose()
  }

  const filtered = equipment.filter(e => {
    if (!search) return true
    const s = search.toLowerCase()
    return e.name.toLowerCase().includes(s) || (e.brand||'').toLowerCase().includes(s) || (e.internal_code||'').toLowerCase().includes(s)
  })

  const grouped = categories.map(cat => ({
    ...cat,
    items: filtered.filter(e => e.category_id === cat.id)
  })).filter(g => g.items.length > 0)

  const STATUS_COLORS = {
    available: 'text-emerald-400', reserved: 'text-blue-400', in_use: 'text-amber-400', maintenance: 'text-red-400'
  }
  const STATUS_LABELS = {
    available: 'Disponível', reserved: 'Reservado', in_use: 'Em uso', maintenance: 'Manutenção'
  }

  if (loading) return <div className="modal-overlay"><div className="modal-content p-8 text-center text-white/30">Carregando equipamentos...</div></div>

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && null}>
      <div className="modal-content max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2"><Package size={20}/>Equipamentos</h2>
            <p className="text-xs text-white/40">{selected.size} selecionados</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20}/></button>
        </div>

        <div className="p-4 border-b border-white/[0.06]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar equipamento..." className="w-full pl-9"/>
          </div>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {grouped.map(cat => (
            <div key={cat.id}>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span>{cat.icon}</span>{cat.name}
              </p>
              <div className="space-y-1">
                {cat.items.map(eq => {
                  const isSel = selected.has(eq.id)
                  const isAvail = eq.status === 'available'
                  return (
                    <button key={eq.id} onClick={() => toggle(eq.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                        isSel ? 'bg-tgt-red/10 border border-tgt-red/30' : 'hover:bg-white/[0.03] border border-transparent'
                      }`}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                        isSel ? 'bg-tgt-red border-tgt-red' : 'border-white/20'
                      }`}>
                        {isSel && <Check size={12} className="text-white"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{eq.name}</p>
                        <p className="text-xs text-white/30">{eq.brand} {eq.model} · {eq.internal_code}</p>
                      </div>
                      <span className={`text-xs ${STATUS_COLORS[eq.status]||'text-white/30'}`}>
                        {STATUS_LABELS[eq.status]||eq.status}
                      </span>
                      {eq.quantity > 1 && <span className="badge-gray text-[10px]">x{eq.quantity}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          {equipment.length === 0 && (
            <div className="text-center py-8 text-white/30">
              <Package size={32} className="mx-auto mb-2 opacity-50"/>
              <p className="text-sm">Nenhum equipamento cadastrado.</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-white/[0.06]">
          <span className="text-sm text-white/40">{selected.size} equipamento{selected.size!==1?'s':''}</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-ghost">Cancelar</button>
            <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-1">
              <Check size={16}/>{saving?'Salvando...':'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EquipmentList({ requestId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!requestId) return
    supabase.from('av_equipment').select('*,equipment:equipment(name,brand,model,internal_code,category:categories(name,icon))')
      .eq('request_id', requestId).then(({data}) => { if(data) setItems(data); setLoading(false) })
  }, [requestId])

  if (loading) return <p className="text-white/30 text-sm">Carregando...</p>
  if (items.length === 0) return <p className="text-white/30 text-sm">Nenhum equipamento selecionado.</p>

  return (
    <div className="space-y-1">
      {items.map(i => (
        <div key={i.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.03]">
          <span className="text-sm">{i.equipment?.category?.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{i.equipment?.name}</p>
            <p className="text-xs text-white/30">{i.equipment?.brand} · {i.equipment?.internal_code}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
