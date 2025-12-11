# Modelo de Dados - Sistema de Lembretes

## 📦 Schema Prisma - Lembrete Principal

```prisma
// Status do lembrete
enum StatusLembrete {
  CONFIRMADO              // Aguardando próximo disparo
  DISPARADO              // Pop-up ativo/visível
  AGUARDANDO_CONFIRMACAO // Aguardando confirmação na plataforma
}

// Prioridade do lembrete (opcional)
enum PrioridadeLembrete {
  BAIXA
  MEDIA
  ALTA
  URGENTE
}

// Model principal de Lembretes
model Lembrete {
  id                    String            @id @default(cuid())

  // Informações básicas
  titulo                String            @db.VarChar(255)
  descricao             String?           @db.Text
  prioridade            PrioridadeLembrete @default(MEDIA)
  ativo                 Boolean           @default(true)

  // Relacionamento com usuário
  userId                String
  user                  User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Estado atual
  status                StatusLembrete    @default(CONFIRMADO)

  // Configurações de tempo (em minutos)
  intervaloInicial      Int               // Tempo até primeiro disparo
  intervaloRecorrencia  Int               // Tempo entre ciclos após confirmação
  intervaloRedisparo    Int               // Tempo entre re-exibições do pop-up (estado DISPARADO)
  intervaloLembreteConfirmacao Int        // ⭐ Tempo entre lembretes de confirmação (estado AGUARDANDO)

  // Timestamps de controle
  dataCriacao           DateTime          @default(now())
  dataUltimaConfirmacao DateTime          @default(now())
  dataDisparo           DateTime?         // Quando entrou em DISPARADO
  dataVisto             DateTime?         // Quando usuário clicou "VISTO"
  proximoDisparo        DateTime          // Calculado: dataUltimaConfirmacao + intervaloRecorrencia

  // Controle de exibições (Estado DISPARADO)
  numeroExibicoes       Int               @default(0)  // Quantas vezes pop-up foi exibido
  ultimaExibicao        DateTime?         // Última vez que pop-up foi mostrado

  // ⭐ Controle de lembretes (Estado AGUARDANDO CONFIRMAÇÃO - NOVO)
  numeroExibicoesLembrete Int             @default(0)  // Quantas vezes lembrete foi exibido
  ultimaExibicaoLembrete  DateTime?       // Última vez que lembrete foi mostrado

  // Metadados
  atualizadoEm          DateTime          @updatedAt

  // Relações
  historico             HistoricoLembrete[]

  // Índices para performance
  @@index([userId])
  @@index([status])
  @@index([proximoDisparo])
  @@index([ativo])
  @@map("lembretes")
}
```

---

## 📜 Schema Prisma - Histórico

```prisma
// Model para rastrear todas as ações e mudanças de estado
model HistoricoLembrete {
  id              String   @id @default(cuid())

  // Relacionamento
  lembreteId      String
  lembrete        Lembrete @relation(fields: [lembreteId], references: [id], onDelete: Cascade)

  // Informações da ação
  estadoAnterior  StatusLembrete?
  estadoNovo      StatusLembrete
  acao            String           // "criado", "disparado", "visto", "confirmado", "editado"
  descricao       String?          @db.Text

  // Timestamp
  dataHora        DateTime         @default(now())

  // Metadados
  ipAddress       String?
  userAgent       String?

  @@index([lembreteId])
  @@index([dataHora])
  @@map("historico_lembretes")
}
```

---

## 🔗 Integração com User Model Existente

```prisma
// Adicionar no model User existente do template
model User {
  // ... campos existentes ...

  // Nova relação
  lembretes     Lembrete[]

  // ... resto do model ...
}
```

---

## 📊 Estrutura de Dados - TypeScript Interfaces

