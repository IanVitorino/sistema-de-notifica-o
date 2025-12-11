import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

const DocsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Sistema de Lembretes</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentação do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold mb-4">📚 Visão Geral</h2>
            <p className="text-muted-foreground mb-4">
              Sistema inteligente de gerenciamento de lembretes com notificações automáticas e controle de estados.
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 my-6">
              <Card className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">🟢 CONFIRMADO</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Aguardando próximo disparo baseado no intervalo configurado
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">🔴 DISPARADO</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Pop-up ativo na tela - aguardando usuário clicar "VISTO"
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">🟡 AGUARDANDO</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Visto mas não confirmado - aguarda confirmação na plataforma
                  </p>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-2xl font-semibold mb-4 mt-8">⚙️ Intervalos Configuráveis</h2>
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold">1. Intervalo Inicial</h3>
                <p className="text-sm text-muted-foreground">Tempo até o primeiro disparo após confirmação (ex: 2 horas)</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold">2. Intervalo de Recorrência</h3>
                <p className="text-sm text-muted-foreground">Tempo entre ciclos completos após confirmação (ex: 1 dia)</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold">3. Intervalo de Re-disparo</h3>
                <p className="text-sm text-muted-foreground">Tempo entre re-exibições do pop-up se usuário não clicar "VISTO" (ex: 5 minutos)</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold">⭐ 4. Intervalo Lembrete de Confirmação (NOVO)</h3>
                <p className="text-sm text-muted-foreground">Tempo entre lembretes se usuário não confirmar na plataforma (ex: 30 minutos)</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-4 mt-8">🔄 Ciclo de Vida</h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-6 rounded-lg">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-900 px-4 py-2 rounded-lg font-semibold">
                    CONFIRMADO
                  </div>
                </div>
                <span className="text-2xl">→</span>
                <div className="text-center">
                  <div className="bg-red-100 dark:bg-red-900 px-4 py-2 rounded-lg font-semibold">
                    DISPARADO
                  </div>
                </div>
                <span className="text-2xl">→</span>
                <div className="text-center">
                  <div className="bg-yellow-100 dark:bg-yellow-900 px-4 py-2 rounded-lg font-semibold">
                    AGUARDANDO
                  </div>
                </div>
                <span className="text-2xl">→</span>
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-900 px-4 py-2 rounded-lg font-semibold">
                    CONFIRMADO
                  </div>
                </div>
              </div>
              <p className="text-center mt-4 text-sm text-muted-foreground">
                Ciclo infinito - O lembrete se repete automaticamente
              </p>
            </div>

            <h2 className="text-2xl font-semibold mb-4 mt-8">🏗️ Stack Tecnológica</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Frontend</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Next.js 14 (App Router)</li>
                  <li>• React 18 + TypeScript</li>
                  <li>• Tailwind CSS + Shadcn UI</li>
                  <li>• React Hook Form + Zod</li>
                </ul>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Backend</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Next.js API Routes</li>
                  <li>• PostgreSQL + Prisma ORM</li>
                  <li>• NextAuth.js</li>
                  <li>• Node-cron (Scheduler)</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-primary/10 rounded-lg border-2 border-primary">
              <h3 className="text-xl font-semibold mb-3">📂 Documentação Completa</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Para acessar a documentação técnica detalhada, consulte a pasta:
              </p>
              <code className="block bg-background p-3 rounded text-sm">
                C:\Users\User\Downloads\Sistema_de_notificacao\Docs
              </code>
              <p className="text-sm text-muted-foreground mt-4">
                A documentação inclui:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                <li>✅ Visão geral do sistema e fluxo do usuário</li>
                <li>✅ Fluxo de estados técnico com diagramas</li>
                <li>✅ Modelo de dados (Prisma schema + interfaces TypeScript)</li>
                <li>✅ Requisitos funcionais (17 RFs + 7 RNFs)</li>
                <li>✅ Diagramas visuais e linhas do tempo</li>
                <li>✅ FAQ com 15 perguntas respondidas</li>
              </ul>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Status:</strong> Sistema em desenvolvimento - Fase de implementação inicial
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Versão da Documentação:</strong> 1.1 (10/12/2025)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocsPage;
