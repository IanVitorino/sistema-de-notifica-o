'use client';

import { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BlobProvider } from '@react-pdf/renderer';
import { Download, Search, Eraser } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { FabricanteAutocomplete } from '../components/FabricanteAutocomplete';
import { ClienteAutocomplete } from '../components/ClienteAutocomplete';
import { VendedorAutocomplete } from '../components/VendedorAutocomplete';
import { RegiaoAutocomplete } from '../components/RegiaoAutocomplete';
import { ProdutoAutocomplete } from '../components/ProdutoAutocomplete';
import { GrupoProdutoAutocomplete } from '../components/GrupoProdutoAutocomplete';
import { MarcaAutocomplete } from '../components/MarcaAutocomplete';
import { CurvaABCVendasPDF } from './components/curva-abc-vendas-pdf';

interface CurvaABCItem {
  ranking: number;
  descricao: string;
  quantidade: number;
  valor: number;
  percentual: number;
  acumulado: number;
  classificacao: 'A' | 'B' | 'C';
}

interface Filtros {
  fabricante: string;
  cliente: string;
  vendedor: string;
  regiao: string;
  produto: string;
  grupoProduto: string;
  marca: string;
  periodoInicial: string;
  periodoFinal: string;
  tipoPesquisa: string;
  tipoDados: 'valor' | 'quantidade';
  curvaRange: [number, number];
}

