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
import { FichaClientePDF } from './components/ficha-cliente-pdf';
import { ClienteAutocomplete } from '../components/ClienteAutocomplete';

interface Cliente {
  id: number;
  fantasia?: string;
  razao_social?: string;
  cnpj?: string;
}

interface ClienteDetalhado extends Cliente {
  grupo_clientes?: number;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: number;
  cep?: string;
  inscricao_estadual?: string;
  contato_email?: string;
  contato_nome?: string;
  contato_telefone?: string;
  contato_telefone_ramal?: string;
  contato_celular?: string;
  contato_radio?: string;
  contato_fax?: string;
  contato_regiao?: number;
  fk_vendedor?: number;
  entrega_endereco?: string;
  entrega_bairro?: string;
  entrega_cidade?: string;
  entrega_estado?: number;
  entrega_cep?: string;
  entrega_nfexml?: string;
  cobranca_endereco?: string;
  cobranca_bairro?: string;
  cobranca_cidade?: string;
  cobranca_estado?: number;
  cobranca_cep?: string;
  transportadora?: number;
  situacao?: boolean;
  situacao_desde?: string;
  situacao_ate?: string;
  receber_email_servico?: boolean;
  habilitado?: boolean;
  criterio_pagamento?: number;
  motivo_bloqueio?: number;
  status?: boolean;
  observacao?: string;
}

async function fetchClienteDetalhado(id: number): Promise<ClienteDetalhado> {
  const response = await fetch(`/api/paginas/cadastros/cliente/${id}`);
  if (!response.ok) {
    throw new Error('Erro ao carregar detalhes do cliente');
  }
  return response.json();
}

