'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

interface Fabricante {
  id: number;
  razao_social?: string;
  fantasia?: string;
}

interface Lista {
  id?: number;
  nome_lista: string;
  atual: boolean;
  fk_fabricante: number;
}

interface ModalListaFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  lista?: Lista | null;
}

async function fetchFabricantes(): Promise<Fabricante[]> {
  const response = await fetch('/api/paginas/parametros/fabricante');
  if (!response.ok) throw new Error('Erro ao buscar fabricantes');
  return response.json();
}

async function salvarLista(data: any) {
  const isEdit = !!data.id;
  const url = isEdit
    ? `/api/paginas/parametros/listas/${data.id}`
    : `/api/paginas/parametros/listas`;
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = errorData.error || 'Erro ao salvar lista';
    throw new Error(errorMessage);
  }

  return await res.json();
}

export function ModalListaForm({ open, onClose, onSaved, lista }: ModalListaFormProps) {
  const [nome, setNome] = useState('');
  const [atual, setAtual] = useState(false);
  const [fabricanteId, setFabricanteId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [showAtualInfo, setShowAtualInfo] = useState(false);

  const { data: fabricantes = [], isLoading: isLoadingFabricantes } = useQuery({
    queryKey: ['fabricantes'],
    queryFn: fetchFabricantes,
  });

  useEffect(() => {
    if (open) {
      if (lista) {
        setNome(lista.nome_lista || '');
        setAtual(lista.atual || false);
        setFabricanteId(lista.fk_fabricante?.toString() || '');
      } else {
        setNome('');
        setAtual(false);
        setFabricanteId('');
      }
      setErro(null);
      setShowAtualInfo(false);
    }
  }, [lista, open]);

  const handleAtualChange = (checked: boolean) => {
    setAtual(checked);
    setShowAtualInfo(checked);
  };

  async function handleSave() {
    setLoading(true);
    setErro(null);

    if (!nome.trim()) {
      setErro('O nome da lista é obrigatório.');
      setLoading(false);
      return;
    }

    if (nome.trim().length > 25) {
      setErro('O nome da lista deve ter no máximo 25 caracteres.');
      setLoading(false);
      return;
    }

    if (!fabricanteId) {
      setErro('É obrigatório selecionar um fabricante.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        id: lista?.id,
        nome_lista: nome.trim(),
        atual,
        fk_fabricante: parseInt(fabricanteId),
      };

      await salvarLista(payload);

      toast.success(lista ? 'Lista atualizada com sucesso!' : 'Lista criada com sucesso!');
      onSaved();
      onClose();
    } catch (error: any) {
      setErro(error.message || 'Erro ao salvar a lista. Tente novamente.');
      toast.error(error.message || 'Erro ao salvar lista');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{lista ? 'Editar' : 'Nova'} Lista de Preço</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Lista</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Tabela Promocional"
              maxLength={25}
            />
            <p className="text-xs text-muted-foreground">
              {nome.length}/25 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fabricante">Fabricante</Label>
            <Select
              value={fabricanteId}
              onValueChange={setFabricanteId}
              disabled={!!lista?.id || isLoadingFabricantes}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={isLoadingFabricantes ? 'Carregando...' : 'Selecione um fabricante'}
                />
              </SelectTrigger>
              <SelectContent>
                {fabricantes.map((fab) => (
                  <SelectItem key={fab.id} value={fab.id.toString()}>
                    {fab.fantasia || fab.razao_social || `Fabricante ${fab.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {lista?.id && (
              <p className="text-xs text-muted-foreground">
                O fabricante não pode ser alterado após a criação
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="atual"
                checked={atual}
                onCheckedChange={handleAtualChange}
              />
              <Label htmlFor="atual" className="cursor-pointer">
                Definir como lista ativa
              </Label>
            </div>

            {showAtualInfo && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                <div className="flex gap-2">
                  <Icon icon="heroicons:information-circle" className="h-5 w-5 flex-shrink-0" />
                  <p>
                    Atenção: Se outra lista deste fabricante estiver ativa, ela será
                    automaticamente desativada.
                  </p>
                </div>
              </div>
            )}
          </div>

          {erro && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              <div className="flex gap-2">
                <Icon icon="heroicons:exclamation-circle" className="h-5 w-5 flex-shrink-0" />
                <p>{erro}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Icon icon="heroicons:arrow-path" className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
