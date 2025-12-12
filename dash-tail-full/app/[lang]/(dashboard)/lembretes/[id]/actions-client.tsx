"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Eye, Trash2, Power, PowerOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LembreteActionsProps {
  lembreteId: string;
  status: string;
  ativo: boolean;
}

const LembreteActions = ({ lembreteId, status, ativo }: LembreteActionsProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: string) => {
    if (!confirm(`Tem certeza que deseja executar esta ação?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/lembretes/${lembreteId}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert("Erro: " + (error.message || "Erro desconhecido"));
      }
    } catch (error) {
      alert("Erro ao executar ação");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este lembrete? Esta ação não pode ser desfeita.")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/lembretes/${lembreteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/lembretes");
      } else {
        const error = await response.json();
        alert("Erro: " + (error.message || "Erro desconhecido"));
      }
    } catch (error) {
      alert("Erro ao excluir lembrete");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {status === "DISPARADO" && (
          <Button
            onClick={() => handleAction("marcar_visto")}
            disabled={loading || !ativo}
            className="w-full"
            variant="outline"
          >
            <Eye className="h-4 w-4 mr-2" />
            Marcar como Visto
          </Button>
        )}

        {status === "AGUARDANDO_CONFIRMACAO" && (
          <Button
            onClick={() => handleAction("confirmar")}
            disabled={loading || !ativo}
            className="w-full"
          >
            <Check className="h-4 w-4 mr-2" />
            Confirmar
          </Button>
        )}

        <Button
          onClick={() => handleAction(ativo ? "desativar" : "ativar")}
          disabled={loading}
          className="w-full"
          variant="outline"
        >
          {ativo ? (
            <>
              <PowerOff className="h-4 w-4 mr-2" />
              Desativar
            </>
          ) : (
            <>
              <Power className="h-4 w-4 mr-2" />
              Ativar
            </>
          )}
        </Button>

        <div className="border-t pt-3">
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="w-full"
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Lembrete
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
          <p><strong>Status atual:</strong> {status}</p>
          <p><strong>Estado:</strong> {ativo ? "Ativo" : "Inativo"}</p>
          <div className="mt-2">
            <p className="font-semibold mb-1">Transições disponíveis:</p>
            {status === "CONFIRMADO" && (
              <p>• Aguarda disparo automático</p>
            )}
            {status === "DISPARADO" && (
              <p>• Marcar como Visto → Aguardando Confirmação</p>
            )}
            {status === "AGUARDANDO_CONFIRMACAO" && (
              <p>• Confirmar → Confirmado</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LembreteActions;
