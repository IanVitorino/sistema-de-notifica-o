'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { BlobProvider } from '@react-pdf/renderer';
import { FichaProdutoPDF } from './components/ficha-produto-pdf';
import { ProdutoAutocomplete } from '../components/ProdutoAutocomplete';

interface Produto {
  id: number;
  codigo: string;
  descricao: string;
  desc_reduzida?: string;
}

interface ProdutoDetalhado extends Produto {
  fk_fabricante?: number;
  fabricante?: {
    id: number;
    razao_social?: string;
    fantasia?: string;
  };
  grupo_produto?: number;
  grupo?: {
    id: number;
    codigo: string;
    descricao: string;
  };
  linha_produto?: number;
  linha?: {
    id: number;
    codigo: string;
    descricao: string;
  };
  marca_produto?: number;
  marca?: {
    id: number;
    marca: string;
    descricao: string;
  };
  unidade_medida?: number;
  unidade?: {
    id: number;
    sigla: string;
    descricao: string;
  };
  codigo_original?: string;
  produto_substituido?: string;
  validade?: string | Date;
  motivo_bloqueio?: number;
  bloqueio?: {
    id: number;
    motivo: string;
    descricao: string;
  };
  inicio_bloq?: string | Date;
  termino_bloq?: string | Date;
  grupo_2?: string;
}

async function fetchProdutoDetalhado(id: number): Promise<ProdutoDetalhado> {
  const response = await fetch(`/api/paginas/parametros/produto/${id}`);
  if (!response.ok) {
    throw new Error('Erro ao carregar detalhes do produto');
  }
  return response.json();
}

const formatarData = (data?: Date | string): string => {
  if (!data) return '-';
  try {
    return new Date(data).toLocaleDateString('pt-BR');
  } catch {
    return String(data);
  }
};

