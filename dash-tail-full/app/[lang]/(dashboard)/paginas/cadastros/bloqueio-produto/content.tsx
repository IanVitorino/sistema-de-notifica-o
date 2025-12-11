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

interface MotivoBloqueio {
  id: number;
  motivo: string;
  descricao: string;
  bloq: boolean;
}

async function fetchMotivosBloqueio(): Promise<MotivoBloqueio[]> {
  const response = await fetch('/api/paginas/cadastros/bloqueio-produto');
  if (!response.ok) {
    throw new Error('Erro ao carregar motivos de bloqueio');
  }
  return response.json();
}

async function createMotivoBloqueio(data: { motivo: string; descricao: string; bloq: boolean }): Promise<MotivoBloqueio> {
  const response = await fetch('/api/paginas/cadastros/bloqueio-produto', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar motivo de bloqueio');
  }

  return response.json();
}

async function updateMotivoBloqueio(id: number, data: { motivo: string; descricao: string; bloq: boolean }): Promise<MotivoBloqueio> {
  const response = await fetch(`/api/paginas/cadastros/bloqueio-produto/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar motivo de bloqueio');
  }

  return response.json();
}

async function deleteMotivoBloqueio(id: number): Promise<void> {
  const response = await fetch(`/api/paginas/cadastros/bloqueio-produto/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erro ao excluir motivo de bloqueio');
  }
}

