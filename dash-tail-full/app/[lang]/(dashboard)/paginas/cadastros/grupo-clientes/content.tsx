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
import { Switch } from '@/components/ui/switch';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface GrupoCliente {
  id: number;
  codigo_grupo: string;
  descricao: string;
  status: boolean;
}

async function fetchGruposClientes(): Promise<GrupoCliente[]> {
  const response = await fetch('/api/paginas/cadastros/grupo-clientes');
  if (!response.ok) {
    throw new Error('Erro ao carregar grupos de clientes');
  }
  return response.json();
}

async function createGrupoCliente(data: { codigo: string; descricao: string; status: boolean }): Promise<GrupoCliente> {
  const response = await fetch('/api/paginas/cadastros/grupo-clientes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar grupo de cliente');
  }

  return response.json();
}

async function updateGrupoCliente(id: number, data: { codigo: string; descricao: string; status: boolean }): Promise<GrupoCliente> {
  const response = await fetch(`/api/paginas/cadastros/grupo-clientes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar grupo de cliente');
  }

  return response.json();
}

async function deleteGrupoCliente(id: number): Promise<void> {
  const response = await fetch(`/api/paginas/cadastros/grupo-clientes/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erro ao excluir grupo de cliente');
  }
}

export function GrupoClientesContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewGrupoClienteModalOpen, setIsNewGrupoClienteModalOpen] = useState(false);
  const [isEditGrupoClienteModalOpen, setIsEditGrupoClienteModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [editingGrupoCliente, setEditingGrupoCliente] = useState<GrupoCliente | null>(null);
  const [deletingGrupoCliente, setDeletingGrupoCliente] = useState<GrupoCliente | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    status: true,
  });

  const queryClient = useQueryClient();

  const {
    data: gruposClientes = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['gruposClientes'],
    queryFn: fetchGruposClientes,
  });

  const createMutation = useMutation({
    mutationFn: createGrupoCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gruposClientes'] });
      setIsNewGrupoClienteModalOpen(false);
      setFormData({ codigo: '', descricao: '', status: true });
      toast.success('Grupo de cliente criado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao criar grupo de cliente: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { codigo: string; descricao: string; status: boolean } }) =>
      updateGrupoCliente(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gruposClientes'] });
      setIsEditGrupoClienteModalOpen(false);
      setEditingGrupoCliente(null);
      setFormData({ codigo: '', descricao: '', status: true });
      toast.success('Grupo de cliente atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar grupo de cliente: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGrupoCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gruposClientes'] });
      setIsDeleteConfirmModalOpen(false);
      setDeletingGrupoCliente(null);
      toast.success('Grupo de cliente excluído com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao excluir grupo de cliente: ${error.message}`);
    },
  });

  // Verificações de duplicatas em tempo real
  const grupoClienteDuplicado = (formData.codigo.trim() || formData.descricao.trim()) && gruposClientes.some(
    (g) => (
      (g.codigo_grupo?.toLowerCase().trim() === formData.codigo.toLowerCase().trim() ||
       g.descricao?.toLowerCase().trim() === formData.descricao.toLowerCase().trim()) &&
      g.id !== editingGrupoCliente?.id
    )
  );

  const formValido = formData.codigo.trim() && formData.descricao.trim() && !grupoClienteDuplicado;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.codigo.trim() || !formData.descricao.trim()) {
      toast.error('Código e descrição do grupo são obrigatórios');
      return;
    }

    if (formData.codigo.length > 6) {
      toast.error('O código deve ter no máximo 6 caracteres');
      return;
    }

    // Verificar se o grupo já existe
    const grupoClienteExistente = gruposClientes.find(
      (g) => (
        (g.codigo_grupo?.toLowerCase().trim() === formData.codigo.toLowerCase().trim() ||
         g.descricao?.toLowerCase().trim() === formData.descricao.toLowerCase().trim()) &&
        g.id !== editingGrupoCliente?.id
      )
    );

    if (grupoClienteExistente) {
      toast.error('Este código ou descrição já existe no sistema');
      return;
    }

    const data = {
      codigo: formData.codigo.trim(),
      descricao: formData.descricao.trim(),
      status: formData.status,
    };

    if (editingGrupoCliente) {
      updateMutation.mutate({ id: editingGrupoCliente.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEditGrupoCliente = (grupoCliente: GrupoCliente) => {
    setEditingGrupoCliente(grupoCliente);
    setFormData({
      codigo: grupoCliente.codigo_grupo || '',
      descricao: grupoCliente.descricao || '',
      status: grupoCliente.status ?? true,
    });
    setIsEditGrupoClienteModalOpen(true);
  };

  const handleDeleteGrupoCliente = (grupoCliente: GrupoCliente) => {
    setDeletingGrupoCliente(grupoCliente);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingGrupoCliente) {
      deleteMutation.mutate(deletingGrupoCliente.id);
    }
  };

  const handleCloseModal = () => {
    setIsNewGrupoClienteModalOpen(false);
    setIsEditGrupoClienteModalOpen(false);
    setIsDeleteConfirmModalOpen(false);
    setEditingGrupoCliente(null);
    setDeletingGrupoCliente(null);
    setFormData({ codigo: '', descricao: '', status: true });
  };

  const filteredGruposClientes = gruposClientes.filter(
    (grupoCliente) =>
      grupoCliente.codigo_grupo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grupoCliente.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grupoCliente.id.toString().includes(searchTerm)
  );

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">
              Erro ao carregar grupos de clientes: {(error as Error).message}
            </p>
            <Button onClick={() => refetch()}>Tentar Novamente</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mx-10">
      {/* Header com busca */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <CardTitle>Grupos de Clientes</CardTitle>
              <CardDescription>Gerencie os grupos de clientes do sistema</CardDescription>
            </div>
            <div>
              <Button onClick={() => setIsNewGrupoClienteModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Grupo de Cliente
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar grupos de clientes..."
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
                  <TableHead>Código</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGruposClientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Nenhum grupo de cliente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGruposClientes.map((grupoCliente) => (
                    <TableRow key={grupoCliente.id}>
                      <TableCell>{grupoCliente.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{grupoCliente.codigo_grupo}</Badge>
                      </TableCell>
                      <TableCell>{grupoCliente.descricao}</TableCell>
                      <TableCell>
                        <Badge variant={grupoCliente.status ? "outline" : "soft"}>
                          {grupoCliente.status ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditGrupoCliente(grupoCliente)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGrupoCliente(grupoCliente)}
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

      {/* Modal de Novo/Edição */}
      <Dialog
        open={isNewGrupoClienteModalOpen || isEditGrupoClienteModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGrupoCliente ? 'Editar Grupo de Cliente' : 'Novo Grupo de Cliente'}
            </DialogTitle>
            <DialogDescription>
              {editingGrupoCliente
                ? 'Edite as informações do grupo de cliente selecionado'
                : 'Preencha as informações para criar um novo grupo de cliente'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código do Grupo</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) =>
                    setFormData({ ...formData, codigo: e.target.value })
                  }
                  maxLength={6}
                />
                <p className="text-sm text-muted-foreground">Máximo 6 caracteres</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={formData.status}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, status: checked })
                  }
                />
                <Label htmlFor="status">Ativo</Label>
              </div>
              {grupoClienteDuplicado && (
                <p className="text-sm text-destructive">
                  Este código ou descrição já existe no sistema
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
                {editingGrupoCliente ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
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
              Tem certeza que deseja excluir o grupo de cliente{' '}
              {deletingGrupoCliente?.codigo_grupo} - {deletingGrupoCliente?.descricao}?
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