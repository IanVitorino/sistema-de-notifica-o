'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Search, Plus, Pencil, Trash2, CreditCard, X, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VendedorBanco {
  id?: number;
  fk_vendedor?: number;
  banco: string;
  agencia: string;
  conta: string;
  tipo: number;
  preferencial: boolean;
}

interface RegiaoZona {
  id: number;
  codigo_regiao?: string;
  codigo_zona?: string;
  descricao_regiao?: string;
  descricao_zona_estatica?: string;
  descricao_reduzida?: string;
}

interface VendedorRegiao {
  id?: number;
  fk_vendedor?: number;
  regiao?: number;
  tremonte_regiao_zona?: RegiaoZona;
}

interface Vendedor {
  id: number;
  apelido?: string;
  nome?: string;
  endereco?: string;
  cep?: string;
  bairro?: string;
  cidade?: string;
  uf?: number;
  celular?: string;
  telefone?: string;
  ramal?: string;
  comissao?: number;
  email?: string;
  rg?: string;
  cpf?: string;
  status: boolean;
  bancos?: VendedorBanco[];
  regioes?: VendedorRegiao[];
}

async function fetchVendedores(): Promise<Vendedor[]> {
  const response = await fetch('/api/paginas/cadastros/vendedor');
  if (!response.ok) {
    throw new Error('Erro ao carregar vendedores');
  }
  return response.json();
}

async function createVendedor(data: Omit<Vendedor, 'id'>): Promise<Vendedor> {
  const response = await fetch('/api/paginas/cadastros/vendedor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Erro ao criar vendedor');
  }
  
  return response.json();
}

async function updateVendedor(id: number, data: Omit<Vendedor, 'id'>): Promise<Vendedor> {
  const response = await fetch(`/api/paginas/cadastros/vendedor/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Erro ao atualizar vendedor');
  }
  
  return response.json();
}

async function deleteVendedor(id: number): Promise<void> {
  const response = await fetch(`/api/paginas/cadastros/vendedor/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Erro ao excluir vendedor');
  }
}

async function fetchVendedorBancos(vendedorId: number): Promise<VendedorBanco[]> {
  const response = await fetch(`/api/paginas/cadastros/vendedor/${vendedorId}/bancos`);
  if (!response.ok) {
    throw new Error('Erro ao carregar dados bancários');
  }
  return response.json();
}

async function createVendedorBanco(vendedorId: number, data: Omit<VendedorBanco, 'id' | 'fk_vendedor'>): Promise<VendedorBanco> {
  const response = await fetch(`/api/paginas/cadastros/vendedor/${vendedorId}/bancos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Erro ao criar dados bancários');
  }
  
  return response.json();
}

async function updateVendedorBanco(vendedorId: number, bancoId: number, data: Omit<VendedorBanco, 'id' | 'fk_vendedor'>): Promise<VendedorBanco> {
  const response = await fetch(`/api/paginas/cadastros/vendedor/${vendedorId}/bancos/${bancoId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Erro ao atualizar dados bancários');
  }
  
  return response.json();
}

async function deleteVendedorBanco(vendedorId: number, bancoId: number): Promise<void> {
  const response = await fetch(`/api/paginas/cadastros/vendedor/${vendedorId}/bancos/${bancoId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Erro ao excluir dados bancários');
  }
}

async function fetchRegioesZonas(): Promise<RegiaoZona[]> {
  const response = await fetch('/api/paginas/parametros/regiao-zona');
  if (!response.ok) {
    throw new Error('Erro ao carregar regiões e zonas');
  }
  return response.json();
}

async function fetchVendedorRegioes(vendedorId: number): Promise<VendedorRegiao[]> {
  const response = await fetch(`/api/paginas/cadastros/vendedor/${vendedorId}/regioes`);
  if (!response.ok) {
    throw new Error('Erro ao carregar regiões do vendedor');
  }
  return response.json();
}

async function createVendedorRegiao(vendedorId: number, regiaoId: number): Promise<VendedorRegiao> {
  const response = await fetch(`/api/paginas/cadastros/vendedor/${vendedorId}/regioes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ regiao: regiaoId }),
  });
  
  if (!response.ok) {
    throw new Error('Erro ao associar região ao vendedor');
  }
  
  return response.json();
}

