'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Se não tiver usuário, redireciona para o login
    if (!user) {
      router.replace('/login');
      return;
    }
    // Se tiver usuário, redireciona para o dashboard
    router.replace('/dashboard');
  }, [user, router]);

  // Retorna null para não mostrar nada enquanto redireciona
  return null;
}
