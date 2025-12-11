'use client';

import { useState, useEffect } from 'react';
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

interface Fabricante {
  id: number;
  razao_social: string;
  fantasia: string;
}

interface GrupoProduto {
  id: number;
  codigo: string;
  descricao: string;
}

interface MarcaProduto {
  id: number;
  codigo: string | null;
  descricao: string | null;
}

interface UnidadeMedida {
  id: number;
  unidade: string;
  descricao: string;
}

interface MotivoBloqueio {
  id: number;
  motivo: string;
  descricao: string;
}

interface Produto {
  id: number;
  fk_fabricante?: number;
  codigo: string;
  descricao: string;
  desc_reduzida?: string;
  grupo_produto?: number;
  marca_produto?: number;
  codigo_original?: string;
  unidade_medida?: number;
  produto_substituido?: string;
  validade?: string;
  motivo_bloqueio?: number;
  inicio_bloq?: string;
  termino_bloq?: string;
  grupo_2?: string;
  tremonte_fabricante?: Fabricante;
  tremonte_grupo_produto?: GrupoProduto;
  tremonte_marca_produto?: MarcaProduto;
  tremonte_unidade_medida?: UnidadeMedida;
  tremonte_motivo_bloqueio_produto?: MotivoBloqueio;
}

interface PaginatedResponse {
  produtos: Produto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

async function fetchProdutos(page: number = 1, limit: number = 20, search: string = '', fabricante: string = ''): Promise<PaginatedResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(fabricante && fabricante !== '0' && { fabricante })
  });

  const response = await fetch(`/api/paginas/parametros/produto?${params}`);
  if (!response.ok) {
    throw new Error('Erro ao carregar produtos');
  }
  return response.json();
}

async function fetchFabricantes(): Promise<Fabricante[]> {
  const response = await fetch('/api/paginas/parametros/fabricante');
  if (!response.ok) {
    throw new Error('Erro ao carregar fabricantes');
  }
  return response.json();
}

async function fetchGruposProduto(): Promise<GrupoProduto[]> {
  const response = await fetch('/api/paginas/cadastros/grupo-produtos');
  if (!response.ok) {
    throw new Error('Erro ao carregar grupos de produto');
  }
  return response.json();
}

async function fetchMarcasProduto(): Promise<MarcaProduto[]> {
  const response = await fetch('/api/paginas/cadastros/marca-produto');
  if (!response.ok) {
    throw new Error('Erro ao carregar marcas de produto');
  }
  return response.json();
}

async function fetchUnidadesMedida(): Promise<UnidadeMedida[]> {
  const response = await fetch('/api/paginas/parametros/unidade-medida');
  if (!response.ok) {
    throw new Error('Erro ao carregar unidades de medida');
  }
  return response.json();
}

async function fetchMotivosBloqueio(): Promise<MotivoBloqueio[]> {
  const response = await fetch('/api/paginas/parametros/bloqueio-produto');
  if (!response.ok) {
    throw new Error('Erro ao carregar motivos de bloqueio');
  }
  return response.json();
}

async function createProduto(data: Omit<Produto, 'id' | 'tremonte_fabricante' | 'tremonte_grupo_produto' | 'tremonte_unidade_medida' | 'tremonte_motivo_bloqueio_produto'>): Promise<Produto> {
  const response = await fetch('/api/paginas/parametros/produto', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar produto');
  }

  return response.json();
}

async function updateProduto(id: number, data: Omit<Produto, 'id' | 'tremonte_fabricante' | 'tremonte_grupo_produto' | 'tremonte_unidade_medida' | 'tremonte_motivo_bloqueio_produto'>): Promise<Produto> {
  const response = await fetch(`/api/paginas/parametros/produto/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar produto');
  }

  return response.json();
}

async function deleteProduto(id: number): Promise<void> {
  const response = await fetch(`/api/paginas/parametros/produto/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erro ao excluir produto');
  }
}

