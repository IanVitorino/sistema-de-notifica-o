'use client';

import { useState, useMemo, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BlobProvider } from '@react-pdf/renderer';
import { Download, Search, Eraser, AlertCircle } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { VendedorAutocomplete } from '../components/VendedorAutocomplete';
import { FabricanteAutocomplete } from '../components/FabricanteAutocomplete';
import { RegiaoAutocomplete } from '../components/RegiaoAutocomplete';
import { ClientesInativosPDF } from './components/clientes-inativos-pdf';

interface ClienteInativo {
  fantasia: string;
  cidade: string;
  uf: string;
  contato_telefone: string;
  contato_nome: string;
  ultimopedido: string;
  totped: number;
}

interface Estado {
  id: number;
  uf: string;
  descricao: string;
}

interface Filtros {
  vendedor: string;
  fabricante: string;
  estadoId: string;
  cidade: string;
  regiao: string;
  dataLimite: string;
}

export function ClientesInativosContent() {
  const defaultDataLimite = useMemo(() => format(subMonths(new Date(), 3), 'yyyy-MM-dd'), []);

  const [filtros, setFiltros] = useState<Filtros>({
    vendedor: '',
    fabricante: '',
    estadoId: '',
    cidade: '',
    regiao: '',
    dataLimite: defaultDataLimite,
  });

  const [data, setData] = useState<ClienteInativo[]>([]);
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
      const response = await fetch('/api/paginas/relatorios/clientes-inativos', {
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
    if (!filtros.dataLimite) {
      setValidationError('A Data Limite é obrigatória');
      return;
    }

    setValidationError('');

    const payload = {
      vendedor_id: filtros.vendedor ? parseInt(filtros.vendedor) : null,
      fabricante_id: filtros.fabricante ? parseInt(filtros.fabricante) : null,
      estado_id: filtros.estadoId ? parseInt(filtros.estadoId) : null,
      cidade: filtros.cidade || null,
      regiao_id: filtros.regiao ? parseInt(filtros.regiao) : null,
      datafinal: filtros.dataLimite,
    };

    mutation.mutate(payload);
  };

  const handleLimparFiltros = () => {
    setFiltros({
      vendedor: '',
      fabricante: '',
      estadoId: '',
      cidade: '',
      regiao: '',
      dataLimite: defaultDataLimite,
    });
    setData([]);
    setShowPDF(false);
    setValidationError('');
  };

  const formatDate = (dateStr: string) => {
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
      dataFinal: filtros.dataLimite ? format(new Date(filtros.dataLimite), 'dd/MM/yyyy') : '',
      vendedor: filtros.vendedor,
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
          <CardTitle>Relatório de Clientes Inativos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Vendedor</Label>
              <VendedorAutocomplete
                value={filtros.vendedor}
                onChange={(value) => setFiltros((prev) => ({ ...prev, vendedor: value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Fabricante</Label>
              <FabricanteAutocomplete
                value={filtros.fabricante as any}
                onChange={(value: any) => setFiltros((prev) => ({ ...prev, fabricante: value }))}
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
                value={filtros.regiao as any}
                onChange={(value: any) => setFiltros((prev) => ({ ...prev, regiao: value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Data Limite <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={filtros.dataLimite}
                onChange={(e) => setFiltros((prev) => ({ ...prev, dataLimite: e.target.value }))}
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
              <CardTitle>
                Resultados - Total de clientes: {data.length}
              </CardTitle>
              {showPDF && (
                <BlobProvider
                  document={
                    <ClientesInativosPDF
                      data={new Date()}
                      clientes={data}
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
                          link.download = `clientes-inativos-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.pdf`;
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
                    <TableHead>Cliente</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead className="text-right">Total Pedidos</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Último Pedido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.fantasia}</TableCell>
                      <TableCell>
                        {item.cidade} - {item.uf}
                      </TableCell>
                      <TableCell className="text-right">{item.totped}</TableCell>
                      <TableCell>{item.contato_telefone}</TableCell>
                      <TableCell>{item.contato_nome}</TableCell>
                      <TableCell>{formatDate(item.ultimopedido)}</TableCell>
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
