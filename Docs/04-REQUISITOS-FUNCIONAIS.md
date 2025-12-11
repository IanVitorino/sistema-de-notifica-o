# Requisitos Funcionais e Técnicos

## 🎯 Requisitos Funcionais

### RF-01: Cadastro de Lembretes
**Descrição**: Usuário deve poder criar novos lembretes

**Critérios de Aceite**:
- [ ] Formulário com campos: título (obrigatório), descrição (opcional), prioridade
- [ ] Configuração de 3 intervalos de tempo
- [ ] Opção de selecionar intervalos em minutos, horas ou dias
- [ ] Validação de campos obrigatórios
- [ ] Mensagem de sucesso após criação
- [ ] Lembrete criado com status inicial "CONFIRMADO"

**Telas**:
- Formulário de criação de lembrete
- Modal de confirmação de criação

---

### RF-02: Listagem de Lembretes
**Descrição**: Usuário visualiza todos os seus lembretes

**Critérios de Aceite**:
- [ ] Tabela/cards com todos os lembretes do usuário
- [ ] Exibir: título, status, prioridade, próximo disparo
- [ ] Filtros por: status, prioridade, ativo/inativo
- [ ] Busca por título/descrição
- [ ] Ordenação por: data de criação, próximo disparo, prioridade
- [ ] Paginação (20 itens por página)
- [ ] Badge visual indicando status
- [ ] Contador de tempo até próximo disparo

**Telas**:
- Página de listagem de lembretes
- Componentes de filtro e busca

---

### RF-03: Edição de Lembretes
**Descrição**: Usuário pode editar lembretes existentes

**Critérios de Aceite**:
- [ ] Formulário pré-preenchido com dados atuais
- [ ] Permitir editar: título, descrição, prioridade, intervalos
- [ ] Validação de campos
- [ ] Mensagem de confirmação antes de salvar
- [ ] Registro de alteração no histórico
- [ ] Recalcular `proximoDisparo` se intervalos mudarem

**Regras**:
- Se status = CONFIRMADO: recalcula próximo disparo imediatamente
- Se status = DISPARADO: mudanças aplicadas no próximo ciclo
- Se status = AGUARDANDO: mudanças aplicadas no próximo ciclo

---

### RF-04: Exclusão de Lembretes
**Descrição**: Usuário pode deletar lembretes

**Critérios de Aceite**:
- [ ] Botão de exclusão na listagem
- [ ] Modal de confirmação ("Tem certeza?")
- [ ] Se estado = DISPARADO: ocultar pop-up imediatamente
- [ ] Registro no histórico antes de deletar
- [ ] Soft delete (opcional) vs Hard delete
- [ ] Mensagem de sucesso

---

### RF-05: Ativar/Desativar Lembretes
**Descrição**: Pausar lembrete sem deletar

**Critérios de Aceite**:
- [ ] Toggle switch "Ativo/Inativo"
- [ ] Lembrete inativo não dispara
- [ ] Manter estado atual ao desativar
- [ ] Ao reativar, recalcular próximo disparo
- [ ] Indicação visual de lembrete inativo

---

### RF-06: Disparo Automático de Notificações
**Descrição**: Sistema verifica e dispara lembretes automaticamente

**Critérios de Aceite**:
- [ ] Verificação periódica (a cada 1 minuto)
- [ ] Buscar lembretes com status CONFIRMADO e `proximoDisparo <= agora`
- [ ] Transição automática para estado DISPARADO
- [ ] Exibir pop-up de notificação
- [ ] Registrar timestamp de disparo
- [ ] Incrementar contador de exibições
- [ ] Atualizar `ultimaExibicao`

**Componente**:
- Scheduler/Cron job
- Background worker

---

### RF-07: Exibição de Pop-up
**Descrição**: Mostrar notificação visual ao usuário

**Critérios de Aceite**:
- [ ] Pop-up com informações do lembrete
- [ ] Exibir: título, descrição, prioridade
- [ ] Botão "VISTO" destacado
- [ ] Som de notificação (opcional, configurável)
- [ ] Notification API do browser (permissão do usuário)
- [ ] Fallback para toast in-app se permissão negada
- [ ] Cores diferentes por prioridade (vermelho = urgente, etc)

**Design**:
```
┌─────────────────────────────┐
│ 🔔 [PRIORIDADE] LEMBRETE    │
├─────────────────────────────┤
│ Título do Lembrete          │
│                             │
│ Descrição detalhada aqui... │
│                             │
│        [  VISTO  ]          │
└─────────────────────────────┘
```

---

### RF-08: Re-disparo de Pop-up
**Descrição**: Re-exibir pop-up se usuário não clicar "VISTO"

