'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Search, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { BlobProvider } from '@react-pdf/renderer';
import { CarteiraClientesFabricantePDF } from './components/carteira-clientes-fabricante-pdf';
import { VendedorAutocomplete } from '../components/VendedorAutocomplete';
import { FabricanteAutocomplete } from '../components/FabricanteAutocomplete';
import { RegiaoAutocomplete } from '../components/RegiaoAutocomplete';

interface Vendedor {
  id: number;
  apelido?: string;
  nome?: string;
}

interface Fabricante {
  id: number;
  fantasia?: string;
  razao_social?: string;
}

interface Regiao {
  id: number;
  codigo_regiao: string;
  descricao_regiao: string;
}

interface Estado {
  id: number;
  uf: string;
  descricao: string;
}

interface ClienteCarteira {
  cliente_nome: string;
  endereco: string;
  cep: string;
  contato_telefone: string;
  cidade: string;
  fabricante_nome: string;
  codigo_regiao: string;
  cnpj: string;
  cond_1: string;
  cond_2: string;
  cond_3: string;
  cond_4: string;
  cond_5: string;
  descontos_1: string;
  descontos_2: string;
  descontos_3: string;
  descontos_4: string;
  descontos_5: string;
  contato_nome: string;
}

interface CarteiraClientesData {
  data: ClienteCarteira[];
}

async function fetchCarteiraClientes(params: {
  vendedor_id: number;
  fabricante_id: number;
  estado_id?: number | null;
  cidade?: string | null;
  regiao_id?: number | null;
}): Promise<CarteiraClientesData> {
  const response = await fetch('/api/paginas/relatorios/carteira-clientes-fabricante', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar carteira de clientes');
  }

  return response.json();
}

async function fetchEstados(): Promise<Estado[]> {
  const response = await fetch('/api/paginas/parametros/estados');
  if (!response.ok) {
    throw new Error('Erro ao buscar estados');
  }
  return response.json();
}

