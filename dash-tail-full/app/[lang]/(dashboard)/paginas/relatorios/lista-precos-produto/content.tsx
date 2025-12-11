'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { BlobProvider } from '@react-pdf/renderer';
import { ListaPrecosProdutoPDF } from './components/lista-precos-produto-pdf';
import { FabricanteAutocomplete } from '../components/FabricanteAutocomplete';
import { MarcaAutocomplete } from '../components/MarcaAutocomplete';

interface Fabricante {
  id: number;
  razao_social?: string;
  fantasia?: string;
  cnpj?: string;
}

interface MarcaProduto {
  id: number;
  codigo?: string | null;
  descricao?: string | null;
}

interface ProdutoPreco {
  id: number;
  codigo: string;
  descricao: string;
  desc_reduzida?: string;
  preco: number;
  master: number;
  nome_lista?: string;
  unidade?: {
    sigla: string;
  };
}

interface ListaPrecosData {
  nome_lista: string;
  produtos: ProdutoPreco[];
}

async function fetchListaPrecos(fabricanteId: number, marcaId?: number | null): Promise<ListaPrecosData> {
  const body: any = { fabricante_id: fabricanteId };
  if (marcaId) {
    body.marca_id = marcaId;
  }

  const response = await fetch('/api/paginas/relatorios/lista-precos-produto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar lista de preços');
  }

  const data = await response.json();
  return data;
}

const formatarValor = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
};

export function ListaPrecosProdutoContent() {
  const [selectedFabricanteId, setSelectedFabricanteId] = useState<number | null>(null);
  const [selectedFabricante, setSelectedFabricante] = useState<Fabricante | null>(null);
  const [selectedMarcaId, setSelectedMarcaId] = useState<number | null>(null);
  const [selectedMarca, setSelectedMarca] = useState<MarcaProduto | null>(null);

  const {
    data: listaPrecos,
    isLoading: isLoadingLista,
    error: errorLista,
  } = useQuery({
    queryKey: ['lista-precos-produto', selectedFabricanteId, selectedMarcaId],
    queryFn: () => fetchListaPrecos(selectedFabricanteId!, selectedMarcaId),
    enabled: !!selectedFabricanteId,
  });

  // Handler para seleção de fabricante via autocomplete
  const handleFabricanteSelect = useCallback((fabricante: Fabricante | null) => {
    setSelectedFabricante(fabricante);
    setSelectedFabricanteId(fabricante?.id || null);
  }, []);

  // Handler para seleção de marca via autocomplete
  const handleMarcaSelect = useCallback((marca: MarcaProduto | null) => {
    setSelectedMarca(marca);
    setSelectedMarcaId(marca?.id || null);
  }, []);

  // Função para abrir o PDF em uma nova janela
  const abrirPDFEmNovaJanela = (url: string) => {
    window.open(url, '_blank');
    toast.success('PDF aberto em uma nova janela');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-default-900 mb-2">
            Lista de Preços de Produto
          </h1>
          <p className="text-sm text-default-600">
            Selecione um fabricante para visualizar a lista de preços dos produtos
          </p>
        </div>
        <div>
          {selectedFabricanteId && listaPrecos && !isLoadingLista ? (
            <BlobProvider
              document={
                <ListaPrecosProdutoPDF
                  nomeLista={listaPrecos.nome_lista}
                  produtos={listaPrecos.produtos}
                  fabricante={selectedFabricante}
                />
              }
            >
              {({ url, blob, loading, error }) => (
                <Button
                  onClick={() => url && abrirPDFEmNovaJanela(url)}
                  disabled={loading || !url || !!error}
                  className="gap-2"
                  size="default"
                >
                  <ExternalLink className="h-4 w-4" />
                  {loading ? 'Gerando PDF...' : 'Visualizar Lista'}
                </Button>
              )}
            </BlobProvider>
          ) : (
            <Button
              disabled={!selectedFabricanteId || isLoadingLista}
              className="gap-2"
              size="default"
            >
              <ExternalLink className="h-4 w-4" />
              {isLoadingLista ? 'Carregando...' : 'Visualizar Lista'}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleção do Fabricante</CardTitle>
          <p className="text-sm text-default-600 mt-2">
            Escolha o fabricante para visualizar a lista de preços
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca de Fabricante com Autocomplete */}
          <div className="space-y-2">
            <Label htmlFor="fabricante-autocomplete">Buscar Fabricante</Label>
            <FabricanteAutocomplete
              value={selectedFabricante}
              onSelect={handleFabricanteSelect}
              placeholder="Digite nome ou CNPJ do fabricante..."
            />
          </div>

          {/* Busca de Marca com Autocomplete (Opcional) */}
          <div className="space-y-2">
            <Label htmlFor="marca-autocomplete">
              Filtrar por Marca (Opcional)
            </Label>
            <MarcaAutocomplete
              value={selectedMarca}
              onSelect={handleMarcaSelect}
              placeholder="Digite código ou descrição da marca..."
            />
            {selectedMarca && (
              <p className="text-sm text-default-600 mt-1">
                Filtrando por: {selectedMarca.codigo} - {selectedMarca.descricao}
              </p>
            )}
          </div>

          {isLoadingLista && (
            <p className="text-sm text-default-500 mt-2">
              Carregando lista de preços...
            </p>
          )}
            {selectedFabricanteId && listaPrecos && (
              <div className="mt-4 p-4 bg-default-50 dark:bg-default-200 rounded-md border border-default-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-default-900">
                      {selectedFabricante?.fantasia || selectedFabricante?.razao_social}
                    </p>
                    <p className="text-sm text-default-600">
                      Lista: {listaPrecos.nome_lista}
                    </p>
                    <p className="text-sm text-default-600 mt-1">
                      Total de produtos: {listaPrecos.produtos.length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela com Lista de Preços */}
      {selectedFabricanteId && listaPrecos && !isLoadingLista && (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Preços - {listaPrecos.nome_lista}</CardTitle>
            <p className="text-sm text-default-600 mt-2">
              {listaPrecos.produtos.length} produto(s) encontrado(s)
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[200px]">Desc. Reduzida</TableHead>
                    <TableHead className="w-[100px] text-right">Valor</TableHead>
                    <TableHead className="w-[80px] text-center">Master</TableHead>
                    <TableHead className="w-[80px] text-center">Unidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listaPrecos.produtos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-default-500">
                        Nenhum produto encontrado nesta lista de preços
                      </TableCell>
                    </TableRow>
                  ) : (
                    listaPrecos.produtos.map((produto) => (
                      <TableRow key={produto.id}>
                        <TableCell className="font-medium">{produto.codigo}</TableCell>
                        <TableCell>{produto.descricao}</TableCell>
                        <TableCell className="text-default-600">
                          {produto.desc_reduzida || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatarValor(produto.preco)}
                        </TableCell>
                        <TableCell className="text-center">{produto.master}</TableCell>
                        <TableCell className="text-center">
                          {produto.unidade?.sigla || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem de erro */}
      {errorLista && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-destructive">
              Erro ao carregar lista de preços. Tente novamente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
