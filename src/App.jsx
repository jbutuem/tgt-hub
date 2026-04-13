import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { LoginPage } from '@/components/LoginPage'
import { AppLayout } from '@/components/AppLayout'
import { TimePage } from '@/modules/time/TimePage'
import { ExtrasPage } from '@/modules/extras/ExtrasPage'
import { ProdPage } from '@/modules/prod/ProdPage'
import { DashboardPage } from '@/modules/dashboard/DashboardPage'
import { SettingsPage } from '@/modules/settings/SettingsPage'

function ProtectedRoutes() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-tgt-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-tgt-red/30 border-t-tgt-red rounded-full animate-spin mx-auto mb-3"/>
        <p className="text-white/30 text-sm">Carregando...</p>
      </div>
    </div>
  )
  if (!user) return <LoginPage/>
  return (
    <Routes>
      <Route element={<AppLayout/>}>
        <Route index element={<Navigate to="/time" replace/>}/>
        <Route path="time" element={<TimePage/>}/>
        <Route path="prod" element={<ProdPage/>}/>
        <Route path="extras" element={<ExtrasPage/>}/>
        <Route path="dashboard" element={<DashboardPage/>}/>
        <Route path="settings" element={<SettingsPage/>}/>
        <Route path="*" element={<Navigate to="/time" replace/>}/>
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<ProtectedRoutes/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
