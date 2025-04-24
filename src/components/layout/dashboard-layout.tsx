'use client'

import { useAuth } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Se não estiver carregando e não tiver token ou usuário, redireciona para o login
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!loading && (!token || !userData)) {
      router.push('/login')
    }
  }, [loading, router])

  // Mostra loading apenas durante a verificação inicial
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  // Se não tiver usuário após o carregamento, não renderiza nada (vai redirecionar)
  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
