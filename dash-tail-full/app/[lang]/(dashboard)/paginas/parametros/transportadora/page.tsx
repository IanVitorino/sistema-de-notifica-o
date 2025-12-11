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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Estado {
  id: number;
  uf: string;
  descricao: string;
}

interface Transportadora {
  id: number;
  razao: string;
  fantasia: string;
  cnpj: string;
  endereco?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  uf?: number;
  fone?: string;
  fax?: string;
  email?: string;
  contato?: string;
  contato2?: string;
  codigo_servico?: string;
  estado?: Estado;
}

// Funções de formatação
const formatCNPJ = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 14) {
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return value;
};

const formatCEP = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 8) {
    return digits.replace(/(\d{5})(\d)/, '$1-$2');
  }
  return value;
};

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 11) {
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d)/, '($1) $2-$3');
    }
    return digits.replace(/(\d{2})(\d{5})(\d)/, '($1) $2-$3');
  }
  return value;
};

async function fetchTransportadoras(): Promise<Transportadora[]> {
  const response = await fetch('/api/paginas/parametros/transportadora');
  if (!response.ok) throw new Error('Erro ao carregar transportadoras');
  return response.json();
}

async function fetchEstados(): Promise<Estado[]> {
  const response = await fetch('/api/paginas/parametros/estados');
  if (!response.ok) throw new Error('Erro ao carregar estados');
  return response.json();
}

async function createTransportadora(data: Omit<Transportadora, 'id' | 'estado'>): Promise<Transportadora> {
  const response = await fetch('/api/paginas/parametros/transportadora', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao criar transportadora');
  }

  return response.json();
}

async function updateTransportadora(id: number, data: Omit<Transportadora, 'id' | 'estado'>): Promise<Transportadora> {
  const response = await fetch(`/api/paginas/parametros/transportadora/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao atualizar transportadora');
  }

  return response.json();
}

async function deleteTransportadora(id: number) {
  const response = await fetch(`/api/paginas/parametros/transportadora/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao excluir transportadora');
  }

  return response.json();
}

