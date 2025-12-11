'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Produto {
  codigo: string | null;
  descricao: string | null;
}

interface ListaItem {
  id: number;
  fk_produto: number;
  preco: number;
  master: number;
  tremonte_produto: Produto;
}

interface Lista {
  id: number;
  nome_lista: string;
  fk_fabricante: number;
  tremonte_fabricante: {
    fantasia: string | null;
  };
  tremonte_lista_preco_item: ListaItem[];
}

async function fetchLista(id: string): Promise<Lista> {
  const response = await fetch(`/api/paginas/parametros/listas/${id}`);
  if (!response.ok) throw new Error('Erro ao carregar lista');
  return response.json();
}

async function updateItem(listaId: string, itemId: number, data: { preco: number; master: number }) {
  const response = await fetch(`/api/paginas/parametros/listas/${listaId}/itens/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao atualizar item');
  return response.json();
}

async function deleteItem(listaId: string, itemId: number) {
  const response = await fetch(`/api/paginas/parametros/listas/${listaId}/itens/${itemId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Erro ao excluir item');
  return response.json();
}

export default function EditListaPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const lang = params.lang as string;

  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ preco: string; master: string }>({
    preco: '',
    master: '',
  });

  const { data: lista, isLoading } = useQuery({
    queryKey: ['lista', id],
    queryFn: () => fetchLista(id),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: { preco: number; master: number } }) =>
      updateItem(id, itemId, data),
    onSuccess: () => {
      toast.success('Item atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['lista', id] });
      setEditingItem(null);
    },
    onError: () => {
      toast.error('Erro ao atualizar item');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId: number) => deleteItem(id, itemId),
    onSuccess: () => {
      toast.success('Item excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['lista', id] });
    },
    onError: () => {
      toast.error('Erro ao excluir item');
    },
  });

  const handleEdit = (item: ListaItem) => {
    setEditingItem(item.id);
    setEditValues({
      preco: item.preco.toFixed(2),
      master: item.master.toString(),
    });
  };

  const handleSave = (itemId: number) => {
    const preco = parseFloat(editValues.preco);
    const master = parseInt(editValues.master);

    if (isNaN(preco) || isNaN(master)) {
      toast.error('Valores inválidos');
      return;
    }

    updateMutation.mutate({ itemId, data: { preco, master } });
  };

  const handleDelete = (itemId: number) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      deleteMutation.mutate(itemId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (!lista) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">Lista não encontrada</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Itens da Lista: {lista.nome_lista}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Fabricante: {lista.tremonte_fabricante.fantasia}
              </p>
            </div>
            <Link href={`/${lang}/paginas/parametros/listas`}>
              <Button variant="outline">
                <Icon icon="heroicons:arrow-left" className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent>
          {lista.tremonte_lista_preco_item.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum item na lista
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Código</th>
                    <th className="text-left p-3">Descrição</th>
                    <th className="text-right p-3">Preço</th>
                    <th className="text-right p-3">Master</th>
                    <th className="text-center p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.tremonte_lista_preco_item.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{item.tremonte_produto.codigo}</td>
                      <td className="p-3">{item.tremonte_produto.descricao}</td>
                      <td className="p-3 text-right">
                        {editingItem === item.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editValues.preco}
                            onChange={(e) =>
                              setEditValues({ ...editValues, preco: e.target.value })
                            }
                            className="w-32 text-right"
                          />
                        ) : (
                          `R$ ${item.preco.toFixed(2)}`
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {editingItem === item.id ? (
                          <Input
                            type="number"
                            value={editValues.master}
                            onChange={(e) =>
                              setEditValues({ ...editValues, master: e.target.value })
                            }
                            className="w-24 text-right"
                          />
                        ) : (
                          item.master
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          {editingItem === item.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleSave(item.id)}
                                disabled={updateMutation.isPending}
                              >
                                <Icon icon="heroicons:check" className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingItem(null)}
                              >
                                <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(item)}
                              >
                                <Icon icon="heroicons:pencil" className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(item.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Icon icon="heroicons:trash" className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
