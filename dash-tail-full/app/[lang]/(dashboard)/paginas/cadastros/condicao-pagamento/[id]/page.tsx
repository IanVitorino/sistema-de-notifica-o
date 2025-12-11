'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClienteAutocomplete } from '../../../relatorios/components/ClienteAutocomplete'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Cliente {
  id: number
  fantasia?: string
  razao_social?: string
  cnpj?: string
}

interface Fabricante {
  id: number
  nome?: string
  fantasia?: string
  razao_social?: string
}

interface Transportadora {
  id: number
  nome?: string
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

export default function CondicaoPagamentoFormPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const isNew = id === 'new'

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [fabricantes, setFabricantes] = useState<Fabricante[]>([])
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([])
  const [condicao, setCondicao] = useState<CondicaoPagamento>({
    id: 0,
    fk_cliente: null,
    fk_fabrica: null,
    fk_transportadora: null,
    cond_1: null,
    cond_100: null,
    cond_2: null,
    cond_3: null,
    cond_4: null,
    cond_5: null,
    descontos_1: null,
    descontos_2: null,
    descontos_3: null,
    descontos_4: null,
    descontos_5: null,
    observacao: null,
    codigo_cliente_fabrica: null,
    desconto_ds: null,
    lista_preco_ds: null,
    codigo_transportadora_fabrica: null,
    cod_cond_pagamento: null
  })

  // Carregar dados iniciais
  useEffect(() => {
    fetchFabricantes()
    fetchTransportadoras()
    
    if (!isNew) {
      fetchCondicao(parseInt(id))
    } else {
      // Quando for uma nova condição, verificar cliente na URL
      const urlParams = new URLSearchParams(window.location.search);
      const clienteId = urlParams.get('clienteId');
      
      if (clienteId) {
        // Se tiver clienteId na URL, buscar o cliente
        fetchCliente(parseInt(clienteId))
          .then(cliente => {
            if (cliente) {
              setClienteSelecionado(cliente)
              updateCondicao('fk_cliente', cliente.id)
            }
          })
      } else {
        // Se não tiver na URL, tentar pegar do localStorage
        const savedClienteStr = localStorage.getItem('condicoesPagamento_clienteSelecionado')
        if (savedClienteStr) {
          try {
            const savedCliente = JSON.parse(savedClienteStr) as Cliente
            setClienteSelecionado(savedCliente)
            updateCondicao('fk_cliente', savedCliente.id)
            // Salvar ID do último cliente para futura referência
            localStorage.setItem('lastSelectedClienteId', savedCliente.id.toString())
          } catch (error) {
            console.error('Erro ao recuperar cliente do localStorage:', error)
          }
        }
      }
    }
  }, [id, isNew])

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

