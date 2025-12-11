'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, Pencil, Trash2, Filter } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ClienteAutocomplete } from '../../relatorios/components/ClienteAutocomplete'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'

interface Cliente {
  id: number
  fantasia?: string
  razao_social?: string
  cnpj?: string
}

interface Fabricante {
  id: number
  nome: string
  fantasia?: string
  razao_social?: string
}

interface Transportadora {
  id: number
  nome: string
  fantasia?: string
}

interface CondicaoPagamento {
  id: number
  fk_cliente: number | null
  fk_fabrica: number | null
  fk_transportadora: number | null
  cond_1: string | null
  cond_100: number | null
  cond_2: number | null
  cond_3: number | null
  cond_4: number | null
  cond_5: number | null
  descontos_1: number | null
  descontos_2: number | null
  descontos_3: number | null
  descontos_4: number | null
  descontos_5: number | null
  observacao: string | null
  codigo_cliente_fabrica: string | null
  desconto_ds: string | null
  lista_preco_ds: string | null
  codigo_transportadora_fabrica: string | null
  cod_cond_pagamento: string | null
  cliente?: Cliente
  fabricante?: Fabricante
  transportadora?: Transportadora
}

export default function CondicoesPagamentoPage() {
  const router = useRouter()
  const [condicoes, setCondicoes] = useState<CondicaoPagamento[]>([])
  const [fabricantes, setFabricantes] = useState<Fabricante[]>([])
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentCondicao, setCurrentCondicao] = useState<CondicaoPagamento | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  // Verificar se há atualizações pendentes quando a página é carregada ou focada
  useEffect(() => {
    // Verificar atualizações ao carregar a página
    checkForUpdates()
    
    // Verificar atualizações quando a janela recebe foco (usuário volta para a página)
    const handleFocus = () => checkForUpdates()
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // Função para verificar atualizações
  const checkForUpdates = () => {
    const storedLastUpdate = localStorage.getItem('condicoesPagamento_lastUpdate')
    
    if (storedLastUpdate && storedLastUpdate !== lastUpdate) {
      setLastUpdate(storedLastUpdate)
      if (clienteSelecionado) {
        // Pequeno atraso para garantir que o estado está atualizado
        setTimeout(() => fetchCondicoes(), 100)
      }
    }
  }

  // Buscar dados iniciais
  useEffect(() => {
    fetchFabricantes()
    fetchTransportadoras()
    
    // Sempre verificar se há um cliente salvo no localStorage
    const savedClienteStr = localStorage.getItem('condicoesPagamento_clienteSelecionado')
    console.log('Cliente salvo encontrado?', !!savedClienteStr);
    
    if (savedClienteStr) {
      try {
        const savedCliente = JSON.parse(savedClienteStr) as Cliente
        console.log('Cliente recuperado:', savedCliente);
        
        // Definir cliente e buscar condições imediatamente
        setClienteSelecionado(savedCliente)
        
        // Buscar condições do cliente imediatamente 
        setTimeout(() => {
          if (savedCliente && savedCliente.id) {
            console.log('Buscando condições para o cliente:', savedCliente.id);
            const fetchClienteCondicoes = async () => {
              setLoading(true);
              try {
                const response = await fetch(`/api/paginas/cadastros/condicao-pagamento?clienteId=${savedCliente.id}`);
                if (response.ok) {
                  const data = await response.json();
                  setCondicoes(data);
                  console.log('Condições recuperadas:', data.length);
                }
              } catch (error) {
                console.error('Erro ao buscar condições:', error);
              } finally {
                setLoading(false);
              }
            };
            fetchClienteCondicoes();
          }
        }, 100);
      } catch (error) {
        console.error('Erro ao recuperar cliente do localStorage:', error)
        localStorage.removeItem('condicoesPagamento_clienteSelecionado')
      }
    }
    
    // Verificar atualizações de dados
    const storedLastUpdate = localStorage.getItem('condicoesPagamento_lastUpdate')
    if (storedLastUpdate) {
      setLastUpdate(storedLastUpdate)
    }
  }, [])

  // Salvar cliente selecionado no localStorage quando mudar
  useEffect(() => {
    if (clienteSelecionado) {
      localStorage.setItem('condicoesPagamento_clienteSelecionado', JSON.stringify(clienteSelecionado))
      fetchCondicoes()
    } else {
      localStorage.removeItem('condicoesPagamento_clienteSelecionado')
      setCondicoes([])
    }
  }, [clienteSelecionado])

  // Função para buscar fabricantes
  const fetchFabricantes = async () => {
    try {
      const response = await fetch('/api/paginas/cadastros/fabricante')
      if (response.ok) {
        const data = await response.json()
        setFabricantes(data)
      } else {
        console.error('Erro ao buscar fabricantes')
      }
    } catch (error) {
      console.error('Erro ao buscar fabricantes:', error)
    }
  }

  // Função para buscar transportadoras
  const fetchTransportadoras = async () => {
    try {
      const response = await fetch('/api/paginas/parametros/transportadora')
      if (response.ok) {
        const data = await response.json()
        setTransportadoras(data)
      } else {
        console.error('Erro ao buscar transportadoras')
      }
    } catch (error) {
      console.error('Erro ao buscar transportadoras:', error)
    }
  }

  // Função para buscar condições de pagamento
  const fetchCondicoes = async () => {
    if (!clienteSelecionado) return
    
    setLoading(true)
    try {
      const url = `/api/paginas/cadastros/condicao-pagamento?clienteId=${clienteSelecionado.id}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setCondicoes(data)
      } else {
        console.error('Erro ao buscar condições de pagamento')
      }
    } catch (error) {
      console.error('Erro ao buscar condições de pagamento:', error)
    } finally {
      setLoading(false)
    }
  }

  // Abrir modal para criar nova condição
  const handleNovaCondicao = () => {
    if (clienteSelecionado && clienteSelecionado.id) {
      // Marcar que está indo para edição/cadastro
      localStorage.setItem('condicoesPagamento_returnFromEdit', 'true')
      // Incluir o ID do cliente como parâmetro na URL
      router.push(`/paginas/cadastros/condicao-pagamento/new?clienteId=${clienteSelecionado.id}`)
    } else {
      router.push('/paginas/cadastros/condicao-pagamento/new')
    }
  }

  // Abrir modal para editar condição
  const handleEditarCondicao = (condicao: CondicaoPagamento) => {
    // Marcar que está indo para edição/cadastro
    localStorage.setItem('condicoesPagamento_returnFromEdit', 'true')
    router.push(`/paginas/cadastros/condicao-pagamento/${condicao.id}`)
  }

  // Abrir modal para confirmar exclusão
  const handleConfirmarExclusao = (condicao: CondicaoPagamento) => {
    setCurrentCondicao(condicao)
    setIsDeleteDialogOpen(true)
  }

  // Salvar condição de pagamento (criar ou atualizar)
  const handleSalvarCondicao = async () => {
    if (!currentCondicao) return

    try {
      const method = currentCondicao.id ? 'PUT' : 'POST'
      const url = currentCondicao.id 
        ? `/api/paginas/cadastros/condicao-pagamento/${currentCondicao.id}`
        : '/api/paginas/cadastros/condicao-pagamento'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentCondicao)
      })

      if (response.ok) {
        toast.success(currentCondicao.id ? 'Condição atualizada com sucesso!' : 'Condição criada com sucesso!')
        setIsDialogOpen(false)
        fetchCondicoes()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao salvar condição de pagamento')
      }
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro ao salvar a condição de pagamento')
    }
  }

  // Excluir condição de pagamento
  const handleExcluirCondicao = async () => {
    if (!currentCondicao) return

    try {
      const response = await fetch(`/api/paginas/cadastros/condicao-pagamento/${currentCondicao.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Condição excluída com sucesso!')
        setIsDeleteDialogOpen(false)
        
        // Atualizar timestamp para indicar alteração nos dados
        const newTimestamp = Date.now().toString()
        localStorage.setItem('condicoesPagamento_lastUpdate', newTimestamp)
        setLastUpdate(newTimestamp)
        
        fetchCondicoes()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao excluir condição de pagamento')
      }
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro ao excluir a condição de pagamento')
    }
  }

  // Atualizar campo da condição atual
  const updateCurrentCondicao = (field: keyof CondicaoPagamento, value: any) => {
    if (currentCondicao) {
      setCurrentCondicao({ ...currentCondicao, [field]: value })
    }
  }

  // Formatar valor numérico para exibição
  const formatValue = (value: number | null): string => {
    if (value === null) return '-'
    return value.toString()
  }

  // Obter nome do fabricante pelo ID
  const getFabricanteName = (id: number | null) => {
    if (!id) return '-'
    const fabricante = fabricantes.find(f => f.id === id)
    return fabricante ? (fabricante.nome || fabricante.fantasia || fabricante.razao_social) : '-'
  }

  // Obter nome da transportadora pelo ID
  const getTransportadoraName = (id: number | null) => {
    if (!id) return '-'
    const transportadora = transportadoras.find(t => t.id === id)
    return transportadora ? (transportadora.nome || transportadora.fantasia) : '-'
  }

  return (
    <div className="container mx-auto py-2 px-6">
      <Card className="mb-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-2xl font-bold">Condições de Pagamento</CardTitle>
            <Button onClick={handleNovaCondicao} disabled={!clienteSelecionado}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Condição
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="cliente" className="mb-2 block">Cliente</Label>
              <ClienteAutocomplete
                value={clienteSelecionado}
                onSelect={(cliente: Cliente | null) => {
                  setClienteSelecionado(cliente)
                  // Se um cliente for selecionado, armazenar no localStorage para persistência
                  if (cliente) {
                    localStorage.setItem('condicoesPagamento_clienteSelecionado', JSON.stringify(cliente))
                    localStorage.setItem('condicoesPagamento_lastClientId', cliente.id.toString())
                  } else {
                    localStorage.removeItem('condicoesPagamento_clienteSelecionado')
                    localStorage.removeItem('condicoesPagamento_lastClientId')
                  }
                }}
                placeholder="Selecione um cliente para filtrar"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {!clienteSelecionado ? (
        <div className="flex justify-center items-center py-10 text-gray-500">
          <p>Selecione um cliente para visualizar suas condições de pagamento</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-10">
          <p>Carregando condições de pagamento...</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="h-10">
                
                <TableHead className="py-1">Fabricante</TableHead>
                <TableHead className="py-1">Código</TableHead>
                <TableHead className="py-1">Pagamento (%)</TableHead>
                <TableHead className="py-1">Descontos (%)</TableHead>
                <TableHead className="py-1">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {condicoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    {`Nenhuma condição de pagamento encontrada para o cliente ${clienteSelecionado.fantasia || clienteSelecionado.razao_social}`}
                  </TableCell>
                </TableRow>
              ) : (
                condicoes.map((condicao) => (
                  <TableRow key={condicao.id} className="h-8">
                    <TableCell className="py-1">{getFabricanteName(condicao.fk_fabrica)}</TableCell>
                    <TableCell className="py-1">{condicao.codigo_cliente_fabrica || '-'}</TableCell>
                    <TableCell className="py-1">{condicao.cond_1 + ' - ' + condicao.cond_2 + ' - ' + condicao.cond_3 + ' - ' + condicao.cond_4 + ' - ' + condicao.cond_5}</TableCell>
                    <TableCell className="py-1">{formatValue(condicao.descontos_1) + ' - ' + formatValue(condicao.descontos_2) + ' - ' + formatValue(condicao.descontos_3) + ' - ' + formatValue(condicao.descontos_4) + ' - ' + formatValue(condicao.descontos_5)}</TableCell>
                    <TableCell className="py-1">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleEditarCondicao(condicao)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleConfirmarExclusao(condicao)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal de Criar/Editar Condição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentCondicao?.id ? 'Editar' : 'Nova'} Condição de Pagamento</DialogTitle>
            <DialogDescription>
              Preencha os dados da condição de pagamento
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="cliente">Cliente</Label>
              <div className="mt-1">
                <ClienteAutocomplete
                  value={clienteSelecionado}
                  onSelect={(cliente: Cliente | null) => {
                    setClienteSelecionado(cliente)
                    updateCurrentCondicao('fk_cliente', cliente?.id || null)
                  }}
                  disabled={!!clienteSelecionado}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="fabricante">Fabricante</Label>
              <Select 
                value={currentCondicao?.fk_fabrica?.toString() || ''} 
                onValueChange={(value) => updateCurrentCondicao('fk_fabrica', value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fabricante" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Selecione...</SelectItem>
                  {fabricantes.map((fabricante) => (
                    <SelectItem key={fabricante.id} value={fabricante.id.toString()}>
                      {fabricante.nome || fabricante.fantasia || fabricante.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transportadora">Transportadora</Label>
              <Select 
                value={currentCondicao?.fk_transportadora?.toString() || ''} 
                onValueChange={(value) => updateCurrentCondicao('fk_transportadora', value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma transportadora" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Selecione...</SelectItem>
                  {transportadoras.map((transportadora) => (
                    <SelectItem key={transportadora.id} value={transportadora.id.toString()}>
                      {transportadora.nome || transportadora.fantasia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cod_cond_pagamento">Código da Condição</Label>
              <Input
                id="cod_cond_pagamento"
                value={currentCondicao?.cod_cond_pagamento || ''}
                onChange={(e) => updateCurrentCondicao('cod_cond_pagamento', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="codigo_cliente_fabrica">Código Cliente na Fábrica</Label>
              <Input
                id="codigo_cliente_fabrica"
                value={currentCondicao?.codigo_cliente_fabrica || ''}
                onChange={(e) => updateCurrentCondicao('codigo_cliente_fabrica', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="codigo_transportadora_fabrica">Código Transportadora na Fábrica</Label>
              <Input
                id="codigo_transportadora_fabrica"
                value={currentCondicao?.codigo_transportadora_fabrica || ''}
                onChange={(e) => updateCurrentCondicao('codigo_transportadora_fabrica', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="lista_preco_ds">Lista de Preço (DS)</Label>
              <Input
                id="lista_preco_ds"
                value={currentCondicao?.lista_preco_ds || ''}
                onChange={(e) => updateCurrentCondicao('lista_preco_ds', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="desconto_ds">Desconto (DS)</Label>
              <Input
                id="desconto_ds"
                value={currentCondicao?.desconto_ds || ''}
                onChange={(e) => updateCurrentCondicao('desconto_ds', e.target.value)}
              />
            </div>
          </div>

          <Separator className="my-4" />
          
          <h3 className="text-lg font-medium">Condições e Descontos</h3>
          
          <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
            <div>
              <Label htmlFor="cond_1">Condição 1</Label>
              <Input
                id="cond_1"
                value={currentCondicao?.cond_1 || ''}
                onChange={(e) => updateCurrentCondicao('cond_1', e.target.value)}
              />
            </div>


            <div>
              <Label htmlFor="cond_2">Condição 2</Label>
              <Input
                id="cond_2"
                type="number"
                value={currentCondicao?.cond_2 ?? ''}
                onChange={(e) => updateCurrentCondicao('cond_2', e.target.value ? parseInt(e.target.value) : null)}
              />
            </div>

            <div>
              <Label htmlFor="cond_3">Condição 3</Label>
              <Input
                id="cond_3"
                type="number"
                value={currentCondicao?.cond_3 ?? ''}
                onChange={(e) => updateCurrentCondicao('cond_3', e.target.value ? parseInt(e.target.value) : null)}
              />
            </div>

            <div>
              <Label htmlFor="cond_4">Condição 4</Label>
              <Input
                id="cond_4"
                type="number"
                value={currentCondicao?.cond_4 ?? ''}
                onChange={(e) => updateCurrentCondicao('cond_4', e.target.value ? parseInt(e.target.value) : null)}
              />
            </div>

            <div>
              <Label htmlFor="cond_5">Condição 5</Label>
              <Input
                id="cond_5"
                type="number"
                value={currentCondicao?.cond_5 ?? ''}
                onChange={(e) => updateCurrentCondicao('cond_5', e.target.value ? parseInt(e.target.value) : null)}
              />
            </div>
           <div>
              <Label htmlFor="cond_100">Condição 100</Label>
              <Input
                id="cond_100"
                type="number"
                value={currentCondicao?.cond_100 ?? ''}
                onChange={(e) => updateCurrentCondicao('cond_100', e.target.value ? parseInt(e.target.value) : null)}
              />
            </div>

            <div>
              <Label htmlFor="descontos_1">Desconto 1 (%)</Label>
              <Input
                id="descontos_1"
                type="number"
                step="0.01"
                value={currentCondicao?.descontos_1 ?? ''}
                onChange={(e) => updateCurrentCondicao('descontos_1', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>

            <div>
              <Label htmlFor="descontos_2">Desconto 2 (%)</Label>
              <Input
                id="descontos_2"
                type="number"
                step="0.01"
                value={currentCondicao?.descontos_2 ?? ''}
                onChange={(e) => updateCurrentCondicao('descontos_2', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>

            <div>
              <Label htmlFor="descontos_3">Desconto 3 (%)</Label>
              <Input
                id="descontos_3"
                type="number"
                step="0.01"
                value={currentCondicao?.descontos_3 ?? ''}
                onChange={(e) => updateCurrentCondicao('descontos_3', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>

            <div>
              <Label htmlFor="descontos_4">Desconto 4 (%)</Label>
              <Input
                id="descontos_4"
                type="number"
                step="0.01"
                value={currentCondicao?.descontos_4 ?? ''}
                onChange={(e) => updateCurrentCondicao('descontos_4', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>

            <div>
              <Label htmlFor="descontos_5">Desconto 5 (%)</Label>
              <Input
                id="descontos_5"
                type="number"
                step="0.01"
                value={currentCondicao?.descontos_5 ?? ''}
                onChange={(e) => updateCurrentCondicao('descontos_5', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="observacao">Observações</Label>
            <Textarea
              id="observacao"
              value={currentCondicao?.observacao || ''}
              onChange={(e) => updateCurrentCondicao('observacao', e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSalvarCondicao}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta condição de pagamento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleExcluirCondicao}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
