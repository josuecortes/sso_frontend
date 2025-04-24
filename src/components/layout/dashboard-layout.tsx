'use client'

import { useAuth } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
      {/* Overlay para fechar o menu em dispositivos móveis */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar com animação */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
