import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('tgt_hub_user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
      } catch { localStorage.removeItem('tgt_hub_user') }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (username, password) => {
    const { data, error } = await supabase
      .from('tt_members')
      .select('id, name, email, team, role, access_level, capacity_hours_month, job_title, is_active')
      .eq('is_active', true)

    if (error) return { error: 'Erro de conexão. Tente novamente.' }

    const member = data.find(m => {
      const nameMatch = m.name.toLowerCase().split(' ')[0] === username.toLowerCase()
      const emailMatch = m.email && m.email.toLowerCase() === username.toLowerCase()
      return nameMatch || emailMatch
    })

    if (!member) return { error: 'Usuário não encontrado.' }

    const { data: passData } = await supabase
      .from('tt_members')
      .select('login_password')
      .eq('id', member.id)
      .single()

    if (!passData?.login_password || passData.login_password !== password) {
      return { error: 'Senha incorreta.' }
    }

    const userData = { ...member }
    setUser(userData)
    localStorage.setItem('tgt_hub_user', JSON.stringify(userData))
    return { user: userData }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('tgt_hub_user')
  }, [])

  const isAdmin = user?.access_level === 'admin'
  const isAccount = user?.access_level === 'account' || isAdmin
  const isProdLeader = user?.access_level === 'prod_leader' || isAdmin
  const isUser = !!user

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isAccount, isProdLeader, isUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
