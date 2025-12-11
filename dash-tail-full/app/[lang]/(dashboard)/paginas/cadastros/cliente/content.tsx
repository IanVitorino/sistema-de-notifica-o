'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Cliente {
  id: number;
  razao_social?: string;
  fantasia?: string;
  cnpj?: string;
  contato_email?: string;
  contato_nome?: string;
  contato_telefone?: string;
  status: boolean;
}

async function fetchClientes(): Promise<Cliente[]> {
  const response = await fetch('/api/paginas/cadastros/cliente');
  if (!response.ok) {
    throw new Error('Erro ao carregar clientes');
  }
  return response.json();
}

async function deleteCliente(id: number): Promise<void> {
  const response = await fetch(`/api/paginas/cadastros/cliente/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erro ao excluir cliente');
  }
}

export function ClienteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Recuperar estado da URL
  const urlPage = searchParams.get('page');
  const urlSearch = searchParams.get('search');
  const urlPerPage = searchParams.get('perPage');

  const [searchTerm, setSearchTerm] = useState(urlSearch || '');
  const [currentPage, setCurrentPage] = useState(urlPage ? parseInt(urlPage) : 1);
  const [itemsPerPage, setItemsPerPage] = useState(urlPerPage ? parseInt(urlPerPage) : 10);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const queryClient = useQueryClient();

  const { data: clientes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['clientes'],
    queryFn: fetchClientes,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setIsDeleteConfirmModalOpen(false);
      setDeletingCliente(null);
      toast.success('Cliente excluído com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao excluir cliente: ${error.message}`);
    },
  });

  // Inicialização
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Sincronizar URL
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      const params = new URLSearchParams();
      if (currentPage !== 1) params.set('page', currentPage.toString());
      if (searchTerm) params.set('search', searchTerm);
      if (itemsPerPage !== 10) params.set('perPage', itemsPerPage.toString());

      const query = params.toString();
      const newURL = `/pt-br/paginas/cadastros/cliente${query ? `?${query}` : ''}`;
      const currentURL = window.location.pathname + window.location.search;

      if (newURL !== currentURL) {
        router.replace(newURL, { scroll: false });
      }
    }
  }, [currentPage, itemsPerPage, searchTerm, isInitialized, router]);

  // Filtrar clientes
  const filteredClientes = clientes.filter((cliente) =>
    cliente.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cnpj?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.contato_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.id.toString().includes(searchTerm)
  );

  // Cálculos de paginação
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClientes = filteredClientes.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value !== searchTerm && currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleNewCliente = () => {
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    if (searchTerm) params.set('search', searchTerm);
    params.set('perPage', itemsPerPage.toString());

    const query = params.toString();
    router.push(`/pt-br/paginas/cadastros/cliente/cadastro${query ? `?${query}` : ''}`);
  };

  const handleEditCliente = (cliente: Cliente) => {
    const params = new URLSearchParams();
    params.set('id', cliente.id.toString());
    params.set('page', currentPage.toString());
    if (searchTerm) params.set('search', searchTerm);
    params.set('perPage', itemsPerPage.toString());

    const query = params.toString();
    router.push(`/pt-br/paginas/cadastros/cliente/cadastro?${query}`);
  };

  const handleDeleteCliente = (cliente: Cliente) => {
    setDeletingCliente(cliente);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingCliente) {
      deleteMutation.mutate(deletingCliente.id);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">
              Erro ao carregar clientes: {(error as Error).message}
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
              <CardTitle>Cadastro de Clientes</CardTitle>
              <CardDescription>Gerencie os clientes do sistema</CardDescription>
            </div>
            <div className="ml-auto">
              <Button onClick={handleNewCliente}>
                <Icon icon="heroicons:plus" className="w-4 h-4 mr-2" />
                Novo Cliente
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
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
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
                  <TableHead>Razão Social / Fantasia</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      {filteredClientes.length === 0
                        ? searchTerm
                          ? "Nenhum cliente encontrado para a busca realizada"
                          : "Nenhum cliente cadastrado"
                        : "Nenhum cliente nesta página"
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>{cliente.id}</TableCell>
                      <TableCell className="font-medium">
                        <div className="max-w-[450px]">
                          <div className="truncate font-semibold" title={cliente.razao_social}>
                            {cliente.razao_social}
                          </div>
                          {cliente.fantasia && (
                            <div className="text-xs text-muted-foreground truncate" title={cliente.fantasia}>
                              {cliente.fantasia}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="whitespace-nowrap">
                          {cliente.cnpj ? (
                            <Badge variant="outline">{cliente.cnpj}</Badge>
                          ) : (
                            '-'
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="truncate max-w-[120px]" title={cliente.contato_nome}>
                            {cliente.contato_nome || '-'}
                          </div>
                          <div className="text-muted-foreground truncate max-w-[120px]" title={cliente.contato_email || cliente.contato_telefone}>
                            {cliente.contato_email || cliente.contato_telefone || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={cliente.status ? "outline" : "outline"}>
                          {cliente.status ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditCliente(cliente)}
                        >
                          <Icon icon="heroicons:pencil" className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteCliente(cliente)}
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

        {/* Controles de Paginação */}
        {filteredClientes.length > 0 && (
          <div className="px-6 py-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredClientes.length)} de {filteredClientes.length} resultado(s)
                </span>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Itens por página:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
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
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <Icon icon="heroicons:chevron-double-left" className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <Icon icon="heroicons:chevron-left" className="h-4 w-4" />
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <Icon icon="heroicons:chevron-right" className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <Icon icon="heroicons:chevron-double-right" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteConfirmModalOpen} onOpenChange={setIsDeleteConfirmModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {deletingCliente && (
            <div className="py-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Cliente a ser excluído:</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Razão Social:</strong> {deletingCliente.razao_social}</p>
                  <p><strong>Nome Fantasia:</strong> {deletingCliente.fantasia || 'Não informado'}</p>
                  <p><strong>CNPJ:</strong> {deletingCliente.cnpj || 'Não informado'}</p>
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