export function CarteiraClientesFabricanteContent() {
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [fabricante, setFabricante] = useState<Fabricante | null>(null);
  const [estadoId, setEstadoId] = useState<string>('');
  const [estadoSelecionado, setEstadoSelecionado] = useState<Estado | null>(null);
  const [regiao, setRegiao] = useState<Regiao | null>(null);
  const [cidade, setCidade] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState<any>(null);

  // Buscar estados
  const { data: estados = [], isLoading: isLoadingEstados } = useQuery({
    queryKey: ['estados'],
    queryFn: fetchEstados,
  });

  // Atualizar estado selecionado quando estadoId mudar
  useEffect(() => {
    if (estadoId && estadoId !== 'todos') {
      const estado = estados.find((e) => e.id === parseInt(estadoId));
      setEstadoSelecionado(estado || null);
    } else {
      setEstadoSelecionado(null);
    }
  }, [estadoId, estados]);

  // Buscar carteira de clientes
  const {
    data: carteiraData,
    isLoading: isLoadingCarteira,
    error: errorCarteira,
    refetch,
  } = useQuery({
    queryKey: ['carteira-clientes-fabricante', searchParams],
    queryFn: () => fetchCarteiraClientes(searchParams),
    enabled: false, // Só executa quando chamado manualmente
  });

  const clientes = carteiraData?.data || [];

  // Handler de busca
  const handleSearch = useCallback(() => {
    if (!vendedor) {
      toast.error('Selecione um vendedor');
      return;
    }

    if (!fabricante) {
      toast.error('Selecione um fabricante');
      return;
    }

    const params = {
      vendedor_id: vendedor.id,
      fabricante_id: fabricante.id,
      estado_id: estadoSelecionado?.id || null,
      cidade: cidade || null,
      regiao_id: regiao?.id || null,
    };

    setSearchParams(params);
    setHasSearched(true);
    refetch();
  }, [vendedor, fabricante, estadoSelecionado, cidade, regiao, refetch]);

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
            Carteira de Clientes por Fabricante
          </h1>
          <p className="text-sm text-default-600">
            Selecione os filtros para visualizar a carteira de clientes
          </p>
        </div>
        <div>
          {hasSearched && clientes.length > 0 && !isLoadingCarteira ? (
            <BlobProvider
              document={
                <CarteiraClientesFabricantePDF
                  data={new Date()}
                  clientes={clientes}
                  filtros={{
                    vendedor: vendedor?.apelido || vendedor?.nome || `ID: ${vendedor?.id}`,
                    fabricante: fabricante?.fantasia || fabricante?.razao_social,
                    estado: estadoSelecionado?.uf,
                    cidade: cidade || undefined,
                    regiao: regiao?.codigo_regiao || undefined,
                  }}
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
                  {loading ? 'Gerando PDF...' : 'Visualizar PDF'}
                </Button>
              )}
            </BlobProvider>
          ) : (
            <Button disabled className="gap-2" size="default">
              <ExternalLink className="h-4 w-4" />
              Visualizar PDF
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Busca</CardTitle>
          <p className="text-sm text-default-600 mt-2">
            * Campos obrigatórios
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vendedor (obrigatório) */}
            <div className="space-y-2">
              <Label htmlFor="vendedor-autocomplete">
                Vendedor <span className="text-destructive">*</span>
              </Label>
              <VendedorAutocomplete
                value={vendedor}
                onSelect={setVendedor}
                placeholder="Selecione um vendedor..."
                disabled={isLoadingCarteira}
              />
            </div>

            {/* Fabricante (obrigatório) */}
            <div className="space-y-2">
              <Label htmlFor="fabricante-autocomplete">
                Fabricante <span className="text-destructive">*</span>
              </Label>
              <FabricanteAutocomplete
                value={fabricante}
                onSelect={setFabricante}
                placeholder="Selecione um fabricante..."
                disabled={isLoadingCarteira}
              />
            </div>

            {/* Estado (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="estado-select">Estado</Label>
              <Select
                value={estadoId}
                onValueChange={setEstadoId}
                disabled={isLoadingCarteira || isLoadingEstados}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {estados.map((estado) => (
                    <SelectItem key={estado.id} value={estado.id.toString()}>
                      {estado.uf} - {estado.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cidade (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="cidade-input">Cidade</Label>
              <Input
                id="cidade-input"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Digite a cidade"
                disabled={isLoadingCarteira}
              />
            </div>

            {/* Região (opcional) */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="regiao-autocomplete">Região</Label>
              <RegiaoAutocomplete
                value={regiao}
                onSelect={setRegiao}
                placeholder="Buscar região..."
                disabled={isLoadingCarteira}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSearch}
              disabled={isLoadingCarteira || !vendedor || !fabricante}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              {isLoadingCarteira ? 'Buscando...' : 'Buscar Clientes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mensagem de erro */}
      {errorCarteira && hasSearched && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Erro ao carregar carteira de clientes. Tente novamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabela com Resultados */}
      {hasSearched && !isLoadingCarteira && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Busca</CardTitle>
            <p className="text-sm text-default-600 mt-2">
              {clientes.length} cliente(s) encontrado(s)
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Cliente</TableHead>
                    <TableHead className="w-[200px]">Endereço</TableHead>
                    <TableHead className="w-[100px]">CEP</TableHead>
                    <TableHead className="w-[120px]">Telefone</TableHead>
                    <TableHead className="w-[150px]">Cidade</TableHead>
                    <TableHead className="w-[80px]">Região</TableHead>
                    <TableHead className="w-[120px]">Fabricante</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-default-500 py-8">
                        Nenhum cliente encontrado com os filtros selecionados
                      </TableCell>
                    </TableRow>
                  ) : (
                    clientes.map((cliente, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="font-medium">{cliente.cliente_nome}</div>
                          <div className="text-xs text-default-500">
                            CNPJ: {cliente.cnpj}
                          </div>
                          <div className="text-xs text-default-500">
                            Contato: {cliente.contato_nome}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{cliente.endereco}</div>
                          <div className="text-xs text-default-500 mt-1">
                            Cond: [{cliente.cond_1}|{cliente.cond_2}|{cliente.cond_3}|{cliente.cond_4}|{cliente.cond_5}]
                          </div>
                          <div className="text-xs text-default-500">
                            Desc: [{cliente.descontos_1}|{cliente.descontos_2}|{cliente.descontos_3}|{cliente.descontos_4}|{cliente.descontos_5}]
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{cliente.cep}</TableCell>
                        <TableCell className="text-sm">{cliente.contato_telefone}</TableCell>
                        <TableCell className="text-sm">{cliente.cidade}</TableCell>
                        <TableCell className="text-sm text-center">{cliente.codigo_regiao}</TableCell>
                        <TableCell className="text-sm">{cliente.fabricante_nome}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado de loading */}
      {isLoadingCarteira && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-default-500">
              Carregando carteira de clientes...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