```typescript
// Interface principal do Lembrete
interface Lembrete {
  id: string;

  // Dados básicos
  titulo: string;
  descricao?: string;
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  ativo: boolean;

  // Relacionamento
  userId: string;
  user?: User;

  // Estado
  status: 'CONFIRMADO' | 'DISPARADO' | 'AGUARDANDO_CONFIRMACAO';

  // Intervalos (minutos)
  intervaloInicial: number;
  intervaloRecorrencia: number;
  intervaloRedisparo: number;
  intervaloLembreteConfirmacao: number; // ⭐ NOVO

  // Timestamps
  dataCriacao: Date;
  dataUltimaConfirmacao: Date;
  dataDisparo?: Date;
  dataVisto?: Date;
  proximoDisparo: Date;

  // Controle (Estado DISPARADO)
  numeroExibicoes: number;
  ultimaExibicao?: Date;

  // ⭐ Controle Lembretes (Estado AGUARDANDO - NOVO)
  numeroExibicoesLembrete: number;
  ultimaExibicaoLembrete?: Date;

  // Meta
  atualizadoEm: Date;

  // Relações
  historico?: HistoricoLembrete[];
}

// Interface de histórico
interface HistoricoLembrete {
  id: string;
  lembreteId: string;
  estadoAnterior?: 'CONFIRMADO' | 'DISPARADO' | 'AGUARDANDO_CONFIRMACAO';
  estadoNovo: 'CONFIRMADO' | 'DISPARADO' | 'AGUARDANDO_CONFIRMACAO';
  acao: 'criado' | 'disparado' | 'visto' | 'confirmado' | 'editado' | 'pausado' | 'deletado';
  descricao?: string;
  dataHora: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Interface para criação de lembrete
interface CreateLembreteDTO {
  titulo: string;
  descricao?: string;
  prioridade?: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  intervaloInicial: number;             // em minutos
  intervaloRecorrencia: number;         // em minutos
  intervaloRedisparo: number;           // em minutos
  intervaloLembreteConfirmacao: number; // ⭐ em minutos (NOVO)
}

// Interface para atualização
interface UpdateLembreteDTO {
  titulo?: string;
  descricao?: string;
  prioridade?: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  intervaloInicial?: number;
  intervaloRecorrencia?: number;
  intervaloRedisparo?: number;
  intervaloLembreteConfirmacao?: number; // ⭐ NOVO
  ativo?: boolean;
}

// Interface para exibição de pop-up
interface PopupNotification {
  lembreteId: string;
  titulo: string;
  descricao?: string;
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  dataDisparo: Date;
  numeroExibicao: number;
}
```

---

## 🗃️ Exemplos de Dados

### Exemplo 1: Lembrete Recém-Criado

```json
{
  "id": "clm123abc456",
  "titulo": "Revisar relatório de vendas",
  "descricao": "Verificar números do mês e preparar apresentação",
  "prioridade": "ALTA",
  "ativo": true,
  "userId": "user_789xyz",
  "status": "CONFIRMADO",
  "intervaloInicial": 120,              // 2 horas
  "intervaloRecorrencia": 1440,         // 24 horas (1 dia)
  "intervaloRedisparo": 5,              // 5 minutos
  "intervaloLembreteConfirmacao": 30,   // ⭐ 30 minutos (NOVO)
  "dataCriacao": "2025-12-10T10:00:00Z",
  "dataUltimaConfirmacao": "2025-12-10T10:00:00Z",
  "proximoDisparo": "2025-12-10T12:00:00Z",
  "numeroExibicoes": 0,
  "numeroExibicoesLembrete": 0,         // ⭐ NOVO
  "atualizadoEm": "2025-12-10T10:00:00Z"
}
```

---

### Exemplo 2: Lembrete em Estado DISPARADO

```json
{
  "id": "clm123abc456",
  "titulo": "Revisar relatório de vendas",
  "status": "DISPARADO",
  "dataDisparo": "2025-12-10T12:00:00Z",
  "numeroExibicoes": 3,
  "ultimaExibicao": "2025-12-10T12:10:00Z",
  "proximoDisparo": "2025-12-10T12:00:00Z"
  // ... outros campos ...
}
```

---

### ⭐ Exemplo 3: Lembrete AGUARDANDO_CONFIRMACAO (Com Lembretes Ativos - ATUALIZADO)