export function ProdutoContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFabricante, setSelectedFabricante] = useState<string>('0');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isNewProdutoModalOpen, setIsNewProdutoModalOpen] = useState(false);
  const [isEditProdutoModalOpen, setIsEditProdutoModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [deletingProduto, setDeletingProduto] = useState<Produto | null>(null);
  const [formData, setFormData] = useState({
    fk_fabricante: 0,
    codigo: '',
    descricao: '',
    desc_reduzida: '',
    grupo_produto: 0,
    marca_produto: 0,
    codigo_original: '',
    unidade_medida: 0,
    produto_substituido: '',
    validade: '',
    motivo_bloqueio: 0,
    inicio_bloq: '',
    termino_bloq: '',
    grupo_2: '',
  });

  const queryClient = useQueryClient();

  const {
    data: paginatedData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['produtos', currentPage, pageSize, searchTerm, selectedFabricante],
    queryFn: () => fetchProdutos(currentPage, pageSize, searchTerm, selectedFabricante),
  });

  const produtos = paginatedData?.produtos || [];

  const { data: fabricantes = [] } = useQuery({
    queryKey: ['fabricantes'],
    queryFn: fetchFabricantes,
  });

  const { data: gruposProduto = [] } = useQuery({
    queryKey: ['grupos-produto'],
    queryFn: fetchGruposProduto,
  });

  const { data: marcasProduto = [] } = useQuery({
    queryKey: ['marcas-produto'],
    queryFn: fetchMarcasProduto,
  });

  const { data: unidadesMedida = [] } = useQuery({
    queryKey: ['unidades-medida'],
    queryFn: fetchUnidadesMedida,
  });

  const { data: motivosBloqueio = [] } = useQuery({
    queryKey: ['motivos-bloqueio'],
    queryFn: fetchMotivosBloqueio,
  });

  const createMutation = useMutation({
    mutationFn: createProduto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setIsNewProdutoModalOpen(false);
      setFormData({
        fk_fabricante: 0,
        codigo: '',
        descricao: '',
        desc_reduzida: '',
        grupo_produto: 0,
        marca_produto: 0,
        codigo_original: '',
        unidade_medida: 0,
        produto_substituido: '',
        validade: '',
        motivo_bloqueio: 0,
        inicio_bloq: '',
        termino_bloq: '',
        grupo_2: '',
      });
      toast.success('Produto criado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao criar produto: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateProduto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setIsEditProdutoModalOpen(false);
      setEditingProduto(null);
      toast.success('Produto atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar produto: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setIsDeleteConfirmModalOpen(false);
      setDeletingProduto(null);
      toast.success('Produto excluído com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao excluir produto: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.codigo || !formData.descricao) {
      toast.error('Código e descrição são obrigatórios');
      return;
    }

    const submitData = {
      ...formData,
      fk_fabricante: formData.fk_fabricante || undefined,
      grupo_produto: formData.grupo_produto || undefined,
      unidade_medida: formData.unidade_medida || undefined,
      motivo_bloqueio: formData.motivo_bloqueio || undefined,
      desc_reduzida: formData.desc_reduzida || undefined,
      codigo_original: formData.codigo_original || undefined,
      produto_substituido: formData.produto_substituido || undefined,
      validade: formData.validade || undefined,
      inicio_bloq: formData.inicio_bloq || undefined,
      termino_bloq: formData.termino_bloq || undefined,
      grupo_2: formData.grupo_2 || undefined,
    };

    if (editingProduto) {
      updateMutation.mutate({
        id: editingProduto.id,
        data: submitData,
      });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEditProduto = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData({
      fk_fabricante: produto.fk_fabricante || 0,
      codigo: produto.codigo || '',
      descricao: produto.descricao || '',
      desc_reduzida: produto.desc_reduzida || '',
      grupo_produto: produto.grupo_produto || 0,
      marca_produto: produto.marca_produto || 0,
      codigo_original: produto.codigo_original || '',
      unidade_medida: produto.unidade_medida || 0,
      produto_substituido: produto.produto_substituido || '',
      validade: produto.validade || '',
      motivo_bloqueio: produto.motivo_bloqueio || 0,
      inicio_bloq: produto.inicio_bloq || '',
      termino_bloq: produto.termino_bloq || '',
      grupo_2: produto.grupo_2 || '',
    });
    setIsEditProdutoModalOpen(true);
  };

  const handleDeleteProduto = (produto: Produto) => {
    setDeletingProduto(produto);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingProduto) {
      deleteMutation.mutate(deletingProduto.id);
    }
  };

  const handleCloseModal = () => {
    setIsNewProdutoModalOpen(false);
    setIsEditProdutoModalOpen(false);
    setEditingProduto(null);
    setFormData({
      fk_fabricante: 0,
      codigo: '',
      descricao: '',
      desc_reduzida: '',
      grupo_produto: 0,
      codigo_original: '',
      unidade_medida: 0,
      produto_substituido: '',
      validade: '',
      motivo_bloqueio: 0,
      inicio_bloq: '',
      termino_bloq: '',
      grupo_2: '',
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFabricanteChange = (value: string) => {
    setSelectedFabricante(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">
              Erro ao carregar produtos: {(error as Error).message}
            </p>
            <Button onClick={() => refetch()}>Tentar Novamente</Button>
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
              <CardTitle>Cadastro de Produtos</CardTitle>
              <CardDescription>Gerencie os produtos do sistema</CardDescription>
            </div>
            <div className="ml-auto">
              <Button onClick={() => setIsNewProdutoModalOpen(true)}>
                <Icon icon="heroicons:plus" className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Icon
                icon="heroicons:magnifying-glass"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-default-400"
              />
              <Input
                placeholder="Buscar por código, descrição..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-72">
              <Select
                value={selectedFabricante}
                onValueChange={handleFabricanteChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por fabricante" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todos os fabricantes</SelectItem>
                  {fabricantes.map((fabricante) => (
                    <SelectItem key={fabricante.id} value={fabricante.id.toString()}>
                      {fabricante.fantasia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <TableHead>Código</TableHead>
                  <TableHead>Desc. Reduzida</TableHead>
                  <TableHead>Fabricante</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      {searchTerm ? 'Nenhum produto encontrado com os critérios de busca.' : 'Nenhum produto cadastrado.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  produtos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell>
                        <Badge variant="outline">{produto.codigo}</Badge>
                      </TableCell>
                      <TableCell>{produto.desc_reduzida || '-'}</TableCell>
                      <TableCell>{produto.tremonte_fabricante?.fantasia || '-'}</TableCell>
                      <TableCell>{produto.tremonte_unidade_medida?.unidade || '-'}</TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditProduto(produto)}
                        >
                          <Icon icon="heroicons:pencil" className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteProduto(produto)}
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

        {/* Paginação */}
        {paginatedData?.pagination && paginatedData.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Mostrando {((paginatedData.pagination.page - 1) * paginatedData.pagination.limit) + 1} a{' '}
                  {Math.min(paginatedData.pagination.page * paginatedData.pagination.limit, paginatedData.pagination.total)} de{' '}
                  {paginatedData.pagination.total} resultado(s)
                </span>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Itens por página:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => handlePageSizeChange(parseInt(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    <Icon icon="heroicons:chevron-double-left" className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!paginatedData.pagination.hasPrev}
                  >
                    <Icon icon="heroicons:chevron-left" className="h-4 w-4" />
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {paginatedData.pagination.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!paginatedData.pagination.hasNext}
                  >
                    <Icon icon="heroicons:chevron-right" className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(paginatedData.pagination.totalPages)}
                    disabled={currentPage === paginatedData.pagination.totalPages}
                  >
                    <Icon icon="heroicons:chevron-double-right" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Novo/Editar Produto */}
      <Dialog open={isNewProdutoModalOpen || isEditProdutoModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduto ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              {editingProduto
                ? 'Altere as informações do produto abaixo.'
                : 'Preencha as informações do novo produto.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                  maxLength={20}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc_reduzida">Descrição Reduzida</Label>
                <Input
                  id="desc_reduzida"
                  value={formData.desc_reduzida}
                  onChange={(e) => setFormData(prev => ({ ...prev, desc_reduzida: e.target.value }))}
                  maxLength={25}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fk_fabricante">Fabricante</Label>
                <Select
                  value={formData.fk_fabricante?.toString() || '0'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, fk_fabricante: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fabricante" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Nenhum</SelectItem>
                    {fabricantes.map((fabricante) => (
                      <SelectItem key={fabricante.id} value={fabricante.id.toString()}>
                        {fabricante.fantasia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grupo_produto">Grupo Produto</Label>
                <Select
                  value={formData.grupo_produto?.toString() || '0'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, grupo_produto: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Nenhum</SelectItem>
                    {gruposProduto.map((grupo) => (
                      <SelectItem key={grupo.id} value={grupo.id.toString()}>
                        {grupo.codigo} - {grupo.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca_produto">Marca Produto</Label>
                <Select
                  value={formData.marca_produto?.toString() || '0'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, marca_produto: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a marca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Nenhuma</SelectItem>
                    {marcasProduto.map((marca) => (
                      <SelectItem key={marca.id} value={marca.id.toString()}>
                        {marca.codigo} - {marca.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidade_medida">Unidade Medida</Label>
                <Select
                  value={formData.unidade_medida?.toString() || '0'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, unidade_medida: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Nenhuma</SelectItem>
                    {unidadesMedida.map((unidade) => (
                      <SelectItem key={unidade.id} value={unidade.id.toString()}>
                        {unidade.unidade} - {unidade.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo_original">Código Original</Label>
                <Input
                  id="codigo_original"
                  value={formData.codigo_original}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigo_original: e.target.value }))}
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="produto_substituido">Produto Substituído</Label>
                <Input
                  id="produto_substituido"
                  value={formData.produto_substituido}
                  onChange={(e) => setFormData(prev => ({ ...prev, produto_substituido: e.target.value }))}
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validade">Validade</Label>
                <Input
                  id="validade"
                  type="date"
                  value={formData.validade}
                  onChange={(e) => setFormData(prev => ({ ...prev, validade: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo_bloqueio">Motivo Bloqueio</Label>
                <Select
                  value={formData.motivo_bloqueio?.toString() || '0'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, motivo_bloqueio: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Nenhum</SelectItem>
                    {motivosBloqueio.map((motivo) => (
                      <SelectItem key={motivo.id} value={motivo.id.toString()}>
                        {motivo.motivo} - {motivo.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inicio_bloq">Início Bloqueio</Label>
                <Input
                  id="inicio_bloq"
                  type="date"
                  value={formData.inicio_bloq}
                  onChange={(e) => setFormData(prev => ({ ...prev, inicio_bloq: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="termino_bloq">Término Bloqueio</Label>
                <Input
                  id="termino_bloq"
                  type="date"
                  value={formData.termino_bloq}
                  onChange={(e) => setFormData(prev => ({ ...prev, termino_bloq: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grupo_2">Grupo 2</Label>
                <Input
                  id="grupo_2"
                  value={formData.grupo_2}
                  onChange={(e) => setFormData(prev => ({ ...prev, grupo_2: e.target.value }))}
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
                  : editingProduto ? 'Atualizar' : 'Criar'
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmação Exclusão */}
      <Dialog open={isDeleteConfirmModalOpen} onOpenChange={setIsDeleteConfirmModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir este produto? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {deletingProduto && (
            <div className="py-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Produto a ser excluído:</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Fabricante:</strong> {deletingProduto.tremonte_fabricante?.fantasia || 'Não informado'}</p>
                  <p><strong>Código:</strong> {deletingProduto.codigo}</p>
                  <p><strong>Descrição Reduzida:</strong> {deletingProduto.desc_reduzida || 'Não informado'}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmModalOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
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
