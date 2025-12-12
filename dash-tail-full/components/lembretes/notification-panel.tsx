"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X, Check, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Lembrete {
  id: string;
  titulo: string;
  descricao: string | null;
  prioridade: string;
  status: string;
  numeroExibicoes: number;
  numeroExibicoesLembrete: number;
}

export default function NotificationPanel() {
  const router = useRouter();
  const [lembretes, setLembretes] = useState<{
    disparados: Lembrete[];
    aguardandoConfirmacao: Lembrete[];
  }>({
    disparados: [],
    aguardandoConfirmacao: [],
  });
  const [loading, setLoading] = useState(true);
  const [minimized, setMinimized] = useState(false);

  const fetchLembretes = async () => {
    try {
      const response = await fetch("/api/lembretes/worker");
      if (response.ok) {
        const data = await response.json();
        setLembretes({
          disparados: data.disparados || [],
          aguardandoConfirmacao: data.aguardandoConfirmacao || [],
        });
      }
    } catch (error) {
      console.error("Erro ao buscar lembretes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLembretes();

    const interval = setInterval(() => {
      fetchLembretes();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleAction = async (lembreteId: string, action: string) => {
    try {
      const response = await fetch(`/api/lembretes/${lembreteId}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        await fetchLembretes();
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao executar ação:", error);
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    const colors = {
      URGENTE: "border-red-500",
      ALTA: "border-orange-500",
      MEDIA: "border-gray-500",
      BAIXA: "border-blue-500",
    };
    return colors[prioridade as keyof typeof colors] || "border-gray-500";
  };

  const totalNotifications =
    lembretes.disparados.length + lembretes.aguardandoConfirmacao.length;

  if (loading) {
    return null;
  }

  if (totalNotifications === 0) {
    return null;
  }

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setMinimized(false)}
          className="rounded-full h-14 w-14 relative"
          size="icon"
        >
          <Bell className="h-6 w-6" />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalNotifications}
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[600px] overflow-hidden">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                Lembretes Ativos ({totalNotifications})
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMinimized(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
          {lembretes.disparados.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-red-600">
                Disparados ({lembretes.disparados.length})
              </h3>
              {lembretes.disparados.map((lembrete) => (
                <div
                  key={lembrete.id}
                  className={`border-l-4 ${getPrioridadeColor(
                    lembrete.prioridade
                  )} pl-3 py-2 mb-2 bg-muted/50 rounded`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{lembrete.titulo}</h4>
                      {lembrete.descricao && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {lembrete.descricao}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Exibido {lembrete.numeroExibicoes}x
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(lembrete.id, "marcar_visto")}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Visto
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {lembretes.aguardandoConfirmacao.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-yellow-600">
                Aguardando Confirmação ({lembretes.aguardandoConfirmacao.length})
              </h3>
              {lembretes.aguardandoConfirmacao.map((lembrete) => (
                <div
                  key={lembrete.id}
                  className={`border-l-4 ${getPrioridadeColor(
                    lembrete.prioridade
                  )} pl-3 py-2 mb-2 bg-muted/50 rounded`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{lembrete.titulo}</h4>
                      {lembrete.descricao && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {lembrete.descricao}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Lembretes enviados: {lembrete.numeroExibicoesLembrete}x
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAction(lembrete.id, "confirmar")}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Confirmar
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
