'use client';

import { useAuth } from '@/providers/auth-provider';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Bem-vindo, {user?.name}</h1>
      {/* mais conteúdo aqui */}
    </div>
  );
}