```json
{
  "id": "clm123abc456",
  "titulo": "Revisar relatório de vendas",
  "status": "AGUARDANDO_CONFIRMACAO",
  "intervaloLembreteConfirmacao": 30,     // ⭐ 30 minutos
  "dataDisparo": "2025-12-10T12:00:00Z",
  "dataVisto": "2025-12-10T12:12:30Z",
  "numeroExibicoes": 3,
  "ultimaExibicao": "2025-12-10T12:10:00Z",
  "numeroExibicoesLembrete": 2,           // ⭐ 2 lembretes já exibidos
  "ultimaExibicaoLembrete": "2025-12-10T13:12:30Z"  // ⭐ Último lembrete
  // ... outros campos ...
}
```

**⭐ Novidade**: Agora inclui controle de lembretes de confirmação!

---

### Exemplo 4: Entrada de Histórico

```json
{
  "id": "hist_001",
  "lembreteId": "clm123abc456",
  "estadoAnterior": "DISPARADO",
  "estadoNovo": "AGUARDANDO_CONFIRMACAO",
  "acao": "visto",
  "descricao": "Usuário clicou em VISTO no pop-up (exibição #3)",
  "dataHora": "2025-12-10T12:12:30Z",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
}
```

---

## 🔢 Conversões de Tempo

### Tabela de Referência (Intervalos Comuns)

| Descrição | Minutos | Uso Típico |
|-----------|---------|------------|
| 5 minutos | 5 | Intervalo re-disparo (pop-up) |
| 15 minutos | 15 | Lembretes frequentes |
| 30 minutos | 30 | Atividades de curto prazo |
| 1 hora | 60 | Tarefas horárias |
| 2 horas | 120 | Intervalo inicial comum |
| 4 horas | 240 | Meio expediente |
| 8 horas | 480 | Expediente completo |
| 12 horas | 720 | Duas vezes ao dia |
| 1 dia | 1440 | Atividades diárias |
| 1 semana | 10080 | Atividades semanais |
| 1 mês (30 dias) | 43200 | Atividades mensais |

### Funções Auxiliares

```typescript
// Converter minutos para millisegundos
function minutesToMs(minutes: number): number {
  return minutes * 60 * 1000;
}

// Calcular próximo disparo
function calcularProximoDisparo(
  dataBase: Date,
  intervaloMinutos: number
): Date {
  return new Date(dataBase.getTime() + minutesToMs(intervaloMinutos));
}

// Verificar se deve disparar
function deveDisparar(proximoDisparo: Date): boolean {
  return new Date() >= proximoDisparo;
}

// Calcular tempo restante
function tempoRestante(proximoDisparo: Date): number {
  const diff = proximoDisparo.getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 1000 / 60)); // em minutos
}
```

---

## 📝 Validações de Dados

### Regras de Validação (Zod Schema)

```typescript
import { z } from 'zod';

// Schema de criação
const CreateLembreteSchema = z.object({
  titulo: z.string()
    .min(3, "Título deve ter no mínimo 3 caracteres")
    .max(255, "Título muito longo"),

  descricao: z.string()
    .max(2000, "Descrição muito longa")
    .optional(),

  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'])
    .default('MEDIA'),

  intervaloInicial: z.number()
    .int("Deve ser número inteiro")
    .min(1, "Mínimo 1 minuto")
    .max(525600, "Máximo 1 ano (525600 minutos)"),

  intervaloRecorrencia: z.number()
    .int()
    .min(1)
    .max(525600),

  intervaloRedisparo: z.number()
    .int()
    .min(1, "Mínimo 1 minuto")
    .max(60, "Máximo 1 hora para re-disparo"),

  intervaloLembreteConfirmacao: z.number() // ⭐ NOVO
    .int()
    .min(1, "Mínimo 1 minuto")
    .max(1440, "Máximo 1 dia (1440 minutos)")
});

// Schema de atualização
const UpdateLembreteSchema = CreateLembreteSchema.partial().extend({
  ativo: z.boolean().optional()
});
```

---

## 🔐 Permissões e Segurança

### Regras de Acesso

