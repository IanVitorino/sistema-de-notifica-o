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

interface CriterioPagamento {
  id: number;
  criterio: string;
  descricao: string;
}

async function fetchCriteriosPagamento(): Promise<CriterioPagamento[]> {
  const response = await fetch('/api/paginas/cadastros/criterio-pagamento');
  if (!response.ok) {
    throw new Error('Erro ao carregar critérios de pagamento');
  }
  return response.json();
}

async function createCriterioPagamento(data: { criterio: string; descricao: string }): Promise<CriterioPagamento> {
  const response = await fetch('/api/paginas/cadastros/criterio-pagamento', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar critério de pagamento');
  }

  return response.json();
}

async function updateCriterioPagamento(id: number, data: { criterio: string; descricao: string }): Promise<CriterioPagamento> {
  const response = await fetch(`/api/paginas/cadastros/criterio-pagamento/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar critério de pagamento');
  }

  return response.json();
}

async function deleteCriterioPagamento(id: number): Promise<void> {
  const response = await fetch(`/api/paginas/cadastros/criterio-pagamento/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erro ao excluir critério de pagamento');
  }
}

export function CriterioPagamentoContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewCriterioPagamentoModalOpen, setIsNewCriterioPagamentoModalOpen] = useState(false);
  const [isEditCriterioPagamentoModalOpen, setIsEditCriterioPagamentoModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [editingCriterioPagamento, setEditingCriterioPagamento] = useState<CriterioPagamento | null>(null);
  const [deletingCriterioPagamento, setDeletingCriterioPagamento] = useState<CriterioPagamento | null>(null);
  const [formData, setFormData] = useState({
    criterio: '',
    descricao: '',
  });

  const queryClient = useQueryClient();

  const {
    data: criteriosPagamento = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['criteriosPagamento'],
    queryFn: fetchCriteriosPagamento,
  });

  const createMutation = useMutation({
    mutationFn: createCriterioPagamento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['criteriosPagamento'] });
      setIsNewCriterioPagamentoModalOpen(false);
      setFormData({ criterio: '', descricao: '' });
      toast.success('Critério de pagamento criado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao criar critério de pagamento: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { criterio: string; descricao: string } }) =>
      updateCriterioPagamento(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['criteriosPagamento'] });
      setIsEditCriterioPagamentoModalOpen(false);
      setEditingCriterioPagamento(null);
      setFormData({ criterio: '', descricao: '' });
      toast.success('Critério de pagamento atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar critério de pagamento: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCriterioPagamento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['criteriosPagamento'] });
      setIsDeleteConfirmModalOpen(false);
      setDeletingCriterioPagamento(null);
      toast.success('Critério de pagamento excluído com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao excluir critério de pagamento: ${error.message}`);
    },
  });

  // Verificações de duplicatas em tempo real
  const criterioPagamentoDuplicado = (formData.criterio.trim() || formData.descricao.trim()) && criteriosPagamento.some(
    (c) => (
      (c.criterio?.toLowerCase().trim() === formData.criterio.toLowerCase().trim() ||
       c.descricao?.toLowerCase().trim() === formData.descricao.toLowerCase().trim()) &&
      c.id !== editingCriterioPagamento?.id
    )
  );

  const formValido = formData.criterio.trim() && formData.descricao.trim() && !criterioPagamentoDuplicado;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.criterio.trim() || !formData.descricao.trim()) {
      toast.error('Critério e descrição são obrigatórios');
      return;
    }

    if (formData.criterio.length > 20) {
      toast.error('O critério deve ter no máximo 20 caracteres');
      return;
    }

    // Verificar se o critério já existe
    const criterioPagamentoExistente = criteriosPagamento.find(
      (c) => (
        (c.criterio?.toLowerCase().trim() === formData.criterio.toLowerCase().trim() ||
         c.descricao?.toLowerCase().trim() === formData.descricao.toLowerCase().trim()) &&
        c.id !== editingCriterioPagamento?.id
      )
    );

    if (criterioPagamentoExistente) {
      toast.error('Este critério ou descrição já existe no sistema');
      return;
    }

    const data = {
      criterio: formData.criterio.trim(),
      descricao: formData.descricao.trim(),
    };

    if (editingCriterioPagamento) {
      updateMutation.mutate({ id: editingCriterioPagamento.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEditCriterioPagamento = (criterioPagamento: CriterioPagamento) => {
    setEditingCriterioPagamento(criterioPagamento);
    setFormData({
      criterio: criterioPagamento.criterio || '',
      descricao: criterioPagamento.descricao || '',
    });
    setIsEditCriterioPagamentoModalOpen(true);
  };

  const handleDeleteCriterioPagamento = (criterioPagamento: CriterioPagamento) => {
    setDeletingCriterioPagamento(criterioPagamento);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingCriterioPagamento) {
      deleteMutation.mutate(deletingCriterioPagamento.id);
    }
  };

  const handleCloseModal = () => {
    setIsNewCriterioPagamentoModalOpen(false);
    setIsEditCriterioPagamentoModalOpen(false);
    setIsDeleteConfirmModalOpen(false);
    setEditingCriterioPagamento(null);
    setDeletingCriterioPagamento(null);
    setFormData({ criterio: '', descricao: '' });
  };

  const filteredCriteriosPagamento = criteriosPagamento.filter(
    (criterioPagamento) =>
      criterioPagamento.criterio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      criterioPagamento.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      criterioPagamento.id.toString().includes(searchTerm)
  );

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">
              Erro ao carregar critérios de pagamento: {(error as Error).message}
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
              <CardTitle>Critérios de Pagamento</CardTitle>
              <CardDescription>Gerencie os critérios de pagamento do sistema</CardDescription>
            </div>
            <div>
              <Button onClick={() => setIsNewCriterioPagamentoModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Critério de Pagamento
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar critérios de pagamento..."
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
                  <TableHead>Critério</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCriteriosPagamento.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Nenhum critério de pagamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCriteriosPagamento.map((criterioPagamento) => (
                    <TableRow key={criterioPagamento.id}>
                      <TableCell>{criterioPagamento.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{criterioPagamento.criterio}</Badge>
                      </TableCell>
                      <TableCell>{criterioPagamento.descricao}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCriterioPagamento(criterioPagamento)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCriterioPagamento(criterioPagamento)}
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
        open={isNewCriterioPagamentoModalOpen || isEditCriterioPagamentoModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCriterioPagamento ? 'Editar Critério de Pagamento' : 'Novo Critério de Pagamento'}
            </DialogTitle>
            <DialogDescription>
              {editingCriterioPagamento
                ? 'Edite as informações do critério de pagamento selecionado'
                : 'Preencha as informações para criar um novo critério de pagamento'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="criterio">Critério</Label>
                <Input
                  id="criterio"
                  value={formData.criterio}
                  onChange={(e) =>
                    setFormData({ ...formData, criterio: e.target.value })
                  }
                  maxLength={20}
                />
                <p className="text-sm text-muted-foreground">Máximo 20 caracteres</p>
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
              {criterioPagamentoDuplicado && (
                <p className="text-sm text-destructive">
                  Este critério ou descrição já existe no sistema
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
                {editingCriterioPagamento ? 'Salvar' : 'Criar'}
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
              Tem certeza que deseja excluir o critério de pagamento{' '}
              {deletingCriterioPagamento?.criterio} - {deletingCriterioPagamento?.descricao}?
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