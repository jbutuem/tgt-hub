import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { TGTLogo } from '@/components/TGTLogo'

export function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) return setError('Preencha todos os campos.')
    setLoading(true)
    setError('')
    const result = await login(username, password)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-tgt-black px-4">
      <div className="w-full max-w-sm animate-fade">
        <div className="flex justify-center mb-10">
          <TGTLogo className="h-12" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">TGT Hub</h1>
          <p className="text-white/40 text-sm">Acesse sua área de trabalho</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Primeiro nome ou email"
              autoComplete="username"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Entrando...
              </span>
            ) : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-8">TGT Studio © 2026</p>
      </div>
    </div>
  )
}
