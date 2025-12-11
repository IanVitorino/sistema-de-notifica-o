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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface MarcaProduto {
  id: number;
  codigo: string | null;
  descricao: string | null;
}

async function fetchMarcasProduto(): Promise<MarcaProduto[]> {
  const response = await fetch('/api/paginas/cadastros/marca-produto');
  if (!response.ok) {
    throw new Error('Erro ao carregar marcas de produto');
  }
  return response.json();
}

async function createMarcaProduto(data: { codigo: string; descricao: string }): Promise<MarcaProduto> {
  const response = await fetch('/api/paginas/cadastros/marca-produto', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao criar marca de produto');
  }

  return response.json();
}

async function updateMarcaProduto(id: number, data: { codigo: string; descricao: string }): Promise<MarcaProduto> {
  const response = await fetch(`/api/paginas/cadastros/marca-produto/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao atualizar marca de produto');
  }

  return response.json();
}

async function deleteMarcaProduto(id: number): Promise<void> {
  const response = await fetch(`/api/paginas/cadastros/marca-produto/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao excluir marca de produto');
  }
}

export function MarcaProdutoContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingMarca, setEditingMarca] = useState<MarcaProduto | null>(null);
  const [deletingMarca, setDeletingMarca] = useState<MarcaProduto | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
  });

  const queryClient = useQueryClient();

  const {
    data: marcas = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['marcasProduto'],
    queryFn: fetchMarcasProduto,
  });

  const createMutation = useMutation({
    mutationFn: createMarcaProduto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marcasProduto'] });
      setIsNewModalOpen(false);
      setFormData({ codigo: '', descricao: '' });
      toast.success('Marca de produto criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { codigo: string; descricao: string } }) =>
      updateMarcaProduto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marcasProduto'] });
      setIsEditModalOpen(false);
      setEditingMarca(null);
      setFormData({ codigo: '', descricao: '' });
      toast.success('Marca de produto atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMarcaProduto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marcasProduto'] });
      setIsDeleteConfirmOpen(false);
      setDeletingMarca(null);
      toast.success('Marca de produto excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Filtrar marcas
  const filteredMarcas = marcas.filter((marca) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      marca.codigo?.toLowerCase().includes(searchLower) ||
      marca.descricao?.toLowerCase().includes(searchLower)
    );
  });

  // Verificar duplicatas
  const marcaDuplicada = (formData.codigo.trim() || formData.descricao.trim()) && marcas.some(
    (m) => (
      (m.codigo?.toLowerCase().trim() === formData.codigo.toLowerCase().trim() ||
       m.descricao?.toLowerCase().trim() === formData.descricao.toLowerCase().trim()) &&
      m.id !== editingMarca?.id
    )
  );

  const formValido = formData.codigo.trim() && formData.descricao.trim() && !marcaDuplicada;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.codigo.trim() || !formData.descricao.trim()) {
      toast.error('Código e descrição são obrigatórios');
      return;
    }

    if (formData.codigo.length > 6) {
      toast.error('O código deve ter no máximo 6 caracteres');
      return;
    }

    if (editingMarca) {
      updateMutation.mutate({
        id: editingMarca.id,
        data: {
          codigo: formData.codigo.trim(),
          descricao: formData.descricao.trim(),
        },
      });
    } else {
      createMutation.mutate({
        codigo: formData.codigo.trim(),
        descricao: formData.descricao.trim(),
      });
    }
  };

  const handleEdit = (marca: MarcaProduto) => {
    setEditingMarca(marca);
    setFormData({
      codigo: marca.codigo || '',
      descricao: marca.descricao || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (marca: MarcaProduto) => {
    setDeletingMarca(marca);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deletingMarca) {
      deleteMutation.mutate(deletingMarca.id);
    }
  };

  const handleNewMarca = () => {
    setFormData({ codigo: '', descricao: '' });
    setEditingMarca(null);
    setIsNewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Marcas de Produtos</CardTitle>
              <CardDescription>
                Gerencie as marcas de produtos do sistema
              </CardDescription>
            </div>
            <Button onClick={handleNewMarca}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Marca
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Busca */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-default-500" />
              <Input
                placeholder="Buscar por código ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabela */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Erro ao carregar marcas de produto
            </div>
          ) : filteredMarcas.length === 0 ? (
            <div className="text-center py-8 text-default-500">
              {searchTerm ? 'Nenhuma marca encontrada' : 'Nenhuma marca cadastrada'}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMarcas.map((marca) => (
                    <TableRow key={marca.id}>
                      <TableCell className="font-medium">{marca.codigo}</TableCell>
                      <TableCell>{marca.descricao}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(marca)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(marca)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Nova Marca */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Nova Marca de Produto</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar uma nova marca
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">
                  Código <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="codigo"
                  placeholder="Ex: ABC"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  maxLength={6}
                  required
                />
                <p className="text-xs text-default-500">Máximo 6 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">
                  Descrição <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="descricao"
                  placeholder="Ex: Marca XYZ"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  maxLength={60}
                  required
                />
                <p className="text-xs text-default-500">Máximo 60 caracteres</p>
              </div>

              {marcaDuplicada && (
                <div className="text-sm text-destructive">
                  Já existe uma marca com esse código ou descrição
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!formValido || createMutation.isPending}
              >
                {createMutation.isPending ? 'Criando...' : 'Criar Marca'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Marca */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Editar Marca de Produto</DialogTitle>
              <DialogDescription>
                Atualize os dados da marca
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-codigo">
                  Código <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-codigo"
                  placeholder="Ex: ABC"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  maxLength={6}
                  required
                />
                <p className="text-xs text-default-500">Máximo 6 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-descricao">
                  Descrição <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-descricao"
                  placeholder="Ex: Marca XYZ"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  maxLength={60}
                  required
                />
                <p className="text-xs text-default-500">Máximo 60 caracteres</p>
              </div>

              {marcaDuplicada && (
                <div className="text-sm text-destructive">
                  Já existe uma marca com esse código ou descrição
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!formValido || updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Exclusão */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a marca{' '}
              <strong>{deletingMarca?.descricao}</strong>?<br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
