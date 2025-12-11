'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import Link from 'next/link';
import { ModalListaForm } from './components/ModalListaForm';

interface Fabricante {
  id: number;
  fantasia: string;
  razao_social: string;
  cnpj: string;
}

interface Lista {
  id: number;
  nome_lista: string;
  atual: boolean;
  fk_fabricante: number;
  tremonte_fabricante: Fabricante;
  tremonte_lista_preco_item: any[];
}

async function fetchFabricantes(): Promise<Fabricante[]> {
  const response = await fetch('/api/paginas/parametros/fabricante');
  if (!response.ok) throw new Error('Erro ao carregar fabricantes');
  return response.json();
}

async function fetchListas(fabricante?: string, ativas?: boolean): Promise<Lista[]> {
  const params = new URLSearchParams();
  if (fabricante) params.append('fabricante', fabricante);
  if (ativas) params.append('ativas', 'true');

  const response = await fetch(`/api/paginas/parametros/listas?${params}`);
  if (!response.ok) throw new Error('Erro ao carregar listas');
  return response.json();
}

async function deleteLista(id: number) {
  const response = await fetch(`/api/paginas/parametros/listas/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao excluir lista');
  }
  return response.json();
}

export default function ListasPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [selectedFabricante, setSelectedFabricante] = useState<string>('');
  const [showAtivasOnly, setShowAtivasOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLista, setEditingLista] = useState<Lista | null>(null);

  const { data: fabricantes = [] } = useQuery({
    queryKey: ['fabricantes'],
    queryFn: fetchFabricantes,
  });

  const { data: listas = [], refetch, isLoading } = useQuery({
    queryKey: ['listas', selectedFabricante, showAtivasOnly],
    queryFn: () => fetchListas(selectedFabricante, showAtivasOnly),
    enabled: !!selectedFabricante,
  });

  const handleDelete = async (id: number, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir a lista "${nome}"?`)) return;

    try {
      await deleteLista(id);
      toast.success('Lista excluída com sucesso!');
      setTimeout(() => refetch(), 2000);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir lista');
    }
  };

  return (
    <div className="space-y-6">
      <ModalListaForm
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLista(null);
        }}
        onSaved={() => {
          refetch();
        }}
        lista={editingLista}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Listas de Preços</CardTitle>
              <CardDescription>Gerencie as listas de preços por fabricante</CardDescription>
            </div>
            <Button onClick={() => {
              setEditingLista(null);
              setIsModalOpen(true);
            }} disabled={!selectedFabricante}>
              <Icon icon="heroicons:plus" className="w-4 h-4 mr-2" />
              Nova Lista
            </Button>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1">
              <Select value={selectedFabricante} onValueChange={setSelectedFabricante}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fabricante" />
                </SelectTrigger>
                <SelectContent>
                  {fabricantes.map((fab) => (
                    <SelectItem key={fab.id} value={fab.id.toString()}>
                      {fab.fantasia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ativas"
                checked={showAtivasOnly}
                onCheckedChange={(checked) => setShowAtivasOnly(checked as boolean)}
              />
              <Label htmlFor="ativas" className="cursor-pointer">
                Mostrar apenas listas ativas
              </Label>
            </div>

            {selectedFabricante && (
              <Button variant="outline" onClick={() => setSelectedFabricante('')}>
                Limpar
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {!selectedFabricante ? (
            <div className="text-center py-8 text-muted-foreground">
              Selecione um fabricante para visualizar as listas de preços
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : listas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma lista encontrada
            </div>
          ) : (
            <div className="space-y-4">
              {listas.map((lista) => (
                <div key={lista.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{lista.nome_lista}</h3>
                      {lista.atual && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          Ativa
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {lista.tremonte_fabricante.fantasia} • {lista.tremonte_lista_preco_item.length} itens
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setEditingLista(lista);
                      setIsModalOpen(true);
                    }}>
                      <Icon icon="heroicons:pencil" className="w-4 h-4" />
                    </Button>
                    <Link href={`/${lang}/paginas/parametros/listas/${lista.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Icon icon="heroicons:list-bullet" className="w-4 h-4 mr-1" />
                        Itens
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(lista.id, lista.nome_lista)}
                      disabled={lista.atual}
                    >
                      <Icon icon="heroicons:trash" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