export default function TransportadoraPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTransportadora, setEditingTransportadora] = useState<Transportadora | null>(null);
  const [deletingTransportadora, setDeletingTransportadora] = useState<Transportadora | null>(null);
  const [formData, setFormData] = useState<Omit<Transportadora, 'id' | 'estado'>>({
    razao: '',
    fantasia: '',
    cnpj: '',
    endereco: '',
    bairro: '',
    cep: '',
    cidade: '',
    uf: undefined,
    fone: '',
    fax: '',
    email: '',
    contato: '',
    contato2: '',
    codigo_servico: '',
  });

  const queryClient = useQueryClient();

  const { data: transportadoras = [], isLoading, error } = useQuery({
    queryKey: ['transportadoras'],
    queryFn: fetchTransportadoras,
  });

  const { data: estados = [] } = useQuery({
    queryKey: ['estados'],
    queryFn: fetchEstados,
  });

  const createMutation = useMutation({
    mutationFn: createTransportadora,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      setIsModalOpen(false);
      resetForm();
      toast.success('Transportadora criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Transportadora, 'id' | 'estado'> }) =>
      updateTransportadora(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      setIsModalOpen(false);
      setEditingTransportadora(null);
      resetForm();
      toast.success('Transportadora atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransportadora,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      setIsDeleteModalOpen(false);
      setDeletingTransportadora(null);
      toast.success('Transportadora excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      razao: '',
      fantasia: '',
      cnpj: '',
      endereco: '',
      bairro: '',
      cep: '',
      cidade: '',
      uf: undefined,
      fone: '',
      fax: '',
      email: '',
      contato: '',
      contato2: '',
      codigo_servico: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.razao || !formData.fantasia || !formData.cnpj || !formData.uf) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingTransportadora) {
      updateMutation.mutate({
        id: editingTransportadora.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (transportadora: Transportadora) => {
    setEditingTransportadora(transportadora);
    setFormData({
      razao: transportadora.razao,
      fantasia: transportadora.fantasia,
      cnpj: transportadora.cnpj,
      endereco: transportadora.endereco || '',
      bairro: transportadora.bairro || '',
      cep: transportadora.cep || '',
      cidade: transportadora.cidade || '',
      uf: transportadora.uf,
      fone: transportadora.fone || '',
      fax: transportadora.fax || '',
      email: transportadora.email || '',
      contato: transportadora.contato || '',
      contato2: transportadora.contato2 || '',
      codigo_servico: transportadora.codigo_servico || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (transportadora: Transportadora) => {
    setDeletingTransportadora(transportadora);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingTransportadora) {
      deleteMutation.mutate(deletingTransportadora.id);
    }
  };

  const handleCloseModal = (open?: boolean) => {
    // Se open é definido e é true, não fazer nada (modal está abrindo)
    if (open === true) return;

    setIsModalOpen(false);
    setEditingTransportadora(null);
    resetForm();
  };

  const filteredTransportadoras = transportadoras.filter((t) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      t.razao?.toLowerCase().includes(searchLower) ||
      t.fantasia?.toLowerCase().includes(searchLower) ||
      t.cnpj?.includes(searchTerm) ||
      t.cidade?.toLowerCase().includes(searchLower) ||
      t.estado?.uf?.toLowerCase().includes(searchLower) ||
      t.id.toString().includes(searchTerm)
    );
  });

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">
              Erro ao carregar transportadoras: {(error as Error).message}
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['transportadoras'] })}>
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <CardTitle>Transportadoras</CardTitle>
              <CardDescription>Gerencie as transportadoras do sistema</CardDescription>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Icon icon="heroicons:plus" className="w-4 h-4 mr-2" />
              Nova Transportadora
            </Button>
          </div>
          <div className="relative mt-4">
            <Icon
              icon="heroicons:magnifying-glass"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-default-400"
            />
            <Input
              placeholder="Buscar por razão social, fantasia, CNPJ, cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
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
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransportadoras.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      {searchTerm ? 'Nenhuma transportadora encontrada.' : 'Nenhuma transportadora cadastrada.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransportadoras.map((transportadora) => (
                    <TableRow key={transportadora.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transportadora.razao}</div>
                          <div className="text-sm text-muted-foreground">{transportadora.fantasia}</div>
                        </div>
                      </TableCell>
                      <TableCell>{transportadora.cnpj}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transportadora.cidade}
                          {transportadora.estado && (
                            <Badge variant="outline">{transportadora.estado.uf}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{transportadora.contato || '-'}</TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(transportadora)}
                        >
                          <Icon icon="heroicons:pencil" className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(transportadora)}
                        >
                          <Icon icon="heroicons:trash" className="h-4 w-4" />
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

      {/* Modal Criar/Editar */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTransportadora ? 'Editar Transportadora' : 'Nova Transportadora'}
            </DialogTitle>
            <DialogDescription>
              {editingTransportadora
                ? 'Altere as informações da transportadora abaixo.'
                : 'Preencha as informações da nova transportadora.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="razao">Razão Social *</Label>
                <Input
                  id="razao"
                  value={formData.razao}
                  onChange={(e) => setFormData((prev) => ({ ...prev, razao: e.target.value }))}
                  maxLength={80}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fantasia">Nome Fantasia *</Label>
                <Input
                  id="fantasia"
                  value={formData.fantasia}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fantasia: e.target.value }))}
                  maxLength={60}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cnpj: formatCNPJ(e.target.value) }))}
                  maxLength={18}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uf">Estado *</Label>
                <Select
                  value={formData.uf !== undefined ? formData.uf.toString() : ""}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, uf: parseInt(value) }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado.id} value={estado.id.toString()}>
                        {estado.uf} - {estado.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endereco: e.target.value }))}
                  maxLength={60}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bairro: e.target.value }))}
                  maxLength={60}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cep: formatCEP(e.target.value) }))}
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cidade: e.target.value }))}
                  maxLength={40}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fone">Telefone</Label>
                <Input
                  id="fone"
                  value={formData.fone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fone: formatPhone(e.target.value) }))}
                  maxLength={16}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fax">Fax</Label>
                <Input
                  id="fax"
                  value={formData.fax}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fax: formatPhone(e.target.value) }))}
                  maxLength={16}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  maxLength={60}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contato">Contato Principal</Label>
                <Input
                  id="contato"
                  value={formData.contato}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contato: e.target.value }))}
                  maxLength={40}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contato2">Contato Secundário</Label>
                <Input
                  id="contato2"
                  value={formData.contato2}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contato2: e.target.value }))}
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo_servico">Código de Serviço</Label>
                <Input
                  id="codigo_servico"
                  value={formData.codigo_servico}
                  onChange={(e) => setFormData((prev) => ({ ...prev, codigo_servico: e.target.value }))}
                  maxLength={30}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Salvando...'
                  : editingTransportadora ? 'Atualizar' : 'Criar'
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmação Exclusão */}
      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) {
            setDeletingTransportadora(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir esta transportadora? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {deletingTransportadora && (
            <div className="py-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Transportadora a ser excluída:</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Razão Social:</strong> {deletingTransportadora.razao}</p>
                  <p><strong>Nome Fantasia:</strong> {deletingTransportadora.fantasia}</p>
                  <p><strong>CNPJ:</strong> {deletingTransportadora.cnpj}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingTransportadora(null);
              }}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={confirmDelete}
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
