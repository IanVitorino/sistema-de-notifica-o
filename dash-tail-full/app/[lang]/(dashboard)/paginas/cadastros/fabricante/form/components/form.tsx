'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import Link from 'next/link';

interface Fabricante {
  id: number;
  razao_social?: string;
  fantasia?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: number;
  cep?: string;
  cnpj?: string;
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
  inicio_representada?: string;
  criterio_pagamento?: number;
  base_do_dia?: string;
  base_ate?: string;
  anexo_txt?: boolean;
  anexo_xls?: boolean;
  anexo_xml?: boolean;
  anexo_json?: boolean;
  num_ped_cli?: boolean;
  dia_vencimento?: string;
  porcent_comissao?: number;
  fechamento_periodo?: string;
  emite_nota?: boolean;
  ident_usuario?: string;
  ident_empresa?: string;
  habilitado?: boolean;
  status: boolean;
}

interface Estado {
  id: number;
  uf?: string;
  descricao?: string;
}

interface CriterioPagamento {
  id: number;
  criterio?: string;
  descricao?: string;
}

async function fetchFabricante(id: string): Promise<Fabricante> {
  const response = await fetch(`/api/paginas/cadastros/fabricante/${id}`);
  if (!response.ok) {
    throw new Error('Erro ao carregar fabricante');
  }
  return response.json();
}

async function fetchFabricantes(): Promise<Fabricante[]> {
  const response = await fetch('/api/paginas/cadastros/fabricante');
  if (!response.ok) {
    throw new Error('Erro ao carregar fabricantes');
  }
  return response.json();
}

async function createFabricante(data: Omit<Fabricante, 'id'>): Promise<Fabricante> {
  const response = await fetch('/api/paginas/cadastros/fabricante', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao criar fabricante');
  }
  
  return response.json();
}

