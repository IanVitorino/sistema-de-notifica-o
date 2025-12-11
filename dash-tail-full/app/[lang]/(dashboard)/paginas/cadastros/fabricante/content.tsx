'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Fabricante {
  id: number;
  razao_social: string;
  fantasia?: string;
  cnpj?: string;
  cidade?: string;
  estado?: number;
  contato_telefone1?: string;
  contato_email_contato?: string;
  habilitado?: boolean;
  status?: boolean;
}

async function fetchFabricantes(): Promise<Fabricante[]> {
  const response = await fetch('/api/paginas/cadastros/fabricante');
  if (!response.ok) {
    throw new Error('Erro ao carregar fabricantes');
  }
  return response.json();
}

export function FabricanteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page') || '1');
  const searchQuery = searchParams.get('search') || '';
  const perPage = Number(searchParams.get('perPage') || '10');
  
  const [search, setSearch] = useState(searchQuery);
  const [showOnlyActive, setShowOnlyActive] = useState(true); // Padrão: mostrar apenas ativos
  
  const { data: fabricantes = [], isLoading, error } = useQuery({
    queryKey: ['fabricantes'],
    queryFn: fetchFabricantes
  });

  // Filtragem por termo de busca e status
  const filteredFabricantes = fabricantes.filter((fabricante) => {
    const matchesSearch = 
      fabricante.razao_social?.toLowerCase().includes(search.toLowerCase()) ||
      fabricante.fantasia?.toLowerCase().includes(search.toLowerCase()) ||
      fabricante.cnpj?.toLowerCase().includes(search.toLowerCase()) ||
      fabricante.contato_email_contato?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = showOnlyActive ? fabricante.status === true : true;
    
    return matchesSearch && matchesStatus;
  });

  // Cálculos de paginação
  const totalItems = filteredFabricantes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const startIndex = (currentPage - 1) * perPage;
  const paginatedFabricantes = filteredFabricantes.slice(
    startIndex,
    startIndex + perPage
  );

  // Navegação de páginas
  const navigateToPage = (page: number) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (search) params.set('search', search);
    if (perPage !== 10) params.set('perPage', perPage.toString());
    
    router.push(`/paginas/cadastros/fabricante?${params.toString()}`);
  };

  // Submeter busca
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('page', '1');
    if (search) params.set('search', search);
    if (perPage !== 10) params.set('perPage', perPage.toString());
    
    router.push(`/paginas/cadastros/fabricante?${params.toString()}`);
  };

  // Navegar para o formulário de novo fabricante
  const handleNewFabricante = () => {
    router.push('/paginas/cadastros/fabricante/form');
  };

  // Navegar para o formulário de edição
  const handleEditFabricante = (id: number) => {
    const params = new URLSearchParams();
    params.set('id', id.toString());
    params.set('page', currentPage.toString());
    if (search) params.set('search', search);
    if (perPage !== 10) params.set('perPage', perPage.toString());
    
    router.push(`/paginas/cadastros/fabricante/form?${params.toString()}`);
  };

  // Sincronizar estado local com searchParams quando mudar a URL
  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  // Renderizar números de página para paginação
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => navigateToPage(1)}>1</PaginationLink>
        </PaginationItem>
      );
      
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => navigateToPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => navigateToPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Fabricantes</h1>
          <div className="flex items-center gap-2">
            <Switch
              checked={showOnlyActive}
              onCheckedChange={setShowOnlyActive}
              size="sm"
            />
            <span className="text-sm text-muted-foreground">
              {showOnlyActive ? 'Apenas ativos' : 'Todos'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="flex">
            <Input
              type="text"
              placeholder="Buscar fabricante..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit" variant="outline" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <Button onClick={handleNewFabricante}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Fabricante
          </Button>
        </div>
      </div>
      
      <Card className="p-4">
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {/* <TableHead className="w-16 text-center">ID</TableHead> */}
                <TableHead>Razão Social</TableHead>
                <TableHead className="hidden md:table-cell">Fantasia</TableHead>
                <TableHead className="w-44 hidden lg:table-cell">CNPJ</TableHead>
                <TableHead className="hidden lg:table-cell">Cidade</TableHead>
                {/* <TableHead className="hidden lg:table-cell">Telefone</TableHead> */}
                <TableHead className="hidden lg:table-cell">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-red-500">
                    Erro ao carregar dados.
                  </TableCell>
                </TableRow>
              ) : paginatedFabricantes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {search ? 'Nenhum fabricante encontrado.' : 'Nenhum fabricante cadastrado.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFabricantes.map((fabricante) => (
                  <TableRow 
                    key={fabricante.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEditFabricante(fabricante.id)}
                  >
                    {/* <TableCell className="text-center">{fabricante.id}</TableCell> */}
                    <TableCell className="font-medium">
                      {fabricante.razao_social}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {fabricante.fantasia || ''}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {fabricante.cnpj || ''}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {fabricante.cidade || ''}
                    </TableCell>
                    {/* <TableCell className="hidden lg:table-cell">
                      {fabricante.contato_telefone1 || ''}
                    </TableCell> */}
                    <TableCell className="hidden lg:table-cell">
                      {fabricante.status ? (
                        <span className="inline-block px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                          Inativo
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1}-{Math.min(startIndex + perPage, totalItems)} de {totalItems} registros
            </div>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => navigateToPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1} 
                  />
                </PaginationItem>
                
                {renderPaginationItems()}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => navigateToPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages} 
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  );
} 