'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Cliente {
  id: number;
  razao_social?: string;
  fantasia?: string;
  cnpj?: string;
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
  status: boolean;
  observacao?: string;
}

interface GrupoCliente {
  id: number;
  codigo_grupo: string;
  descricao: string;
  status: boolean;
}

interface CriterioPagamento {
  id: number;
  codigo: string;
  descricao: string;
  status: boolean;
}

async function fetchCliente(id: string): Promise<Cliente> {
  const response = await fetch(`/api/paginas/cadastros/cliente/${id}`);
  if (!response.ok) {
    throw new Error('Erro ao carregar cliente');
  }
  return response.json();
}

async function createCliente(data: Omit<Cliente, 'id'>): Promise<Cliente> {
  const response = await fetch('/api/paginas/cadastros/cliente', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar cliente');
  }

  return response.json();
}

async function updateCliente(id: number, data: Omit<Cliente, 'id'>): Promise<Cliente> {
  const response = await fetch(`/api/paginas/cadastros/cliente/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar cliente');
  }

  return response.json();
}

async function fetchGruposClientes(): Promise<GrupoCliente[]> {
  try {
    const response = await fetch('/api/paginas/cadastros/grupo-clientes');
    if (!response.ok) {
      console.warn(`API retornou status ${response.status} ao buscar grupos de clientes`);
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao buscar grupos de clientes:', error);
    return [];
  }
}

async function fetchCriteriosPagamento(): Promise<CriterioPagamento[]> {
  try {
    const response = await fetch('/api/paginas/cadastros/criterio-pagamento');
    if (!response.ok) {
      console.warn(`API retornou status ${response.status} ao buscar critérios de pagamento`);
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao buscar critérios de pagamento:', error);
    return [];
  }
}

export function ClienteFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const clienteId = searchParams.get('id');
  const returnPage = searchParams.get('page') || '1';
  const returnSearch = searchParams.get('search') || '';
  const returnPerPage = searchParams.get('perPage') || '10';

  const isEditing = !!clienteId;

  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingCepEntrega, setLoadingCepEntrega] = useState(false);
  const [loadingCepCobranca, setLoadingCepCobranca] = useState(false);

  const [formData, setFormData] = useState({
    razao_social: '',
    fantasia: '',
    cnpj: '',
    grupo_clientes: 0,
    endereco: '',
    bairro: '',
    cidade: '',
    estado: 0,
    cep: '',
    inscricao_estadual: '',
    contato_email: '',
    contato_nome: '',
    contato_telefone: '',
    contato_telefone_ramal: '',
    contato_celular: '',
    contato_radio: '',
    contato_fax: '',
    contato_regiao: 0,
    fk_vendedor: 0,
    entrega_endereco: '',
    entrega_bairro: '',
    entrega_cidade: '',
    entrega_estado: 0,
    entrega_cep: '',
    entrega_nfexml: '',
    cobranca_endereco: '',
    cobranca_bairro: '',
    cobranca_cidade: '',
    cobranca_estado: 0,
    cobranca_cep: '',
    transportadora: 0,
    situacao: true,
    situacao_desde: '',
    situacao_ate: '',
    receber_email_servico: false,
    habilitado: true,
    criterio_pagamento: 0,
    motivo_bloqueio: 0,
    status: true,
    observacao: '',
  });

  // Carregar dados do cliente para edição
  const { data: cliente, isLoading: isLoadingCliente } = useQuery({
    queryKey: ['cliente', clienteId],
    queryFn: () => fetchCliente(clienteId!),
    enabled: !!clienteId
  });

  // Carregar grupos de clientes
  const { data: gruposClientes = [] } = useQuery({
    queryKey: ['gruposClientes'],
    queryFn: fetchGruposClientes,
  });

  // Carregar critérios de pagamento
  const { data: criteriosPagamento = [] } = useQuery({
    queryKey: ['criteriosPagamento'],
    queryFn: fetchCriteriosPagamento,
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        razao_social: cliente.razao_social || '',
        fantasia: cliente.fantasia || '',
        cnpj: cliente.cnpj || '',
        grupo_clientes: cliente.grupo_clientes ? Number(cliente.grupo_clientes) : 0,
        endereco: cliente.endereco || '',
        bairro: cliente.bairro || '',
        cidade: cliente.cidade || '',
        estado: cliente.estado ? Number(cliente.estado) : 0,
        cep: cliente.cep || '',
        inscricao_estadual: cliente.inscricao_estadual || '',
        contato_email: cliente.contato_email || '',
        contato_nome: cliente.contato_nome || '',
        contato_telefone: cliente.contato_telefone || '',
        contato_telefone_ramal: cliente.contato_telefone_ramal || '',
        contato_celular: cliente.contato_celular || '',
        contato_radio: cliente.contato_radio || '',
        contato_fax: cliente.contato_fax || '',
        contato_regiao: cliente.contato_regiao ? Number(cliente.contato_regiao) : 0,
        fk_vendedor: cliente.fk_vendedor ? Number(cliente.fk_vendedor) : 0,
        entrega_endereco: cliente.entrega_endereco || '',
        entrega_bairro: cliente.entrega_bairro || '',
        entrega_cidade: cliente.entrega_cidade || '',
        entrega_estado: cliente.entrega_estado ? Number(cliente.entrega_estado) : 0,
        entrega_cep: cliente.entrega_cep || '',
        entrega_nfexml: cliente.entrega_nfexml || '',
        cobranca_endereco: cliente.cobranca_endereco || '',
        cobranca_bairro: cliente.cobranca_bairro || '',
        cobranca_cidade: cliente.cobranca_cidade || '',
        cobranca_estado: cliente.cobranca_estado ? Number(cliente.cobranca_estado) : 0,
        cobranca_cep: cliente.cobranca_cep || '',
        transportadora: cliente.transportadora ? Number(cliente.transportadora) : 0,
        situacao: cliente.situacao !== undefined ? Boolean(cliente.situacao) : true,
        situacao_desde: cliente.situacao_desde || '',
        situacao_ate: cliente.situacao_ate || '',
        receber_email_servico: cliente.receber_email_servico !== undefined ? Boolean(cliente.receber_email_servico) : false,
        habilitado: cliente.habilitado !== undefined ? Boolean(cliente.habilitado) : true,
        criterio_pagamento: cliente.criterio_pagamento ? Number(cliente.criterio_pagamento) : 0,
        motivo_bloqueio: cliente.motivo_bloqueio ? Number(cliente.motivo_bloqueio) : 0,
        status: cliente.status !== undefined ? Boolean(cliente.status) : true,
        observacao: cliente.observacao || '',
      });
    }
  }, [cliente]);

  const createMutation = useMutation({
    mutationFn: createCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente criado com sucesso!');
      handleReturn();
    },
    onError: (error) => {
      toast.error(`Erro ao criar cliente: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Cliente, 'id'> }) =>
      updateCliente(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente', clienteId] });
      toast.success('Cliente atualizado com sucesso!');
      handleReturn();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar cliente: ${error.message}`);
    },
  });

  const buscarCep = async (cep: string, tipo: 'cadastro' | 'entrega' | 'cobranca') => {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      return;
    }

    const setLoading = tipo === 'cadastro' ? setLoadingCep : tipo === 'entrega' ? setLoadingCepEntrega : setLoadingCepCobranca;

    setLoading(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado');
        setLoading(false);
        return;
      }

      if (tipo === 'cadastro') {
        setFormData(prev => ({
          ...prev,
          endereco: data.logradouro || prev.endereco,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          // estado será preenchido após implementar busca de estado por UF
        }));
        toast.success('Endereço preenchido automaticamente!');
      } else if (tipo === 'entrega') {
        setFormData(prev => ({
          ...prev,
          entrega_endereco: data.logradouro || prev.entrega_endereco,
          entrega_bairro: data.bairro || prev.entrega_bairro,
          entrega_cidade: data.localidade || prev.entrega_cidade,
        }));
        toast.success('Endereço de entrega preenchido!');
      } else {
        setFormData(prev => ({
          ...prev,
          cobranca_endereco: data.logradouro || prev.cobranca_endereco,
          cobranca_bairro: data.bairro || prev.cobranca_bairro,
          cobranca_cidade: data.localidade || prev.cobranca_cidade,
        }));
        toast.success('Endereço de cobrança preenchido!');
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = () => {
    const params = new URLSearchParams();
    if (returnPage !== '1') params.set('page', returnPage);
    if (returnSearch) params.set('search', returnSearch);
    if (returnPerPage !== '10') params.set('perPage', returnPerPage);

    const query = params.toString();
    router.push(`/pt-br/paginas/cadastros/cliente${query ? `?${query}` : ''}`);
  };

  const formValido = formData.razao_social.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.razao_social.trim()) {
      toast.error('Razão social é obrigatória');
      return;
    }

    const data = {
      razao_social: formData.razao_social.trim(),
      fantasia: formData.fantasia.trim() || undefined,
      cnpj: formData.cnpj.trim() || undefined,
      grupo_clientes: formData.grupo_clientes || undefined,
      endereco: formData.endereco.trim() || undefined,
      bairro: formData.bairro.trim() || undefined,
      cidade: formData.cidade.trim() || undefined,
      estado: formData.estado || undefined,
      cep: formData.cep.trim() || undefined,
      inscricao_estadual: formData.inscricao_estadual.trim() || undefined,
      contato_email: formData.contato_email.trim() || undefined,
      contato_nome: formData.contato_nome.trim() || undefined,
      contato_telefone: formData.contato_telefone.trim() || undefined,
      contato_telefone_ramal: formData.contato_telefone_ramal.trim() || undefined,
      contato_celular: formData.contato_celular.trim() || undefined,
      contato_radio: formData.contato_radio.trim() || undefined,
      contato_fax: formData.contato_fax.trim() || undefined,
      contato_regiao: formData.contato_regiao || undefined,
      fk_vendedor: formData.fk_vendedor || undefined,
      entrega_endereco: formData.entrega_endereco.trim() || undefined,
      entrega_bairro: formData.entrega_bairro.trim() || undefined,
      entrega_cidade: formData.entrega_cidade.trim() || undefined,
      entrega_estado: formData.entrega_estado || undefined,
      entrega_cep: formData.entrega_cep.trim() || undefined,
      entrega_nfexml: formData.entrega_nfexml.trim() || undefined,
      cobranca_endereco: formData.cobranca_endereco.trim() || undefined,
      cobranca_bairro: formData.cobranca_bairro.trim() || undefined,
      cobranca_cidade: formData.cobranca_cidade.trim() || undefined,
      cobranca_estado: formData.cobranca_estado || undefined,
      cobranca_cep: formData.cobranca_cep.trim() || undefined,
      transportadora: formData.transportadora || undefined,
      situacao: formData.situacao,
      situacao_desde: formData.situacao_desde || undefined,
      situacao_ate: formData.situacao_ate || undefined,
      receber_email_servico: formData.receber_email_servico,
      habilitado: formData.habilitado,
      criterio_pagamento: formData.criterio_pagamento || undefined,
      motivo_bloqueio: formData.motivo_bloqueio || undefined,
      status: formData.status,
      observacao: formData.observacao.trim() || undefined,
    };

    if (isEditing && cliente) {
      updateMutation.mutate({ id: cliente.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReturn}
                  className="p-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? 'Edite as informações do cliente selecionado'
                  : 'Preencha as informações para criar um novo cliente'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReturn}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formValido || createMutation.isPending || updateMutation.isPending || isLoadingCliente}
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Salvar Alterações' : 'Criar Cliente'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Formulário */}
      <Card>
        <CardContent className="p-6">
          {isLoadingCliente ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando dados do cliente...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="cadastro" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
                  <TabsTrigger value="contato">Contato</TabsTrigger>
                  <TabsTrigger value="entrega-cobranca">Entrega/Cobrança</TabsTrigger>
                  <TabsTrigger value="status">Status</TabsTrigger>
                </TabsList>

                {/* Aba Cadastro */}
                <TabsContent value="cadastro">
                  <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div className="space-y-2 md:col-span-4">
                      <Label htmlFor="razao_social">
                        Razão Social *
                        <span className="text-xs text-muted-foreground ml-1">
                          ({formData.razao_social.length}/60)
                        </span>
                      </Label>
                      <Input
                        id="razao_social"
                        value={formData.razao_social}
                        onChange={(e) => setFormData(prev => ({ ...prev, razao_social: e.target.value }))}
                        maxLength={60}
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={formData.cnpj}
                        onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                        maxLength={18}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-4">
                      <Label htmlFor="fantasia">
                        Nome Fantasia
                        <span className="text-xs text-muted-foreground ml-1">
                          ({formData.fantasia.length}/60)
                        </span>
                      </Label>
                      <Input
                        id="fantasia"
                        value={formData.fantasia}
                        onChange={(e) => setFormData(prev => ({ ...prev, fantasia: e.target.value }))}
                        maxLength={60}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                      <Input
                        id="inscricao_estadual"
                        value={formData.inscricao_estadual}
                        onChange={(e) => setFormData(prev => ({ ...prev, inscricao_estadual: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-5">
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input
                        id="endereco"
                        value={formData.endereco}
                        onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="cep">CEP</Label>
                      <div className="flex gap-2">
                        <Input
                          id="cep"
                          value={formData.cep}
                          onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                          onBlur={(e) => buscarCep(e.target.value, 'cadastro')}
                          placeholder="00000-000"
                          maxLength={9}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => buscarCep(formData.cep, 'cadastro')}
                          disabled={loadingCep}
                        >
                          {loadingCep ? <Loader2 className="h-4 w-4 animate-spin" /> : '🔍'}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        value={formData.bairro}
                        onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor="estado">Estado</Label>
                      <Input
                        id="estado"
                        type="number"
                        value={formData.estado}
                        onChange={(e) => setFormData(prev => ({ ...prev, estado: Number(e.target.value) }))}
                        placeholder="ID do Estado"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor="grupo_clientes">Grupo de Clientes</Label>
                      <Select
                        value={formData.grupo_clientes?.toString() || "0"}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, grupo_clientes: Number(value) }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um grupo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Nenhum</SelectItem>
                          {gruposClientes.map((grupo) => (
                            <SelectItem key={grupo.id} value={grupo.id.toString()}>
                              {grupo.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor="criterio_pagamento">Critério de Pagamento</Label>
                      <Select
                        value={formData.criterio_pagamento?.toString() || "0"}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, criterio_pagamento: Number(value) }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um critério" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Nenhum</SelectItem>
                          {criteriosPagamento.map((criterio) => (
                            <SelectItem key={criterio.id} value={criterio.id.toString()}>
                              {criterio.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Observações */}
                    <div className="space-y-2 md:col-span-6">
                      <Label htmlFor="observacao">Observações</Label>
                      <Textarea
                        id="observacao"
                        value={formData.observacao}
                        onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Aba Contato */}
                <TabsContent value="contato">
                  <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor="contato_nome">Nome do Contato</Label>
                      <Input
                        id="contato_nome"
                        value={formData.contato_nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, contato_nome: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor="contato_celular">Celular</Label>
                      <Input
                        id="contato_celular"
                        value={formData.contato_celular}
                        onChange={(e) => setFormData(prev => ({ ...prev, contato_celular: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-6">
                      <Label htmlFor="contato_email">E-mail</Label>
                      <Input
                        id="contato_email"
                        type="email"
                        value={formData.contato_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, contato_email: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="contato_telefone">Telefone</Label>
                      <Input
                        id="contato_telefone"
                        value={formData.contato_telefone}
                        onChange={(e) => setFormData(prev => ({ ...prev, contato_telefone: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contato_telefone_ramal">Ramal</Label>
                      <Input
                        id="contato_telefone_ramal"
                        value={formData.contato_telefone_ramal}
                        onChange={(e) => setFormData(prev => ({ ...prev, contato_telefone_ramal: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor="contato_fax">Fax</Label>
                      <Input
                        id="contato_fax"
                        value={formData.contato_fax}
                        onChange={(e) => setFormData(prev => ({ ...prev, contato_fax: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-6">
                      <Label htmlFor="contato_radio">Rádio</Label>
                      <Input
                        id="contato_radio"
                        value={formData.contato_radio}
                        onChange={(e) => setFormData(prev => ({ ...prev, contato_radio: e.target.value }))}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Aba Entrega/Cobrança */}
                <TabsContent value="entrega-cobranca">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Endereço de Entrega</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <div className="space-y-2 md:col-span-4">
                          <Label htmlFor="entrega_endereco">Endereço</Label>
                          <Input
                            id="entrega_endereco"
                            value={formData.entrega_endereco}
                            onChange={(e) => setFormData(prev => ({ ...prev, entrega_endereco: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="entrega_bairro">Bairro</Label>
                          <Input
                            id="entrega_bairro"
                            value={formData.entrega_bairro}
                            onChange={(e) => setFormData(prev => ({ ...prev, entrega_bairro: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="entrega_cidade">Cidade</Label>
                          <Input
                            id="entrega_cidade"
                            value={formData.entrega_cidade}
                            onChange={(e) => setFormData(prev => ({ ...prev, entrega_cidade: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="entrega_estado">Estado</Label>
                          <Input
                            id="entrega_estado"
                            type="number"
                            value={formData.entrega_estado}
                            onChange={(e) => setFormData(prev => ({ ...prev, entrega_estado: Number(e.target.value) }))}
                            placeholder="ID do Estado"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="entrega_cep">CEP</Label>
                          <div className="flex gap-2">
                            <Input
                              id="entrega_cep"
                              value={formData.entrega_cep}
                              onChange={(e) => setFormData(prev => ({ ...prev, entrega_cep: e.target.value }))}
                              onBlur={(e) => buscarCep(e.target.value, 'entrega')}
                              placeholder="00000-000"
                              maxLength={9}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => buscarCep(formData.entrega_cep, 'entrega')}
                              disabled={loadingCepEntrega}
                            >
                              {loadingCepEntrega ? <Loader2 className="h-4 w-4 animate-spin" /> : '🔍'}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-6">
                          <Label htmlFor="entrega_nfexml">E-mail NFe/XML</Label>
                          <Input
                            id="entrega_nfexml"
                            value={formData.entrega_nfexml}
                            onChange={(e) => setFormData(prev => ({ ...prev, entrega_nfexml: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t">
                      <h3 className="text-lg font-medium mb-4">Endereço de Cobrança</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <div className="space-y-2 md:col-span-4">
                          <Label htmlFor="cobranca_endereco">Endereço</Label>
                          <Input
                            id="cobranca_endereco"
                            value={formData.cobranca_endereco}
                            onChange={(e) => setFormData(prev => ({ ...prev, cobranca_endereco: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="cobranca_bairro">Bairro</Label>
                          <Input
                            id="cobranca_bairro"
                            value={formData.cobranca_bairro}
                            onChange={(e) => setFormData(prev => ({ ...prev, cobranca_bairro: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="cobranca_cidade">Cidade</Label>
                          <Input
                            id="cobranca_cidade"
                            value={formData.cobranca_cidade}
                            onChange={(e) => setFormData(prev => ({ ...prev, cobranca_cidade: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="cobranca_estado">Estado</Label>
                          <Input
                            id="cobranca_estado"
                            type="number"
                            value={formData.cobranca_estado}
                            onChange={(e) => setFormData(prev => ({ ...prev, cobranca_estado: Number(e.target.value) }))}
                            placeholder="ID do Estado"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="cobranca_cep">CEP</Label>
                          <div className="flex gap-2">
                            <Input
                              id="cobranca_cep"
                              value={formData.cobranca_cep}
                              onChange={(e) => setFormData(prev => ({ ...prev, cobranca_cep: e.target.value }))}
                              onBlur={(e) => buscarCep(e.target.value, 'cobranca')}
                              placeholder="00000-000"
                              maxLength={9}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => buscarCep(formData.cobranca_cep, 'cobranca')}
                              disabled={loadingCepCobranca}
                            >
                              {loadingCepCobranca ? <Loader2 className="h-4 w-4 animate-spin" /> : '🔍'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Aba Status */}
                <TabsContent value="status">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Configurações</h3>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="situacao"
                              checked={formData.situacao}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, situacao: checked }))}
                            />
                            <Label htmlFor="situacao">Situação Ativa</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="habilitado"
                              checked={formData.habilitado}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, habilitado: checked }))}
                            />
                            <Label htmlFor="habilitado">Habilitado</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="receber_email_servico"
                              checked={formData.receber_email_servico}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, receber_email_servico: checked }))}
                            />
                            <Label htmlFor="receber_email_servico">Receber E-mails</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="status"
                              checked={formData.status}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked }))}
                            />
                            <Label htmlFor="status">Status Ativo</Label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Datas</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="situacao_desde">Data de Início</Label>
                            <Input
                              id="situacao_desde"
                              type="date"
                              value={formData.situacao_desde}
                              onChange={(e) => setFormData(prev => ({ ...prev, situacao_desde: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="situacao_ate">Data de Término</Label>
                            <Input
                              id="situacao_ate"
                              type="date"
                              value={formData.situacao_ate}
                              onChange={(e) => setFormData(prev => ({ ...prev, situacao_ate: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
