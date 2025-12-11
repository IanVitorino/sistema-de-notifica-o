# Sistema de Lembretes - Visão Geral

## 📌 Descrição

Sistema de gerenciamento de lembretes/notificações com controle de estados e intervalos configuráveis. O sistema notifica os usuários para realizar atividades cadastradas através de pop-ups no computador.

---

## 🎯 Objetivo

Criar um sistema que:
- Permite cadastrar lembretes/atividades
- Dispara notificações automáticas em intervalos configuráveis
- Exige confirmação do usuário em duas etapas (visualização e conclusão)
- Mantém ciclo contínuo de lembretes

---

## 🔄 Ciclo de Vida do Lembrete

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  CONFIRMADO  →  DISPARADO  →  AGUARDANDO  →  CONFIRMADO │
│                                   CONFIRMAÇÃO           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Ciclo infinito**: Um lembrete confirmado aguarda o tempo definido, dispara, aguarda confirmação do usuário, e retorna ao estado confirmado para iniciar novo ciclo.

---

## 📊 Estados do Lembrete

### 1️⃣ CONFIRMADO / Aguardando Disparo por Tempo
- **Descrição**: Estado inicial e de espera
- **Comportamento**: Não faz nada enquanto o tempo configurado não é ultrapassado
- **Próximo Estado**: DISPARADO (quando tempo é atingido)

### 2️⃣ DISPARADO
- **Descrição**: Notificação ativa exibida ao usuário
- **Comportamento**:
  - Exibe pop-up na tela do usuário
  - Pop-up contém informações da atividade
  - Botão "VISTO" disponível para confirmação
  - Se usuário não clicar "VISTO", pop-up reaparece após intervalo configurado
- **Próximo Estado**: AGUARDANDO CONFIRMAÇÃO (ao clicar "VISTO")

### 3️⃣ AGUARDANDO CONFIRMAÇÃO
- **Descrição**: Usuário visualizou, mas ainda não confirmou conclusão
- **Comportamento**:
  - Usuário deve entrar na plataforma para confirmar
  - Se não confirmar após intervalo configurado, pop-up lembrete aparece
  - Pop-up lembrete: "Você ainda não confirmou a atividade. Acesse a plataforma!"
  - Pop-ups lembretes continuam reaparecendo até confirmação
  - Sistema registra a confirmação quando usuário acessa plataforma
- **Próximo Estado**: CONFIRMADO (após confirmar na plataforma)

---

## ⚙️ Configurações do Lembrete

Cada lembrete possui 4 intervalos de tempo configuráveis:

| Configuração | Descrição | Usado no Estado |
|-------------|-----------|----------------|
| **Intervalo Inicial** | Tempo até o primeiro disparo após confirmação | CONFIRMADO |
| **Intervalo de Re-disparo** | Tempo entre re-exibições do pop-up (se usuário não clicar "VISTO") | DISPARADO |
| **⭐ Intervalo Lembrete Confirmação** | Tempo entre lembretes para confirmar na plataforma (se não confirmar) | AGUARDANDO CONFIRMAÇÃO |
| **Intervalo de Recorrência** | Tempo até próxima execução após confirmação completa | CONFIRMADO → próximo ciclo |

---

## 👤 Fluxo do Usuário

### Criação do Lembrete:
1. Usuário cadastra novo lembrete
2. Define a atividade/tarefa
3. Configura os 4 intervalos de tempo
4. Lembrete entra em estado CONFIRMADO

### Durante Execução:
1. **Tempo passa** → Sistema aguarda intervalo inicial
2. **Pop-up aparece** → Estado muda para DISPARADO
3. **Usuário clica "VISTO"** → Estado muda para AGUARDANDO CONFIRMAÇÃO
4. **Se não confirmar** → Pop-up lembrete aparece após intervalo configurável
5. **Usuário acessa plataforma** → Confirma conclusão da atividade
6. **Estado volta para CONFIRMADO** → Aguarda próximo ciclo

### Se Usuário Ignorar Pop-up (Estado DISPARADO):
1. Pop-up é exibido
2. Usuário não clica "VISTO"
3. Após **intervalo de re-disparo**, pop-up reaparece
4. Ciclo se repete até usuário clicar "VISTO"

### Se Usuário Não Confirmar na Plataforma (Estado AGUARDANDO):
1. Usuário clicou "VISTO" mas não confirmou na plataforma
2. Após **intervalo lembrete de confirmação**, pop-up lembrete aparece
3. Pop-up: "Você ainda não confirmou a atividade. Acesse a plataforma!"
4. Usuário clica "OK" no lembrete
5. Após intervalo, pop-up reaparece se ainda não confirmou
6. Ciclo se repete até usuário confirmar na plataforma

---

## 🎨 Interface Esperada

### Pop-up de Notificação (Estado DISPARADO):
```
┌──────────────────────────────────────┐
│  🔔 LEMBRETE                          │
├──────────────────────────────────────┤
│                                      │
│  Atividade: [Nome da Atividade]     │
│  Descrição: [Detalhes]              │
│                                      │
│  Por favor, realize esta atividade. │
│                                      │
│         ┌──────────┐                 │
│         │  VISTO   │                 │
│         └──────────┘                 │
│                                      │
└──────────────────────────────────────┘
```

### Pop-up Lembrete de Confirmação (Estado AGUARDANDO CONFIRMAÇÃO):
```
┌──────────────────────────────────────┐
│  ⏰ LEMBRETE DE CONFIRMAÇÃO           │
├──────────────────────────────────────┤
│                                      │
│  Você ainda não confirmou:          │
│  "Revisar relatório de vendas"      │
│                                      │
│  Por favor, acesse a plataforma     │
│  para confirmar a conclusão.        │
│                                      │
│         ┌──────────┐                 │
│         │    OK    │                 │
│         └──────────┘                 │
│                                      │
└──────────────────────────────────────┘
```

### Painel de Confirmação (Estado AGUARDANDO CONFIRMAÇÃO):
```
┌──────────────────────────────────────┐
│  📋 Atividades Pendentes             │
├──────────────────────────────────────┤
│                                      │
│  ✓ [Atividade 1]                    │
│    Status: Aguardando confirmação   │
│    Visto em: 10/12/2025 14:30      │
│    ┌───────────────┐                │
│    │  CONFIRMAR    │                │
│    └───────────────┘                │
│                                      │
└──────────────────────────────────────┘
```

---

## 🔔 Tecnologia de Notificações

### Opções para Pop-ups no Computador:

1. **Notification API** (Browser):
   - Notificações nativas do sistema operacional
   - Requer permissão do usuário
   - Funciona mesmo com navegador minimizado

2. **In-app Toast/Dialog**:
   - Pop-up dentro da aplicação web
   - Mais controle sobre aparência
   - Requer aplicação aberta

3. **Electron App** (Futuro):
   - Aplicação desktop dedicada
   - Total controle sobre notificações
   - Funciona em background

**Recomendação Inicial**: Notification API + In-app Dialog (híbrido)

---

## 📅 Data de Criação
10 de Dezembro de 2025

## 🔄 Última Atualização
10 de Dezembro de 2025 - v1.1 (Adicionado intervalo lembrete de confirmação)

## ✍️ Autor
Documentação criada para Sistema de Notificação - Tremonte
