import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, ArrowLeft, Check, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import LembreteActions from "./actions-client";

async function getLembrete(id: string, userId: string) {
  return await db.lembrete.findFirst({
    where: {
      id: id,
      userId: userId,
    },
    include: {
      historico: {
        orderBy: {
          dataHora: 'desc'
        },
        take: 10
      }
    }
  });
}

const LembreteDetailPage = async ({ params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const lembrete = await getLembrete(params.id, session.user.id);

  if (!lembrete) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      CONFIRMADO: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      DISPARADO: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      AGUARDANDO_CONFIRMACAO: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    };
    return badges[status as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    const texts = {
      CONFIRMADO: "Confirmado",
      DISPARADO: "Disparado",
      AGUARDANDO_CONFIRMACAO: "Aguardando Confirmação"
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const badges = {
      BAIXA: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      MEDIA: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      ALTA: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      URGENTE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    };
    return badges[prioridade as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Detalhes do Lembrete</h1>
        </div>
        <Link href="/lembretes">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{lembrete.titulo}</CardTitle>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusBadge(lembrete.status)}`}>
                    {getStatusText(lembrete.status)}
                  </span>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${getPrioridadeBadge(lembrete.prioridade)}`}>
                    {lembrete.prioridade}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {lembrete.descricao && (
                <div>
                  <h3 className="font-semibold mb-2">Descrição</h3>
                  <p className="text-muted-foreground">{lembrete.descricao}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Próximo Disparo</h3>
                  <p className="text-muted-foreground">
                    {new Date(lembrete.proximoDisparo).toLocaleString('pt-BR')}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Data de Criação</h3>
                  <p className="text-muted-foreground">
                    {new Date(lembrete.dataCriacao).toLocaleString('pt-BR')}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Última Confirmação</h3>
                  <p className="text-muted-foreground">
                    {new Date(lembrete.dataUltimaConfirmacao).toLocaleString('pt-BR')}
                  </p>
                </div>

                {lembrete.dataDisparo && (
                  <div>
                    <h3 className="font-semibold mb-1">Data do Disparo</h3>
                    <p className="text-muted-foreground">
                      {new Date(lembrete.dataDisparo).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}

                {lembrete.dataVisto && (
                  <div>
                    <h3 className="font-semibold mb-1">Data Visto</h3>
                    <p className="text-muted-foreground">
                      {new Date(lembrete.dataVisto).toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Configurações de Intervalo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Intervalo Inicial:</span>
                    <span className="font-medium">{lembrete.intervaloInicial} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Intervalo Recorrência:</span>
                    <span className="font-medium">{lembrete.intervaloRecorrencia} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Intervalo Redisparo:</span>
                    <span className="font-medium">{lembrete.intervaloRedisparo} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Intervalo Lembrete Confirmação:</span>
                    <span className="font-medium">{lembrete.intervaloLembreteConfirmacao} min</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Estatísticas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Número de Exibições:</span>
                    <span className="font-medium">{lembrete.numeroExibicoes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Número Exibições Lembrete:</span>
                    <span className="font-medium">{lembrete.numeroExibicoesLembrete}</span>
                  </div>
                  {lembrete.ultimaExibicao && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Última Exibição:</span>
                      <span className="font-medium">
                        {new Date(lembrete.ultimaExibicao).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {lembrete.ultimaExibicaoLembrete && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Última Exib. Lembrete:</span>
                      <span className="font-medium">
                        {new Date(lembrete.ultimaExibicaoLembrete).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              {lembrete.historico.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum histórico disponível
                </p>
              ) : (
                <div className="space-y-3">
                  {lembrete.historico.map((hist) => (
                    <div key={hist.id} className="border-l-2 border-primary pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{hist.acao}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(hist.dataHora).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      {hist.estadoAnterior && (
                        <div className="text-sm text-muted-foreground">
                          {getStatusText(hist.estadoAnterior)} → {getStatusText(hist.estadoNovo)}
                        </div>
                      )}
                      {hist.descricao && (
                        <p className="text-sm text-muted-foreground mt-1">{hist.descricao}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <LembreteActions
            lembreteId={lembrete.id}
            status={lembrete.status}
            ativo={lembrete.ativo}
          />
        </div>
      </div>
    </div>
  );
};

export default LembreteDetailPage;
