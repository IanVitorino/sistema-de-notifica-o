'use client';

import { useState, useCallback, FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { BlobProvider } from '@react-pdf/renderer';
import { VendasPDF } from './components/vendas-pdf';
import { FabricanteAutocomplete } from '../components/FabricanteAutocomplete';
import { ClienteAutocomplete } from '../components/ClienteAutocomplete';
import { VendedorAutocomplete } from '../components/VendedorAutocomplete';
import { RegiaoAutocomplete } from '../components/RegiaoAutocomplete';
import { GrupoProdutoAutocomplete } from '../components/GrupoProdutoAutocomplete';
import { ProdutoAutocomplete } from '../components/ProdutoAutocomplete';

interface Fabricante {
  id: number;
  fantasia?: string;
  razao_social?: string;
}

interface Cliente {
  id: number;
  fantasia?: string;
  razao_social?: string;
}

interface Vendedor {
  id: number;
  nome?: string;
  apelido?: string;
}

interface Regiao {
  id: number;
  codigo_regiao: string;
  descricao_regiao: string;
}

interface GrupoProduto {
  id: number;
  codigo: string;
  descricao: string;
}

interface Produto {
  id: number;
  codigo: string;
  descricao: string;
}

interface ResumoGrupo {
  codigo: string;
  valores: (number | '')[];
  total: number;
  media: number;
}

interface Filters {
  fabricante: Fabricante | null;
  cliente: Cliente | null;
  vendedor: Vendedor | null;
  regiao: Regiao | null;
  produto: Produto | null;
  grupoProduto: GrupoProduto | null;
  mesInicial: string;
  mesFinal: string;
  ano: string;
  tipoPesquisa: string;
  tipoDados: string;
}

const meses = [
  { valor: '01', nome: 'Janeiro' },
  { valor: '02', nome: 'Fevereiro' },
  { valor: '03', nome: 'Março' },
  { valor: '04', nome: 'Abril' },
  { valor: '05', nome: 'Maio' },
  { valor: '06', nome: 'Junho' },
  { valor: '07', nome: 'Julho' },
  { valor: '08', nome: 'Agosto' },
  { valor: '09', nome: 'Setembro' },
  { valor: '10', nome: 'Outubro' },
  { valor: '11', nome: 'Novembro' },
  { valor: '12', nome: 'Dezembro' },
];

const mesesAbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

async function fetchVendas(payload: any): Promise<{ dados: ResumoGrupo[]; count: number }> {
  const response = await fetch('/api/paginas/relatorios/vendas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao buscar dados');
  }

  return response.json();
}