async function deleteVendedorRegiao(vendedorId: number, regiaoId: number): Promise<void> {
  const response = await fetch(`/api/paginas/cadastros/vendedor/${vendedorId}/regioes/${regiaoId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Erro ao remover associação da região');
  }
}

export function VendedorContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [isNewVendedorModalOpen, setIsNewVendedorModalOpen] = useState(false);
  const [isEditVendedorModalOpen, setIsEditVendedorModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState<Vendedor | null>(null);
  const [deletingVendedor, setDeletingVendedor] = useState<Vendedor | null>(null);
  
  // Estados para dados bancários
  const [bancos, setBancos] = useState<VendedorBanco[]>([]);
  const [isNewBancoModalOpen, setIsNewBancoModalOpen] = useState(false);
  const [isEditBancoModalOpen, setIsEditBancoModalOpen] = useState(false);
  const [editingBanco, setEditingBanco] = useState<VendedorBanco | null>(null);
  const [bancoFormData, setBancoFormData] = useState({
    banco: '',
    agencia: '',
    conta: '',
    tipo: 1, // 1 = Conta Corrente, 2 = Conta Poupança
    preferencial: false,
  });
  
  // Estados para regiões/zonas
  const [regioes, setRegioes] = useState<VendedorRegiao[]>([]);
  const [isNewRegiaoModalOpen, setIsNewRegiaoModalOpen] = useState(false);
  const [selectedRegiaoId, setSelectedRegiaoId] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    apelido: '',
    nome: '',
    endereco: '',
    cep: '',
    bairro: '',
    cidade: '',
    uf: 0,
    celular: '',
    telefone: '',
    ramal: '',
    comissao: 0,
    email: '',
    rg: '',
    cpf: '',
    status: true,
  });

  const queryClient = useQueryClient();

  // Funções para gerenciar dados bancários
  const loadBancos = async (vendedorId: number) => {
    try {
      const bancosData = await fetchVendedorBancos(vendedorId);
      setBancos(bancosData);
    } catch (error) {
      console.error('Erro ao carregar bancos:', error);
      setBancos([]);
    }
  };

  const resetBancoForm = () => {
    setBancoFormData({
      banco: '',
      agencia: '',
      conta: '',
      tipo: 1,
      preferencial: false,
    });
  };

  const {
    data: vendedores = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['vendedores'],
    queryFn: fetchVendedores,
  });

  // Query para buscar regiões/zonas disponíveis
  const { data: regioesZonasDisponiveis = [] } = useQuery({
    queryKey: ['regioesZonas'],
    queryFn: fetchRegioesZonas,
  });

  const createMutation = useMutation({
    mutationFn: createVendedor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendedores'] });
      setIsNewVendedorModalOpen(false);
      setFormData({
        apelido: '',
        nome: '',
        endereco: '',
        cep: '',
        bairro: '',
        cidade: '',
        uf: 0,
        celular: '',
        telefone: '',
        ramal: '',
        comissao: 0,
        email: '',
        rg: '',
        cpf: '',
        status: true,
      });
      toast.success('Vendedor criado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao criar vendedor: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Vendedor, 'id'> }) => 
      updateVendedor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendedores'] });
      setIsEditVendedorModalOpen(false);
      setEditingVendedor(null);
      toast.success('Vendedor atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar vendedor: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVendedor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendedores'] });
      setIsDeleteConfirmModalOpen(false);
      setDeletingVendedor(null);
      toast.success('Vendedor excluído com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao excluir vendedor: ${error.message}`);
    },
  });

  // Mutations para dados bancários
  const createBancoMutation = useMutation({
    mutationFn: ({ vendedorId, data }: { vendedorId: number; data: Omit<VendedorBanco, 'id' | 'fk_vendedor'> }) =>
      createVendedorBanco(vendedorId, data),
    onSuccess: () => {
      if (editingVendedor) {
        queryClient.invalidateQueries({ queryKey: ['vendedor-bancos', editingVendedor.id] });
        loadBancos(editingVendedor.id);
      }
      setIsNewBancoModalOpen(false);
      resetBancoForm();
      toast.success('Dados bancários criados com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao criar dados bancários: ${error.message}`);
    },
  });

  const updateBancoMutation = useMutation({
    mutationFn: ({ vendedorId, bancoId, data }: { vendedorId: number; bancoId: number; data: Omit<VendedorBanco, 'id' | 'fk_vendedor'> }) =>
      updateVendedorBanco(vendedorId, bancoId, data),
    onSuccess: () => {
      if (editingVendedor) {
        queryClient.invalidateQueries({ queryKey: ['vendedor-bancos', editingVendedor.id] });
        loadBancos(editingVendedor.id);
      }
      setIsEditBancoModalOpen(false);
      setEditingBanco(null);
      resetBancoForm();
      toast.success('Dados bancários atualizados com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar dados bancários: ${error.message}`);
    },
  });

  const deleteBancoMutation = useMutation({
    mutationFn: ({ vendedorId, bancoId }: { vendedorId: number; bancoId: number }) =>
      deleteVendedorBanco(vendedorId, bancoId),
    onSuccess: () => {
      if (editingVendedor) {
        queryClient.invalidateQueries({ queryKey: ['vendedor-bancos', editingVendedor.id] });
        loadBancos(editingVendedor.id);
      }
      toast.success('Dados bancários excluídos com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao excluir dados bancários: ${error.message}`);
    },
  });

  // Mutations para regiões/zonas
  const createRegiaoMutation = useMutation({
    mutationFn: ({ vendedorId, regiaoId }: { vendedorId: number; regiaoId: number }) =>
      createVendedorRegiao(vendedorId, regiaoId),
    onSuccess: () => {
      if (editingVendedor) {
        queryClient.invalidateQueries({ queryKey: ['vendedor-regioes', editingVendedor.id] });
        loadRegioes(editingVendedor.id);
      }
      setIsNewRegiaoModalOpen(false);
      setSelectedRegiaoId(0);
      toast.success('Região associada com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao associar região: ${error.message}`);
    },
  });

  const deleteRegiaoMutation = useMutation({
    mutationFn: ({ vendedorId, regiaoId }: { vendedorId: number; regiaoId: number }) =>
      deleteVendedorRegiao(vendedorId, regiaoId),
    onSuccess: () => {
      if (editingVendedor) {
        queryClient.invalidateQueries({ queryKey: ['vendedor-regioes', editingVendedor.id] });
        loadRegioes(editingVendedor.id);
      }
      toast.success('Associação de região removida com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao remover associação de região: ${error.message}`);
    },
  });

  // Funções para gerenciar regiões/zonas
  const loadRegioes = async (vendedorId: number) => {
    try {
      const regioesData = await fetchVendedorRegioes(vendedorId);
      setRegioes(regioesData);
    } catch (error) {
      console.error('Erro ao carregar regiões:', error);
      setRegioes([]);
    }
  };

  const handleRegiaoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingVendedor || !selectedRegiaoId) return;
    
    // Verificar se a região já está associada
    const regiaoJaAssociada = regioes.some(r => r.regiao === selectedRegiaoId);
    if (regiaoJaAssociada) {
      toast.error('Esta região já está associada ao vendedor');
      return;
    }

    createRegiaoMutation.mutate({
      vendedorId: editingVendedor.id,
      regiaoId: selectedRegiaoId,
    });
  };

  const handleDeleteRegiao = (regiaoId: number) => {
    if (!editingVendedor) return;
    
    if (confirm('Tem certeza de que deseja remover esta associação de região?')) {
      deleteRegiaoMutation.mutate({
        vendedorId: editingVendedor.id,
        regiaoId: regiaoId,
      });
    }
  };

  const handleCloseRegiaoModal = () => {
    setIsNewRegiaoModalOpen(false);
    setSelectedRegiaoId(0);
  };

  const handleBancoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingVendedor) return;
    
    if (!bancoFormData.banco.trim() || !bancoFormData.agencia.trim() || !bancoFormData.conta.trim()) {
      toast.error('Banco, agência e conta são obrigatórios');
      return;
    }

    const data = {
      banco: bancoFormData.banco.trim(),
      agencia: bancoFormData.agencia.trim(),
      conta: bancoFormData.conta.trim(),
      tipo: bancoFormData.tipo,
      preferencial: bancoFormData.preferencial,
    };

    if (editingBanco && editingBanco.id) {
      updateBancoMutation.mutate({
        vendedorId: editingVendedor.id,
        bancoId: editingBanco.id,
        data,
      });
    } else {
      createBancoMutation.mutate({
        vendedorId: editingVendedor.id,
        data,
      });
    }
  };

  const handleEditBanco = (banco: VendedorBanco) => {
    setEditingBanco(banco);
    setBancoFormData({
      banco: banco.banco,
      agencia: banco.agencia,
      conta: banco.conta,
      tipo: banco.tipo,
      preferencial: banco.preferencial,
    });
    setIsEditBancoModalOpen(true);
  };

  const handleDeleteBanco = (banco: VendedorBanco) => {
    if (!editingVendedor || !banco.id) return;
    
    if (confirm('Tem certeza de que deseja excluir estes dados bancários?')) {
      deleteBancoMutation.mutate({
        vendedorId: editingVendedor.id,
        bancoId: banco.id,
      });
    }
  };

  const handleCloseBancoModal = () => {
    setIsNewBancoModalOpen(false);
    setIsEditBancoModalOpen(false);
    setEditingBanco(null);
    resetBancoForm();
  };

  // Verificações de duplicatas em tempo real
  const vendedorDuplicado = (formData.cpf.trim() || formData.email.trim()) && vendedores.some(
    (v) => (
      (v.cpf?.toLowerCase().trim() === formData.cpf.toLowerCase().trim() ||
       v.email?.toLowerCase().trim() === formData.email.toLowerCase().trim()) &&
      v.id !== editingVendedor?.id
    )
  );

  const formValido = formData.nome.trim() && !vendedorDuplicado;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (formData.apelido && formData.apelido.length > 20) {
      toast.error('O apelido deve ter no máximo 20 caracteres');
      return;
    }

    if (formData.nome.length > 60) {
      toast.error('O nome deve ter no máximo 60 caracteres');
      return;
    }

    if (formData.email && formData.email.length > 120) {
      toast.error('O e-mail deve ter no máximo 120 caracteres');
      return;
    }

    // Verificar duplicatas de CPF e email
    const vendedorExistente = vendedores.find(
      (v) => (
        (v.cpf?.toLowerCase().trim() === formData.cpf.toLowerCase().trim() ||
         v.email?.toLowerCase().trim() === formData.email.toLowerCase().trim()) &&
        v.id !== editingVendedor?.id
      )
    );

    if (vendedorExistente) {
      toast.error('Este CPF ou e-mail já existe no sistema');
      return;
    }

    const data = {
      apelido: formData.apelido.trim() || undefined,
      nome: formData.nome.trim(),
      endereco: formData.endereco.trim() || undefined,
      cep: formData.cep.trim() || undefined,
      bairro: formData.bairro.trim() || undefined,
      cidade: formData.cidade.trim() || undefined,
      uf: formData.uf || undefined,
      celular: formData.celular.trim() || undefined,
      telefone: formData.telefone.trim() || undefined,
      ramal: formData.ramal.trim() || undefined,
      comissao: formData.comissao || undefined,
      email: formData.email.trim() || undefined,
      rg: formData.rg.trim() || undefined,
      cpf: formData.cpf.trim() || undefined,
      status: formData.status,
    };

    if (editingVendedor) {
      updateMutation.mutate({
        id: editingVendedor.id,
        data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEditVendedor = (vendedor: Vendedor) => {
    setEditingVendedor(vendedor);
    setFormData({
      apelido: vendedor.apelido || '',
      nome: vendedor.nome || '',
      endereco: vendedor.endereco || '',
      cep: vendedor.cep || '',
      bairro: vendedor.bairro || '',
      cidade: vendedor.cidade || '',
      uf: vendedor.uf || 0,
      celular: vendedor.celular || '',
      telefone: vendedor.telefone || '',
      ramal: vendedor.ramal || '',
      comissao: vendedor.comissao || 0,
      email: vendedor.email || '',
      rg: vendedor.rg || '',
      cpf: vendedor.cpf || '',
      status: vendedor.status,
    });
    
    // Carregar dados bancários do vendedor
    loadBancos(vendedor.id);
    
    // Carregar regiões do vendedor
    loadRegioes(vendedor.id);
    
    setIsEditVendedorModalOpen(true);
  };

  const handleDeleteVendedor = (vendedor: Vendedor) => {
    setDeletingVendedor(vendedor);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingVendedor) {
      deleteMutation.mutate(deletingVendedor.id);
    }
  };

  const handleCloseModal = () => {
    setIsNewVendedorModalOpen(false);
    setIsEditVendedorModalOpen(false);
    setEditingVendedor(null);
    setFormData({
      apelido: '',
      nome: '',
      endereco: '',
      cep: '',
      bairro: '',
      cidade: '',
      uf: 0,
      celular: '',
      telefone: '',
      ramal: '',
      comissao: 0,
      email: '',
      rg: '',
      cpf: '',
      status: true,
    });
  };

  const filteredVendedores = vendedores.filter((vendedor) => {
    const matchesSearch = 
      vendedor.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendedor.apelido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendedor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendedor.cpf?.includes(searchTerm);
    
    const matchesStatus = showOnlyActive ? vendedor.status === true : true;
    
    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Erro ao carregar vendedores. Tente novamente.
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                className="ml-2"
              >
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>Cadastro de Vendedores</CardTitle>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showOnlyActive}
                  onCheckedChange={setShowOnlyActive}
                  size="sm"
                />
                <span className="text-sm text-muted-foreground">
                  {showOnlyActive ? 'Apenas ativos' : 'Todos'}
                </span>
              </div>
            </div>
          </div>
          <CardDescription>
            Gerencie os vendedores do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, apelido, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setIsNewVendedorModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Vendedor
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Apelido</TableHead>
                  <TableHead>Celular</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredVendedores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'Nenhum vendedor encontrado com os critérios de busca.' : 'Nenhum vendedor cadastrado.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVendedores.map((vendedor) => (
                    <TableRow key={vendedor.id}>
                      <TableCell className="font-medium">{vendedor.nome || '-'}</TableCell>
                      <TableCell>{vendedor.apelido || '-'}</TableCell>
                      <TableCell>{vendedor.celular || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={vendedor.status ? "success" : "destructive"}>
                          {vendedor.status ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditVendedor(vendedor)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVendedor(vendedor)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Novo/Editar Vendedor */}
      <Dialog open={isNewVendedorModalOpen || isEditVendedorModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <DialogHeader>
            <DialogTitle>
              {editingVendedor ? 'Editar Vendedor' : 'Novo Vendedor'}
            </DialogTitle>
            <DialogDescription>
              {editingVendedor 
                ? 'Altere as informações do vendedor abaixo.' 
                : 'Preencha as informações do novo vendedor.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="scrollbar-hide">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4 scrollbar-hide">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  maxLength={60}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apelido">Apelido</Label>
                <Input
                  id="apelido"
                  value={formData.apelido}
                  onChange={(e) => setFormData(prev => ({ ...prev, apelido: e.target.value }))}
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  maxLength={120}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                  maxLength={18}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={formData.rg}
                  onChange={(e) => setFormData(prev => ({ ...prev, rg: e.target.value }))}
                  maxLength={12}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="celular">Celular</Label>
                <Input
                  id="celular"
                  value={formData.celular}
                  onChange={(e) => setFormData(prev => ({ ...prev, celular: e.target.value }))}
                  maxLength={16}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  maxLength={16}
                  placeholder="(00) 0000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ramal">Ramal</Label>
                <Input
                  id="ramal"
                  value={formData.ramal}
                  onChange={(e) => setFormData(prev => ({ ...prev, ramal: e.target.value }))}
                  maxLength={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comissao">Comissão (%)</Label>
                <Input
                  id="comissao"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.comissao}
                  onChange={(e) => setFormData(prev => ({ ...prev, comissao: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                  maxLength={60}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                  maxLength={10}
                  placeholder="00000-000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                  maxLength={60}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uf">UF (Código)</Label>
                <Input
                  id="uf"
                  type="number"
                  value={formData.uf}
                  onChange={(e) => setFormData(prev => ({ ...prev, uf: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="status"
                    checked={formData.status}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked }))}
                  />
                  <Label htmlFor="status">Ativo</Label>
                </div>
              </div>
            </div>

            {/* Seção de Dados Bancários - apenas para edição */}
            {editingVendedor && (
              <div className="mt-6 border-t pt-6 scrollbar-hide">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Dados Bancários</h3>
                    <p className="text-sm text-muted-foreground">
                      Gerencie as contas bancárias do vendedor
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewBancoModalOpen(true)}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Adicionar Conta
                  </Button>
                </div>

                {bancos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    Nenhum dado bancário cadastrado
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bancos.map((banco) => (
                      <div
                        key={banco.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{banco.banco}</span>
                            {banco.preferencial && (
                              <Badge variant="success" className="text-xs">
                                Preferencial
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {banco.tipo === 1 ? 'Conta Corrente' : 'Conta Poupança'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Ag: {banco.agencia} • Conta: {banco.conta}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditBanco(banco)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBanco(banco)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Seção de Regiões e Zonas - apenas para edição */}
            {editingVendedor && (
              <div className="mt-6 border-t pt-6 scrollbar-hide">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Regiões e Zonas</h3>
                    <p className="text-sm text-muted-foreground">
                      Gerencie as regiões associadas ao vendedor
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewRegiaoModalOpen(true)}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Associar Região
                  </Button>
                </div>

                {regioes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    Nenhuma região associada
                  </div>
                ) : (
                  <div className="space-y-3">
                    {regioes.map((regiao) => (
                      <div
                        key={regiao.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {regiao.tremonte_regiao_zona?.descricao_regiao || 'Região não encontrada'}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {regiao.tremonte_regiao_zona?.codigo_regiao || 'N/A'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Zona: {regiao.tremonte_regiao_zona?.descricao_zona_estatica || 'N/A'} • 
                            Código: {regiao.tremonte_regiao_zona?.codigo_zona || 'N/A'}
                          </div>
                          {regiao.tremonte_regiao_zona?.descricao_reduzida && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {regiao.tremonte_regiao_zona.descricao_reduzida}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => regiao.regiao && handleDeleteRegiao(regiao.regiao)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {vendedorDuplicado && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  ⚠️ Já existe um vendedor com este CPF ou e-mail.
                </p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!formValido || createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending 
                  ? 'Salvando...' 
                  : editingVendedor ? 'Atualizar' : 'Criar'
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmação Exclusão */}
      <Dialog open={isDeleteConfirmModalOpen} onOpenChange={() => setIsDeleteConfirmModalOpen(false)}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir este vendedor? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {deletingVendedor && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Vendedor a ser excluído:</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Nome:</strong> {deletingVendedor.nome}</p>
                  <p><strong>Apelido:</strong> {deletingVendedor.apelido || 'Não informado'}</p>
                  <p><strong>E-mail:</strong> {deletingVendedor.email || 'Não informado'}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteConfirmModalOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Dados Bancários */}
      <Dialog open={isNewBancoModalOpen || isEditBancoModalOpen} onOpenChange={handleCloseBancoModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {editingBanco ? 'Editar Dados Bancários' : 'Novos Dados Bancários'}
            </DialogTitle>
            <DialogDescription>
              {editingBanco 
                ? 'Altere as informações bancárias abaixo.' 
                : 'Preencha as informações da conta bancária.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBancoSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="banco">Banco *</Label>
                <Input
                  id="banco"
                  value={bancoFormData.banco}
                  onChange={(e) => setBancoFormData(prev => ({ ...prev, banco: e.target.value }))}
                  maxLength={30}
                  placeholder="Nome do banco"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agencia">Agência *</Label>
                  <Input
                    id="agencia"
                    value={bancoFormData.agencia}
                    onChange={(e) => setBancoFormData(prev => ({ ...prev, agencia: e.target.value }))}
                    maxLength={7}
                    placeholder="0000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conta">Conta *</Label>
                  <Input
                    id="conta"
                    value={bancoFormData.conta}
                    onChange={(e) => setBancoFormData(prev => ({ ...prev, conta: e.target.value }))}
                    maxLength={10}
                    placeholder="00000-0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Conta</Label>
                <Select
                  value={bancoFormData.tipo.toString()}
                  onValueChange={(value) => setBancoFormData(prev => ({ ...prev, tipo: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Conta Corrente</SelectItem>
                    <SelectItem value="2">Conta Poupança</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="preferencial"
                    checked={bancoFormData.preferencial}
                    onCheckedChange={(checked) => setBancoFormData(prev => ({ ...prev, preferencial: checked }))}
                  />
                  <Label htmlFor="preferencial">Conta Preferencial</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Apenas uma conta pode ser marcada como preferencial
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseBancoModal}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createBancoMutation.isPending || updateBancoMutation.isPending}
              >
                {createBancoMutation.isPending || updateBancoMutation.isPending 
                  ? 'Salvando...' 
                  : editingBanco ? 'Atualizar' : 'Criar'
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Associar Região */}
      <Dialog open={isNewRegiaoModalOpen} onOpenChange={handleCloseRegiaoModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Associar Região ao Vendedor</DialogTitle>
            <DialogDescription>
              Selecione uma região para associar ao vendedor.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegiaoSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="regiao">Região/Zona *</Label>
                <Select
                  value={selectedRegiaoId.toString()}
                  onValueChange={(value) => setSelectedRegiaoId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma região" />
                  </SelectTrigger>
                  <SelectContent>
                    {regioesZonasDisponiveis
                      .filter(rz => !regioes.some(r => r.regiao === rz.id))
                      .map((regiaoZona) => (
                        <SelectItem key={regiaoZona.id} value={regiaoZona.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {regiaoZona.descricao_regiao} ({regiaoZona.codigo_regiao})
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Zona: {regiaoZona.descricao_zona_estatica} ({regiaoZona.codigo_zona})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {regioesZonasDisponiveis.filter(rz => !regioes.some(r => r.regiao === rz.id)).length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Todas as regiões disponíveis já estão associadas ao vendedor
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseRegiaoModal}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!selectedRegiaoId || createRegiaoMutation.isPending}
              >
                {createRegiaoMutation.isPending ? 'Associando...' : 'Associar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 