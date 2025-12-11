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

interface Estado {
  id: number;
  descricao: string;
  uf: string;
}

async function fetchEstados(): Promise<Estado[]> {
  const response = await fetch('/api/paginas/cadastros/estados');
  if (!response.ok) {
    throw new Error('Erro ao carregar estados');
  }
  return response.json();
}

async function createEstado(data: { nome: string; uf: string }): Promise<Estado> {
  const response = await fetch('/api/paginas/cadastros/estados', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar estado');
  }

  return response.json();
}

async function updateEstado(id: number, data: { nome: string; uf: string }): Promise<Estado> {
  const response = await fetch(`/api/paginas/cadastros/estados/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar estado');
  }

  return response.json();
}

async function deleteEstado(id: number): Promise<void> {
  const response = await fetch(`/api/paginas/cadastros/estados/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erro ao excluir estado');
  }
}

export function EstadosContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewEstadoModalOpen, setIsNewEstadoModalOpen] = useState(false);
  const [isEditEstadoModalOpen, setIsEditEstadoModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [editingEstado, setEditingEstado] = useState<Estado | null>(null);
  const [deletingEstado, setDeletingEstado] = useState<Estado | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    uf: '',
  });

  const queryClient = useQueryClient();

  const {
    data: estados = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['estados'],
    queryFn: fetchEstados,
  });

  const createMutation = useMutation({
    mutationFn: createEstado,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estados'] });
      setIsNewEstadoModalOpen(false);
      setFormData({ nome: '', uf: '' });
      toast.success('Estado criado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao criar estado: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { nome: string; uf: string } }) =>
      updateEstado(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estados'] });
      setIsEditEstadoModalOpen(false);
      setEditingEstado(null);
      setFormData({ nome: '', uf: '' });
      toast.success('Estado atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar estado: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEstado,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estados'] });
      setIsDeleteConfirmModalOpen(false);
      setDeletingEstado(null);
      toast.success('Estado excluído com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao excluir estado: ${error.message}`);
    },
  });

  // Verificações de duplicatas em tempo real
  const estadoDuplicado = (formData.nome.trim() || formData.uf.trim()) && estados.some(
    (e) => (
      (e.descricao.toLowerCase().trim() === formData.nome.toLowerCase().trim() ||
       e.uf.toLowerCase().trim() === formData.uf.toLowerCase().trim()) &&
      e.id !== editingEstado?.id
    )
  );

  const formValido = formData.nome.trim() && formData.uf.trim() && !estadoDuplicado;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.uf.trim()) {
      toast.error('Nome e UF do estado são obrigatórios');
      return;
    }

    if (formData.uf.length !== 2) {
      toast.error('A UF deve ter exatamente 2 caracteres');
      return;
    }

    // Verificar se o estado já existe
    const estadoExistente = estados.find(
      (e) => (
        (e.descricao.toLowerCase().trim() === formData.nome.toLowerCase().trim() ||
         e.uf.toLowerCase().trim() === formData.uf.toLowerCase().trim()) &&
        e.id !== editingEstado?.id
      )
    );

    if (estadoExistente) {
      toast.error('Este estado ou UF já existe no sistema');
      return;
    }

    const data = {
      nome: formData.nome.trim(),
      uf: formData.uf.toUpperCase().trim(),
    };

    if (editingEstado) {
      updateMutation.mutate({ id: editingEstado.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEditEstado = (estado: Estado) => {
    setEditingEstado(estado);
    setFormData({
      nome: estado.descricao || '',
      uf: estado.uf || '',
    });
    setIsEditEstadoModalOpen(true);
  };

  const handleDeleteEstado = (estado: Estado) => {
    setDeletingEstado(estado);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingEstado) {
      deleteMutation.mutate(deletingEstado.id);
    }
  };

  const handleCloseModal = () => {
    setIsNewEstadoModalOpen(false);
    setIsEditEstadoModalOpen(false);
    setIsDeleteConfirmModalOpen(false);
    setEditingEstado(null);
    setDeletingEstado(null);
    setFormData({ nome: '', uf: '' });
  };

  const filteredEstados = estados.filter(
    (estado) =>
      estado.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estado.uf.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estado.id.toString().includes(searchTerm)
  );

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">
              Erro ao carregar estados: {(error as Error).message}
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
              <CardTitle>Estados</CardTitle>
              <CardDescription>Gerencie os estados do sistema</CardDescription>
            </div>
            <div>
              <Button onClick={() => setIsNewEstadoModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Estado
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar estados..."
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
                  <TableHead>UF</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Nenhum estado encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEstados.map((estado) => (
                    <TableRow key={estado.id}>
                      <TableCell>{estado.id}</TableCell>
                      <TableCell>{estado.descricao}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{estado.uf}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEstado(estado)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEstado(estado)}
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
        open={isNewEstadoModalOpen || isEditEstadoModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEstado ? 'Editar Estado' : 'Novo Estado'}
            </DialogTitle>
            <DialogDescription>
              {editingEstado
                ? 'Edite as informações do estado selecionado'
                : 'Preencha as informações para criar um novo estado'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Estado</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf">UF</Label>
                <Input
                  id="uf"
                  value={formData.uf}
                  onChange={(e) =>
                    setFormData({ ...formData, uf: e.target.value.toUpperCase() })
                  }
                  maxLength={2}
                />
              </div>
              {estadoDuplicado && (
                <p className="text-sm text-destructive">
                  Este estado ou UF já existe no sistema
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
                {editingEstado ? 'Salvar' : 'Criar'}
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
              Tem certeza que deseja excluir o estado{' '}
              {deletingEstado?.descricao} ({deletingEstado?.uf})?
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