export function CurvaABCVendasContent() {
  const previousMonth = useMemo(() => subMonths(new Date(), 1), []);
  const defaultPeriodoInicial = useMemo(
    () => format(startOfMonth(previousMonth), 'yyyy-MM-dd'),
    [previousMonth]
  );
  const defaultPeriodoFinal = useMemo(
    () => format(endOfMonth(previousMonth), 'yyyy-MM-dd'),
    [previousMonth]
  );

  const [filtros, setFiltros] = useState<Filtros>({
    fabricante: '',
    cliente: '',
    vendedor: '',
    regiao: '',
    produto: '',
    grupoProduto: '',
    marca: '',
    periodoInicial: defaultPeriodoInicial,
    periodoFinal: defaultPeriodoFinal,
    tipoPesquisa: '1',
    tipoDados: 'valor',
    curvaRange: [30, 60],
  });

  const [data, setData] = useState<CurvaABCItem[]>([]);
  const [showPDF, setShowPDF] = useState(false);

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch('/api/paginas/relatorios/curva-abc-vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados');
      }

      return response.json();
    },
    onSuccess: (result) => {
      setData(result.data || []);
      setShowPDF(true);
    },
  });

  const handlePesquisar = () => {
    const payload = {
      tipoDados: filtros.tipoDados === 'valor' ? 2 : 1,
      tipoPesquisa: parseInt(filtros.tipoPesquisa),
      dataInicial: filtros.periodoInicial,
      dataFinal: filtros.periodoFinal,
      fabricante: filtros.fabricante,
      cliente: filtros.cliente,
      vendedor: filtros.vendedor,
      regiao: filtros.regiao,
      grupoProduto: filtros.grupoProduto,
      codigoProduto: filtros.produto,
      marca: filtros.marca,
      limiteA: filtros.curvaRange[0],
      limiteB: filtros.curvaRange[1] - filtros.curvaRange[0],
    };

    mutation.mutate(payload);
  };

  const handleLimparFiltros = () => {
    setFiltros({
      fabricante: '',
      cliente: '',
      vendedor: '',
      regiao: '',
      produto: '',
      grupoProduto: '',
      marca: '',
      periodoInicial: defaultPeriodoInicial,
      periodoFinal: defaultPeriodoFinal,
      tipoPesquisa: '1',
      tipoDados: 'valor',
      curvaRange: [30, 60],
    });
    setData([]);
    setShowPDF(false);
  };

  const getClasseBadgeVariant = (classe: string) => {
    switch (classe) {
      case 'A':
        return 'default';
      case 'B':
        return 'secondary';
      case 'C':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const dataHoraRelatorio = useMemo(() => {
    return format(new Date(), "dd/MM/yyyy 'às' HH:mm");
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Curva ABC de Vendas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Autocompletes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Fabricante</Label>
              <FabricanteAutocomplete
                value={filtros.fabricante}
                onChange={(value) => setFiltros((prev) => ({ ...prev, fabricante: value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Cliente</Label>
              <ClienteAutocomplete
                value={filtros.cliente}
                onChange={(value) => setFiltros((prev) => ({ ...prev, cliente: value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Vendedor</Label>
              <VendedorAutocomplete
                value={filtros.vendedor}
                onChange={(value) => setFiltros((prev) => ({ ...prev, vendedor: value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Região</Label>
              <RegiaoAutocomplete
                value={filtros.regiao}
                onChange={(value) => setFiltros((prev) => ({ ...prev, regiao: value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Produto</Label>
              <ProdutoAutocomplete
                value={filtros.produto}
                onChange={(value) => setFiltros((prev) => ({ ...prev, produto: value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Grupo Produto</Label>
              <GrupoProdutoAutocomplete
                value={filtros.grupoProduto}
                onChange={(value) => setFiltros((prev) => ({ ...prev, grupoProduto: value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Marca</Label>
              <MarcaAutocomplete
                value={filtros.marca ? { id: parseInt(filtros.marca), codigo: null, descricao: null } : null}
                onSelect={(marca) => setFiltros((prev) => ({ ...prev, marca: marca?.id.toString() || '' }))}
                placeholder="Digite código ou descrição da marca..."
              />
            </div>
          </div>

          {/* Período */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodoInicial">Data Inicial</Label>
              <Input
                id="periodoInicial"
                type="date"
                value={filtros.periodoInicial}
                onChange={(e) => setFiltros((prev) => ({ ...prev, periodoInicial: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodoFinal">Data Final</Label>
              <Input
                id="periodoFinal"
                type="date"
                value={filtros.periodoFinal}
                onChange={(e) => setFiltros((prev) => ({ ...prev, periodoFinal: e.target.value }))}
              />
            </div>
          </div>

          {/* Curva Range Slider */}
          <div className="space-y-4">
            <Label>Limites da Curva ABC (%)</Label>
            <div className="space-y-2">
              <Slider
                value={filtros.curvaRange}
                onValueChange={(value) => setFiltros((prev) => ({ ...prev, curvaRange: value as [number, number] }))}
                min={0}
                max={100}
                step={1}
                minStepsBetweenThumbs={1}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Classe A: 0% - {filtros.curvaRange[0]}%</span>
                <span>Classe B: {filtros.curvaRange[0]}% - {filtros.curvaRange[1]}%</span>
                <span>Classe C: {filtros.curvaRange[1]}% - 100%</span>
              </div>
            </div>
          </div>

          {/* Tipo de Pesquisa */}
          <div className="space-y-2">
            <Label>Tipo de Pesquisa</Label>
            <RadioGroup
              value={filtros.tipoPesquisa}
              onValueChange={(value) => setFiltros((prev) => ({ ...prev, tipoPesquisa: value }))}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="tipo1" />
                  <Label htmlFor="tipo1" className="font-normal cursor-pointer">
                    Cliente
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="tipo2" />
                  <Label htmlFor="tipo2" className="font-normal cursor-pointer">
                    Fabricante
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="tipo3" />
                  <Label htmlFor="tipo3" className="font-normal cursor-pointer">
                    Vendedor
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4" id="tipo4" />
                  <Label htmlFor="tipo4" className="font-normal cursor-pointer">
                    Produto
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5" id="tipo5" />
                  <Label htmlFor="tipo5" className="font-normal cursor-pointer">
                    Grupo de Produto
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="6" id="tipo6" />
                  <Label htmlFor="tipo6" className="font-normal cursor-pointer">
                    Região
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Tipo de Dados */}
          <div className="space-y-2">
            <Label>Tipo de Dados</Label>
            <RadioGroup
              value={filtros.tipoDados}
              onValueChange={(value) => setFiltros((prev) => ({ ...prev, tipoDados: value as 'valor' | 'quantidade' }))}
            >
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="valor" id="valor" />
                  <Label htmlFor="valor" className="font-normal cursor-pointer">
                    Valor (R$)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quantidade" id="quantidade" />
                  <Label htmlFor="quantidade" className="font-normal cursor-pointer">
                    Quantidade
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            <Button onClick={handlePesquisar} disabled={mutation.isPending}>
              <Search className="mr-2 h-4 w-4" />
              {mutation.isPending ? 'Pesquisando...' : 'Pesquisar'}
            </Button>
            <Button variant="outline" onClick={handleLimparFiltros}>
              <Eraser className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>

          {mutation.isError && (
            <div className="text-sm text-destructive">
              Erro ao buscar dados. Tente novamente.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Resultados */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Resultados da Curva ABC</CardTitle>
              {showPDF && (
                <BlobProvider
                  document={
                    <CurvaABCVendasPDF
                      data={data}
                      filtros={filtros}
                      dataHoraRelatorio={dataHoraRelatorio}
                    />
                  }
                >
                  {({ blob, url, loading }) => (
                    <Button
                      variant="outline"
                      disabled={loading}
                      onClick={() => {
                        if (url) {
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `curva-abc-vendas-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.pdf`;
                          link.click();
                        }
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {loading ? 'Gerando PDF...' : 'Baixar PDF'}
                    </Button>
                  )}
                </BlobProvider>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Ranking</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Valor R$</TableHead>
                    <TableHead className="text-right">Perc. %</TableHead>
                    <TableHead className="text-right">Acm. %</TableHead>
                    <TableHead className="w-[100px] text-center">Classe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.ranking}</TableCell>
                      <TableCell>{item.descricao}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR').format(item.quantidade)}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(item.valor)}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(item.percentual)}%
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(item.acumulado)}%
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getClasseBadgeVariant(item.classificacao)}>
                          {item.classificacao}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