**Critérios de Aceite**:
- [ ] Verificação periódica para lembretes DISPARADO
- [ ] Se `agora >= ultimaExibicao + intervaloRedisparo`: re-exibir
- [ ] Incrementar `numeroExibicoes`
- [ ] Atualizar `ultimaExibicao`
- [ ] Sem limite de re-exibições
- [ ] Indicar número da tentativa no pop-up (opcional)

---

### RF-09: Ação "VISTO"
**Descrição**: Usuário marca que viu a notificação

**Critérios de Aceite**:
- [ ] Botão "VISTO" no pop-up
- [ ] Ao clicar: transição para AGUARDANDO_CONFIRMACAO
- [ ] Registrar `dataVisto`
- [ ] Ocultar pop-up
- [ ] Parar timer de re-disparo
- [ ] Registrar ação no histórico
- [ ] Adicionar lembrete na lista de pendentes

---

### RF-10: Lista de Pendentes
**Descrição**: Exibir lembretes aguardando confirmação

**Critérios de Aceite**:
- [ ] Badge/contador no menu principal
- [ ] Página dedicada "Pendentes"
- [ ] Lista de todos os lembretes em AGUARDANDO_CONFIRMACAO
- [ ] Exibir: título, data/hora visto, tempo desde visto
- [ ] Botão "CONFIRMAR" para cada item
- [ ] Possibilidade de confirmar em lote
- [ ] Ordenar por data visto (mais antigos primeiro)

**Telas**:
- Badge no header (contador)
- Página de pendentes
- Modal de confirmação

---

### RF-11: Confirmação de Conclusão
**Descrição**: Usuário confirma que realizou a atividade

**Critérios de Aceite**:
- [ ] Botão "CONFIRMAR" na lista de pendentes
- [ ] Modal opcional para adicionar observação
- [ ] Transição para estado CONFIRMADO
- [ ] Registrar `dataUltimaConfirmacao = agora`
- [ ] Calcular `proximoDisparo = agora + intervaloRecorrencia`
- [ ] Limpar `dataVisto`, `dataDisparo`, `numeroExibicoes`
- [ ] Registrar confirmação no histórico
- [ ] Mensagem de sucesso
- [ ] Remover da lista de pendentes

---

### RF-12: Histórico de Ações
**Descrição**: Rastrear todas as ações do lembrete

**Critérios de Aceite**:
- [ ] Registrar: criação, disparo, visto, confirmação, edição, exclusão
- [ ] Armazenar timestamp, estado anterior/novo
- [ ] Exibir histórico na página de detalhes do lembrete
- [ ] Timeline visual (opcional)
- [ ] Filtrar histórico por tipo de ação
- [ ] Exportar histórico (CSV/PDF - opcional)

---

### RF-13: Detalhes do Lembrete
**Descrição**: Visualizar informações completas

**Critérios de Aceite**:
- [ ] Página/modal de detalhes
- [ ] Exibir todos os campos
- [ ] Status atual com indicação visual
- [ ] Próximo disparo (data/hora + countdown)
- [ ] Estatísticas: total de disparos, confirmações, tempo médio de resposta
- [ ] Histórico de ações
- [ ] Botões de ação: editar, ativar/desativar, excluir

---

### RF-14: Dashboard de Lembretes
**Descrição**: Visão geral de todos os lembretes

**Critérios de Aceite**:
- [ ] Cards com contadores:
  - Total de lembretes
  - Ativos
  - Por estado (Confirmado, Disparado, Aguardando)
  - Por prioridade
- [ ] Gráfico de disparos ao longo do tempo
- [ ] Lista de próximos disparos (hoje, próximas 24h)
- [ ] Taxa de confirmação (% de lembretes confirmados no prazo)
- [ ] Lembretes mais críticos (urgentes + próximos a disparar)

---

### RF-15: Notificações por E-mail (Opcional)
**Descrição**: Enviar lembretes por e-mail também

**Critérios de Aceite**:
- [ ] Configuração por lembrete (enviar e-mail: sim/não)
- [ ] E-mail enviado junto com pop-up ao disparar
- [ ] Template de e-mail com branding
- [ ] Link para acessar plataforma
- [ ] Botão "Marcar como visto" no e-mail (com link)

---

### RF-16: Preferências do Usuário
**Descrição**: Configurações pessoais de notificações

**Critérios de Aceite**:
- [ ] Ativar/desativar sons
- [ ] Ativar/desativar notificações de browser
- [ ] Ativar/desativar notificações por e-mail
- [ ] Horário de silêncio (não disparar entre X e Y)
- [ ] Dias da semana ativos (ex: não disparar fins de semana)

