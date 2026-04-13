import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Film } from 'lucide-react'

export function ProdCalendar({ requests, onSelect }) {
  const [month, setMonth] = useState(new Date())

  const year = month.getFullYear()
  const m = month.getMonth()
  const firstDay = new Date(year, m, 1).getDay()
  const daysInMonth = new Date(year, m + 1, 0).getDate()

  const today = new Date()
  const todayStr = today.toISOString().substring(0, 10)

  const requestsByDate = useMemo(() => {
    const map = {}
    requests.forEach(r => {
      const dates = []
      if (r.desired_deadline) dates.push(r.desired_deadline.substring(0, 10))
      dates.forEach(d => {
        if (!map[d]) map[d] = []
        map[d].push(r)
      })
    })
    return map
  }, [requests])

  const prevMonth = () => setMonth(new Date(year, m - 1, 1))
  const nextMonth = () => setMonth(new Date(year, m + 1, 1))

  const monthLabel = month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const TYPE_COLORS = {
    fee_prod: 'bg-blue-500',
    extra_prod: 'bg-amber-500',
    single_project: 'bg-purple-500',
    package: 'bg-emerald-500',
  }

  return (
    <div className="card animate-fade">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="btn-ghost p-2"><ChevronLeft size={18}/></button>
        <h3 className="text-sm font-semibold capitalize">{monthLabel}</h3>
        <button onClick={nextMonth} className="btn-ghost p-2"><ChevronRight size={18}/></button>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-white/30 py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} className="min-h-[60px]" />
          const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayReqs = requestsByDate[dateStr] || []
          const isToday = dateStr === todayStr

          return (
            <div key={dateStr} className={`min-h-[60px] p-1 rounded-lg border transition-colors ${
              isToday ? 'border-tgt-red/30 bg-tgt-red/5' : 'border-transparent hover:bg-white/[0.03]'
            }`}>
              <span className={`text-xs ${isToday ? 'text-tgt-red font-bold' : 'text-white/50'}`}>{day}</span>
              <div className="mt-0.5 space-y-0.5">
                {dayReqs.slice(0, 3).map(r => (
                  <button key={r.id} onClick={() => onSelect(r)}
                    className="w-full text-left">
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${TYPE_COLORS[r.prod_type] || 'bg-white/30'}`} />
                      <span className="text-[10px] truncate text-white/70">{r.title}</span>
                    </div>
                  </button>
                ))}
                {dayReqs.length > 3 && (
                  <span className="text-[10px] text-white/30">+{dayReqs.length - 3}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