  // Função para buscar uma condição específica
  const fetchCondicao = async (condicaoId: number) => {
    setLoading(true)
    try {
      // Log para debug
      console.log(`Buscando condição de pagamento com ID: ${condicaoId}`)
      
      const response = await fetch(`/api/paginas/cadastros/condicao-pagamento/${condicaoId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Dados recebidos da API:', data)
        
        if (!data || Object.keys(data).length === 0) {
          console.error('API retornou dados vazios')
          toast.error('Erro ao buscar dados: resposta vazia')
          return
        }
        
        // Ajustar as propriedades de acordo com o que a API retorna
        // A API retorna tremonte_cliente, tremonte_fabricante e tremonte_transportadora
        const condicaoAjustada: CondicaoPagamento = {
          ...data,
          cliente: data.tremonte_cliente,
          fabricante: data.tremonte_fabricante,
          transportadora: data.tremonte_transportadora
        }
        
        // Atualizar o estado da condição com os dados recebidos
        setCondicao(condicaoAjustada)
        
        // Se a condição tiver um cliente, buscar os dados do cliente
        if (data.tremonte_cliente) {
          console.log('Cliente encontrado nos dados:', data.tremonte_cliente)
          setClienteSelecionado(data.tremonte_cliente)
        } else if (data.fk_cliente) {
          console.log('Buscando cliente pelo ID:', data.fk_cliente)
          await fetchCliente(data.fk_cliente)
        } else {
          console.error('Nenhum cliente associado à condição')
          toast.error('Condição sem cliente associado')
        }
      } else {
        const errorText = await response.text()
        console.error('Erro na resposta da API:', response.status, errorText)
        toast.error(`Erro ao buscar dados da condição de pagamento (${response.status})`)
        router.push('/paginas/cadastros/condicao-pagamento')
      }
    } catch (error) {
      console.error('Exceção ao buscar condição de pagamento:', error)
      toast.error('Erro ao carregar dados da condição de pagamento')
    } finally {
      setLoading(false)
    }
  }

  // Função para buscar dados de um cliente específico
  const fetchCliente = async (clienteId: number) => {
    try {
      const response = await fetch(`/api/paginas/cadastros/cliente/${clienteId}`)
      if (response.ok) {
        const data = await response.json()
        setClienteSelecionado(data)
        updateCondicao('fk_cliente', data.id)
        return data
      }
      return null
    } catch (error) {
      console.error('Erro ao buscar dados do cliente:', error)
      return null
    }
  }

  // Atualizar campo da condição
  const updateCondicao = (field: keyof CondicaoPagamento, value: any) => {
    setCondicao({ ...condicao, [field]: value })
  }

  // Salvar condição de pagamento
  const handleSalvar = async () => {
    if (!condicao.fk_cliente) {
      toast.error('Cliente é obrigatório')
      return
    }

    setSaving(true)
    try {
      const method = isNew ? 'POST' : 'PUT'
      const url = isNew 
        ? '/api/paginas/cadastros/condicao-pagamento'
        : `/api/paginas/cadastros/condicao-pagamento/${condicao.id}`

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(condicao)
      })

      if (response.ok) {
        toast.success(isNew ? 'Condição criada com sucesso!' : 'Condição atualizada com sucesso!')
        
        // Adicionar um timestamp para forçar a atualização da tabela quando voltar
        localStorage.setItem('condicoesPagamento_lastUpdate', Date.now().toString())
        
        // Definir flag para indicar que está retornando da edição
        localStorage.setItem('condicoesPagamento_returnFromEdit', 'true')
        
        // Garantir que o cliente seja salvo no localStorage
        if (clienteSelecionado) {
          console.log('Salvando cliente ao salvar condição:', clienteSelecionado);
          localStorage.setItem('condicoesPagamento_clienteSelecionado', JSON.stringify(clienteSelecionado))
        }
        
        router.push('/paginas/cadastros/condicao-pagamento')
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao salvar condição de pagamento')
      }
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro ao salvar a condição de pagamento')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-2 px-6">
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-2xl font-bold">
              {isNew ? 'Nova Condição' : 'Editar Condição'}
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  // Definir flag para indicar que está retornando da edição
                  localStorage.setItem('condicoesPagamento_returnFromEdit', 'true')
                  
                  // Garantir que o cliente atual seja salvo no localStorage
                  if (clienteSelecionado) {
                    console.log('Salvando cliente ao voltar:', clienteSelecionado);
                    localStorage.setItem('condicoesPagamento_clienteSelecionado', JSON.stringify(clienteSelecionado))
                  }
                  
                  router.push('/paginas/cadastros/condicao-pagamento')
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button 
                size="sm" 
                onClick={handleSalvar}
                disabled={saving || !condicao.fk_cliente}
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <p>Carregando dados...</p>
            </div>
          ) : (
            <Tabs defaultValue="geral" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="geral">Dados Gerais</TabsTrigger>
                <TabsTrigger value="condicoes">Condições e Descontos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="geral">
                <div className="grid gap-4 md:grid-cols-1">
                  <div>
                    <Label htmlFor="cliente">Cliente *</Label>
                    <div className="mt-1">
                      <ClienteAutocomplete
                        value={clienteSelecionado}
                        onSelect={(cliente: Cliente | null) => {
                          setClienteSelecionado(cliente)
                          updateCondicao('fk_cliente', cliente?.id || null)
                        }}
                        disabled={true} // Cliente sempre bloqueado para edição
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="fabricante">Fabricante</Label>
                    <div className="relative">
                      <Select 
                        value={condicao.fk_fabrica?.toString() || undefined} 
                        onValueChange={(value) => updateCondicao('fk_fabrica', value ? parseInt(value) : null)}
                        disabled={!isNew} // Desabilitar quando não for nova condição
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um fabricante" />
                        </SelectTrigger>
                        <SelectContent>
                          {fabricantes.map((fabricante) => (
                            <SelectItem key={fabricante.id} value={fabricante.id.toString()}>
                              {fabricante.nome || fabricante.fantasia || fabricante.razao_social}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {condicao.fk_fabrica && isNew && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-8 top-0 h-10 w-10 p-0"
                          onClick={() => updateCondicao('fk_fabrica', null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="transportadora">Transportadora</Label>
                    <div className="relative">
                      <Select 
                        value={condicao.fk_transportadora?.toString() || undefined} 
                        onValueChange={(value) => updateCondicao('fk_transportadora', value ? parseInt(value) : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma transportadora" />
                        </SelectTrigger>
                        <SelectContent>
                          {transportadoras.map((transportadora) => (
                            <SelectItem key={transportadora.id} value={transportadora.id.toString()}>
                              {transportadora.nome || transportadora.fantasia}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {condicao.fk_transportadora && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-8 top-0 h-10 w-10 p-0"
                          onClick={() => updateCondicao('fk_transportadora', null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
          <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <Label htmlFor="cod_cond_pagamento">Código da Condição</Label>
                    <Input
                      id="cod_cond_pagamento"
                      value={condicao.cod_cond_pagamento || ''}
                      onChange={(e) => updateCondicao('cod_cond_pagamento', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="codigo_cliente_fabrica">Código Cliente na Fábrica</Label>
                    <Input
                      id="codigo_cliente_fabrica"
                      value={condicao.codigo_cliente_fabrica || ''}
                      onChange={(e) => updateCondicao('codigo_cliente_fabrica', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="codigo_transportadora_fabrica">Código Transportadora na Fábrica</Label>
                    <Input
                      id="codigo_transportadora_fabrica"
                      value={condicao.codigo_transportadora_fabrica || ''}
                      onChange={(e) => updateCondicao('codigo_transportadora_fabrica', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="lista_preco_ds">Lista de Preço (DS)</Label>
                    <Input
                      id="lista_preco_ds"
                      value={condicao.lista_preco_ds || ''}
                      onChange={(e) => updateCondicao('lista_preco_ds', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="desconto_ds">Desconto (DS)</Label>
                    <Input
                      id="desconto_ds"
                      value={condicao.desconto_ds || ''}
                      onChange={(e) => updateCondicao('desconto_ds', e.target.value)}
                    />
                  </div>
                </div>
          </div>

                <div className="mt-4">
                  <Label htmlFor="observacao">Observações</Label>
                  <Textarea
                    id="observacao"
                    value={condicao.observacao || ''}
                    onChange={(e) => updateCondicao('observacao', e.target.value)}
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="condicoes">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Condições de Pagamento</h3>
                    <div className="grid gap-4 md:grid-cols-5">
                      <div>
                        <Label htmlFor="cond_1">Condição 1</Label>
                        <Input
                          id="cond_1"
                          value={condicao.cond_1 || ''}
                          onChange={(e) => updateCondicao('cond_1', e.target.value)}
                        />
                      </div>

                     <div>
                        <Label htmlFor="cond_2">Condição 2</Label>
                        <Input
                          id="cond_2"
                          type="number"
                          value={condicao.cond_2 ?? ''}
                          onChange={(e) => updateCondicao('cond_2', e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cond_3">Condição 3</Label>
                        <Input
                          id="cond_3"
                          type="number"
                          value={condicao.cond_3 ?? ''}
                          onChange={(e) => updateCondicao('cond_3', e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cond_4">Condição 4</Label>
                        <Input
                          id="cond_4"
                          type="number"
                          value={condicao.cond_4 ?? ''}
                          onChange={(e) => updateCondicao('cond_4', e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cond_5">Condição 5</Label>
                        <Input
                          id="cond_5"
                          type="number"
                          value={condicao.cond_5 ?? ''}
                          onChange={(e) => updateCondicao('cond_5', e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cond_100">Condição 100</Label>
                        <Input
                          id="cond_100"
                          type="number"
                          value={condicao.cond_100 ?? ''}
                          onChange={(e) => updateCondicao('cond_100', e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </div>

 
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Descontos (%)</h3>
                    <div className="grid gap-4 md:grid-cols-5">
                      <div>
                        <Label htmlFor="descontos_1">Desconto 1</Label>
                        <Input
                          id="descontos_1"
                          type="number"
                          step="0.01"
                          value={condicao.descontos_1 ?? ''}
                          onChange={(e) => updateCondicao('descontos_1', e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="descontos_2">Desconto 2</Label>
                        <Input
                          id="descontos_2"
                          type="number"
                          step="0.01"
                          value={condicao.descontos_2 ?? ''}
                          onChange={(e) => updateCondicao('descontos_2', e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="descontos_3">Desconto 3</Label>
                        <Input
                          id="descontos_3"
                          type="number"
                          step="0.01"
                          value={condicao.descontos_3 ?? ''}
                          onChange={(e) => updateCondicao('descontos_3', e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="descontos_4">Desconto 4</Label>
                        <Input
                          id="descontos_4"
                          type="number"
                          step="0.01"
                          value={condicao.descontos_4 ?? ''}
                          onChange={(e) => updateCondicao('descontos_4', e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="descontos_5">Desconto 5</Label>
                        <Input
                          id="descontos_5"
                          type="number"
                          step="0.01"
                          value={condicao.descontos_5 ?? ''}
                          onChange={(e) => updateCondicao('descontos_5', e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 