export function BloqueioContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewMotivoBloqueioModalOpen, setIsNewMotivoBloqueioModalOpen] = useState(false);
  const [isEditMotivoBloqueioModalOpen, setIsEditMotivoBloqueioModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [editingMotivoBloqueio, setEditingMotivoBloqueio] = useState<MotivoBloqueio | null>(null);
  const [deletingMotivoBloqueio, setDeletingMotivoBloqueio] = useState<MotivoBloqueio | null>(null);
  const [formData, setFormData] = useState({
    motivo: '',
    descricao: '',
    bloq: false,
  });

  const queryClient = useQueryClient();

  const {
    data: motivosBloqueio = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['motivosBloqueio'],
    queryFn: fetchMotivosBloqueio,
  });

  const createMutation = useMutation({
    mutationFn: createMotivoBloqueio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motivosBloqueio'] });
      setIsNewMotivoBloqueioModalOpen(false);
      setFormData({ motivo: '', descricao: '', bloq: false });
      toast.success('Motivo de bloqueio criado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao criar motivo de bloqueio: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { motivo: string; descricao: string; bloq: boolean } }) =>
      updateMotivoBloqueio(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motivosBloqueio'] });
      setIsEditMotivoBloqueioModalOpen(false);
      setEditingMotivoBloqueio(null);
      setFormData({ motivo: '', descricao: '', bloq: false });
      toast.success('Motivo de bloqueio atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar motivo de bloqueio: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMotivoBloqueio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motivosBloqueio'] });
      setIsDeleteConfirmModalOpen(false);
      setDeletingMotivoBloqueio(null);
      toast.success('Motivo de bloqueio excluído com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao excluir motivo de bloqueio: ${error.message}`);
    },
  });

  const motivoBloqueioeDuplicado = (formData.motivo.trim() || formData.descricao.trim()) && motivosBloqueio.some(
    (m) => (
      (m.motivo?.toLowerCase().trim() === formData.motivo.toLowerCase().trim() ||
       m.descricao?.toLowerCase().trim() === formData.descricao.toLowerCase().trim()) &&
      m.id !== editingMotivoBloqueio?.id
    )
  );

  const formValido = formData.motivo.trim() && formData.descricao.trim() && !motivoBloqueioeDuplicado;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.motivo.trim() || !formData.descricao.trim()) {
      toast.error('Motivo e descrição são obrigatórios');
      return;
    }

    if (formData.motivo.length > 20) {
      toast.error('O motivo deve ter no máximo 20 caracteres');
      return;
    }

    const data = {
      motivo: formData.motivo.trim(),
      descricao: formData.descricao.trim(),
      bloq: formData.bloq,
    };

    if (editingMotivoBloqueio) {
      updateMutation.mutate({ id: editingMotivoBloqueio.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEditMotivoBloqueio = (motivoBloqueio: MotivoBloqueio) => {
    setEditingMotivoBloqueio(motivoBloqueio);
    setFormData({
      motivo: motivoBloqueio.motivo || '',
      descricao: motivoBloqueio.descricao || '',
      bloq: motivoBloqueio.bloq ?? false,
    });
    setIsEditMotivoBloqueioModalOpen(true);
  };

  const handleDeleteMotivoBloqueio = (motivoBloqueio: MotivoBloqueio) => {
    setDeletingMotivoBloqueio(motivoBloqueio);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingMotivoBloqueio) {
      deleteMutation.mutate(deletingMotivoBloqueio.id);
    }
  };

  const handleCloseModal = () => {
    setIsNewMotivoBloqueioModalOpen(false);
    setIsEditMotivoBloqueioModalOpen(false);
    setIsDeleteConfirmModalOpen(false);
    setEditingMotivoBloqueio(null);
    setDeletingMotivoBloqueio(null);
    setFormData({ motivo: '', descricao: '', bloq: false });
  };

  const filteredMotivosBloqueio = motivosBloqueio.filter(
    (motivoBloqueio) =>
      motivoBloqueio.motivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motivoBloqueio.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motivoBloqueio.id.toString().includes(searchTerm)
  );

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">
              Erro ao carregar motivos de bloqueio: {(error as Error).message}
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
              <CardTitle>Motivos de Bloqueio de Produto</CardTitle>
              <CardDescription>Gerencie os motivos de bloqueio de produto do sistema</CardDescription>
            </div>
            <div>
              <Button onClick={() => setIsNewMotivoBloqueioModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Motivo de Bloqueio
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar motivos de bloqueio..."
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
                  <TableHead>Motivo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Bloqueado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMotivosBloqueio.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Nenhum motivo de bloqueio encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMotivosBloqueio.map((motivoBloqueio) => (
                    <TableRow key={motivoBloqueio.id}>
                      <TableCell>{motivoBloqueio.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{motivoBloqueio.motivo}</Badge>
                      </TableCell>
                      <TableCell>{motivoBloqueio.descricao}</TableCell>
                      <TableCell>
                        <Badge variant={motivoBloqueio.bloq ? "soft" : "outline"}>
                          {motivoBloqueio.bloq ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditMotivoBloqueio(motivoBloqueio)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMotivoBloqueio(motivoBloqueio)}
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
        open={isNewMotivoBloqueioModalOpen || isEditMotivoBloqueioModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMotivoBloqueio ? 'Editar Motivo de Bloqueio' : 'Novo Motivo de Bloqueio'}
            </DialogTitle>
            <DialogDescription>
              {editingMotivoBloqueio
                ? 'Edite as informações do motivo de bloqueio selecionado'
                : 'Preencha as informações para criar um novo motivo de bloqueio'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo</Label>
                <Input
                  id="motivo"
                  value={formData.motivo}
                  onChange={(e) =>
                    setFormData({ ...formData, motivo: e.target.value })
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
              <div className="flex items-center space-x-2">
                <Switch
                  id="bloq"
                  checked={formData.bloq}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, bloq: checked })
                  }
                />
                <Label htmlFor="bloq">Bloquear produto</Label>
              </div>
              {motivoBloqueioeDuplicado && (
                <p className="text-sm text-destructive">
                  Este motivo ou descrição já existe no sistema
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
                {editingMotivoBloqueio ? 'Salvar' : 'Criar'}
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
              Tem certeza que deseja excluir o motivo de bloqueio{' '}
              {deletingMotivoBloqueio?.motivo} - {deletingMotivoBloqueio?.descricao}?
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