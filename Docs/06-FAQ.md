# FAQ - Perguntas Frequentes

## 📋 Índice de Perguntas

### Conceitos Gerais
1. [Qual a diferença entre os 3 estados?](#q1)
2. [Por que preciso de 3 intervalos diferentes?](#q2)
3. [O lembrete expira alguma vez?](#q3)
4. [Posso pausar um lembrete sem deletar?](#q4)

### Funcionamento
5. [O que acontece se meu computador estiver desligado?](#q5)
6. [As notificações funcionam com navegador fechado?](#q6)
7. [Posso ter múltiplos lembretes ao mesmo tempo?](#q7)
8. [O que acontece se eu não clicar "VISTO"?](#q8)
9. [Existe limite de tempo para confirmar?](#q9)

### Configurações
10. [Qual o intervalo mínimo permitido?](#q10)
11. [Posso alterar os intervalos depois de criar?](#q11)
12. [Existe um limite de lembretes?](#q12)

### Técnicas
13. [Como o sistema verifica os lembretes?](#q13)
14. [As notificações afetam a performance?](#q14)
15. [Os dados são seguros?](#q15)

---

## Respostas

<a name="q1"></a>
### 1. Qual a diferença entre os 3 estados?

**🟢 CONFIRMADO**: O lembrete está "dormindo", aguardando o tempo passar. Não há nenhuma ação visível para o usuário. É como um alarme configurado mas ainda não disparado.

**🔴 DISPARADO**: O pop-up está aparecendo na tela do usuário. É o momento de chamar atenção. Se o usuário ignorar, o pop-up continua reaparecendo até que ele clique "VISTO".

**🟡 AGUARDANDO CONFIRMAÇÃO**: O usuário viu o lembrete (clicou "VISTO"), mas ainda não confirmou que realizou a atividade. O lembrete fica aguardando na lista de pendentes dentro da plataforma.

**Analogia**: É como um lembrete no celular:
- CONFIRMADO = alarme configurado
- DISPARADO = alarme tocando
- AGUARDANDO = você desligou o alarme mas ainda não fez a tarefa

---

<a name="q2"></a>
### 2. Por que preciso de 3 intervalos diferentes?

Cada intervalo controla um comportamento diferente:

**Intervalo Inicial** (ex: 2 horas):
- Tempo até o primeiro disparo após criar ou confirmar o lembrete
- Define quando você quer ser notificado pela primeira vez

**Intervalo de Recorrência** (ex: 24 horas):
- Tempo entre cada ciclo completo (após você confirmar)
- Define a frequência do lembrete (diário, semanal, etc)

**Intervalo de Re-disparo** (ex: 5 minutos):
- Tempo entre re-exibições do pop-up se você não clicar "VISTO"
- Evita que você perca a notificação

**Exemplo Prático**:
- "Quero ser lembrado de beber água **a cada 2 horas** (recorrência)"
- "O primeiro lembrete deve aparecer **daqui 30 minutos** (inicial)"
- "Se eu não ver, reapareça **a cada 5 minutos** (re-disparo)"

---

<a name="q3"></a>
### 3. O lembrete expira alguma vez?

**Não!** Os lembretes são **cíclicos e infinitos** por padrão.

Uma vez confirmado, o lembrete volta para o estado CONFIRMADO e aguarda o próximo disparo. Isso continua indefinidamente até você:
- Desativar o lembrete (pausar)
- Deletar o lembrete

**Caso de Uso**: Perfeito para tarefas recorrentes como:
- Revisar e-mails (a cada hora)
- Check-in diário
- Relatórios semanais
- Backup mensal

Se você precisar de um lembrete único (apenas uma vez), configure intervalos muito longos ou delete após a primeira confirmação.

---

<a name="q4"></a>
### 4. Posso pausar um lembrete sem deletar?

**Sim!** Cada lembrete tem um campo `ativo` (true/false).

- **Ativo = true**: Lembrete funciona normalmente
- **Ativo = false**: Lembrete pausado, não dispara

**Como usar**:
1. Na listagem, clique no toggle "Ativo/Inativo"
2. Lembrete é pausado mas mantém todos os dados
3. Quando reativar, o sistema recalcula o próximo disparo

**Vantagem**: Você não perde configurações. Por exemplo:
- Pausar lembretes de trabalho durante férias
- Desativar temporariamente lembretes menos urgentes
- Manter histórico mesmo quando pausado

---

<a name="q5"></a>
### 5. O que acontece se meu computador estiver desligado?

**Cenário**: Computador desligado durante horário de disparo.

**Comportamento**:
1. O servidor continua funcionando (sistema web, não local)
2. Quando você ligar o computador e acessar a plataforma:
   - Lembretes que deveriam ter disparado aparecem imediatamente
   - Você verá notificações "atrasadas"
3. Sistema detecta `proximoDisparo < agora` e dispara na hora

**Importante**: As notificações dependem de você estar:
- Com o navegador aberto (para Notification API)
- Ou acessando a plataforma web

**Solução Futura**: Aplicação desktop (Electron) que roda em background mesmo com navegador fechado.

---

<a name="q6"></a>
### 6. As notificações funcionam com navegador fechado?

**Atualmente**: **Não**. É necessário ter:
- Navegador aberto
- Pelo menos uma aba com a plataforma (pode estar em background)

**Tecnologia**: Notification API do browser precisa da página ativa.

**Alternativas**:
1. **Manter aba aberta**: Deixar plataforma em aba do navegador
2. **Notificações por E-mail** (opcional): Receber lembretes por e-mail também
3. **PWA Instalado**: Instalar como app (pode funcionar em segundo plano)
4. **Aplicação Desktop** (futuro): Electron app rodando em background

**Recomendação Atual**: Mantenha uma aba do navegador aberta com a plataforma durante o expediente.

---

<a name="q7"></a>
### 7. Posso ter múltiplos lembretes ao mesmo tempo?

**Sim!** Sem limites práticos.

**Comportamento com múltiplos disparos simultâneos**:
- Opção 1: Pop-ups exibidos sequencialmente (um após o outro)
- Opção 2: Lista de lembretes em único pop-up
- Opção 3: Pop-ups empilhados (depende do browser)

**Organização**:
- Use **prioridades** (BAIXA, MÉDIA, ALTA, URGENTE)
- Filtre por **status** na listagem
- **Dashboard** mostra visão geral de todos

**Limites Sugeridos** (configuráveis):
- Máximo 100 lembretes ativos por usuário
- Máximo 10 disparos simultâneos

---

<a name="q8"></a>
### 8. O que acontece se eu não clicar "VISTO"?

**Comportamento**: Pop-up reaparece automaticamente!

**Ciclo de Re-disparo**:
```
10:00 - Pop-up exibido (1ª vez)
        ↓ Usuário ignora...
10:05 - Pop-up RE-EXIBIDO (2ª vez)  [+5 min]
        ↓ Usuário ignora novamente...
10:10 - Pop-up RE-EXIBIDO (3ª vez)  [+5 min]
        ↓ Continua indefinidamente...
10:15 - Pop-up RE-EXIBIDO (4ª vez)
...
```

**Sem limite**: Pop-up continua reaparecendo até você clicar "VISTO".

**Intervalo configurável**: Você define o tempo entre re-exibições (ex: 5 min, 10 min, 1 hora).

**Contador**: Sistema registra número de exibições (pode ser exibido no pop-up: "Tentativa #3").

---

<a name="q9"></a>
### 9. Existe limite de tempo para confirmar?

**Não!** No estado **AGUARDANDO CONFIRMAÇÃO**, não há timeout.

**Comportamento**:
- Você clicou "VISTO" hoje às 10:00
- Pode confirmar hoje, amanhã, na próxima semana...
- Lembrete permanece na lista de pendentes indefinidamente

**Vantagens**:
- Flexibilidade para confirmar quando puder
- Não perde o lembrete se esquecer

**Desvantagens**:
- Pode acumular pendentes se não confirmar regularmente
- Usuário precisa disciplina

**Solução**:
- Badge com contador de pendentes no header
- Ordenação por data (mais antigos primeiro)
- Possibilidade de confirmar em lote

---

<a name="q10"></a>
### 10. Qual o intervalo mínimo permitido?

**Valores Sugeridos**:

| Tipo | Mínimo Recomendado | Máximo |
|------|-------------------|---------|
| **Intervalo Inicial** | 1 minuto | 1 ano (525.600 min) |
| **Intervalo Recorrência** | 1 minuto | 1 ano |
| **Intervalo Re-disparo** | 1 minuto | 1 hora (60 min) |

**Validações**:
- Mínimo: 1 minuto (evita spam de notificações)
- Máximo: 1 ano (lembretes anuais)

**Re-disparo limitado**:
- Máximo 1 hora para evitar intervalos muito longos
- Se você quer re-exibir depois de 1h, melhor aumentar intervalo inicial

**Observação**: Valores muito baixos (ex: 1 min) podem ser irritantes. Use com cautela!

---

<a name="q11"></a>
### 11. Posso alterar os intervalos depois de criar?

**Sim!** Você pode editar lembretes a qualquer momento.

**Comportamento ao editar**:

**Se estado = CONFIRMADO**:
- Recalcula `proximoDisparo` imediatamente
- Mudanças aplicadas agora

**Se estado = DISPARADO**:
- Pop-up continua com configuração antiga
- Mudanças aplicadas no próximo ciclo (após confirmação)

**Se estado = AGUARDANDO CONFIRMAÇÃO**:
- Não afeta estado atual
- Mudanças aplicadas no próximo ciclo

**Exemplo**:
1. Criar lembrete com recorrência = 1 dia
2. Usar por uma semana
3. Editar para recorrência = 2 dias
4. A partir da próxima confirmação, dispara a cada 2 dias

**Histórico**: Todas as edições são registradas no histórico do lembrete.

---

<a name="q12"></a>
### 12. Existe um limite de lembretes?

**Técnico**: Não há limite hard-coded no sistema.

**Recomendações**:

**Por Usuário**:
- Máximo sugerido: **100 lembretes ativos**
- Ilimitados inativos (pausados)
- Permite grande flexibilidade sem sobrecarregar

**Performance**:
- Sistema otimizado para milhares de lembretes
- Índices de banco garantem consultas rápidas
- Paginação na listagem (20-50 por página)

**UX**:
- Muitos lembretes ativos = difícil gerenciar
- Use prioridades e filtros
- Considere desativar lembretes menos importantes

**Limite Configurável**: Administrador pode definir limites por usuário ou plano (caso tenha assinatura premium).

---

<a name="q13"></a>
### 13. Como o sistema verifica os lembretes?

**Tecnologia**: Cron Job / Scheduler

**Funcionamento**:
```
┌─────────────────────────────────────────┐
│  A cada 1 minuto:                       │
│                                         │
│  1. Buscar lembretes:                   │
│     WHERE status = CONFIRMADO           │
│       AND ativo = true                  │
│       AND proximoDisparo <= AGORA       │
│                                         │
│  2. Para cada lembrete encontrado:      │
│     - Mudar status para DISPARADO       │
│     - Registrar timestamp               │
│     - Emitir evento de notificação      │
│     - Exibir pop-up                     │
│                                         │
│  3. Buscar lembretes para re-disparar:  │
│     WHERE status = DISPARADO            │
│       AND ultima_exibicao + intervalo   │
│           <= AGORA                      │
│                                         │
│  4. Re-exibir pop-ups                   │
└─────────────────────────────────────────┘
```

**Precisão**: ±1 minuto
- Se lembrete deve disparar às 10:00:00
- Pode disparar entre 10:00:00 e 10:01:00
- Precisão aceitável para lembretes

**Alternativas Futuras**:
- Verificação mais frequente (30s, 15s)
- WebSockets para notificações instantâneas
- Server-Sent Events (SSE)

---

<a name="q14"></a>
### 14. As notificações afetam a performance?

**Impacto Mínimo!**

**Frontend**:
- Pop-ups são leves (componentes React simples)
- Notification API nativa do browser (sem overhead)
- Cache com React Query (menos requisições)

**Backend**:
- Queries otimizadas (índices em status, proximoDisparo, userId)
- Scheduler roda em background (não bloqueia UI)
- Máximo 1 query por minuto por usuário

**Banco de Dados**:
- Índices garantem consultas < 50ms
- Tabelas normalizadas
- Limpeza periódica de histórico antigo (opcional)

**Testes de Performance** (estimados):
- 10.000 usuários simultâneos
- 100 lembretes ativos cada
- Verificação a cada 1 min = 10.000 queries/min
- Com índices = ~500ms total

**Conclusão**: Performance excelente mesmo com muitos usuários.

---

<a name="q15"></a>
### 15. Os dados são seguros?

**Sim!** Múltiplas camadas de segurança.

**Autenticação**:
- NextAuth.js (sessões seguras)
- JWT tokens (httpOnly cookies)
- OAuth Google (opcional)

**Autorização**:
- Usuário só acessa seus próprios lembretes
- Validação de propriedade em todas as APIs
- Middleware de proteção de rotas

**Validação de Dados**:
- Zod schemas no backend e frontend
- Sanitização de inputs
- Proteção contra XSS e SQL injection

**Database**:
- PostgreSQL (confiável e robusto)
- Backups regulares
- Conexões criptografadas

**Rate Limiting**:
- Máximo 100 requisições/minuto por usuário
- Proteção contra spam e abuse

**Privacy**:
- Dados isolados por usuário
- LGPD compliant (dados podem ser deletados)
- Sem compartilhamento de dados

---

## 💡 Perguntas Adicionais?

Se você tem dúvidas não respondidas aqui:

1. **Consulte a documentação completa**:
   - [Visão Geral](./01-VISAO-GERAL.md)
   - [Fluxo de Estados](./02-FLUXO-DE-ESTADOS.md)
   - [Modelo de Dados](./03-MODELO-DE-DADOS.md)
   - [Requisitos](./04-REQUISITOS-FUNCIONAIS.md)
   - [Diagramas](./05-DIAGRAMA-VISUAL.md)

2. **Entre em contato** com a equipe de desenvolvimento

3. **Teste o sistema** e envie feedback

---

## 📅 Última Atualização
10 de Dezembro de 2025 - v1.1 (Adicionado 4º intervalo: Lembrete de Confirmação)
