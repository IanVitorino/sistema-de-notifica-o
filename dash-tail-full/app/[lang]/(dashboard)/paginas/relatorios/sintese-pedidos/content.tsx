'use client';

import { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BlobProvider } from '@react-pdf/renderer';
import { Download, Search, Eraser, AlertCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, differenceInYears } from 'date-fns';
import { FabricanteAutocomplete } from '../components/FabricanteAutocomplete';
import { ClienteAutocomplete } from '../components/ClienteAutocomplete';
import { VendedorAutocomplete } from '../components/VendedorAutocomplete';
import { SintesePedidosPDF } from './components/sintese-pedidos-pdf';

interface PedidoSintese {
  numero: string;
  data: string;
  fabricante: string;
  cliente: string;
  pedido: number;
  faturamento: number;
  comissao: number;
}

interface Totais {
  pedido: number;
  faturamento: number;
  comissao: number;
}

interface Filtros {
  fabricante: string;
  cliente: string;
  vendedor: string;
  periodoInicial: string;
  periodoFinal: string;
}

export function SintesePedidosContent() {
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
    periodoInicial: defaultPeriodoInicial,
    periodoFinal: defaultPeriodoFinal,
  });

  const [data, setData] = useState<PedidoSintese[]>([]);
  const [totais, setTotais] = useState<Totais>({
    pedido: 0,
    faturamento: 0,
    comissao: 0,
  });
  const [showPDF, setShowPDF] = useState(false);
  const [validationError, setValidationError] = useState('');

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch('/api/paginas/relatorios/sintese-pedidos', {
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
      setData(result.items || []);
      setTotais(result.totais || { pedido: 0, faturamento: 0, comissao: 0 });
      setShowPDF(true);
      setValidationError('');
    },
  });

  const handlePesquisar = () => {
    if (!filtros.vendedor) {
      setValidationError('O campo Vendedor é obrigatório');
      return;
    }

    if (!filtros.periodoInicial || !filtros.periodoFinal) {
      setValidationError('Período inicial e final são obrigatórios');
      return;
    }

    const dataInicial = new Date(filtros.periodoInicial);
    const dataFinal = new Date(filtros.periodoFinal);

    if (dataInicial > dataFinal) {
      setValidationError('A data inicial deve ser anterior à data final');
      return;
    }

    if (differenceInYears(dataFinal, dataInicial) > 1) {
      setValidationError('O período selecionado não pode ser maior que 1 ano');
      return;
    }

    setValidationError('');

    const payload = {
      fabricanteId: filtros.fabricante ? parseInt(filtros.fabricante) : null,
      clienteId: filtros.cliente ? parseInt(filtros.cliente) : null,
      vendedorId: parseInt(filtros.vendedor),
      periodoInicial: format(dataInicial, 'dd/MM/yyyy'),
      periodoFinal: format(dataFinal, 'dd/MM/yyyy'),
    };

    mutation.mutate(payload);
  };

  const handleLimparFiltros = () => {
    setFiltros({
      fabricante: '',
      cliente: '',
      vendedor: '',
      periodoInicial: defaultPeriodoInicial,
      periodoFinal: defaultPeriodoFinal,
    });
    setData([]);
    setTotais({ pedido: 0, faturamento: 0, comissao: 0 });
    setShowPDF(false);
    setValidationError('');
  };

  const filtrosParaPDF = useMemo(
    () => ({
      periodoInicial: filtros.periodoInicial
        ? format(new Date(filtros.periodoInicial), 'dd/MM/yyyy')
        : '',
      periodoFinal: filtros.periodoFinal
        ? format(new Date(filtros.periodoFinal), 'dd/MM/yyyy')
        : '',
      fabricante: filtros.fabricante || null,
      cliente: filtros.cliente || null,
      vendedor: filtros.vendedor || null,
    }),
    [filtros]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Síntese de Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
              <Label>
                Vendedor <span className="text-destructive">*</span>
              </Label>
              <VendedorAutocomplete
                value={filtros.vendedor}
                onChange={(value) => setFiltros((prev) => ({ ...prev, vendedor: value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Período Inicial <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={filtros.periodoInicial}
                onChange={(e) => setFiltros((prev) => ({ ...prev, periodoInicial: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Período Final <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={filtros.periodoFinal}
                onChange={(e) => setFiltros((prev) => ({ ...prev, periodoFinal: e.target.value }))}
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
              <CardTitle>Resultados - Síntese de Pedidos</CardTitle>
              {showPDF && (
                <BlobProvider
                  document={
                    <SintesePedidosPDF
                      items={data}
                      totais={totais}
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
                          link.download = `sintese-pedidos-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.pdf`;
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
                    <TableHead>Data</TableHead>
                    <TableHead>Nº Pedido</TableHead>
                    <TableHead className="text-right">Total Pedido</TableHead>
                    <TableHead className="text-right">Faturamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.fabricante}</TableCell>
                      <TableCell>{item.cliente}</TableCell>
                      <TableCell>{item.data}</TableCell>
                      <TableCell>{item.numero}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.pedido)}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.faturamento)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={4}>TOTAL</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(totais.pedido)}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(totais.faturamento)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
