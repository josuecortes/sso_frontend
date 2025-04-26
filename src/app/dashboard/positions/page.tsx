'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Pencil, Trash, Shield, Users, Building2, MapPin, LayoutDashboard, Briefcase } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Position {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ValidationErrors {
  [key: string]: string[];
}

interface PositionFormData {
  name: string;
  description: string;
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const [formData, setFormData] = useState<PositionFormData>({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/positions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error('Erro ao buscar positions');
      const data = await response.json();
      setPositions(data);
    } catch (error) {
      toast.error('Erro ao carregar positions');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
    setErrors({});
    setSelectedPositionId(null);
  };

  const handleOpenModal = (position?: Position) => {
    if (position) {
      setFormData({
        name: position.name,
        description: position.description
      });
      setSelectedPositionId(position.id);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('token');
      const method = selectedPositionId ? 'PATCH' : 'POST';
      const url = selectedPositionId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/positions/${selectedPositionId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/positions`;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ position: formData }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          let newErrors: ValidationErrors = {};
          if (Array.isArray(data.errors)) {
            data.errors.forEach((error: string) => {
              const field = error.toLowerCase().startsWith('name') ? 'name' : 'description';
              if (!newErrors[field]) newErrors[field] = [];
              newErrors[field].push(error);
            });
          } else if (typeof data.errors === 'object') {
            newErrors = data.errors;
          }
          setErrors(newErrors);
          setLoading(false);
          return;
        }
        throw new Error(data.message || 'Erro ao salvar position');
      }

      toast.success(selectedPositionId ? 'Cargo atualizado com sucesso' : 'Cargo criado com sucesso');
      handleCloseModal();
      fetchPositions();
    } catch (error) {
      toast.error('Erro ao salvar permissão');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPositionId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/positions/${selectedPositionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erro ao excluir permissão');
      toast.success('Cargo excluída com sucesso');
      setIsDeleteDialogOpen(false);
      fetchPositions();
    } catch (error) {
      toast.error('Erro ao excluir permissão');
    }
  };

  return (
    <div className="h-full flex flex-col pr-4 pl-4">
      <div className="border-b">
        <div className="h-16 flex items-center justify-between mx-auto pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Briefcase className="h-10 w-10 text-indigo-500 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg lg:text-xl font-semibold truncate">
                Gerenciamento de Cargos
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Gerencie os cargos do sistema
              </p>
            </div>
          </div>
          <Button 
            onClick={() => handleOpenModal()} 
            className="flex items-center gap-2 flex-shrink-0"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Cargo</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {/* Conteúdo principal - Ajustado padding para mobile */}
      <div className="flex-1 pt-8">
        <Card className="border dark:border-gray-800">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Descrição</TableHead>
                  <TableHead className="hidden lg:table-cell">Criado em</TableHead>
                  <TableHead className="hidden lg:table-cell">Atualizado</TableHead>
                  <TableHead className="w-[100px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">{position.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {position.description || '-'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {new Date(position.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {new Date(position.updated_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right p-2">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(position)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPositionId(position.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Modal de criar/editar */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-500" />
              {selectedPositionId ? 'Editar Cargo' : 'Novo Cargo'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Digite o nome da permissão"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name?.map((err, i) => (
                <p key={i} className="text-sm text-red-500 mt-1">{err}</p>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Digite uma descrição para a permissão"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description?.map((err, i) => (
                <p key={i} className="text-sm text-red-500 mt-1">{err}</p>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processando...
                  </div>
                ) : selectedPositionId ? (
                  'Atualizar'
                ) : (
                  'Criar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash className="h-5 w-5" />
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta permissão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
