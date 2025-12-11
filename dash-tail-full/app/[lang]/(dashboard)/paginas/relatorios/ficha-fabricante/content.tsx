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
import { FichaFabricantePDF } from './components/ficha-fabricante-pdf';
import { FabricanteAutocomplete } from '../components/FabricanteAutocomplete';

interface Fabricante {
  id: number;
  fantasia?: string;
  razao_social?: string;
  cnpj?: string;
}

interface FabricanteDetalhado extends Fabricante {
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: number;
  cep?: string;
  inscricao?: string;
  contato_email_pedidos?: string;
  contato_email_contato?: string;
  contato_nfe_xml?: string;
  contato_nome_contato?: string;
  contato_telefone1?: string;
  contato_telefone1_ramal?: string;
  contato_telefone2?: string;
  contato_telefone2_ramal?: string;
  contato_fax?: string;
  codigo_representada?: string;
  inicio_representada?: Date | string;
  criterio_pagamento?: number;
  base_do_dia?: string;
  base_ate?: string;
  anexo_txt?: boolean;
  anexo_xls?: boolean;
  dia_vencimento?: string;
  porcent_comissao?: number;
  fechamento_periodo?: string;
  emite_nota?: boolean;
  habilitado?: boolean;
  status?: boolean;
  anexo_xml?: boolean;
  anexo_json?: boolean;
  num_ped_cli?: boolean;
}

