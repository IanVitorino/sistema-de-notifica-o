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

interface RegiaoZona {
  id: number;
  codigo_regiao: string;
  codigo_zona: string;
  descricao_regiao: string;
  descricao_zona_estatica: string;
  descricao_reduzida: string;
}

async function fetchRegioesZonas(): Promise<RegiaoZona[]> {
  const response = await fetch('/api/paginas/cadastros/regiao-zona');
  if (!response.ok) {
    throw new Error('Erro ao carregar regiões e zonas');
  }
  return response.json();
}

async function createRegiaoZona(data: {
  codigo_regiao: string;
  codigo_zona: string;
  descricao_regiao: string;
  descricao_zona_estatica: string;
  descricao_reduzida: string;
}): Promise<RegiaoZona> {
  const response = await fetch('/api/paginas/cadastros/regiao-zona', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar região e zona');
  }

  return response.json();
}

async function updateRegiaoZona(id: number, data: {
  codigo_regiao: string;
  codigo_zona: string;
  descricao_regiao: string;
  descricao_zona_estatica: string;
  descricao_reduzida: string;
}): Promise<RegiaoZona> {
  const response = await fetch(`/api/paginas/cadastros/regiao-zona/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar região e zona');
  }

  return response.json();
}

async function deleteRegiaoZona(id: number): Promise<void> {
  const response = await fetch(`/api/paginas/cadastros/regiao-zona/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erro ao excluir região e zona');
  }
}