---

### ⭐ RF-17: Lembretes de Confirmação (NOVO)
**Descrição**: Pop-ups lembretes para usuários que não confirmaram atividade na plataforma

**Critérios de Aceite**:
- [ ] Sistema verifica lembretes em estado AGUARDANDO CONFIRMAÇÃO periodicamente
- [ ] Se tempo desde último lembrete >= intervalo configurado: exibir pop-up lembrete
- [ ] Pop-up lembrete exibe mensagem: "Você ainda não confirmou [atividade]. Acesse a plataforma!"
- [ ] Botão "OK" para fechar pop-up lembrete
- [ ] Pop-ups lembretes continuam reaparecendo até usuário confirmar na plataforma
- [ ] Contador de lembretes exibidos (para estatísticas)
- [ ] Ao confirmar na plataforma: parar lembretes e resetar contadores
- [ ] Intervalo de lembrete configurável por lembrete (ex: 30min, 1h, 2h)

**Configuração**:
- 4º intervalo: "Intervalo Lembrete de Confirmação"
- Mínimo: 1 minuto
- Máximo: 1 dia (1440 minutos)
- Padrão sugerido: 30 minutos

---

## ⚙️ Requisitos Não Funcionais

### RNF-01: Performance
- [ ] Sistema deve verificar lembretes a cada 1 minuto (máximo)
- [ ] Queries de banco otimizadas (índices)
- [ ] Busca de lembretes < 500ms
- [ ] Listagem paginada (20-50 itens)
- [ ] Cache de dados frequentes (React Query)

---

### RNF-02: Escalabilidade
- [ ] Suportar até 10.000 usuários simultâneos
- [ ] Cada usuário com até 100 lembretes ativos
- [ ] Background jobs isolados (não bloquear UI)
- [ ] Possibilidade de usar queue system (Redis/Bull) para disparos

---

### RNF-03: Disponibilidade
- [ ] Sistema 99.5% uptime
- [ ] Fallback se servidor de notificação cair
- [ ] Recuperação automática de disparos perdidos
- [ ] Logs de erros e falhas

---

### RNF-04: Segurança
- [ ] Autenticação obrigatória (NextAuth)
- [ ] Usuário só acessa seus próprios lembretes
- [ ] Validação de dados no backend
- [ ] Proteção contra XSS e injection
- [ ] Rate limiting em APIs (max 100 req/min por usuário)

---

### RNF-05: Usabilidade
- [ ] Interface intuitiva (UI/UX)
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Acessibilidade (WCAG 2.1 AA)
- [ ] Feedback visual para todas as ações
- [ ] Mensagens de erro claras

---

