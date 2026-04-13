import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { TGTLogo } from '@/components/TGTLogo'
import { Clock, FileText, Film, BarChart3, Settings, LogOut, Menu, X, ChevronRight } from 'lucide-react'

const NAV_ITEMS = [
  { to:'/time', icon:Clock, label:'Time', desc:'Controle de horas', minRole:'user' },
  { to:'/prod', icon:Film, label:'Prod', desc:'Produção AV + Equip.', minRole:'user' },
  { to:'/extras', icon:FileText, label:'Extras', desc:'Extras & Comissões', minRole:'account' },
  { to:'/dashboard', icon:BarChart3, label:'Dashboard', desc:'Visão geral', minRole:'account' },
]

function canAccess(min, user) {
  if (!user) return false
  const h = { admin:4, prod_leader:3, account:2, user:1 }
  return (h[user.access_level]||1) >= (h[min]||1)
}

export function AppLayout() {
  const { user, logout, isAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const vis = NAV_ITEMS.filter(i => canAccess(i.minRole, user))

  return (
    <div className="min-h-screen bg-tgt-black flex">
      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={()=>setOpen(false)}/>}

      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#141414] border-r border-white/[0.06] flex flex-col transition-transform duration-300 ${open?'translate-x-0':'-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 pb-2 flex items-center justify-between">
          <TGTLogo className="h-8"/>
          <button onClick={()=>setOpen(false)} className="lg:hidden text-white/40 hover:text-white p-1"><X size={20}/></button>
        </div>
        <div className="px-4 pb-4"><div className="text-[10px] font-bold uppercase tracking-[0.15em] text-tgt-red/80">Hub</div></div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <p className="section-title">Módulos</p>
          {vis.map(i=>(
            <NavLink key={i.to} to={i.to} onClick={()=>setOpen(false)} className={({isActive})=>isActive?'nav-item-active':'nav-item'}>
              <i.icon size={18}/>
              <div className="flex-1 min-w-0"><div className="font-semibold">{i.label}</div><div className="text-[11px] opacity-50 truncate">{i.desc}</div></div>
              <ChevronRight size={14} className="opacity-30"/>
            </NavLink>
          ))}
          {isAdmin && (
            <>
              <p className="section-title mt-6">Sistema</p>
              <NavLink to="/settings" onClick={()=>setOpen(false)} className={({isActive})=>isActive?'nav-item-active':'nav-item'}>
                <Settings size={18}/><span>Configurações</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-tgt-red/20 flex items-center justify-center text-tgt-red text-xs font-bold">
              {user?.name?.split(' ').map(n=>n[0]).slice(0,2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name?.split(' ').slice(0,2).join(' ')}</p>
              <p className="text-[11px] text-white/40 truncate">{user?.team} · {user?.access_level}</p>
            </div>
            <button onClick={logout} className="text-white/30 hover:text-tgt-red transition-colors" title="Sair"><LogOut size={16}/></button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-30 bg-[#141414]/95 backdrop-blur border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
          <button onClick={()=>setOpen(true)} className="text-white/60 hover:text-white"><Menu size={22}/></button>
          <TGTLogo className="h-6"/>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto"><Outlet/></main>
      </div>
    </div>
  )
}
