'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { PatternFormat } from 'react-number-format';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

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

interface ValidationErrors {
  [key: string]: string[];
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
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
  const [errors, setErrors] = useState<ValidationErrors>({});

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
        // Tenta extrair JSON, se falhar, trata como sessão expirada
        let error;
        try {
          error = await response.json();
        } catch (e) {
          toast.error('Sessão expirada. Faça login novamente.');
          logout();
          return;
        }
        // Se for erro de autenticação, também desloga
        if (response.status === 401 || response.status === 403) {
          toast.error('Sessão expirada. Faça login novamente.');
          logout();
          return;
        }
        throw new Error(error.message || 'Falha ao carregar perfil');
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        toast.error('Sessão expirada. Faça login novamente.');
        logout();
        return;
      }
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
    setErrors({}); // Limpa erros anteriores

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

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          // Trata erros de validação
          const validationErrors: ValidationErrors = {};
          
          // Converte os erros do backend para nosso formato
          if (Array.isArray(data.errors)) {
            data.errors.forEach((error: string) => {
              // Verifica erro de campo em branco
              const blankMatch = error.match(/(.*?) can't be blank/);
              // Verifica erro de campo já utilizado
              const takenMatch = error.match(/(.*?) has already been taken/);
              
              if (blankMatch) {
                const field = blankMatch[1].toLowerCase();
                validationErrors[field] = [`${blankMatch[1]} é obrigatório`];
              } else if (takenMatch) {
                const field = takenMatch[1].toLowerCase();
                validationErrors[field] = [`${takenMatch[1]} já está em uso`];
              } else {
                // Outros tipos de erros
                if (!validationErrors.general) {
                  validationErrors.general = [];
                }
                validationErrors.general.push(error);
              }
            });
          }
          
          setErrors(validationErrors);
          toast.error('Por favor, corrija os erros no formulário');
        } else {
          throw new Error(data.message || 'Falha ao atualizar perfil');
        }
      } else {
        toast.success('Perfil atualizado com sucesso!');
        // Atualiza o perfil com os dados mais recentes
        await fetchProfile();
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar perfil');
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
    <div className="h-full flex flex-col pr-4 pl-4">
      <div className="border-b">
        <div className="h-16 flex items-center justify-between mx-auto pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <User className="h-10 w-10 text-indigo-500 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg lg:text-xl font-semibold truncate">
                Perfil do Usuário
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Gerencie suas informações pessoais
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal - Ajustado padding para mobile */}
      <div className="flex-1 pt-8">
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
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name?.map((error, index) => (
                    <p key={index} className="text-sm text-red-500 mt-1">
                      {error}
                    </p>
                  ))}
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
                  <PatternFormat
                    id="cpf"
                    format="###.###.###-##"
                    value={profile.cpf || ''}
                    onValueChange={(values) => {
                      setProfile({ ...profile, cpf: values.value })
                    }}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                      errors.cpf && "border-red-500"
                    )}
                    placeholder="000.000.000-00"
                  />
                  {errors.cpf?.map((error, index) => (
                    <p key={index} className="text-sm text-red-500 mt-1">
                      {error}
                    </p>
                  ))}
                </div>

                <div>
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={profile.birth_date || ''}
                    onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
                    className={errors.birth_date ? 'border-red-500' : ''}
                  />
                  {errors.birth_date?.map((error, index) => (
                    <p key={index} className="text-sm text-red-500 mt-1">
                      {error}
                    </p>
                  ))}
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <PatternFormat
                    id="phone"
                    format="(##) #####-####"
                    value={profile.phone || ''}
                    onValueChange={(values) => {
                      setProfile({ ...profile, phone: values.value })
                    }}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                      errors.phone && "border-red-500"
                    )}
                    placeholder="(99) 99999-9999"
                  />
                  {errors.phone?.map((error, index) => (
                    <p key={index} className="text-sm text-red-500 mt-1">
                      {error}
                    </p>
                  ))}
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <PatternFormat
                    id="whatsapp"
                    format="(##) #####-####"
                    value={profile.whatsapp || ''}
                    onValueChange={(values) => {
                      setProfile({ ...profile, whatsapp: values.value })
                    }}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                      errors.whatsapp && "border-red-500"
                    )}
                    placeholder="(99) 99999-9999"
                  />
                  {errors.whatsapp?.map((error, index) => (
                    <p key={index} className="text-sm text-red-500 mt-1">
                      {error}
                    </p>
                  ))}
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

                {errors.general?.map((error, index) => (
                  <p key={index} className="text-sm text-red-500">
                    {error}
                  </p>
                ))}

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
    </div>
  );
} 