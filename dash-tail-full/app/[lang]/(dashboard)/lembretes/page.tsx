import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

async function getLembretes(userId: string) {
  return await db.lembrete.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      proximoDisparo: 'asc'
    },
    take: 20
  });
}

const LembretesPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const lembretes = await getLembretes(session.user.id);

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
          <h1 className="text-3xl font-bold">Lembretes</h1>
        </div>
        <Link href="/lembretes/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lembrete
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus Lembretes</CardTitle>
        </CardHeader>
        <CardContent>
          {lembretes.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum lembrete cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro lembrete!
              </p>
              <Link href="/lembretes/novo">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Lembrete
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {lembretes.map((lembrete) => (
                <div
                  key={lembrete.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{lembrete.titulo}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(lembrete.status)}`}>
                        {getStatusText(lembrete.status)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPrioridadeBadge(lembrete.prioridade)}`}>
                        {lembrete.prioridade}
                      </span>
                    </div>
                    {lembrete.descricao && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {lembrete.descricao}
                      </p>
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>
                        Próximo disparo: {new Date(lembrete.proximoDisparo).toLocaleString('pt-BR')}
                      </span>
                      <span>•</span>
                      <span>
                        Recorrência: {lembrete.intervaloRecorrencia} min
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/lembretes/${lembrete.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LembretesPage;