```typescript
// Usuário pode ver apenas seus próprios lembretes
async function getLembretesByUser(userId: string) {
  return await prisma.lembrete.findMany({
    where: { userId }
  });
}

// Verificar propriedade antes de atualizar/deletar
async function canAccessLembrete(lembreteId: string, userId: string): Promise<boolean> {
  const lembrete = await prisma.lembrete.findUnique({
    where: { id: lembreteId },
    select: { userId: true }
  });

  return lembrete?.userId === userId;
}
```

---

## 🎯 Queries Úteis

### Buscar Lembretes que Devem Disparar

```typescript
async function getLembretesParaDisparar() {
  const agora = new Date();

  return await prisma.lembrete.findMany({
    where: {
      status: 'CONFIRMADO',
      ativo: true,
      proximoDisparo: {
        lte: agora  // menor ou igual a agora
      }
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  });
}
```

---

### Buscar Lembretes que Precisam Re-disparar

```typescript
async function getLembretesParaReDisparar() {
  const agora = new Date();

  return await prisma.lembrete.findMany({
    where: {
      status: 'DISPARADO',
      ativo: true,
      AND: [
        {
          ultimaExibicao: {
            not: null
          }
        }
      ]
    }
  }).then(lembretes => {
    // Filtrar no JavaScript para verificar intervalo
    return lembretes.filter(l => {
      if (!l.ultimaExibicao) return false;
      const proximaExibicao = new Date(
        l.ultimaExibicao.getTime() + (l.intervaloRedisparo * 60 * 1000)
      );
      return agora >= proximaExibicao;
    });
  });
}
```

---

### Buscar Lembretes Pendentes de Confirmação

```typescript
async function getLembretesPendentes(userId: string) {
  return await prisma.lembrete.findMany({
    where: {
      userId,
      status: 'AGUARDANDO_CONFIRMACAO',
      ativo: true
    },
    orderBy: {
      dataVisto: 'asc'  // mais antigos primeiro
    }
  });
}
```

---

### ⭐ Buscar Lembretes que Precisam de Lembrete de Confirmação (NOVO)

```typescript
async function getLembretesParaLembreteConfirmacao() {
  const agora = new Date();

  return await prisma.lembrete.findMany({
    where: {
      status: 'AGUARDANDO_CONFIRMACAO',
      ativo: true,
      AND: [
        {
          ultimaExibicaoLembrete: {
            not: null
          }
        }
      ]
    }
  }).then(lembretes => {
    // Filtrar no JavaScript para verificar intervalo
    return lembretes.filter(l => {
      if (!l.ultimaExibicaoLembrete) {
        // Primeira exibição: verificar se passou o tempo desde dataVisto
        if (!l.dataVisto) return false;
        const proximoLembrete = new Date(
          l.dataVisto.getTime() + (l.intervaloLembreteConfirmacao * 60 * 1000)
        );
        return agora >= proximoLembrete;
      }

      // Re-exibições subsequentes
      const proximoLembrete = new Date(
        l.ultimaExibicaoLembrete.getTime() + (l.intervaloLembreteConfirmacao * 60 * 1000)
      );
      return agora >= proximoLembrete;
    });
  });
}
```

**⭐ Nova funcionalidade**: Query para buscar lembretes que precisam de re-disparo no estado AGUARDANDO CONFIRMAÇÃO!

---

## 📊 Índices de Performance

```prisma
// Já incluídos no schema principal:
@@index([userId])           // Buscar lembretes do usuário
@@index([status])           // Filtrar por estado
@@index([proximoDisparo])   // Buscar lembretes a disparar
@@index([ativo])            // Filtrar apenas ativos

// Índice composto (opcional - se queries combinadas forem frequentes)
@@index([userId, status])
@@index([status, proximoDisparo])
```

---

## 📅 Controle de Versão
- **Versão**: 1.0
- **Data**: 10/12/2025
- **Status**: Modelo de dados aprovado

- **Versão**: 1.1
- **Data**: 10/12/2025
- **Status**: Adicionado 4º intervalo (intervaloLembreteConfirmacao) e campos de controle de lembretes
