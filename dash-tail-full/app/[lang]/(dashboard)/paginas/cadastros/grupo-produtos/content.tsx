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

interface GrupoProduto {
  id: number;
  codigo: string;
  descricao: string;
  status: boolean;
}

async function fetchGruposProdutos(): Promise<GrupoProduto[]> {
  const response = await fetch('/api/paginas/cadastros/grupo-produtos');
  if (!response.ok) {
    throw new Error('Erro ao carregar grupos de produtos');
  }
  return response.json();
}

async function createGrupoProduto(data: { codigo: string; descricao: string; status: boolean }): Promise<GrupoProduto> {
  const response = await fetch('/api/paginas/cadastros/grupo-produtos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar grupo de produto');
  }

  return response.json();
}

async function updateGrupoProduto(id: number, data: { codigo: string; descricao: string; status: boolean }): Promise<GrupoProduto> {
  const response = await fetch(`/api/paginas/cadastros/grupo-produtos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar grupo de produto');
  }

  return response.json();
}

async function deleteGrupoProduto(id: number): Promise<void> {
  const response = await fetch(`/api/paginas/cadastros/grupo-produtos/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erro ao excluir grupo de produto');
  }
}

export function GrupoProdutosContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewGrupoProdutoModalOpen, setIsNewGrupoProdutoModalOpen] = useState(false);
  const [isEditGrupoProdutoModalOpen, setIsEditGrupoProdutoModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [editingGrupoProduto, setEditingGrupoProduto] = useState<GrupoProduto | null>(null);
  const [deletingGrupoProduto, setDeletingGrupoProduto] = useState<GrupoProduto | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    status: true,
  });

  const queryClient = useQueryClient();

  const {
    data: gruposProdutos = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['gruposProdutos'],
    queryFn: fetchGruposProdutos,
  });

  const createMutation = useMutation({
    mutationFn: createGrupoProduto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gruposProdutos'] });
      setIsNewGrupoProdutoModalOpen(false);
      setFormData({ codigo: '', descricao: '', status: true });
      toast.success('Grupo de produto criado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao criar grupo de produto: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { codigo: string; descricao: string; status: boolean } }) =>
      updateGrupoProduto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gruposProdutos'] });
      setIsEditGrupoProdutoModalOpen(false);
      setEditingGrupoProduto(null);
      setFormData({ codigo: '', descricao: '', status: true });
      toast.success('Grupo de produto atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar grupo de produto: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGrupoProduto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gruposProdutos'] });
      setIsDeleteConfirmModalOpen(false);
      setDeletingGrupoProduto(null);
      toast.success('Grupo de produto excluído com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao excluir grupo de produto: ${error.message}`);
    },
  });

  // Verificações de duplicatas em tempo real
  const grupoProdutoDuplicado = (formData.codigo.trim() || formData.descricao.trim()) && gruposProdutos.some(
    (g) => (
      (g.codigo?.toLowerCase().trim() === formData.codigo.toLowerCase().trim() ||
       g.descricao?.toLowerCase().trim() === formData.descricao.toLowerCase().trim()) &&
      g.id !== editingGrupoProduto?.id
    )
  );

  const formValido = formData.codigo.trim() && formData.descricao.trim() && !grupoProdutoDuplicado;

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
    const grupoProdutoExistente = gruposProdutos.find(
      (g) => (
        (g.codigo?.toLowerCase().trim() === formData.codigo.toLowerCase().trim() ||
         g.descricao?.toLowerCase().trim() === formData.descricao.toLowerCase().trim()) &&
        g.id !== editingGrupoProduto?.id
      )
    );

    if (grupoProdutoExistente) {
      toast.error('Este código ou descrição já existe no sistema');
      return;
    }

    const data = {
      codigo: formData.codigo.trim(),
      descricao: formData.descricao.trim(),
      status: formData.status,
    };

    if (editingGrupoProduto) {
      updateMutation.mutate({ id: editingGrupoProduto.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEditGrupoProduto = (grupoProduto: GrupoProduto) => {
    setEditingGrupoProduto(grupoProduto);
    setFormData({
      codigo: grupoProduto.codigo || '',
      descricao: grupoProduto.descricao || '',
      status: grupoProduto.status ?? true,
    });
    setIsEditGrupoProdutoModalOpen(true);
  };

  const handleDeleteGrupoProduto = (grupoProduto: GrupoProduto) => {
    setDeletingGrupoProduto(grupoProduto);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingGrupoProduto) {
      deleteMutation.mutate(deletingGrupoProduto.id);
    }
  };

  const handleCloseModal = () => {
    setIsNewGrupoProdutoModalOpen(false);
    setIsEditGrupoProdutoModalOpen(false);
    setIsDeleteConfirmModalOpen(false);
    setEditingGrupoProduto(null);
    setDeletingGrupoProduto(null);
    setFormData({ codigo: '', descricao: '', status: true });
  };

  const filteredGruposProdutos = gruposProdutos.filter(
    (grupoProduto) =>
      grupoProduto.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grupoProduto.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grupoProduto.id.toString().includes(searchTerm)
  );

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">
              Erro ao carregar grupos de produtos: {(error as Error).message}
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
              <CardTitle>Grupos de Produtos</CardTitle>
              <CardDescription>Gerencie os grupos de produtos do sistema</CardDescription>
            </div>
            <div>
              <Button onClick={() => setIsNewGrupoProdutoModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Grupo de Produto
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar grupos de produtos..."
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
                {filteredGruposProdutos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Nenhum grupo de produto encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGruposProdutos.map((grupoProduto) => (
                    <TableRow key={grupoProduto.id}>
                      <TableCell>{grupoProduto.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{grupoProduto.codigo}</Badge>
                      </TableCell>
                      <TableCell>{grupoProduto.descricao}</TableCell>
                      <TableCell>
                        <Badge variant={grupoProduto.status ? "outline" : "soft"}>
                          {grupoProduto.status ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditGrupoProduto(grupoProduto)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGrupoProduto(grupoProduto)}
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
        open={isNewGrupoProdutoModalOpen || isEditGrupoProdutoModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGrupoProduto ? 'Editar Grupo de Produto' : 'Novo Grupo de Produto'}
            </DialogTitle>
            <DialogDescription>
              {editingGrupoProduto
                ? 'Edite as informações do grupo de produto selecionado'
                : 'Preencha as informações para criar um novo grupo de produto'}
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
              {grupoProdutoDuplicado && (
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
                {editingGrupoProduto ? 'Salvar' : 'Criar'}
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
              Tem certeza que deseja excluir o grupo de produto{' '}
              {deletingGrupoProduto?.codigo} - {deletingGrupoProduto?.descricao}?
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