### RNF-06: Compatibilidade
- [ ] Browsers modernos (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- [ ] Notification API suportada
- [ ] Fallback para browsers sem suporte
- [ ] PWA (opcional - para instalar no desktop)

---

### RNF-07: Manutenibilidade
- [ ] Código TypeScript (type-safe)
- [ ] Comentários e documentação
- [ ] Testes unitários (cobertura > 70%)
- [ ] Testes de integração
- [ ] Logs estruturados

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológica (Baseado no Template):

**Frontend**:
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn UI (componentes)
- React Hook Form + Zod (formulários)
- React Query (cache/state)

**Backend**:
- Next.js API Routes
- Server Actions
- Prisma ORM
- PostgreSQL

**Notificações**:
- Notification API (browser)
- React Hot Toast (in-app)
- Resend ou NodeMailer (e-mail - opcional)

**Scheduling**:
- Node-cron ou node-schedule
- Ou background job queue (Bull + Redis)

---

### Estrutura de Arquivos Proposta:

```
dash-tail-full/
├── app/
│   ├── [lang]/
│   │   ├── (dashboard)/
│   │   │   ├── lembretes/
│   │   │   │   ├── page.tsx              # Listagem
│   │   │   │   ├── novo/page.tsx         # Criar lembrete
│   │   │   │   ├── [id]/page.tsx         # Detalhes
│   │   │   │   ├── [id]/editar/page.tsx  # Editar
│   │   │   │   └── pendentes/page.tsx    # Lista pendentes
│   ├── api/
│   │   ├── lembretes/
│   │   │   ├── route.ts                  # GET/POST lembretes
│   │   │   ├── [id]/route.ts             # GET/PUT/DELETE by ID
│   │   │   ├── [id]/visto/route.ts       # POST marcar visto
│   │   │   ├── [id]/confirmar/route.ts   # POST confirmar
│   │   │   └── scheduler/route.ts        # Endpoint interno scheduler
│   │   └── notificacoes/
│   │       └── teste/route.ts            # Testar notificação
│
├── action/
│   └── lembrete-action.ts                # Server Actions
│
├── components/
│   ├── lembretes/
│   │   ├── lembrete-card.tsx
│   │   ├── lembrete-form.tsx
│   │   ├── lembrete-list.tsx
│   │   ├── lembrete-filters.tsx
│   │   ├── popup-notification.tsx        # Pop-up component
│   │   ├── pendentes-badge.tsx           # Badge contador
│   │   └── historico-timeline.tsx
│   └── ui/
│       └── ... (Shadcn components)
│
├── lib/
│   ├── scheduler.ts                      # Lógica do scheduler
│   ├── notification-service.ts           # Service de notificações
│   └── lembrete-utils.ts                 # Funções auxiliares
│
├── hooks/
│   ├── use-lembretes.ts                  # Hook para buscar lembretes
│   ├── use-notification.ts               # Hook para Notification API
│   └── use-scheduler.ts                  # Hook para verificar disparos
│
└── prisma/
    └── schema.prisma                     # Schema com models
```

---

## 🔄 Fluxo de Dados

### Criação de Lembrete:
```
User → Formulário → Validação (Zod)
     → Server Action → Prisma → DB
     → Response → Toast Sucesso
     → Redirect para listagem
```

### Verificação de Disparos (Scheduler):
```
Cron Job (1 min) → Buscar lembretes (Prisma)
                 → Filtrar por proximoDisparo <= agora
                 → Para cada lembrete:
                    → Atualizar status = DISPARADO
                    → Criar registro histórico
                    → Emitir evento de notificação
                    → Exibir pop-up
```

### Ação "VISTO":
```
User → Clica botão → POST /api/lembretes/[id]/visto
                   → Validar usuário
                   → Atualizar status = AGUARDANDO_CONFIRMACAO
                   → Registrar dataVisto
                   → Criar histórico
                   → Ocultar pop-up
                   → Response OK
```

### Confirmação:
```
User → Lista Pendentes → Clica "CONFIRMAR"
     → POST /api/lembretes/[id]/confirmar
     → Validar usuário
     → Atualizar status = CONFIRMADO
     → Registrar dataUltimaConfirmacao
     → Calcular proximoDisparo
     → Criar histórico
     → Remover de pendentes
     → Toast sucesso
```

---

## 📋 Checklist de Implementação

### Fase 1: Setup e Infraestrutura
- [ ] Configurar banco de dados (Prisma schema)
- [ ] Migrations
- [ ] Seeds (dados de exemplo)
- [ ] Estrutura de pastas
- [ ] Types e interfaces TypeScript

### Fase 2: Backend
- [ ] API Routes (CRUD lembretes)
- [ ] Server Actions
- [ ] Validações (Zod schemas)
- [ ] Queries otimizadas (Prisma)
- [ ] Scheduler/Cron job

### Fase 3: Frontend - Componentes Base
- [ ] Formulário de criação
- [ ] Listagem com filtros
- [ ] Card/Item de lembrete
- [ ] Página de detalhes
- [ ] Formulário de edição

### Fase 4: Sistema de Notificações
- [ ] Pop-up component
- [ ] Notification API integration
- [ ] Fallback toast in-app
- [ ] Sons de notificação
- [ ] Badge de pendentes no header

### Fase 5: Lógica de Estados
- [ ] Transição CONFIRMADO → DISPARADO
- [ ] Transição DISPARADO → AGUARDANDO
- [ ] Transição AGUARDANDO → CONFIRMADO
- [ ] Re-disparo automático
- [ ] Histórico de ações

### Fase 6: Páginas Complementares
- [ ] Dashboard de lembretes
- [ ] Página de pendentes
- [ ] Preferências de usuário
- [ ] Página de histórico

### Fase 7: Testes
- [ ] Testes unitários (componentes)
- [ ] Testes de integração (API)
- [ ] Testes E2E (fluxo completo)
- [ ] Testes de performance

### Fase 8: Refinamento
- [ ] Responsividade
- [ ] Acessibilidade
- [ ] Otimizações de performance
- [ ] Tratamento de erros
- [ ] Logs e monitoramento

### Fase 9: Documentação
- [ ] README completo
- [ ] Documentação de API
- [ ] Guia de uso
- [ ] Vídeo demo

---

## 📅 Controle de Versão
- **Versão**: 1.0
- **Data**: 10/12/2025
- **Status**: Requisitos aprovados

- **Versão**: 1.1
- **Data**: 10/12/2025
- **Status**: Adicionado RF-17: Lembretes de Confirmação e 4º intervalo configurável
