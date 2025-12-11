'use client';

import { useState, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BlobProvider } from '@react-pdf/renderer';
import { Download, Search, Eraser, AlertCircle } from 'lucide-react';
import { format, subMonths, subDays } from 'date-fns';
import { FabricanteAutocomplete } from '../components/FabricanteAutocomplete';
import { ClienteAutocomplete } from '../components/ClienteAutocomplete';
import { RegiaoAutocomplete } from '../components/RegiaoAutocomplete';
import { MarcaAutocomplete } from '../components/MarcaAutocomplete';
import { ProdutosSemPedidoPDF } from './components/produtos-sem-pedido-pdf';

interface ProdutoSemPedido {
  fabricante: string;
  subgrupo_cliente: string;
  codigo: string;
  quantidade_ultima: number | null;
  data_ultima_compra: string | null;
}

interface Estado {
  id: number;
  uf: string;
  descricao: string;
}

interface Filtros {
  fabricante: string;
  cliente: string;
  estadoId: string;
  cidade: string;
  regiao: string;
  marca: string;
  dataInicial: string;
  dataFinal: string;
}

export function ProdutosSemPedidoContent() {
  const defaultDataInicial = useMemo(() => format(subMonths(new Date(), 3), 'yyyy-MM-dd'), []);
  const defaultDataFinal = useMemo(() => format(subDays(new Date(), 1), 'yyyy-MM-dd'), []);

  const [filtros, setFiltros] = useState<Filtros>({
    fabricante: '',
    cliente: '',
    estadoId: '',
    cidade: '',
    regiao: '',
    marca: '',
    dataInicial: defaultDataInicial,
    dataFinal: defaultDataFinal,
  });

  const [data, setData] = useState<ProdutoSemPedido[]>([]);
  const [showPDF, setShowPDF] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Buscar estados
  const { data: estados = [] } = useQuery<Estado[]>({
    queryKey: ['estados'],
    queryFn: async () => {
      const response = await fetch('/api/paginas/parametros/estados');
      if (!response.ok) throw new Error('Erro ao buscar estados');
      return response.json();
    },
  });

  const estadoSelecionado = useMemo(
    () => estados.find((e) => e.id.toString() === filtros.estadoId),
    [estados, filtros.estadoId]
  );

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch('/api/paginas/relatorios/produtos-sem-pedido', {
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
      setValidationError('');
    },
  });

  const handlePesquisar = () => {
    if (!filtros.fabricante) {
      setValidationError('O campo Fabricante é obrigatório');
      return;
    }

    if (!filtros.dataInicial || !filtros.dataFinal) {
      setValidationError('Período inicial e final são obrigatórios');
      return;
    }

    const dataInicial = new Date(filtros.dataInicial);
    const dataFinal = new Date(filtros.dataFinal);

    if (dataInicial > dataFinal) {
      setValidationError('A data inicial deve ser anterior à data final');
      return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataFinal > hoje) {
      setValidationError('A data final não pode ser uma data futura');
      return;
    }

    setValidationError('');

    const payload = {
      cliente_id: filtros.cliente ? parseInt(filtros.cliente) : null,
      fabricante_id: parseInt(filtros.fabricante),
      estado_id: filtros.estadoId ? parseInt(filtros.estadoId) : null,
      cidade: filtros.cidade || null,
      regiao_id: filtros.regiao ? parseInt(filtros.regiao) : null,
      marca_id: filtros.marca ? parseInt(filtros.marca) : null,
      datainicial: filtros.dataInicial,
      datafinal: filtros.dataFinal,
    };

    mutation.mutate(payload);
  };

  const handleLimparFiltros = () => {
    setFiltros({
      fabricante: '',
      cliente: '',
      estadoId: '',
      cidade: '',
      regiao: '',
      marca: '',
      dataInicial: defaultDataInicial,
      dataFinal: defaultDataFinal,
    });
    setData([]);
    setShowPDF(false);
    setValidationError('');
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const filtrosParaPDF = useMemo(
    () => ({
      dataInicial: filtros.dataInicial ? format(new Date(filtros.dataInicial), 'dd/MM/yyyy') : '',
      dataFinal: filtros.dataFinal ? format(new Date(filtros.dataFinal), 'dd/MM/yyyy') : '',
      cliente: filtros.cliente,
      fabricante: filtros.fabricante,
      estado: estadoSelecionado?.uf,
      cidade: filtros.cidade,
      regiao: filtros.regiao,
    }),
    [filtros, estadoSelecionado]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Produtos Sem Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>
                Fabricante <span className="text-destructive">*</span>
              </Label>
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
              <Label>Estado</Label>
              <Select
                value={filtros.estadoId}
                onValueChange={(value) => setFiltros((prev) => ({ ...prev, estadoId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {estados.map((estado) => (
                    <SelectItem key={estado.id} value={estado.id.toString()}>
                      {estado.uf} - {estado.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                value={filtros.cidade}
                onChange={(e) => setFiltros((prev) => ({ ...prev, cidade: e.target.value }))}
                placeholder="Digite a cidade"
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
              <Label>Marca</Label>
              <MarcaAutocomplete
                value={filtros.marca ? { id: parseInt(filtros.marca), codigo: null, descricao: null } : null}
                onSelect={(marca) => setFiltros((prev) => ({ ...prev, marca: marca?.id.toString() || '' }))}
                placeholder="Digite código ou descrição da marca..."
              />
            </div>

            <div className="space-y-2">
              <Label>
                Data Inicial <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={filtros.dataInicial}
                onChange={(e) => setFiltros((prev) => ({ ...prev, dataInicial: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Data Final <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={filtros.dataFinal}
                onChange={(e) => setFiltros((prev) => ({ ...prev, dataFinal: e.target.value }))}
              />
            </div>
          </div>

          {validationError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{validationError}</span>
            </div>
          )}

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

      {data.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Resultados - Total de produtos: {data.length}</CardTitle>
              {showPDF && (
                <BlobProvider
                  document={
                    <ProdutosSemPedidoPDF
                      data={new Date()}
                      produtos={data}
                      filtros={filtrosParaPDF}
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
                          link.download = `produtos-sem-pedido-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.pdf`;
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
                    <TableHead>Fabricante</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead className="text-right">Quantidade Última</TableHead>
                    <TableHead>Data Última Compra</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.fabricante}</TableCell>
                      <TableCell>{item.subgrupo_cliente}</TableCell>
                      <TableCell>{item.codigo}</TableCell>
                      <TableCell className="text-right">
                        {item.quantidade_ultima !== null ? item.quantidade_ultima : '-'}
                      </TableCell>
                      <TableCell>{formatDate(item.data_ultima_compra)}</TableCell>
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