async function updateFabricante(id: number, data: Omit<Fabricante, 'id'>): Promise<Fabricante> {
  const response = await fetch(`/api/paginas/cadastros/fabricante/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao atualizar fabricante');
  }
  
  return response.json();
}

async function fetchEstados(): Promise<Estado[]> {
  try {
    const response = await fetch('/api/paginas/parametros/estados');
    
    if (!response.ok) {
      console.warn(`API retornou status ${response.status} ao buscar estados`);
      return [];
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar estados:", error);
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
    
    const result = await response.json();
    // A API retorna um objeto com data, extrair apenas os dados
    return result.data || result || [];
  } catch (error) {
    console.error("Erro ao buscar critérios de pagamento:", error);
    return [];
  }
}

export function FabricanteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  const fabricanteId = searchParams.get('id');
  const returnPage = searchParams.get('page') || '1';
  const returnSearch = searchParams.get('search') || '';
  const returnPerPage = searchParams.get('perPage') || '10';
  
  const isEditing = !!fabricanteId;
  
  const [formData, setFormData] = useState({
    razao_social: '',
    fantasia: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: 0,
    cep: '',
    cnpj: '',
    inscricao: '',
    contato_email_pedidos: '',
    contato_email_contato: '',
    contato_nfe_xml: '',
    contato_nome_contato: '',
    contato_telefone1: '',
    contato_telefone1_ramal: '',
    contato_telefone2: '',
    contato_telefone2_ramal: '',
    contato_fax: '',
    codigo_representada: '',
    inicio_representada: '',
    criterio_pagamento: 0,
    base_do_dia: '',
    base_ate: '',
    anexo_txt: false,
    anexo_xls: false,
    anexo_xml: false,
    anexo_json: false,
    num_ped_cli: true,
    dia_vencimento: '',
    porcent_comissao: 0,
    fechamento_periodo: '',
    emite_nota: true,
    ident_usuario: '',
    ident_empresa: '',
    habilitado: true,
    status: true,
  });

  // Carregar dados do fabricante para edição
  const { data: fabricante } = useQuery({
    queryKey: ['fabricante', fabricanteId],
    queryFn: () => fetchFabricante(fabricanteId!),
    enabled: !!fabricanteId,
  });

  // Carregar todos os fabricantes para validação
  const { data: fabricantes = [] } = useQuery({
    queryKey: ['fabricantes'],
    queryFn: fetchFabricantes,
  });

  // Carregar estados
  const { data: estados = [] } = useQuery({
    queryKey: ['estados'],
    queryFn: fetchEstados,
  });

  // Carregar critérios de pagamento
  const { data: criteriosPagamento = [] } = useQuery({
    queryKey: ['criteriosPagamento'],
    queryFn: fetchCriteriosPagamento,
  });

  useEffect(() => {
    if (fabricante) {
      setFormData({
        razao_social: fabricante.razao_social || '',
        fantasia: fabricante.fantasia || '',
        endereco: fabricante.endereco || '',
        bairro: fabricante.bairro || '',
        cidade: fabricante.cidade || '',
        estado: fabricante.estado || 0,
        cep: fabricante.cep || '',
        cnpj: fabricante.cnpj || '',
        inscricao: fabricante.inscricao || '',
        contato_email_pedidos: fabricante.contato_email_pedidos || '',
        contato_email_contato: fabricante.contato_email_contato || '',
        contato_nfe_xml: fabricante.contato_nfe_xml || '',
        contato_nome_contato: fabricante.contato_nome_contato || '',
        contato_telefone1: fabricante.contato_telefone1 || '',
        contato_telefone1_ramal: fabricante.contato_telefone1_ramal || '',
        contato_telefone2: fabricante.contato_telefone2 || '',
        contato_telefone2_ramal: fabricante.contato_telefone2_ramal || '',
        contato_fax: fabricante.contato_fax || '',
        codigo_representada: fabricante.codigo_representada || '',
        inicio_representada: fabricante.inicio_representada ? new Date(fabricante.inicio_representada).toISOString().split('T')[0] : '',
        criterio_pagamento: fabricante.criterio_pagamento || 0,
        base_do_dia: fabricante.base_do_dia || '',
        base_ate: fabricante.base_ate || '',
        anexo_txt: fabricante.anexo_txt ?? false,
        anexo_xls: fabricante.anexo_xls ?? false,
        anexo_xml: fabricante.anexo_xml ?? false,
        anexo_json: fabricante.anexo_json ?? false,
        num_ped_cli: fabricante.num_ped_cli ?? true,
        dia_vencimento: fabricante.dia_vencimento || '',
        porcent_comissao: fabricante.porcent_comissao || 0,
        fechamento_periodo: fabricante.fechamento_periodo || '',
        emite_nota: fabricante.emite_nota ?? true,
        ident_usuario: fabricante.ident_usuario || '',
        ident_empresa: fabricante.ident_empresa || '',
        habilitado: fabricante.habilitado ?? true,
        status: fabricante.status ?? true,
      });
    }
  }, [fabricante]);

  const createMutation = useMutation({
    mutationFn: createFabricante,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fabricantes'] });
      toast.success('Fabricante criado com sucesso!');
      handleReturn();
    },
    onError: (error) => {
      toast.error(`Erro ao criar fabricante: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Fabricante, 'id'> }) =>
      updateFabricante(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fabricantes'] });
      queryClient.invalidateQueries({ queryKey: ['fabricante', fabricanteId] });
      toast.success('Fabricante atualizado com sucesso!');
      handleReturn();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar fabricante: ${error.message}`);
    },
  });

  const handleReturn = () => {
    const params = new URLSearchParams();
    if (returnPage !== '1') params.set('page', returnPage);
    if (returnSearch) params.set('search', returnSearch);
    if (returnPerPage !== '10') params.set('perPage', returnPerPage);
    
    const query = params.toString();
    router.push(`/paginas/cadastros/fabricante${query ? `?${query}` : ''}`);
  };

  const fabricanteDuplicado = (formData.cnpj.trim() || formData.razao_social.trim() || formData.fantasia.trim()) && fabricantes.some(
    (f) => (
      (f.cnpj?.toLowerCase().trim() === formData.cnpj.toLowerCase().trim() ||
       f.razao_social?.toLowerCase().trim() === formData.razao_social.toLowerCase().trim() ||
       f.fantasia?.toLowerCase().trim() === formData.fantasia.toLowerCase().trim()) &&
      f.id !== fabricante?.id
    )
  );

  const formValido = formData.razao_social.trim() && formData.fantasia.trim() && !fabricanteDuplicado;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.razao_social.trim() || !formData.fantasia.trim()) {
      toast.error('Razão social e nome fantasia são obrigatórios');
      return;
    }

    if (formData.razao_social.length > 80) {
      toast.error('Razão social deve ter no máximo 80 caracteres');
      return;
    }

    if (formData.fantasia.length > 60) {
      toast.error('Nome fantasia deve ter no máximo 60 caracteres');
      return;
    }

    const data = {
      razao_social: formData.razao_social.trim(),
      fantasia: formData.fantasia.trim(),
      endereco: formData.endereco.trim() || undefined,
      bairro: formData.bairro.trim() || undefined,
      cidade: formData.cidade.trim() || undefined,
      estado: formData.estado || undefined,
      cep: formData.cep.trim() || undefined,
      cnpj: formData.cnpj.trim() || undefined,
      inscricao: formData.inscricao.trim() || undefined,
      contato_email_pedidos: formData.contato_email_pedidos.trim() || undefined,
      contato_email_contato: formData.contato_email_contato.trim() || undefined,
      contato_nfe_xml: formData.contato_nfe_xml.trim() || undefined,
      contato_nome_contato: formData.contato_nome_contato.trim() || undefined,
      contato_telefone1: formData.contato_telefone1.trim() || undefined,
      contato_telefone1_ramal: formData.contato_telefone1_ramal.trim() || undefined,
      contato_telefone2: formData.contato_telefone2.trim() || undefined,
      contato_telefone2_ramal: formData.contato_telefone2_ramal.trim() || undefined,
      contato_fax: formData.contato_fax.trim() || undefined,
      codigo_representada: formData.codigo_representada.trim() || undefined,
      inicio_representada: formData.inicio_representada || undefined,
      criterio_pagamento: formData.criterio_pagamento || undefined,
      base_do_dia: formData.base_do_dia.trim() || undefined,
      base_ate: formData.base_ate.trim() || undefined,
      anexo_txt: formData.anexo_txt,
      anexo_xls: formData.anexo_xls,
      anexo_xml: formData.anexo_xml,
      anexo_json: formData.anexo_json,
      num_ped_cli: formData.num_ped_cli,
      dia_vencimento: formData.dia_vencimento.trim() || undefined,
      porcent_comissao: formData.porcent_comissao || undefined,
      fechamento_periodo: formData.fechamento_periodo.trim() || undefined,
      emite_nota: formData.emite_nota,
      ident_usuario: formData.ident_usuario.trim() || undefined,
      ident_empresa: formData.ident_empresa.trim() || undefined,
      habilitado: formData.habilitado,
      status: formData.status,
    };

    if (isEditing && fabricante) {
      updateMutation.mutate({ id: fabricante.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6 mx-10">
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
                {isEditing ? 'Editar Fabricante' : 'Novo Fabricante'}
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? 'Edite as informações do fabricante selecionado'
                  : 'Preencha as informações para criar um novo fabricante'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReturn}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!formValido || createMutation.isPending || updateMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Salvar Alterações' : 'Criar Fabricante'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-6">
          {fabricanteDuplicado && (
            <div className="mb-4 p-3 border border-destructive/20 bg-destructive/10 rounded-md">
              <p className="text-sm text-destructive">
                ⚠️ Este CNPJ, razão social ou nome fantasia já existe no sistema
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="cadastro" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
                <TabsTrigger value="contato">Contato</TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
              </TabsList>

              <TabsContent value="cadastro">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="space-y-2 md:col-span-4">
                    <Label htmlFor="razao_social">
                      Razão Social * 
                      <span className="text-xs text-muted-foreground ml-1">
                        ({formData.razao_social.length}/80)
                      </span>
                    </Label>
                    <Input
                      id="razao_social"
                      value={formData.razao_social}
                      onChange={(e) => setFormData(prev => ({ ...prev, razao_social: e.target.value }))}
                      maxLength={80}
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
                      Nome Fantasia *
                      <span className="text-xs text-muted-foreground ml-1">
                        ({formData.fantasia.length}/60)
                      </span>
                    </Label>
                    <Input
                      id="fantasia"
                      value={formData.fantasia}
                      onChange={(e) => setFormData(prev => ({ ...prev, fantasia: e.target.value }))}
                      maxLength={60}
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="inscricao">Inscrição Estadual</Label>
                    <Input
                      id="inscricao"
                      value={formData.inscricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, inscricao: e.target.value }))}
                      maxLength={16}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-5">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                      maxLength={60}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                      placeholder="00000-000"
                      maxLength={10}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                      maxLength={60}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                      maxLength={30}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      value={formData.estado?.toString() || "0"}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, estado: Number(value) }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key="selecione" value="0">Selecione...</SelectItem>
                        {estados.map((estado) => (
                          <SelectItem key={`estado-${estado.id}`} value={estado.id.toString()}>
                            {estado.uf} - {estado.descricao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contato">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="contato_nome_contato">Nome do Contato</Label>
                    <Input
                      id="contato_nome_contato"
                      value={formData.contato_nome_contato}
                      onChange={(e) => setFormData(prev => ({ ...prev, contato_nome_contato: e.target.value }))}
                      maxLength={30}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="contato_email_contato">E-mail de Contato</Label>
                    <Input
                      id="contato_email_contato"
                      type="email"
                      value={formData.contato_email_contato}
                      onChange={(e) => setFormData(prev => ({ ...prev, contato_email_contato: e.target.value }))}
                      maxLength={200}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="contato_email_pedidos">E-mail de Pedidos</Label>
                    <Input
                      id="contato_email_pedidos"
                      type="email"
                      value={formData.contato_email_pedidos}
                      onChange={(e) => setFormData(prev => ({ ...prev, contato_email_pedidos: e.target.value }))}
                      maxLength={60}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="contato_nfe_xml">E-mail NFe/XML</Label>
                    <Input
                      id="contato_nfe_xml"
                      type="email"
                      value={formData.contato_nfe_xml}
                      onChange={(e) => setFormData(prev => ({ ...prev, contato_nfe_xml: e.target.value }))}
                      maxLength={100}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="contato_telefone1">Telefone 1</Label>
                    <Input
                      id="contato_telefone1"
                      value={formData.contato_telefone1}
                      onChange={(e) => setFormData(prev => ({ ...prev, contato_telefone1: e.target.value }))}
                      maxLength={16}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contato_telefone1_ramal">Ramal</Label>
                    <Input
                      id="contato_telefone1_ramal"
                      value={formData.contato_telefone1_ramal}
                      onChange={(e) => setFormData(prev => ({ ...prev, contato_telefone1_ramal: e.target.value }))}
                      maxLength={4}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="contato_telefone2">Telefone 2</Label>
                    <Input
                      id="contato_telefone2"
                      value={formData.contato_telefone2}
                      onChange={(e) => setFormData(prev => ({ ...prev, contato_telefone2: e.target.value }))}
                      maxLength={16}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contato_telefone2_ramal">Ramal</Label>
                    <Input
                      id="contato_telefone2_ramal"
                      value={formData.contato_telefone2_ramal}
                      onChange={(e) => setFormData(prev => ({ ...prev, contato_telefone2_ramal: e.target.value }))}
                      maxLength={4}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="contato_fax">Fax</Label>
                    <Input
                      id="contato_fax"
                      value={formData.contato_fax}
                      onChange={(e) => setFormData(prev => ({ ...prev, contato_fax: e.target.value }))}
                      maxLength={20}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="codigo_representada">Código Representada</Label>
                    <Input
                      id="codigo_representada"
                      value={formData.codigo_representada}
                      onChange={(e) => setFormData(prev => ({ ...prev, codigo_representada: e.target.value }))}
                      maxLength={6}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="inicio_representada">Início Representada</Label>
                    <Input
                      id="inicio_representada"
                      type="date"
                      value={formData.inicio_representada}
                      onChange={(e) => setFormData(prev => ({ ...prev, inicio_representada: e.target.value }))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="status">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Configurações de Status</h3>
                      <div className="space-y-4">
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
                            id="status"
                            checked={formData.status}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked }))}
                          />
                          <Label htmlFor="status">Status Ativo</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="emite_nota"
                            checked={formData.emite_nota}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emite_nota: checked }))}
                          />
                          <Label htmlFor="emite_nota">Emissão de Nota Fiscal</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="num_ped_cli"
                            checked={formData.num_ped_cli}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, num_ped_cli: checked }))}
                          />
                          <Label htmlFor="num_ped_cli">Número Pedido Cliente</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Configurações Comerciais</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="criterio_pagamento">Critério de Pagamento</Label>
                          <Select
                            value={formData.criterio_pagamento.toString() || "0"}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, criterio_pagamento: Number(value) }))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione um critério" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem key="nenhum" value="0">Nenhum</SelectItem>
                              {criteriosPagamento.map((criterio) => (
                                <SelectItem key={`criterio-${criterio.id}`} value={criterio.id.toString()}>
                                  {criterio.criterio} - {criterio.descricao}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dia_vencimento">Dias para o Vencimento</Label>
                          <Input
                            id="dia_vencimento"
                            value={formData.dia_vencimento}
                            onChange={(e) => setFormData(prev => ({ ...prev, dia_vencimento: e.target.value }))}
                            maxLength={2}
                            placeholder="Ex: 30"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="porcent_comissao">(%) Porcentagem de Comissão</Label>
                          <Input
                            id="porcent_comissao"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.porcent_comissao}
                            onChange={(e) => setFormData(prev => ({ ...prev, porcent_comissao: Number(e.target.value) }))}
                            placeholder="Ex: 5.50"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="fechamento_periodo">Fechamento do Período</Label>
                          <Input
                            id="fechamento_periodo"
                            value={formData.fechamento_periodo}
                            onChange={(e) => setFormData(prev => ({ ...prev, fechamento_periodo: e.target.value }))}
                            maxLength={2}
                            placeholder="Ex: 15"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label htmlFor="base_do_dia">Base do Dia</Label>
                            <Input
                              id="base_do_dia"
                              value={formData.base_do_dia}
                              onChange={(e) => setFormData(prev => ({ ...prev, base_do_dia: e.target.value }))}
                              maxLength={2}
                              placeholder="Ex: 01"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="base_ate">Base Até</Label>
                            <Input
                              id="base_ate"
                              value={formData.base_ate}
                              onChange={(e) => setFormData(prev => ({ ...prev, base_ate: e.target.value }))}
                              maxLength={2}
                              placeholder="Ex: 31"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="ident_usuario">Identificação do Usuário na Representada</Label>
                      <Input
                        id="ident_usuario"
                        value={formData.ident_usuario}
                        onChange={(e) => setFormData(prev => ({ ...prev, ident_usuario: e.target.value }))}
                        maxLength={20}
                        placeholder="ID do usuário"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ident_empresa">Código de Identificação na Representada</Label>
                      <Input
                        id="ident_empresa"
                        value={formData.ident_empresa}
                        onChange={(e) => setFormData(prev => ({ ...prev, ident_empresa: e.target.value }))}
                        maxLength={20}
                        placeholder="Código da empresa"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-medium">Configurações de Anexos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="anexo_txt"
                          checked={formData.anexo_txt}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, anexo_txt: checked }))}
                        />
                        <Label htmlFor="anexo_txt">Anexo TXT</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="anexo_xls"
                          checked={formData.anexo_xls}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, anexo_xls: checked }))}
                        />
                        <Label htmlFor="anexo_xls">Anexo XLS</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="anexo_xml"
                          checked={formData.anexo_xml}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, anexo_xml: checked }))}
                        />
                        <Label htmlFor="anexo_xml">Anexo XML</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="anexo_json"
                          checked={formData.anexo_json}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, anexo_json: checked }))}
                        />
                        <Label htmlFor="anexo_json">Anexo JSON</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 