export function VendasContent() {
  const [filters, setFilters] = useState<Filters>({
    fabricante: null,
    cliente: null,
    vendedor: null,
    regiao: null,
    produto: null,
    grupoProduto: null,
    mesInicial: '01',
    mesFinal: '12',
    ano: new Date().getFullYear().toString(),
    tipoPesquisa: 'produto',
    tipoDados: 'valor',
  });

  const [data, setData] = useState<ResumoGrupo[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const getDadosValue = (tipoPesquisa: string): number => {
    const mapping: Record<string, number> = {
      produto: 1,
      grupoProduto: 2,
      clientes: 3,
      vendedor: 4,
      regiao: 5,
      fabricante: 6,
    };
    return mapping[tipoPesquisa] || 1;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setData([]);
    setHasSearched(false);

    try {
      const payload = {
        dados: getDadosValue(filters.tipoPesquisa),
        tipoDados: filters.tipoDados,
        status: 1,
        ano: Number(filters.ano),
        mesInicio: Number(filters.mesInicial),
        mesFim: Number(filters.mesFinal),
        fabricantePattern: filters.fabricante?.fantasia || '',
        clientePattern: filters.cliente?.fantasia || '',
        vendedorPattern: filters.vendedor?.nome || filters.vendedor?.apelido || '',
        regiaoPattern: filters.regiao?.codigo_regiao || '',
        grupoProdutoPattern: filters.grupoProduto?.codigo || '',
        codigoProdutoPattern: filters.produto?.codigo || '',
      };

      const result = await fetchVendas(payload);

      if (result.dados.length === 0) {
        toast.info('Nenhum registro encontrado para os filtros informados.');
        setHasSearched(true);
        return;
      }

      setData(result.dados);
      setHasSearched(true);
      toast.success(`Relatório gerado com sucesso! ${result.count} registros encontrados.`);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const abrirPDFEmNovaJanela = (url: string) => {
    window.open(url, '_blank');
    toast.success('PDF aberto em uma nova janela');
  };

  const formatValue = (value: number | '') => {
    if (value === '') return '-';
    return filters.tipoDados === 'valor'
      ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
      : new Intl.NumberFormat('pt-BR').format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-default-900 mb-2">Relatório de Vendas</h1>
          <p className="text-sm text-default-600">
            Análise de desempenho baseada em vendas
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parâmetros do Relatório</CardTitle>
          <CardDescription>Configure os filtros para análise de vendas</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="relatorio-vendas-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Filtros de Autocomplete */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fabricante</Label>
                <FabricanteAutocomplete
                  value={filters.fabricante}
                  onSelect={(fabricante) => setFilters((prev) => ({ ...prev, fabricante }))}
                  placeholder="Buscar fabricante..."
                />
              </div>

              <div className="space-y-2">
                <Label>Cliente</Label>
                <ClienteAutocomplete
                  value={filters.cliente}
                  onSelect={(cliente) => setFilters((prev) => ({ ...prev, cliente }))}
                  placeholder="Buscar cliente..."
                />
              </div>

              <div className="space-y-2">
                <Label>Vendedor</Label>
                <VendedorAutocomplete
                  value={filters.vendedor}
                  onSelect={(vendedor) => setFilters((prev) => ({ ...prev, vendedor }))}
                  placeholder="Buscar vendedor..."
                />
              </div>

              <div className="space-y-2">
                <Label>Região</Label>
                <RegiaoAutocomplete
                  value={filters.regiao}
                  onSelect={(regiao) => setFilters((prev) => ({ ...prev, regiao }))}
                  placeholder="Buscar região..."
                />
              </div>

              <div className="space-y-2">
                <Label>Código Produto</Label>
                <ProdutoAutocomplete
                  value={filters.produto}
                  onSelect={(produto) => setFilters((prev) => ({ ...prev, produto }))}
                  placeholder="Buscar produto..."
                />
              </div>

              <div className="space-y-2">
                <Label>Grupo de Produto</Label>
                <GrupoProdutoAutocomplete
                  value={filters.grupoProduto}
                  onSelect={(grupoProduto) => setFilters((prev) => ({ ...prev, grupoProduto }))}
                  placeholder="Buscar grupo de produto..."
                />
              </div>
            </div>

            {/* Seleção de Período */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Mês Inicial</Label>
                <Select
                  value={filters.mesInicial}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, mesInicial: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês inicial" />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map((mes) => (
                      <SelectItem key={mes.valor} value={mes.valor}>
                        {mes.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mês Final</Label>
                <Select
                  value={filters.mesFinal}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, mesFinal: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês final" />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map((mes) => (
                      <SelectItem key={mes.valor} value={mes.valor}>
                        {mes.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ano</Label>
                <Input
                  type="number"
                  value={filters.ano}
                  onChange={(e) => setFilters((prev) => ({ ...prev, ano: e.target.value }))}
                  min="2000"
                  max="2100"
                  placeholder="Digite o ano"
                />
              </div>
            </div>

            {/* Tipo Pesquisa e Tipo Dados */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="space-y-2 col-span-4">
                <Label>Tipo de Pesquisa</Label>
                <div className="border rounded-md p-3">
                  <div className="grid grid-cols-3 gap-3">
                    {['produto', 'grupoProduto', 'clientes', 'vendedor', 'regiao', 'fabricante'].map(
                      (option) => (
                        <label key={option} className="flex items-center space-x-2 text-sm">
                          <input
                            type="radio"
                            name="tipoPesquisa"
                            value={option}
                            checked={filters.tipoPesquisa === option}
                            onChange={(e) =>
                              setFilters((prev) => ({ ...prev, tipoPesquisa: e.target.value }))
                            }
                            className="form-radio text-primary"
                          />
                          <span>
                            {option
                              .replace(/([A-Z])/g, ' $1')
                              .replace(/^\w/, (c) => c.toUpperCase())}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Tipo de Dados</Label>
                <div className="border rounded-md p-3">
                  <div className="space-y-3">
                    {['valor', 'quantidade'].map((option) => (
                      <label key={option} className="flex items-center space-x-3 text-sm">
                        <input
                          type="radio"
                          name="tipoDados"
                          value={option}
                          checked={filters.tipoDados === option}
                          onChange={(e) =>
                            setFilters((prev) => ({ ...prev, tipoDados: e.target.value }))
                          }
                          className="form-radio text-primary"
                        />
                        <span>{option.replace(/^\w/, (c) => c.toUpperCase())}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t p-4">
          {data.length > 0 && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFilters({
                    fabricante: null,
                    cliente: null,
                    vendedor: null,
                    regiao: null,
                    produto: null,
                    grupoProduto: null,
                    mesInicial: '01',
                    mesFinal: '12',
                    ano: new Date().getFullYear().toString(),
                    tipoPesquisa: 'produto',
                    tipoDados: 'valor',
                  });
                  setData([]);
                  setHasSearched(false);
                }}
              >
                Limpar Filtros
              </Button>
              <BlobProvider
                document={
                  <VendasPDF
                    data={data}
                    filtros={{
                      fabricante: filters.fabricante?.fantasia || '----',
                      cliente: filters.cliente?.fantasia || '----',
                      vendedor: filters.vendedor?.nome || filters.vendedor?.apelido || '----',
                      regiao: filters.regiao?.descricao_regiao || '----',
                      produto: filters.produto?.descricao || '----',
                      grupoProduto: filters.grupoProduto?.descricao || '----',
                      mesInicial: filters.mesInicial,
                      mesFinal: filters.mesFinal,
                      ano: filters.ano,
                      tipoPesquisa: filters.tipoPesquisa,
                      tipoDados: filters.tipoDados,
                    }}
                    dataHoraRelatorio={new Date().toLocaleString('pt-BR')}
                  />
                }
              >
                {({ url, loading: pdfLoading, error }) => (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => url && abrirPDFEmNovaJanela(url)}
                    disabled={pdfLoading || !url || !!error}
                    className="gap-2"
                  >
                    <Download size={20} />
                    {pdfLoading ? 'Gerando PDF...' : 'Visualizar PDF'}
                  </Button>
                )}
              </BlobProvider>
            </>
          )}
          <Button type="submit" form="relatorio-vendas-form" disabled={loading}>
            {loading ? 'Processando...' : 'Gerar Relatório'}
          </Button>
        </CardFooter>
      </Card>

      {/* Tabela de Resultados */}
      {hasSearched && data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <p className="text-sm text-default-600 mt-2">
              {data.length} registro(s) encontrado(s)
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Código</TableHead>
                    {mesesAbrev.map((mes, index) => (
                      <TableHead key={index} className="text-right">
                        {mes}
                      </TableHead>
                    ))}
                    <TableHead className="text-right font-bold">Média</TableHead>
                    <TableHead className="text-right font-bold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.codigo}</TableCell>
                      {item.valores.map((valor, mesIndex) => (
                        <TableCell key={mesIndex} className="text-right text-sm">
                          {formatValue(valor)}
                        </TableCell>
                      ))}
                      <TableCell className="text-right font-medium">
                        {formatValue(item.media)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatValue(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {hasSearched && data.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-default-500">
              Nenhum registro encontrado para os filtros selecionados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
