'use client';

import { useAuth } from '@/providers/auth-provider';
import { redirect } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="h-full flex flex-col pr-4 pl-4">
      <div className="border-b">
        <div className="h-16 flex items-center justify-between mx-auto pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <LayoutDashboard className="h-10 w-10 text-indigo-500 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg lg:text-xl font-semibold truncate">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Pagina inicial do SSO
              </p>
            </div>
          </div>
          
        </div>
      </div>

      {/* Conteúdo principal - Ajustado padding para mobile */}
      <div className="flex-1 pt-8">
        <h1>Bem-vindo, {user?.name}</h1>
      </div>

      
    </div>
  );
}