export function RegiaoZonaContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewRegiaoZonaModalOpen, setIsNewRegiaoZonaModalOpen] = useState(false);
  const [isEditRegiaoZonaModalOpen, setIsEditRegiaoZonaModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [editingRegiaoZona, setEditingRegiaoZona] = useState<RegiaoZona | null>(null);
  const [deletingRegiaoZona, setDeletingRegiaoZona] = useState<RegiaoZona | null>(null);
  const [formData, setFormData] = useState({
    codigo_regiao: '',
    codigo_zona: '',
    descricao_regiao: '',
    descricao_zona_estatica: '',
    descricao_reduzida: '',
  });

  const queryClient = useQueryClient();

  const {
    data: regioesZonas = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['regioesZonas'],
    queryFn: fetchRegioesZonas,
  });

  const createMutation = useMutation({
    mutationFn: createRegiaoZona,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regioesZonas'] });
      setIsNewRegiaoZonaModalOpen(false);
      setFormData({
        codigo_regiao: '',
        codigo_zona: '',
        descricao_regiao: '',
        descricao_zona_estatica: '',
        descricao_reduzida: '',
      });
      toast.success('Região e zona criada com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao criar região e zona: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateRegiaoZona(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regioesZonas'] });
      setIsEditRegiaoZonaModalOpen(false);
      setEditingRegiaoZona(null);
      setFormData({
        codigo_regiao: '',
        codigo_zona: '',
        descricao_regiao: '',
        descricao_zona_estatica: '',
        descricao_reduzida: '',
      });
      toast.success('Região e zona atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar região e zona: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRegiaoZona,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regioesZonas'] });
      setIsDeleteConfirmModalOpen(false);
      setDeletingRegiaoZona(null);
      toast.success('Região e zona excluída com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao excluir região e zona: ${error.message}`);
    },
  });

  // Verificações de duplicatas em tempo real
  const regiaoZonaDuplicada = (
    formData.codigo_regiao.trim() ||
    formData.codigo_zona.trim() ||
    formData.descricao_regiao.trim() ||
    formData.descricao_zona_estatica.trim() ||
    formData.descricao_reduzida.trim()
  ) && regioesZonas.some(
    (r) => (
      (r.codigo_regiao?.toLowerCase().trim() === formData.codigo_regiao.toLowerCase().trim() ||
       r.codigo_zona?.toLowerCase().trim() === formData.codigo_zona.toLowerCase().trim() ||
       r.descricao_regiao?.toLowerCase().trim() === formData.descricao_regiao.toLowerCase().trim() ||
       r.descricao_zona_estatica?.toLowerCase().trim() === formData.descricao_zona_estatica.toLowerCase().trim() ||
       r.descricao_reduzida?.toLowerCase().trim() === formData.descricao_reduzida.toLowerCase().trim()) &&
      r.id !== editingRegiaoZona?.id
    )
  );

  const formValido = (
    formData.codigo_regiao.trim() &&
    formData.codigo_zona.trim() &&
    formData.descricao_regiao.trim() &&
    formData.descricao_zona_estatica.trim() &&
    formData.descricao_reduzida.trim() &&
    !regiaoZonaDuplicada
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.codigo_regiao.trim() || !formData.codigo_zona.trim() ||
        !formData.descricao_regiao.trim() || !formData.descricao_zona_estatica.trim() ||
        !formData.descricao_reduzida.trim()) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    if (formData.codigo_regiao.length > 20 || formData.codigo_zona.length > 20) {
      toast.error('Os códigos devem ter no máximo 20 caracteres');
      return;
    }

    if (formData.descricao_regiao.length > 80 || formData.descricao_zona_estatica.length > 80) {
      toast.error('As descrições devem ter no máximo 80 caracteres');
      return;
    }

    if (formData.descricao_reduzida.length > 50) {
      toast.error('A descrição reduzida deve ter no máximo 50 caracteres');
      return;
    }

    const data = {
      codigo_regiao: formData.codigo_regiao.trim(),
      codigo_zona: formData.codigo_zona.trim(),
      descricao_regiao: formData.descricao_regiao.trim(),
      descricao_zona_estatica: formData.descricao_zona_estatica.trim(),
      descricao_reduzida: formData.descricao_reduzida.trim(),
    };

    if (editingRegiaoZona) {
      updateMutation.mutate({ id: editingRegiaoZona.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEditRegiaoZona = (regiaoZona: RegiaoZona) => {
    setEditingRegiaoZona(regiaoZona);
    setFormData({
      codigo_regiao: regiaoZona.codigo_regiao || '',
      codigo_zona: regiaoZona.codigo_zona || '',
      descricao_regiao: regiaoZona.descricao_regiao || '',
      descricao_zona_estatica: regiaoZona.descricao_zona_estatica || '',
      descricao_reduzida: regiaoZona.descricao_reduzida || '',
    });
    setIsEditRegiaoZonaModalOpen(true);
  };

  const handleDeleteRegiaoZona = (regiaoZona: RegiaoZona) => {
    setDeletingRegiaoZona(regiaoZona);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingRegiaoZona) {
      deleteMutation.mutate(deletingRegiaoZona.id);
    }
  };

  const handleCloseModal = () => {
    setIsNewRegiaoZonaModalOpen(false);
    setIsEditRegiaoZonaModalOpen(false);
    setIsDeleteConfirmModalOpen(false);
    setEditingRegiaoZona(null);
    setDeletingRegiaoZona(null);
    setFormData({
      codigo_regiao: '',
      codigo_zona: '',
      descricao_regiao: '',
      descricao_zona_estatica: '',
      descricao_reduzida: '',
    });
  };

  const filteredRegioesZonas = regioesZonas.filter(
    (regiaoZona) =>
      regiaoZona.codigo_regiao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regiaoZona.codigo_zona?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regiaoZona.descricao_regiao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regiaoZona.descricao_zona_estatica?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regiaoZona.descricao_reduzida?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regiaoZona.id.toString().includes(searchTerm)
  );

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">
              Erro ao carregar regiões e zonas: {(error as Error).message}
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
              <CardTitle>Regiões e Zonas</CardTitle>
              <CardDescription>Gerencie as regiões e zonas do sistema</CardDescription>
            </div>
            <div>
              <Button onClick={() => setIsNewRegiaoZonaModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Região e Zona
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar regiões e zonas..."
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
                  <TableHead>Cód. Região</TableHead>
                  <TableHead>Cód. Zona</TableHead>
                  <TableHead>Desc. Região</TableHead>
                  <TableHead>Desc. Zona</TableHead>
                  <TableHead>Desc. Reduzida</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegioesZonas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Nenhuma região e zona encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRegioesZonas.map((regiaoZona) => (
                    <TableRow key={regiaoZona.id}>
                      <TableCell>{regiaoZona.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{regiaoZona.codigo_regiao}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{regiaoZona.codigo_zona}</Badge>
                      </TableCell>
                      <TableCell className="max-w-32 truncate">{regiaoZona.descricao_regiao}</TableCell>
                      <TableCell className="max-w-32 truncate">{regiaoZona.descricao_zona_estatica}</TableCell>
                      <TableCell className="max-w-32 truncate">{regiaoZona.descricao_reduzida}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRegiaoZona(regiaoZona)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRegiaoZona(regiaoZona)}
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
        open={isNewRegiaoZonaModalOpen || isEditRegiaoZonaModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRegiaoZona ? 'Editar Região e Zona' : 'Nova Região e Zona'}
            </DialogTitle>
            <DialogDescription>
              {editingRegiaoZona
                ? 'Edite as informações da região e zona selecionada'
                : 'Preencha as informações para criar uma nova região e zona'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="codigo_regiao">Código da Região</Label>
                <Input
                  id="codigo_regiao"
                  value={formData.codigo_regiao}
                  onChange={(e) =>
                    setFormData({ ...formData, codigo_regiao: e.target.value })
                  }
                  maxLength={20}
                />
                <p className="text-sm text-muted-foreground">Máximo 20 caracteres</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo_zona">Código da Zona</Label>
                <Input
                  id="codigo_zona"
                  value={formData.codigo_zona}
                  onChange={(e) =>
                    setFormData({ ...formData, codigo_zona: e.target.value })
                  }
                  maxLength={20}
                />
                <p className="text-sm text-muted-foreground">Máximo 20 caracteres</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao_regiao">Descrição da Região</Label>
                <Input
                  id="descricao_regiao"
                  value={formData.descricao_regiao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao_regiao: e.target.value })
                  }
                  maxLength={80}
                />
                <p className="text-sm text-muted-foreground">Máximo 80 caracteres</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao_zona_estatica">Descrição da Zona</Label>
                <Input
                  id="descricao_zona_estatica"
                  value={formData.descricao_zona_estatica}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao_zona_estatica: e.target.value })
                  }
                  maxLength={80}
                />
                <p className="text-sm text-muted-foreground">Máximo 80 caracteres</p>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="descricao_reduzida">Descrição Reduzida</Label>
                <Input
                  id="descricao_reduzida"
                  value={formData.descricao_reduzida}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao_reduzida: e.target.value })
                  }
                  maxLength={50}
                />
                <p className="text-sm text-muted-foreground">Máximo 50 caracteres</p>
              </div>
              {regiaoZonaDuplicada && (
                <p className="text-sm text-destructive col-span-2">
                  Já existe um registro com essas informações no sistema
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
                {editingRegiaoZona ? 'Salvar' : 'Criar'}
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
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir esta região e zona? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {deletingRegiaoZona && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Região e zona a ser excluída:</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Código Região:</strong> {deletingRegiaoZona.codigo_regiao}</p>
                  <p><strong>Código Zona:</strong> {deletingRegiaoZona.codigo_zona}</p>
                  <p><strong>Descrição Reduzida:</strong> {deletingRegiaoZona.descricao_reduzida}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}