export function FichaClienteContent() {
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  const {
    data: clienteDetalhado,
    isLoading: isLoadingDetalhes,
    error: errorDetalhes
  } = useQuery({
    queryKey: ['cliente-detalhado', selectedClienteId],
    queryFn: () => fetchClienteDetalhado(selectedClienteId!),
    enabled: !!selectedClienteId
  });

  // Handler para seleção de cliente via autocomplete
  const handleClienteSelect = useCallback((cliente: Cliente | null) => {
    setSelectedCliente(cliente);
    setSelectedClienteId(cliente?.id || null);
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
          <h1 className="text-2xl font-semibold text-default-900 mb-2">Ficha do Cliente</h1>
          <p className="text-sm text-default-600">
            Gere o relatório completo da ficha do cliente em PDF
          </p>
        </div>
        <div>
          {selectedClienteId && clienteDetalhado && !isLoadingDetalhes ? (
            <BlobProvider
              document={<FichaClientePDF cliente={clienteDetalhado} />}
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
              disabled={!selectedClienteId || isLoadingDetalhes}
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
          <CardTitle>Seleção do Cliente</CardTitle>
          <p className="text-sm text-default-600 mt-2">
            Escolha o cliente para gerar a ficha completa
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca de Cliente com Autocomplete */}
          <div className="space-y-2">
            <Label htmlFor="cliente-autocomplete">Buscar Cliente</Label>
            <ClienteAutocomplete
              value={selectedCliente}
              onSelect={handleClienteSelect}
              placeholder="Digite para buscar por nome, fantasia ou CNPJ..."
            />
            {isLoadingDetalhes && (
              <p className="text-sm text-default-500 mt-2">
                Carregando dados do cliente...
              </p>
            )}
            {selectedClienteId && clienteDetalhado && (
              <div className="mt-4 p-4 bg-default-50 dark:bg-default-200 rounded-md border border-default-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-default-900">{clienteDetalhado.fantasia || clienteDetalhado.razao_social}</p>
                    {clienteDetalhado.cnpj && <p className="text-sm text-default-600">CNPJ: {clienteDetalhado.cnpj}</p>}
                    {clienteDetalhado.endereco && (
                      <p className="text-sm text-default-600 mt-1">
                        {clienteDetalhado.endereco}
                        {clienteDetalhado.cidade && `, ${clienteDetalhado.cidade}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela com Informações Detalhadas do Cliente */}
      {selectedClienteId && clienteDetalhado && !isLoadingDetalhes && (
        <Card>
          <CardHeader>
            <CardTitle>Informações Detalhadas do Cliente</CardTitle>
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
                      <TableCell>{clienteDetalhado.id}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Status</TableCell>
                      <TableCell>
                        <Badge variant={clienteDetalhado.status ? "soft" : "outline"}>
                          {clienteDetalhado.status ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Razão Social</TableCell>
                      <TableCell>{clienteDetalhado.razao_social || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Nome Fantasia</TableCell>
                      <TableCell>{clienteDetalhado.fantasia || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">CNPJ</TableCell>
                      <TableCell>{clienteDetalhado.cnpj || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Inscrição Estadual</TableCell>
                      <TableCell>{clienteDetalhado.inscricao_estadual || "-"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Contato */}
              <div>
                <h3 className="text-sm font-semibold text-default-900 mb-3 pb-2 border-b">
                  Contato
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">Nome do Contato</TableCell>
                      <TableCell>{clienteDetalhado.contato_nome || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Telefone</TableCell>
                      <TableCell>
                        {clienteDetalhado.contato_telefone
                          ? `${clienteDetalhado.contato_telefone}${clienteDetalhado.contato_telefone_ramal ? ` (Ramal: ${clienteDetalhado.contato_telefone_ramal})` : ''}`
                          : "-"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Celular</TableCell>
                      <TableCell>{clienteDetalhado.contato_celular || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Email</TableCell>
                      <TableCell>{clienteDetalhado.contato_email || "-"}</TableCell>
                    </TableRow>
                    {clienteDetalhado.contato_fax && (
                      <TableRow>
                        <TableCell className="font-medium">Fax</TableCell>
                        <TableCell>{clienteDetalhado.contato_fax}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Endereço Principal */}
              <div>
                <h3 className="text-sm font-semibold text-default-900 mb-3 pb-2 border-b">
                  Endereço Principal
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">Endereço</TableCell>
                      <TableCell>{clienteDetalhado.endereco || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Bairro</TableCell>
                      <TableCell>{clienteDetalhado.bairro || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Cidade</TableCell>
                      <TableCell>{clienteDetalhado.cidade || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">CEP</TableCell>
                      <TableCell>{clienteDetalhado.cep || "-"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Endereço de Entrega (se existir) */}
              {(clienteDetalhado.entrega_endereco || clienteDetalhado.entrega_cidade) && (
                <div>
                  <h3 className="text-sm font-semibold text-default-900 mb-3 pb-2 border-b">
                    Endereço de Entrega
                  </h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium w-1/3">Endereço</TableCell>
                        <TableCell>{clienteDetalhado.entrega_endereco || "-"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Bairro</TableCell>
                        <TableCell>{clienteDetalhado.entrega_bairro || "-"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Cidade</TableCell>
                        <TableCell>{clienteDetalhado.entrega_cidade || "-"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">CEP</TableCell>
                        <TableCell>{clienteDetalhado.entrega_cep || "-"}</TableCell>
                      </TableRow>
                      {clienteDetalhado.entrega_nfexml && (
                        <TableRow>
                          <TableCell className="font-medium">Email NF-e XML</TableCell>
                          <TableCell>{clienteDetalhado.entrega_nfexml}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Endereço de Cobrança (se existir) */}
              {(clienteDetalhado.cobranca_endereco || clienteDetalhado.cobranca_cidade) && (
                <div>
                  <h3 className="text-sm font-semibold text-default-900 mb-3 pb-2 border-b">
                    Endereço de Cobrança
                  </h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium w-1/3">Endereço</TableCell>
                        <TableCell>{clienteDetalhado.cobranca_endereco || "-"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Bairro</TableCell>
                        <TableCell>{clienteDetalhado.cobranca_bairro || "-"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Cidade</TableCell>
                        <TableCell>{clienteDetalhado.cobranca_cidade || "-"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">CEP</TableCell>
                        <TableCell>{clienteDetalhado.cobranca_cep || "-"}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Configurações */}
              <div>
                <h3 className="text-sm font-semibold text-default-900 mb-3 pb-2 border-b">
                  Configurações
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">Situação</TableCell>
                      <TableCell>
                        <Badge variant={clienteDetalhado.situacao ? "success" : "secondary"}>
                          {clienteDetalhado.situacao ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Habilitado</TableCell>
                      <TableCell>
                        <Badge variant={clienteDetalhado.habilitado ? "success" : "secondary"}>
                          {clienteDetalhado.habilitado ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Receber Email de Serviço</TableCell>
                      <TableCell>
                        <Badge variant={clienteDetalhado.receber_email_servico ? "success" : "secondary"}>
                          {clienteDetalhado.receber_email_servico ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Observações (se existir) */}
              {clienteDetalhado.observacao && (
                <div>
                  <h3 className="text-sm font-semibold text-default-900 mb-3 pb-2 border-b">
                    Observações
                  </h3>
                  <div className="p-4 bg-default-50 dark:bg-default-100 rounded-md">
                    <p className="text-sm text-default-700 whitespace-pre-wrap">
                      {clienteDetalhado.observacao}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
