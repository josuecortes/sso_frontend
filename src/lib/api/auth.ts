export async function login({ email, password }: { email: string; password: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user: { email, password } }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Erro ao fazer login');
  }

  // Log da resposta completa
  console.log('Resposta do login:', {
    status: res.status,
    statusText: res.statusText,
    headers: Object.fromEntries(res.headers.entries()),
    body: await res.clone().json()
  });

  const data = await res.json();
  const token = res.headers.get('Authorization')?.split(' ')[1];
  
  if (!token) {
    throw new Error('Token não encontrado no header de autorização');
  }

  return { 
    token,
    user: data.user
  };
}