async function fetchFabricanteDetalhado(id: number): Promise<FabricanteDetalhado> {
  const response = await fetch(`/api/paginas/cadastros/fabricante/${id}`);
  if (!response.ok) {
    throw new Error('Erro ao carregar detalhes do fabricante');
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

const formatarTelefone = (telefone?: string, ramal?: string): string => {
  if (!telefone) return '-';
  return ramal ? `${telefone} (Ramal: ${ramal})` : telefone;
};

export function FichaFabricanteContent() {
  const [selectedFabricanteId, setSelectedFabricanteId] = useState<number | null>(null);
  const [selectedFabricante, setSelectedFabricante] = useState<Fabricante | null>(null);

  const {
    data: fabricanteDetalhado,
    isLoading: isLoadingDetalhes,
    error: errorDetalhes
  } = useQuery({
    queryKey: ['fabricante-detalhado', selectedFabricanteId],
    queryFn: () => fetchFabricanteDetalhado(selectedFabricanteId!),
    enabled: !!selectedFabricanteId
  });

  // Handler para seleção de fabricante via autocomplete
  const handleFabricanteSelect = useCallback((fabricante: Fabricante | null) => {
    setSelectedFabricante(fabricante);
    setSelectedFabricanteId(fabricante?.id || null);
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
          <h1 className="text-2xl font-semibold text-default-900 mb-2">Ficha do Fabricante</h1>
          <p className="text-sm text-default-600">
            Gere o relatório completo da ficha do fabricante em PDF
          </p>
        </div>
        <div>
          {selectedFabricanteId && fabricanteDetalhado && !isLoadingDetalhes ? (
            <BlobProvider
              document={<FichaFabricantePDF fabricante={fabricanteDetalhado} />}
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
              disabled={!selectedFabricanteId || isLoadingDetalhes}
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
          <CardTitle>Seleção do Fabricante</CardTitle>
          <p className="text-sm text-default-600 mt-2">
            Escolha o fabricante para gerar a ficha completa
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca de Fabricante com Autocomplete */}
          <div className="space-y-2">
            <Label htmlFor="fabricante-autocomplete">Buscar Fabricante</Label>
            <FabricanteAutocomplete
              value={selectedFabricante}
              onSelect={handleFabricanteSelect}
              placeholder="Digite para buscar por nome, fantasia ou CNPJ..."
            />
            {isLoadingDetalhes && (
              <p className="text-sm text-default-500 mt-2">
                Carregando dados do fabricante...
              </p>
            )}
            {selectedFabricanteId && fabricanteDetalhado && (
              <div className="mt-4 p-4 bg-default-50 dark:bg-default-200 rounded-md border border-default-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-default-900">{fabricanteDetalhado.fantasia || fabricanteDetalhado.razao_social}</p>
                    {fabricanteDetalhado.cnpj && <p className="text-sm text-default-600">CNPJ: {fabricanteDetalhado.cnpj}</p>}
                    {fabricanteDetalhado.cidade && (
                      <p className="text-sm text-default-600 mt-1">
                        {fabricanteDetalhado.cidade}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela com Informações Detalhadas do Fabricante */}
      {selectedFabricanteId && fabricanteDetalhado && !isLoadingDetalhes && (
        <Card>
          <CardHeader>
            <CardTitle>Informações Detalhadas do Fabricante</CardTitle>
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
                      <TableCell>{fabricanteDetalhado.id}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Status</TableCell>
                      <TableCell>
                        <Badge variant={fabricanteDetalhado.status ? "success" : "destructive"}>
                          {fabricanteDetalhado.status ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Razão Social</TableCell>
                      <TableCell>{fabricanteDetalhado.razao_social || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Nome Fantasia</TableCell>
                      <TableCell>{fabricanteDetalhado.fantasia || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">CNPJ</TableCell>
                      <TableCell>{fabricanteDetalhado.cnpj || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Inscrição</TableCell>
                      <TableCell>{fabricanteDetalhado.inscricao || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Código Representada</TableCell>
                      <TableCell>{fabricanteDetalhado.codigo_representada || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Início Representada</TableCell>
                      <TableCell>{formatarData(fabricanteDetalhado.inicio_representada)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Percentual de Comissão</TableCell>
                      <TableCell>{fabricanteDetalhado.porcent_comissao ? `${fabricanteDetalhado.porcent_comissao}%` : "-"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Contatos */}
              <div>
                <h3 className="text-sm font-semibold text-default-900 mb-3 pb-2 border-b">
                  Contatos
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">Nome do Contato</TableCell>
                      <TableCell>{fabricanteDetalhado.contato_nome_contato || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Telefone Principal</TableCell>
                      <TableCell>
                        {formatarTelefone(fabricanteDetalhado.contato_telefone1, fabricanteDetalhado.contato_telefone1_ramal)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Telefone Secundário</TableCell>
                      <TableCell>
                        {formatarTelefone(fabricanteDetalhado.contato_telefone2, fabricanteDetalhado.contato_telefone2_ramal)}
                      </TableCell>
                    </TableRow>
                    {fabricanteDetalhado.contato_fax && (
                      <TableRow>
                        <TableCell className="font-medium">Fax</TableCell>
                        <TableCell>{fabricanteDetalhado.contato_fax}</TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell className="font-medium">Email para Pedidos</TableCell>
                      <TableCell>{fabricanteDetalhado.contato_email_pedidos || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Email de Contato</TableCell>
                      <TableCell>{fabricanteDetalhado.contato_email_contato || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Email NF-e XML</TableCell>
                      <TableCell>{fabricanteDetalhado.contato_nfe_xml || "-"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Endereço */}
              <div>
                <h3 className="text-sm font-semibold text-default-900 mb-3 pb-2 border-b">
                  Endereço
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">Endereço</TableCell>
                      <TableCell>{fabricanteDetalhado.endereco || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Bairro</TableCell>
                      <TableCell>{fabricanteDetalhado.bairro || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Cidade</TableCell>
                      <TableCell>{fabricanteDetalhado.cidade || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">CEP</TableCell>
                      <TableCell>{fabricanteDetalhado.cep || "-"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Condições de Pagamento */}
              <div>
                <h3 className="text-sm font-semibold text-default-900 mb-3 pb-2 border-b">
                  Condições de Pagamento
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">Critério de Pagamento</TableCell>
                      <TableCell>{fabricanteDetalhado.criterio_pagamento || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Base do Dia</TableCell>
                      <TableCell>{fabricanteDetalhado.base_do_dia || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Base Até</TableCell>
                      <TableCell>{fabricanteDetalhado.base_ate || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Dia de Vencimento</TableCell>
                      <TableCell>{fabricanteDetalhado.dia_vencimento || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Fechamento do Período</TableCell>
                      <TableCell>{fabricanteDetalhado.fechamento_periodo || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Emite Nota</TableCell>
                      <TableCell>
                        <Badge variant={fabricanteDetalhado.emite_nota ? "success" : "secondary"}>
                          {fabricanteDetalhado.emite_nota ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Número Pedido Cliente</TableCell>
                      <TableCell>
                        <Badge variant={fabricanteDetalhado.num_ped_cli ? "success" : "secondary"}>
                          {fabricanteDetalhado.num_ped_cli ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Configurações de Anexos */}
              <div>
                <h3 className="text-sm font-semibold text-default-900 mb-3 pb-2 border-b">
                  Configurações de Anexos
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">Anexo TXT</TableCell>
                      <TableCell>
                        <Badge variant={fabricanteDetalhado.anexo_txt ? "success" : "secondary"}>
                          {fabricanteDetalhado.anexo_txt ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Anexo XLS</TableCell>
                      <TableCell>
                        <Badge variant={fabricanteDetalhado.anexo_xls ? "success" : "secondary"}>
                          {fabricanteDetalhado.anexo_xls ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Anexo XML</TableCell>
                      <TableCell>
                        <Badge variant={fabricanteDetalhado.anexo_xml ? "success" : "secondary"}>
                          {fabricanteDetalhado.anexo_xml ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Anexo JSON</TableCell>
                      <TableCell>
                        <Badge variant={fabricanteDetalhado.anexo_json ? "success" : "secondary"}>
                          {fabricanteDetalhado.anexo_json ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Configurações Gerais */}
              <div>
                <h3 className="text-sm font-semibold text-default-900 mb-3 pb-2 border-b">
                  Configurações Gerais
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">Habilitado</TableCell>
                      <TableCell>
                        <Badge variant={fabricanteDetalhado.habilitado ? "success" : "secondary"}>
                          {fabricanteDetalhado.habilitado ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
