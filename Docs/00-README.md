# 📚 Documentação do Sistema de Lembretes

> Sistema inteligente de gerenciamento de lembretes com notificações automáticas e controle de estados

---

## 📋 Índice da Documentação

### [01 - Visão Geral](./01-VISAO-GERAL.md)
Descrição completa do sistema, objetivos, ciclo de vida dos lembretes e interface esperada.

**Conteúdo**:
- Descrição do sistema
- Ciclo de vida do lembrete
- Estados detalhados (Confirmado, Disparado, Aguardando Confirmação)
- Configurações de intervalos
- Fluxo do usuário
- Tecnologias de notificação

---

### [02 - Fluxo de Estados](./02-FLUXO-DE-ESTADOS.md)
Documentação técnica detalhada sobre transições de estados e cenários de uso.

**Conteúdo**:
- Diagrama de estados (Mermaid)
- Tabela de transições
- Timers e contadores
- Cenários de uso completos
- Regras de negócio
- Casos especiais e edge cases
- Checklist de implementação

---

### [03 - Modelo de Dados](./03-MODELO-DE-DADOS.md)
Estrutura de banco de dados, schemas Prisma e interfaces TypeScript.

**Conteúdo**:
- Schema Prisma completo (Lembrete, Histórico)
- Integração com User model
- Interfaces TypeScript
- Exemplos de dados
- Conversões de tempo
- Validações (Zod)
- Queries úteis
- Índices de performance

---

### [04 - Requisitos Funcionais](./04-REQUISITOS-FUNCIONAIS.md)
Requisitos funcionais e não funcionais, arquitetura técnica e checklist de desenvolvimento.

**Conteúdo**:
- 16 Requisitos Funcionais detalhados
- 7 Requisitos Não Funcionais
- Stack tecnológica
- Estrutura de arquivos proposta
- Fluxos de dados
- Checklist de implementação (9 fases)

---

## 🎯 Resumo Executivo

### O que é o Sistema?

Sistema de lembretes inteligente que:
1. Permite cadastrar atividades com intervalos de tempo configuráveis
2. Dispara notificações automáticas no computador do usuário
3. Gerencia 3 estados: **Confirmado** → **Disparado** → **Aguardando Confirmação**
4. Mantém ciclo contínuo de lembretes

---

### Como Funciona?

```
1. CRIAÇÃO
   Usuário cadastra lembrete com:
   - Título e descrição da atividade
   - Intervalo inicial (ex: 2 horas)
   - Intervalo de recorrência (ex: 1 dia)
   - Intervalo de re-disparo (ex: 5 minutos)
   - Intervalo lembrete de confirmação (ex: 30 minutos)

2. AGUARDANDO (Estado: CONFIRMADO)
   Sistema conta o tempo até próximo disparo

3. DISPARO (Estado: DISPARADO)
   - Pop-up aparece na tela
   - Usuário vê a atividade
   - Clica "VISTO"
   - Se ignorar: pop-up reaparece após intervalo de re-disparo

4. CONFIRMAÇÃO (Estado: AGUARDANDO CONFIRMAÇÃO)
   - Usuário deve acessar plataforma para confirmar
   - Lista de pendentes mostra atividade
   - Se NÃO confirmar: pop-up lembrete aparece após intervalo configurável
   - Pop-up lembrete: "Você ainda não confirmou. Acesse a plataforma!"
   - Re-disparo de lembretes até confirmação
   - Confirma que realizou na plataforma
   - Sistema registra confirmação

5. NOVO CICLO
   - Volta para estado CONFIRMADO
   - Aguarda intervalo de recorrência
   - Dispara novamente
   - Ciclo infinito
```

---

## 🏗️ Stack Tecnológica

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript
- **Estilo**: Tailwind CSS + Shadcn UI
- **Forms**: React Hook Form + Zod
- **State**: Zustand + React Query

### Backend
- **API**: Next.js API Routes + Server Actions
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth.js

### Notificações
- **Browser**: Notification API
- **In-app**: React Hot Toast
- **Scheduler**: Node-cron ou Bull

---

## 📊 Modelo de Dados Simplificado

```typescript
Lembrete {
  id: string
  titulo: string
  descricao?: string

  // Estado
  status: CONFIRMADO | DISPARADO | AGUARDANDO_CONFIRMACAO

  // Intervalos (minutos)
  intervaloInicial: number
  intervaloRecorrencia: number
  intervaloRedisparo: number
  intervaloLembreteConfirmacao: number

  // Timestamps
  dataUltimaConfirmacao: Date
  proximoDisparo: Date

  // Relacionamento
  userId: string
  historico: HistoricoLembrete[]
}
```

---

## 🔄 Estados do Lembrete

