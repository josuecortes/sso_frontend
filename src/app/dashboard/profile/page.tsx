'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { PatternFormat } from 'react-number-format';

interface Role {
  id: number;
  name: string;
  assigned_at: string;
}

interface Position {
  id: number;
  position_name: string;
  organizational_unit_name: string;
  assigned_at: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  cpf?: string;
  birth_date?: string;
  phone?: string;
  whatsapp?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  active_roles: Role[];
  active_positions: Position[];
}

interface PasswordChange {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

interface ApiResponse {
  message: string;
  code: number;
  user: UserProfile;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    name: '',
    email: '',
    cpf: '',
    birth_date: '',
    phone: '',
    whatsapp: '',
    active: false,
    created_at: '',
    updated_at: '',
    active_roles: [],
    active_positions: [],
  });
  const [password, setPassword] = useState<PasswordChange>({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao carregar perfil');
      }

      const data: ApiResponse = await response.json();
      console.log('Dados do perfil:', data); // Log para debug
      setProfile({
        ...data.user,
        name: data.user.name || '',
        email: data.user.email || '',
        cpf: data.user.cpf || '',
        birth_date: data.user.birth_date || '',
        phone: data.user.phone || '',
        whatsapp: data.user.whatsapp || '',
        active_roles: data.user.active_roles || [],
        active_positions: data.user.active_positions || [],
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar perfil');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: {
            name: profile.name,
            cpf: profile.cpf,
            birth_date: profile.birth_date,
            phone: profile.phone,
            whatsapp: profile.whatsapp,
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao atualizar perfil');
      }
      
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/profile/update_password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(password),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao atualizar senha');
      }

      toast.success('Senha atualizada com sucesso!');
      setPassword({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      toast.error('Erro ao atualizar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl">
      <h1 className="text-xl lg:text-2xl font-bold mb-6">Perfil do Usuário</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="order-1">
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={profile.cpf}
                  onChange={(e) => setProfile({ ...profile, cpf: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={profile.birth_date || ''}
                  onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <PatternFormat
                  format="(##) #####-####"
                  value={profile.phone || ''}
                  onValueChange={(values) => {
                    setProfile({ ...profile, phone: values.value })
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="(99) 99999-9999"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <PatternFormat
                  format="(##) #####-####"
                  value={profile.whatsapp || ''}
                  onValueChange={(values) => {
                    setProfile({ ...profile, whatsapp: values.value })
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="(99) 99999-9999"
                />
              </div>

              <div>
                <Label>Status</Label>
                <Input
                  value={profile.active ? 'Ativo' : 'Inativo'}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
              </div>

              <div>
                <Label>Funções Ativas</Label>
                <div className="mt-2 space-y-1">
                  {profile.active_roles.map((role) => (
                    <div key={role.id} className="text-sm text-foreground">
                      {role.name}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Cargo/Unidade Ativos</Label>
                <div className="mt-2 space-y-2">
                  {profile.active_positions.map((position) => (
                    <div key={position.id} className="text-sm p-2 bg-muted rounded">
                      <div className="font-medium text-foreground">{position.position_name}</div>
                      <div className="text-muted-foreground">{position.organizational_unit_name}</div>
                      <div className="text-xs text-muted-foreground">
                        Atribuído em: {new Date(position.assigned_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="order-2">
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl">Alterar Senha</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="current_password">Senha Atual</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={password.current_password}
                  onChange={(e) => setPassword({ ...password, current_password: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="new_password">Nova Senha</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={password.new_password}
                  onChange={(e) => setPassword({ ...password, new_password: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="new_password_confirmation">Confirmar Nova Senha</Label>
                <Input
                  id="new_password_confirmation"
                  type="password"
                  value={password.new_password_confirmation}
                  onChange={(e) => setPassword({ ...password, new_password_confirmation: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 