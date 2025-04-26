'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Eye, Pencil, Power } from 'lucide-react';
import { RoleModal } from '@/components/roles/role-modal';

interface Role {
  id: number;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export default function RolesPage() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [viewMode, setViewMode] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar funções');
      }

      const data = await response.json();
      setRoles(data.roles);
    } catch (error) {
      console.error('Erro ao carregar funções:', error);
      toast.error('Erro ao carregar funções');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (role: Role) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/roles/${role.id}/toggle_active`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao alterar status da função');
      }

      await fetchRoles(); // Recarrega a lista de funções
      toast.success(`Função ${role.active ? 'desativada' : 'ativada'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status da função:', error);
      toast.error('Erro ao alterar status da função');
    }
  };

  const handleOpenModal = (role?: Role, view: boolean = false) => {
    setSelectedRole(role || null);
    setViewMode(view);
    setIsModalOpen(true);
  };

  const handleCloseModal = (shouldRefresh?: boolean) => {
    setIsModalOpen(false);
    setSelectedRole(null);
    setViewMode(false);
    if (shouldRefresh) {
      fetchRoles();
    }
  };

  if (!user?.active_roles.some(role => ['master', 'administrador'].includes(role.name.toLowerCase()))) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-center text-red-600">
            Acesso Negado
          </h2>
          <p className="text-center mt-2">
            Você não tem permissão para acessar esta página.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Funções</h1>
        <Button onClick={() => handleOpenModal()}>
          Criar Nova Função
        </Button>
      </div>

      <Card>
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      role.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {role.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(role.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {new Date(role.updated_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenModal(role, true)}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenModal(role)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={role.active ? "destructive" : "default"}
                        size="icon"
                        onClick={() => handleToggleActive(role)}
                        title={role.active ? "Desativar" : "Ativar"}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <RoleModal
        open={isModalOpen}
        onClose={handleCloseModal}
        role={selectedRole}
        viewMode={viewMode}
      />
    </div>
  );
} 