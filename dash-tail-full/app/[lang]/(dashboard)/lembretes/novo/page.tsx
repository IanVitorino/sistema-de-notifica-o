"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const NovoLembretePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    prioridade: "MEDIA",
    intervaloInicial: "",
    intervaloRecorrencia: "",
    intervaloRedisparo: "",
    intervaloLembreteConfirmacao: "",
    proximoDisparo: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/lembretes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          intervaloInicial: parseInt(formData.intervaloInicial),
          intervaloRecorrencia: parseInt(formData.intervaloRecorrencia),
          intervaloRedisparo: parseInt(formData.intervaloRedisparo),
          intervaloLembreteConfirmacao: parseInt(formData.intervaloLembreteConfirmacao),
          proximoDisparo: new Date(formData.proximoDisparo).toISOString(),
        }),
      });

      if (response.ok) {
        router.push("/lembretes");
      } else {
        const error = await response.json();
        alert("Erro ao criar lembrete: " + (error.message || "Erro desconhecido"));
      }
    } catch (error) {
      alert("Erro ao criar lembrete");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Novo Lembrete</h1>
        </div>
        <Link href="/lembretes">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Lembrete</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="titulo">
                  Título <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                  placeholder="Digite o título do lembrete"
                  required
                  maxLength={255}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleChange("descricao", e.target.value)}
                  placeholder="Digite uma descrição opcional"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridade">
                  Prioridade <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(value) => handleChange("prioridade", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BAIXA">Baixa</SelectItem>
                    <SelectItem value="MEDIA">Média</SelectItem>
                    <SelectItem value="ALTA">Alta</SelectItem>
                    <SelectItem value="URGENTE">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proximoDisparo">
                  Primeiro Disparo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="proximoDisparo"
                  type="datetime-local"
                  value={formData.proximoDisparo}
                  onChange={(e) => handleChange("proximoDisparo", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="intervaloInicial">
                  Intervalo Inicial (minutos) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="intervaloInicial"
                  type="number"
                  min="1"
                  value={formData.intervaloInicial}
                  onChange={(e) => handleChange("intervaloInicial", e.target.value)}
                  placeholder="Ex: 60"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Tempo até o primeiro disparo após confirmação
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="intervaloRecorrencia">
                  Intervalo de Recorrência (minutos) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="intervaloRecorrencia"
                  type="number"
                  min="1"
                  value={formData.intervaloRecorrencia}
                  onChange={(e) => handleChange("intervaloRecorrencia", e.target.value)}
                  placeholder="Ex: 1440"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Tempo entre ciclos completos do lembrete
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="intervaloRedisparo">
                  Intervalo de Redisparo (minutos) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="intervaloRedisparo"
                  type="number"
                  min="1"
                  value={formData.intervaloRedisparo}
                  onChange={(e) => handleChange("intervaloRedisparo", e.target.value)}
                  placeholder="Ex: 30"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Intervalo entre re-exibições quando em estado DISPARADO
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="intervaloLembreteConfirmacao">
                  Intervalo Lembrete Confirmação (minutos) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="intervaloLembreteConfirmacao"
                  type="number"
                  min="1"
                  value={formData.intervaloLembreteConfirmacao}
                  onChange={(e) =>
                    handleChange("intervaloLembreteConfirmacao", e.target.value)
                  }
                  placeholder="Ex: 15"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Intervalo entre lembretes quando aguardando confirmação
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/lembretes">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar Lembrete"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NovoLembretePage;