| Estado | Descrição | Próxima Ação |
|--------|-----------|--------------|
| **🟢 CONFIRMADO** | Aguardando disparo | Sistema aguarda tempo, depois dispara |
| **🔴 DISPARADO** | Pop-up ativo | Usuário clica "VISTO" ou pop-up reaparece |
| **🟡 AGUARDANDO CONFIRMAÇÃO** | Visto, mas não confirmado | Pop-ups lembrete aparecem até confirmar na plataforma |

**Ciclo**: 🟢 → 🔴 → 🟡 → 🟢 → ...

---

## 📈 Fases de Desenvolvimento

### ✅ Fase 1: Setup (Concluída)
- [x] Análise do template existente
- [x] Documentação completa do sistema
- [x] Definição de requisitos

### 🔜 Fase 2: Banco de Dados
- [ ] Criar schema Prisma
- [ ] Executar migrations
- [ ] Seeds de teste

### 🔜 Fase 3: Backend
- [ ] APIs CRUD
- [ ] Server Actions
- [ ] Scheduler/Cron

### 🔜 Fase 4: Frontend Base
- [ ] Formulários
- [ ] Listagem
- [ ] Detalhes

### 🔜 Fase 5: Notificações
- [ ] Pop-up component
- [ ] Notification API
- [ ] Badge de pendentes

### 🔜 Fase 6: Lógica de Estados
- [ ] Transições automáticas
- [ ] Re-disparo
- [ ] Histórico

### 🔜 Fase 7: Páginas Complementares
- [ ] Dashboard
- [ ] Pendentes
- [ ] Preferências

### 🔜 Fase 8: Testes & Refinamento
- [ ] Testes unitários
- [ ] Testes E2E
- [ ] Otimizações

---

## 🎨 Interfaces Principais

### 1. Listagem de Lembretes
- Tabela/cards com todos os lembretes
- Filtros (status, prioridade)
- Busca
- Ações rápidas (editar, deletar, ativar/desativar)

### 2. Formulário de Criação/Edição
- Campos: título, descrição, prioridade
- Seletores de intervalo (com conversão min/hora/dia)
- Validação em tempo real
- Preview do próximo disparo

### 3. Pop-up de Notificação
- Exibição destacada com informações do lembrete
- Botão "VISTO" em destaque
- Cores por prioridade
- Som opcional

### 4. Lista de Pendentes
- Lembretes aguardando confirmação
- Badge com contador no header
- Botão "CONFIRMAR" para cada item
- Ordenação por data

### 5. Dashboard
- Cards de métricas
- Próximos disparos
- Gráficos de atividade
- Lembretes críticos

---

## 🔐 Segurança

- ✅ Autenticação obrigatória (NextAuth)
- ✅ Isolamento de dados por usuário
- ✅ Validação de dados (Zod)
- ✅ Rate limiting
- ✅ Proteção contra XSS/injection

---

## 📝 Próximos Passos

### Para o Desenvolvedor:

1. **Revisar toda a documentação** (4 arquivos)
2. **Entender o fluxo completo** de estados
3. **Familiarizar-se com o template** dash-tail-full
4. **Começar pela Fase 2**: criação do schema Prisma
5. **Seguir o checklist** de implementação no doc 04

### Para o Product Owner:

1. **Validar requisitos** funcionais (doc 04)
2. **Aprovar interfaces** propostas (doc 01)
3. **Definir prioridades** de features
4. **Fornecer feedback** sobre configurações padrão
5. **Aprovar início** da implementação

---

## ❓ Perguntas Pendentes

Antes de iniciar a implementação, esclarecer:

1. **Configurações padrão** sugeridas?
   - Intervalo inicial padrão?
   - Intervalo de recorrência padrão?
   - Intervalo de re-disparo padrão?

2. **Limites do sistema**?
   - Máximo de lembretes por usuário?
   - Intervalo mínimo permitido?
   - Intervalo máximo permitido?

3. **Notificações por e-mail**?
   - Implementar na primeira versão?
   - Ou deixar para versão futura?

4. **Preferências do usuário**?
   - Horário de silêncio?
   - Dias da semana ativos?
   - Implementar já ou depois?

5. **Dashboard avançado**?
   - Gráficos e estatísticas são prioridade?
   - Ou focar primeiro no core (CRUD + notificações)?

---

## 📞 Contato e Suporte

Para dúvidas sobre a documentação ou sugestões de melhorias, entre em contato.

---

## 📅 Histórico de Versões

| Versão | Data | Alterações |
|--------|------|------------|
| 1.0 | 10/12/2025 | Documentação inicial completa |
| 1.1 | 10/12/2025 | Adicionado 4º intervalo: Lembrete de Confirmação para estado AGUARDANDO |

---

**🎉 Documentação completa e pronta para implementação!**

Todos os aspectos do sistema foram documentados:
- ✅ Visão geral e conceitos
- ✅ Fluxo técnico detalhado
- ✅ Modelo de dados completo
- ✅ Requisitos funcionais e técnicos

**Próximo passo**: Revisar documentação e iniciar implementação.
