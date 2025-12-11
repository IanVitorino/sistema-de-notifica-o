'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface UnidadeMedida {
  id: number;
  descricao: string;
  unidade: string;
}

async function fetchUnidadesMedida(): Promise<UnidadeMedida[]> {
  const response = await fetch('/api/paginas/cadastros/unidade-medida');
  if (!response.ok) {
    throw new Error('Erro ao carregar unidades de medida');
  }
  return response.json();
}

async function createUnidadeMedida(data: { nome: string; sigla: string }): Promise<UnidadeMedida> {
  const response = await fetch('/api/paginas/cadastros/unidade-medida', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar unidade de medida');
  }

  return response.json();
}

async function updateUnidadeMedida(id: number, data: { nome: string; sigla: string }): Promise<UnidadeMedida> {
  const response = await fetch(`/api/paginas/cadastros/unidade-medida/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar unidade de medida');
  }

  return response.json();
}

async function deleteUnidadeMedida(id: number): Promise<void> {
  const response = await fetch(`/api/paginas/cadastros/unidade-medida/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erro ao excluir unidade de medida');
  }
}

export function UnidadeMedidaContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewUnidadeMedidaModalOpen, setIsNewUnidadeMedidaModalOpen] = useState(false);
  const [isEditUnidadeMedidaModalOpen, setIsEditUnidadeMedidaModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [editingUnidadeMedida, setEditingUnidadeMedida] = useState<UnidadeMedida | null>(null);
  const [deletingUnidadeMedida, setDeletingUnidadeMedida] = useState<UnidadeMedida | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    sigla: '',
  });

  const queryClient = useQueryClient();

  const {
    data: unidadesMedida = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['unidadesMedida'],
    queryFn: fetchUnidadesMedida,
  });

  const createMutation = useMutation({
    mutationFn: createUnidadeMedida,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidadesMedida'] });
      setIsNewUnidadeMedidaModalOpen(false);
      setFormData({ nome: '', sigla: '' });
      toast.success('Unidade de medida criada com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao criar unidade de medida: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { nome: string; sigla: string } }) =>
      updateUnidadeMedida(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidadesMedida'] });
      setIsEditUnidadeMedidaModalOpen(false);
      setEditingUnidadeMedida(null);
      setFormData({ nome: '', sigla: '' });
      toast.success('Unidade de medida atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar unidade de medida: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUnidadeMedida,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidadesMedida'] });
      setIsDeleteConfirmModalOpen(false);
      setDeletingUnidadeMedida(null);
      toast.success('Unidade de medida excluída com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao excluir unidade de medida: ${error.message}`);
    },
  });

  const unidadeMedidaDuplicada = (formData.nome.trim() || formData.sigla.trim()) && unidadesMedida.some(
    (u) => (
      (u.descricao?.toLowerCase().trim() === formData.nome.toLowerCase().trim() ||
       u.unidade?.toLowerCase().trim() === formData.sigla.toLowerCase().trim()) &&
      u.id !== editingUnidadeMedida?.id
    )
  );

  const formValido = formData.nome.trim() && formData.sigla.trim() && !unidadeMedidaDuplicada;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.sigla.trim()) {
      toast.error('Nome e sigla são obrigatórios');
      return;
    }

    const data = {
      nome: formData.nome.trim(),
      sigla: formData.sigla.trim(),
    };

    if (editingUnidadeMedida) {
      updateMutation.mutate({ id: editingUnidadeMedida.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEditUnidadeMedida = (unidadeMedida: UnidadeMedida) => {
    setEditingUnidadeMedida(unidadeMedida);
    setFormData({
      nome: unidadeMedida.descricao || '',
      sigla: unidadeMedida.unidade || '',
    });
    setIsEditUnidadeMedidaModalOpen(true);
  };

  const handleDeleteUnidadeMedida = (unidadeMedida: UnidadeMedida) => {
    setDeletingUnidadeMedida(unidadeMedida);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingUnidadeMedida) {
      deleteMutation.mutate(deletingUnidadeMedida.id);
    }
  };

  const handleCloseModal = () => {
    setIsNewUnidadeMedidaModalOpen(false);
    setIsEditUnidadeMedidaModalOpen(false);
    setIsDeleteConfirmModalOpen(false);
    setEditingUnidadeMedida(null);
    setDeletingUnidadeMedida(null);
    setFormData({ nome: '', sigla: '' });
  };

  const filteredUnidadesMedida = unidadesMedida.filter(
    (unidadeMedida) =>
      unidadeMedida.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidadeMedida.unidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unidadeMedida.id.toString().includes(searchTerm)
  );

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">
              Erro ao carregar unidades de medida: {(error as Error).message}
            </p>
            <Button onClick={() => refetch()}>Tentar Novamente</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mx-10">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <CardTitle>Unidades de Medida</CardTitle>
              <CardDescription>Gerencie as unidades de medida do sistema</CardDescription>
            </div>
            <div>
              <Button onClick={() => setIsNewUnidadeMedidaModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Unidade de Medida
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar unidades de medida..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Sigla</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnidadesMedida.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Nenhuma unidade de medida encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUnidadesMedida.map((unidadeMedida) => (
                    <TableRow key={unidadeMedida.id}>
                      <TableCell>{unidadeMedida.id}</TableCell>
                      <TableCell>{unidadeMedida.descricao}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{unidadeMedida.unidade}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUnidadeMedida(unidadeMedida)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUnidadeMedida(unidadeMedida)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isNewUnidadeMedidaModalOpen || isEditUnidadeMedidaModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUnidadeMedida ? 'Editar Unidade de Medida' : 'Nova Unidade de Medida'}
            </DialogTitle>
            <DialogDescription>
              {editingUnidadeMedida
                ? 'Edite as informações da unidade de medida selecionada'
                : 'Preencha as informações para criar uma nova unidade de medida'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sigla">Sigla</Label>
                <Input
                  id="sigla"
                  value={formData.sigla}
                  onChange={(e) =>
                    setFormData({ ...formData, sigla: e.target.value })
                  }
                />
              </div>
              {unidadeMedidaDuplicada && (
                <p className="text-sm text-destructive">
                  Esta unidade de medida ou sigla já existe no sistema
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!formValido}
              >
                {editingUnidadeMedida ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteConfirmModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a unidade de medida{' '}
              {deletingUnidadeMedida?.descricao} ({deletingUnidadeMedida?.unidade})?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleConfirmDelete}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}