export function FichaProdutoContent() {
  const [selectedProdutoId, setSelectedProdutoId] = useState<number | null>(null);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  const {
    data: produtoDetalhado,
    isLoading: isLoadingDetalhes,
    error: errorDetalhes
  } = useQuery({
    queryKey: ['produto-detalhado', selectedProdutoId],
    queryFn: () => fetchProdutoDetalhado(selectedProdutoId!),
    enabled: !!selectedProdutoId
  });

  // Handler para seleção de produto via autocomplete
  const handleProdutoSelect = useCallback((produto: Produto | null) => {
    setSelectedProduto(produto);
    setSelectedProdutoId(produto?.id || null);
  }, []);

  // Função para abrir o PDF em uma nova janela
  const abrirPDFEmNovaJanela = (url: string) => {
    window.open(url, '_blank');
    toast.success('PDF aberto em uma nova janela');
  };

  // Verificar se há bloqueio ativo
  const bloqueioAtivo = produtoDetalhado?.motivo_bloqueio && produtoDetalhado.motivo_bloqueio > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-default-900 mb-2">Ficha do Produto</h1>
          <p className="text-sm text-default-600">
            Gere o relatório completo da ficha do produto em PDF
          </p>
        </div>
        <div>
          {selectedProdutoId && produtoDetalhado && !isLoadingDetalhes ? (
            <BlobProvider
              document={<FichaProdutoPDF produto={produtoDetalhado} />}
            >
              {({ url, blob, loading, error }) => (
                <Button
                  onClick={() => url && abrirPDFEmNovaJanela(url)}
                  disabled={loading || !url || !!error}
                  className="gap-2"
                  size="default"
                >
                  <ExternalLink className="h-4 w-4" />
                  {loading ? 'Gerando PDF...' : 'Visualizar Ficha'}
                </Button>
              )}
            </BlobProvider>
          ) : (
            <Button
              disabled={!selectedProdutoId || isLoadingDetalhes}
              className="gap-2"
              size="default"
            >
              <ExternalLink className="h-4 w-4" />
              {isLoadingDetalhes ? 'Carregando...' : 'Visualizar Ficha'}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleção do Produto</CardTitle>
          <p className="text-sm text-default-600 mt-2">
            Escolha o produto para gerar a ficha completa
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca de Produto com Autocomplete */}
          <div className="space-y-2">
            <Label htmlFor="produto-autocomplete">Buscar Produto</Label>
            <ProdutoAutocomplete
              value={selectedProduto}
              onSelect={handleProdutoSelect}
              placeholder="Digite código ou descrição do produto..."
            />
            {isLoadingDetalhes && (
              <p className="text-sm text-default-500 mt-2">
                Carregando dados do produto...
              </p>
            )}
            {selectedProdutoId && produtoDetalhado && (
              <div className="mt-4 p-4 bg-default-50 dark:bg-default-200 rounded-md border border-default-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-default-900">
                      {produtoDetalhado.codigo} - {produtoDetalhado.descricao}
                    </p>
                    {produtoDetalhado.fabricante && (
                      <p className="text-sm text-default-600">
                        Fabricante: {produtoDetalhado.fabricante.fantasia || produtoDetalhado.fabricante.razao_social}
                      </p>
                    )}
                    {produtoDetalhado.unidade && (
                      <p className="text-sm text-default-600 mt-1">
                        Unidade: {produtoDetalhado.unidade.sigla}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela com Informações Detalhadas do Produto */}
      {selectedProdutoId && produtoDetalhado && !isLoadingDetalhes && (
        <Card>
          <CardHeader>
            <CardTitle>Informações Detalhadas do Produto</CardTitle>
            <p className="text-sm text-default-600 mt-2">
              Visualização completa dos dados cadastrados
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Dados Principais */}
              <div>
                <h3 className="text-sm font-semibold text-default-900 mb-3 pb-2 border-b">
                  Dados Principais
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">ID</TableCell>
                      <TableCell>{produtoDetalhado.id}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Código</TableCell>
                      <TableCell>{produtoDetalhado.codigo || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Descrição</TableCell>
                      <TableCell>{produtoDetalhado.descricao || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Descrição Reduzida</TableCell>
                      <TableCell>{produtoDetalhado.desc_reduzida || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Código Original (NCM)</TableCell>
                      <TableCell>{produtoDetalhado.codigo_original || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Produto Substituído</TableCell>
                      <TableCell>{produtoDetalhado.produto_substituido || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Validade</TableCell>
                      <TableCell>{formatarData(produtoDetalhado.validade)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Classificação */}
              <div>
                <h3 className="text-sm font-semibold text-default-900 mb-3 pb-2 border-b">
                  Classificação
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">Fabricante</TableCell>
                      <TableCell>
                        {produtoDetalhado.fabricante?.fantasia ||
                         produtoDetalhado.fabricante?.razao_social || "-"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Grupo</TableCell>
                      <TableCell>
                        {produtoDetalhado.grupo?.descricao || "-"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Linha</TableCell>
                      <TableCell>
                        {produtoDetalhado.linha?.descricao || "-"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Marca</TableCell>
                      <TableCell>
                        {produtoDetalhado.marca?.marca || "-"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Unidade de Medida</TableCell>
                      <TableCell>
                        {produtoDetalhado.unidade ?
                          `${produtoDetalhado.unidade.sigla} - ${produtoDetalhado.unidade.descricao}` :
                          "-"}
                      </TableCell>
                    </TableRow>
                    {produtoDetalhado.grupo_2 && (
                      <TableRow>
                        <TableCell className="font-medium">Grupo 2</TableCell>
                        <TableCell>{produtoDetalhado.grupo_2}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Bloqueio (se existir) */}
              {bloqueioAtivo && (
                <div>
                  <h3 className="text-sm font-semibold text-default-900 mb-3 pb-2 border-b text-destructive">
                    ⚠️ Bloqueio
                  </h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium w-1/3">Status</TableCell>
                        <TableCell>
                          <Badge variant="destructive">Produto Bloqueado</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Motivo</TableCell>
                        <TableCell>
                          {produtoDetalhado.bloqueio?.descricao ||
                           `Motivo ID: ${produtoDetalhado.motivo_bloqueio}`}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Início do Bloqueio</TableCell>
                        <TableCell>{formatarData(produtoDetalhado.inicio_bloq)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Término do Bloqueio</TableCell>
                        <TableCell>{formatarData(produtoDetalhado.termino_bloq)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
