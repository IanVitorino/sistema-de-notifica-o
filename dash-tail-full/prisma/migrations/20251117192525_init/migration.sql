-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'BLOCKED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entityId" TEXT,
    "entityType" TEXT,
    "event" TEXT,
    "description" TEXT,
    "ipAddress" TEXT,
    "meta" TEXT,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Company',
    "logo" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "address" TEXT,
    "websiteURL" TEXT,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "currencyFormat" TEXT NOT NULL DEFAULT '$ {value}',
    "socialFacebook" TEXT,
    "socialTwitter" TEXT,
    "socialInstagram" TEXT,
    "socialLinkedIn" TEXT,
    "socialPinterest" TEXT,
    "socialYoutube" TEXT,
    "notifyStockEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyStockWeb" BOOLEAN NOT NULL DEFAULT true,
    "notifyStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "notifyStockRoleIds" TEXT[],
    "notifyNewOrderEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyNewOrderWeb" BOOLEAN NOT NULL DEFAULT true,
    "notifyNewOrderRoleIds" TEXT[],
    "notifyOrderStatusUpdateEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyOrderStatusUpdateWeb" BOOLEAN NOT NULL DEFAULT true,
    "notifyOrderStatusUpdateRoleIds" TEXT[],
    "notifyPaymentFailureEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyPaymentFailureWeb" BOOLEAN NOT NULL DEFAULT true,
    "notifyPaymentFailureRoleIds" TEXT[],
    "notifySystemErrorFailureEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifySystemErrorWeb" BOOLEAN NOT NULL DEFAULT true,
    "notifySystemErrorRoleIds" TEXT[],

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "country" TEXT,
    "timezone" TEXT,
    "name" TEXT,
    "roleId" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'INACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSignInAt" TIMESTAMP(3),
    "emailVerifiedAt" TIMESTAMP(3),
    "isTrashed" BOOLEAN NOT NULL DEFAULT false,
    "avatar" TEXT,
    "invitedByUserId" TEXT,
    "isProtected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isTrashed" BOOLEAN NOT NULL DEFAULT false,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isProtected" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "condicoes_pagamento" (
    "id" SERIAL NOT NULL,
    "fk_cliente" INTEGER,
    "fk_fabrica" INTEGER,
    "cond_100" SMALLINT,
    "cond_2" SMALLINT,
    "cond_3" SMALLINT,
    "cond_4" SMALLINT,
    "cond_5" SMALLINT,
    "descontos_1" DOUBLE PRECISION,
    "descontos_2" DOUBLE PRECISION,
    "descontos_3" DOUBLE PRECISION,
    "descontos_4" DOUBLE PRECISION,
    "descontos_5" DOUBLE PRECISION,
    "observacao" VARCHAR(300),
    "codigo_cliente_fabrica" VARCHAR(20),
    "fk_transportadora" INTEGER,
    "desconto_ds" VARCHAR(12),
    "lista_preco_ds" VARCHAR(12),
    "cond_1" VARCHAR(12),
    "codigo_transportadora_fabrica" VARCHAR(30),
    "cod_cond_pagamento" VARCHAR(20),

    CONSTRAINT "pk_condicoes" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado" (
    "id" SERIAL NOT NULL,
    "uf" VARCHAR(2),
    "descricao" VARCHAR(60),

    CONSTRAINT "pk_estado" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcao" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(40),
    "codigo_funcao" VARCHAR(20),
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "pk_funcao_menu" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu" (
    "id" SERIAL NOT NULL,
    "fk_origem" INTEGER,
    "nome" VARCHAR(30),
    "url" VARCHAR(120),
    "nivel" SMALLINT,
    "status" BOOLEAN DEFAULT true,
    "codigo" INTEGER,
    "descricao" VARCHAR(60),

    CONSTRAINT "pk_item_menu" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_funcao" (
    "id" SERIAL NOT NULL,
    "fk_menu" INTEGER,
    "fk_funcao" INTEGER,

    CONSTRAINT "menu_funcao_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos" (
    "id" SERIAL NOT NULL,
    "fk_cliente" INTEGER,
    "cliente" BOOLEAN DEFAULT false,
    "cliente_valor" DOUBLE PRECISION,
    "fornecedor" BOOLEAN DEFAULT false,
    "fornecedor_valor" DOUBLE PRECISION,
    "produto" BOOLEAN DEFAULT false,
    "produto_valor" DOUBLE PRECISION,

    CONSTRAINT "pk_plano" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topfox_utilizacao_material" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(60),

    CONSTRAINT "pk_utilizacao_material" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_cliente" (
    "id" SERIAL NOT NULL,
    "razao_social" VARCHAR(60),
    "fantasia" VARCHAR(60),
    "cnpj" VARCHAR(18),
    "grupo_clientes" INTEGER,
    "endereco" VARCHAR(60),
    "bairro" VARCHAR(60),
    "cidade" VARCHAR(30),
    "estado" INTEGER,
    "cep" VARCHAR(11),
    "inscricao_estadual" VARCHAR(18),
    "contato_email" VARCHAR(120),
    "contato_nome" VARCHAR(80),
    "contato_telefone" VARCHAR(16),
    "contato_telefone_ramal" VARCHAR(4),
    "contato_celular" VARCHAR(16),
    "contato_radio" VARCHAR(17),
    "contato_fax" VARCHAR(16),
    "contato_regiao" INTEGER,
    "fk_vendedor" INTEGER,
    "entrega_endereco" VARCHAR(60),
    "entrega_bairro" VARCHAR(60),
    "entrega_cidade" VARCHAR(30),
    "entrega_estado" INTEGER,
    "entrega_cep" VARCHAR(10),
    "entrega_nfexml" VARCHAR(100),
    "cobranca_endereco" VARCHAR(60),
    "cobranca_bairro" VARCHAR(60),
    "cobranca_cidade" VARCHAR(30),
    "cobranca_estado" INTEGER,
    "cobranca_cep" VARCHAR(10),
    "transportadora" INTEGER,
    "situacao" BOOLEAN,
    "situacao_desde" DATE,
    "situacao_ate" DATE,
    "receber_email_servico" BOOLEAN,
    "habilitado" BOOLEAN,
    "criterio_pagamento" INTEGER,
    "motivo_bloqueio" INTEGER,
    "status" BOOLEAN DEFAULT true,
    "observacao" VARCHAR(200),

    CONSTRAINT "pk_cliente" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_criterio_pagamento" (
    "id" SERIAL NOT NULL,
    "criterio" VARCHAR(20),
    "descricao" VARCHAR(60),

    CONSTRAINT "pk_criterio" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_fabricante" (
    "id" SERIAL NOT NULL,
    "razao_social" VARCHAR(80),
    "fantasia" VARCHAR(60),
    "endereco" VARCHAR(60),
    "bairro" VARCHAR(60),
    "cidade" VARCHAR(30),
    "estado" INTEGER,
    "cep" VARCHAR(10),
    "cnpj" VARCHAR(18),
    "inscricao" VARCHAR(16),
    "contato_email_pedidos" VARCHAR(60),
    "contato_email_contato" VARCHAR(200),
    "contato_nfe_xml" VARCHAR(100),
    "contato_nome_contato" VARCHAR(30),
    "contato_telefone1" VARCHAR(16),
    "contato_telefone1_ramal" VARCHAR(4),
    "contato_telefone2" VARCHAR(16),
    "contato_telefone2_ramal" VARCHAR(4),
    "contato_fax" VARCHAR(20),
    "codigo_representada" VARCHAR(6),
    "inicio_representada" DATE,
    "criterio_pagamento" INTEGER,
    "base_do_dia" VARCHAR(2),
    "base_ate" VARCHAR(2),
    "anexo_txt" BOOLEAN,
    "anexo_xls" BOOLEAN,
    "dia_vencimento" VARCHAR(2),
    "porcent_comissao" DOUBLE PRECISION,
    "fechamento_periodo" VARCHAR(2),
    "emite_nota" BOOLEAN,
    "habilitado" BOOLEAN DEFAULT true,
    "status" BOOLEAN DEFAULT true,
    "anexo_xml" BOOLEAN DEFAULT false,
    "ident_usuario" VARCHAR(20),
    "ident_empresa" VARCHAR(20),
    "anexo_json" BOOLEAN,
    "num_ped_cli" BOOLEAN DEFAULT true,

    CONSTRAINT "pk_tremonte_fabricante" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_fat" (
    "id" SERIAL NOT NULL,
    "dtemissao" VARCHAR(10),
    "nfiscal" VARCHAR(30),
    "serie" VARCHAR(3),
    "destinatario" VARCHAR(18),
    "emitente" VARCHAR(18),
    "codigo" VARCHAR(20),
    "quantidade" DOUBLE PRECISION,
    "original" VARCHAR(30),
    "tremonte" VARCHAR(30),
    "data_cadastro" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "arquivo" VARCHAR(60),
    "fkfabrica" INTEGER DEFAULT 0,
    "fkcliente" INTEGER DEFAULT 0,
    "fkcodigo" INTEGER DEFAULT 0,
    "fktremonte" INTEGER DEFAULT 0,
    "fkoriginal" INTEGER DEFAULT 0,
    "fkrefpeditem" INTEGER DEFAULT 0,
    "fknota" INTEGER DEFAULT 0,

    CONSTRAINT "tremonte_fat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_fat_arq" (
    "id" INTEGER NOT NULL,
    "dtemissao" VARCHAR(10),
    "nfiscal" VARCHAR(30),
    "serie" VARCHAR(3),
    "destinatario" VARCHAR(18),
    "emitente" VARCHAR(18),
    "codigo" VARCHAR(20),
    "quantidade" DOUBLE PRECISION,
    "original" VARCHAR(30),
    "tremonte" VARCHAR(30),
    "data_cadastro" TIMESTAMP(6),
    "arquivo" VARCHAR(60),
    "fkcodigo" INTEGER DEFAULT 0,
    "fkrefpeditem" INTEGER DEFAULT 0,
    "processamento" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tremonte_fat_arq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_faturamento" (
    "id" SERIAL NOT NULL,
    "cnpj_destinatario" VARCHAR(20),
    "cnpj_emitente" VARCHAR(20),
    "fk_erro" INTEGER,
    "status" INTEGER DEFAULT 0,
    "data_cadastro" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "nota_fiscal" VARCHAR(60),
    "protocolo" VARCHAR(60),
    "vincular" INTEGER,
    "total" DOUBLE PRECISION,
    "pedido" VARCHAR(60),
    "data_emissao" VARCHAR(30),

    CONSTRAINT "tremonte_faturamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_faturamento_config" (
    "pop3" VARCHAR(80),
    "email" VARCHAR(80),
    "senha" VARCHAR(20),
    "porta" VARCHAR(8),
    "frequencia" INTEGER,
    "logs" BOOLEAN,
    "status" BOOLEAN,
    "diretorio" VARCHAR(200),
    "servico" INTEGER,
    "ultimo_id" VARCHAR(100),
    "fatt_conf_id" SERIAL NOT NULL,

    CONSTRAINT "tremonte_faturamento_config_pkey" PRIMARY KEY ("fatt_conf_id")
);

-- CreateTable
CREATE TABLE "tremonte_faturamento_detalhamento" (
    "id" SERIAL NOT NULL,
    "fk_tremonte_faturamento" INTEGER,
    "status" INTEGER,
    "valor_total" DOUBLE PRECISION,
    "vincular" INTEGER,
    "data_cadastro" TIMESTAMPTZ(6),
    "quant" INTEGER,
    "valor_unitario" DOUBLE PRECISION,
    "icms" DOUBLE PRECISION,
    "pis" DOUBLE PRECISION,
    "cofins" DOUBLE PRECISION,
    "ipi" DOUBLE PRECISION,
    "xped" VARCHAR(80),
    "produto" VARCHAR(80),
    "saldo" INTEGER,
    "fk_erro" INTEGER,
    "processado" INTEGER DEFAULT 0,

    CONSTRAINT "tremonte_faturamento_detalhamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_faturamento_log" (
    "id" SERIAL NOT NULL,
    "status" INTEGER,
    "data" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "descricao" VARCHAR(300),

    CONSTRAINT "pk_faturamento_log" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_faturamento_log_detalhes" (
    "id" SERIAL NOT NULL,
    "log" INTEGER,
    "status" INTEGER,
    "descricao" VARCHAR(120),

    CONSTRAINT "pk_faturamento_log_details" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_fatvinculo_pedido" (
    "id" SERIAL NOT NULL,
    "fk_faturamento_detalhe" INTEGER,
    "fk_pedido_detalhe" INTEGER,
    "fk_produto" INTEGER,
    "quantidade" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valor" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "pk_vinc" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_grupo_clientes" (
    "id" SERIAL NOT NULL,
    "codigo_grupo" VARCHAR(6),
    "descricao" VARCHAR(60),
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "pk_grupo_cliente" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_grupo_produto" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(6),
    "descricao" VARCHAR(60),
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "pk_grupo_produto" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_grupo_produto_fabricante" (
    "id" SERIAL NOT NULL,
    "fk_grupo_produto" INTEGER,
    "fk_fabricante" INTEGER,

    CONSTRAINT "pk_grupo_produto_fabricante" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_linha_produto" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(6),
    "descricao" VARCHAR(60),

    CONSTRAINT "pk_linha_produto" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_lista_preco" (
    "id" SERIAL NOT NULL,
    "fk_fabricante" INTEGER,
    "nome_lista" VARCHAR(25),
    "atual" BOOLEAN,

    CONSTRAINT "pk_lista" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_lista_preco_item" (
    "id" SERIAL NOT NULL,
    "fk_lista_preco" INTEGER,
    "fk_produto" INTEGER,
    "preco" DOUBLE PRECISION,
    "master" SMALLINT,

    CONSTRAINT "pk_lista_item" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_logs" (
    "id" SERIAL NOT NULL,
    "fk_usuario" INTEGER,
    "acao" VARCHAR(200),
    "data" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "codigo_tela" INTEGER,

    CONSTRAINT "pk_logs" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_marca_produto" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(6),
    "descricao" VARCHAR(60),

    CONSTRAINT "pk_marca_produto" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_menu" (
    "id" SERIAL NOT NULL,
    "menu" INTEGER,
    "nome" VARCHAR(20),
    "id_interface" INTEGER,

    CONSTRAINT "pk_menu" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_menu_item" (
    "id" SERIAL NOT NULL,
    "origem" INTEGER,
    "nome" VARCHAR(20),
    "id_interface" INTEGER,

    CONSTRAINT "pk_menu_item" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_menu_sub_item" (
    "id" SERIAL NOT NULL,
    "origem" INTEGER,
    "menu" INTEGER,
    "nome" VARCHAR(20),

    CONSTRAINT "pk_sub_item" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_motivo_bloqueio" (
    "id" SERIAL NOT NULL,
    "motivo" VARCHAR(20),
    "descricao" VARCHAR(60),
    "bloq" BOOLEAN DEFAULT false,

    CONSTRAINT "pk_cmotivo_bloqueio" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_motivo_bloqueio_fabricante" (
    "id" SERIAL NOT NULL,
    "motivo" VARCHAR(20),
    "descricao" VARCHAR(60),

    CONSTRAINT "pk_motivo_bloqueio_fabricante" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_motivo_bloqueio_produto" (
    "id" SERIAL NOT NULL,
    "motivo" VARCHAR(20),
    "descricao" VARCHAR(60),
    "bloq" BOOLEAN DEFAULT false,

    CONSTRAINT "pk_motivo_bloqueio_produto" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_motivo_bloqueio_vendedor" (
    "id" SERIAL NOT NULL,
    "motivo" VARCHAR(20),
    "descricao" VARCHAR(60),

    CONSTRAINT "pk_motivo_bloqueio_vendedor" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_ped_acao" (
    "id" SERIAL NOT NULL,
    "criacao" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "fabricante" INTEGER DEFAULT 0,
    "cliente" INTEGER DEFAULT 0,
    "pedido" INTEGER DEFAULT 0,
    "tipoacao" INTEGER DEFAULT 0,
    "status" BOOLEAN DEFAULT true,
    "usuario" INTEGER DEFAULT 0,
    "realizado" TIMESTAMPTZ(6),

    CONSTRAINT "tremonte_ped_acao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_pedido" (
    "id" SERIAL NOT NULL,
    "status" SMALLINT,
    "fabricante" INTEGER,
    "cliente" INTEGER,
    "transportadora" INTEGER,
    "data_pedido" DATE DEFAULT CURRENT_TIMESTAMP,
    "pedido_original" VARCHAR(20),
    "lista_preco" INTEGER,
    "data_faturamento" DATE,
    "cond_2" SMALLINT,
    "cond_3" SMALLINT,
    "cond_4" SMALLINT,
    "cond_5" SMALLINT,
    "descontos_1" DOUBLE PRECISION,
    "descontos_2" DOUBLE PRECISION,
    "descontos_3" DOUBLE PRECISION,
    "descontos_4" DOUBLE PRECISION,
    "descontos_5" DOUBLE PRECISION,
    "promocional" BOOLEAN,
    "exportacao" BOOLEAN,
    "observacao" VARCHAR(400),
    "motivo_bloqueio" VARCHAR(400),
    "download_xml" BOOLEAN DEFAULT false,
    "status_envio_pedido" INTEGER DEFAULT 1,
    "orcamento" BOOLEAN DEFAULT false,
    "criterio_pagamento" INTEGER DEFAULT 0,
    "cond_1" VARCHAR(10),
    "motivo_erro" VARCHAR(200),
    "data_chegada" TIMESTAMPTZ(6),
    "data_envio" TIMESTAMPTZ(6),
    "email" BOOLEAN DEFAULT false,

    CONSTRAINT "pk_tremonte_pedido" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_pedido_email" (
    "id" SERIAL NOT NULL,
    "pedido" INTEGER,
    "data" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "destinatario" VARCHAR(200),
    "tipo" VARCHAR(150),
    "log" VARCHAR(500),

    CONSTRAINT "tremonte_pedido_email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_pedido_itens" (
    "id" SERIAL NOT NULL,
    "pedido" INTEGER,
    "produto" INTEGER,
    "quantidade" INTEGER,
    "valor" DOUBLE PRECISION,
    "valor_descontado" DOUBLE PRECISION,
    "promocional" BOOLEAN,
    "saldo" INTEGER DEFAULT 0,
    "total_fat" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "pk_pedido_item" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_pedido_log" (
    "id_pedido" INTEGER,
    "data_saida" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "ped_log" SERIAL NOT NULL,

    CONSTRAINT "tremonte_pedido_log_pkey" PRIMARY KEY ("ped_log")
);

-- CreateTable
CREATE TABLE "tremonte_pedido_servico" (
    "id" SERIAL NOT NULL,
    "pedido" INTEGER,
    "processar" BOOLEAN,
    "conteudo" BYTEA,

    CONSTRAINT "pk_tremonte_pedido_servico" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_produto" (
    "id" SERIAL NOT NULL,
    "fk_fabricante" INTEGER,
    "codigo" VARCHAR(20),
    "descricao" VARCHAR(100),
    "desc_reduzida" VARCHAR(25),
    "grupo_produto" INTEGER,
    "linha_produto" INTEGER,
    "marca_produto" INTEGER,
    "codigo_original" VARCHAR(20),
    "unidade_medida" INTEGER,
    "produto_substituido" VARCHAR(20),
    "validade" DATE,
    "motivo_bloqueio" INTEGER,
    "inicio_bloq" DATE,
    "termino_bloq" DATE,
    "grupo_2" VARCHAR DEFAULT 10,

    CONSTRAINT "pk_produto" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_regiao_zona" (
    "id" SERIAL NOT NULL,
    "codigo_regiao" VARCHAR(20),
    "codigo_zona" VARCHAR(20),
    "descricao_regiao" VARCHAR(80),
    "descricao_zona_estatica" VARCHAR(80),
    "descricao_reduzida" VARCHAR(50),

    CONSTRAINT "pk_regiao_zona" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_transportadora" (
    "id" SERIAL NOT NULL,
    "razao" VARCHAR(80),
    "fantasia" VARCHAR(60),
    "cnpj" VARCHAR(18),
    "endereco" VARCHAR(60),
    "bairro" VARCHAR(60),
    "cep" VARCHAR(40),
    "cidade" VARCHAR(40),
    "uf" INTEGER,
    "fone" VARCHAR(16),
    "fax" VARCHAR(16),
    "email" VARCHAR(60),
    "contato" VARCHAR(40),
    "contato2" VARCHAR(20),
    "codigo_servico" VARCHAR(30),

    CONSTRAINT "pk_transportadoras" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_unidade_medida" (
    "id" SERIAL NOT NULL,
    "unidade" VARCHAR(2),
    "descricao" VARCHAR(60),

    CONSTRAINT "pk_unidade_medida" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_usuario" (
    "id" SERIAL NOT NULL,
    "grupo" INTEGER,
    "status" BOOLEAN DEFAULT true,
    "nome" VARCHAR(60),
    "usuario" VARCHAR(30),
    "senha" VARCHAR(32),
    "email" VARCHAR(80),
    "adm" BOOLEAN DEFAULT false,
    "troca_senha" BOOLEAN DEFAULT true,
    "modelo" BOOLEAN DEFAULT false,
    "config_usuario" INTEGER DEFAULT 0,
    "vendedor" BOOLEAN DEFAULT false,

    CONSTRAINT "pk_tremonte_usuario" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_usuario_acesso" (
    "id" SERIAL NOT NULL,
    "usuario" INTEGER,
    "item_menu" SMALLINT,

    CONSTRAINT "pk_usuario_acesso" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_usuario_grupo" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(20),

    CONSTRAINT "pk_usuario_grupo" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_usuario_grupo_acesso" (
    "id" SERIAL NOT NULL,
    "fk_grupo" INTEGER,
    "item_menu" SMALLINT,

    CONSTRAINT "pk_acesso_grupo" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_usuario_modelo" (
    "id" SERIAL NOT NULL,
    "fk_tremonte_usuario" INTEGER,
    "descricao" VARCHAR(120),
    "alias" VARCHAR(60),

    CONSTRAINT "pk_tremonte_usuario_modelo" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_vendedor" (
    "id" SERIAL NOT NULL,
    "apelido" VARCHAR(20),
    "nome" VARCHAR(60),
    "endereco" VARCHAR(60),
    "cep" VARCHAR(10),
    "bairro" VARCHAR(60),
    "cidade" VARCHAR(20),
    "uf" INTEGER,
    "celular" VARCHAR(16),
    "telefone" VARCHAR(16),
    "ramal" VARCHAR(4),
    "comissao" DOUBLE PRECISION,
    "email" VARCHAR(120),
    "rg" VARCHAR(12),
    "cpf" VARCHAR(18),
    "imagem" VARCHAR(60),
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "pk_tremonte_vendedor" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_vendedor_banco" (
    "id" SERIAL NOT NULL,
    "fk_vendedor" INTEGER,
    "banco" VARCHAR(30),
    "agencia" VARCHAR(7),
    "conta" VARCHAR(10),
    "tipo" SMALLINT,
    "preferencial" BOOLEAN,

    CONSTRAINT "pk_vendedor_banco" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tremonte_vendedor_regiao" (
    "id" SERIAL NOT NULL,
    "fk_vendedor" INTEGER,
    "regiao" INTEGER,

    CONSTRAINT "pk_vendedor_regiao" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_menu" (
    "id" SERIAL NOT NULL,
    "fk_usuario" INTEGER,
    "fk_menu" INTEGER,
    "fk_func" INTEGER,

    CONSTRAINT "pk_usuario_menu" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_vendedor" (
    "id" SERIAL NOT NULL,
    "fk_usuario" INTEGER,
    "fk_vendedor" INTEGER,

    CONSTRAINT "pk_usuario_vendedor" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "SystemLog_userId_idx" ON "SystemLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_invitedByUserId_idx" ON "User"("invitedByUserId");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_slug_key" ON "UserPermission"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_slug_key" ON "UserRole"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_name_key" ON "UserRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserRolePermission_roleId_permissionId_key" ON "UserRolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemLog" ADD CONSTRAINT "SystemLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRolePermission" ADD CONSTRAINT "UserRolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "UserPermission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRolePermission" ADD CONSTRAINT "UserRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condicoes_pagamento" ADD CONSTRAINT "fk_condicoes_cliente" FOREIGN KEY ("fk_cliente") REFERENCES "tremonte_cliente"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "condicoes_pagamento" ADD CONSTRAINT "fk_condicoes_fabricante" FOREIGN KEY ("fk_fabrica") REFERENCES "tremonte_fabricante"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "condicoes_pagamento" ADD CONSTRAINT "fk_condicoes_transportadora" FOREIGN KEY ("fk_transportadora") REFERENCES "tremonte_transportadora"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "menu_funcao" ADD CONSTRAINT "menu_funcao_fk_funcao" FOREIGN KEY ("fk_funcao") REFERENCES "funcao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "menu_funcao" ADD CONSTRAINT "menu_funcao_fk_menu" FOREIGN KEY ("fk_menu") REFERENCES "menu"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tremonte_cliente" ADD CONSTRAINT "fk_cliente_criterio" FOREIGN KEY ("criterio_pagamento") REFERENCES "tremonte_criterio_pagamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_cliente" ADD CONSTRAINT "fk_cliente_grupo_cliente" FOREIGN KEY ("grupo_clientes") REFERENCES "tremonte_grupo_clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_cliente" ADD CONSTRAINT "fk_cliente_motivo_bloqueio" FOREIGN KEY ("motivo_bloqueio") REFERENCES "tremonte_motivo_bloqueio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_cliente" ADD CONSTRAINT "fk_cliente_regiao" FOREIGN KEY ("contato_regiao") REFERENCES "tremonte_regiao_zona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_cliente" ADD CONSTRAINT "fk_cliente_transportadora" FOREIGN KEY ("transportadora") REFERENCES "tremonte_transportadora"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_cliente" ADD CONSTRAINT "fk_cliente_vendedor" FOREIGN KEY ("fk_vendedor") REFERENCES "tremonte_vendedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_cliente" ADD CONSTRAINT "fk_cobranca_estado" FOREIGN KEY ("cobranca_estado") REFERENCES "estado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_cliente" ADD CONSTRAINT "fk_entrega_estado" FOREIGN KEY ("entrega_estado") REFERENCES "estado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_cliente" ADD CONSTRAINT "fk_estado_estado" FOREIGN KEY ("estado") REFERENCES "estado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_fabricante" ADD CONSTRAINT "fk_fabricante_criterio_pagamento" FOREIGN KEY ("criterio_pagamento") REFERENCES "tremonte_criterio_pagamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_faturamento_log_detalhes" ADD CONSTRAINT "fk_log_detail" FOREIGN KEY ("log") REFERENCES "tremonte_faturamento_log"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tremonte_grupo_produto_fabricante" ADD CONSTRAINT "fk_grupo_fabricante" FOREIGN KEY ("fk_fabricante") REFERENCES "tremonte_fabricante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_grupo_produto_fabricante" ADD CONSTRAINT "fk_grupo_fabricante_grupo" FOREIGN KEY ("fk_grupo_produto") REFERENCES "tremonte_grupo_produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_lista_preco" ADD CONSTRAINT "fk_lista_fabricante" FOREIGN KEY ("fk_fabricante") REFERENCES "tremonte_fabricante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_lista_preco_item" ADD CONSTRAINT "fk_lista_item" FOREIGN KEY ("fk_lista_preco") REFERENCES "tremonte_lista_preco"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_lista_preco_item" ADD CONSTRAINT "fk_lista_item_produto" FOREIGN KEY ("fk_produto") REFERENCES "tremonte_produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_logs" ADD CONSTRAINT "fk_logs_usuario" FOREIGN KEY ("fk_usuario") REFERENCES "tremonte_usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tremonte_pedido" ADD CONSTRAINT "fk_ped_cliente" FOREIGN KEY ("cliente") REFERENCES "tremonte_cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_pedido" ADD CONSTRAINT "fk_ped_fabricante" FOREIGN KEY ("fabricante") REFERENCES "tremonte_fabricante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_pedido_itens" ADD CONSTRAINT "fk_pedido" FOREIGN KEY ("pedido") REFERENCES "tremonte_pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_pedido_itens" ADD CONSTRAINT "fk_pedido_itens_produtos" FOREIGN KEY ("produto") REFERENCES "tremonte_produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_pedido_servico" ADD CONSTRAINT "fk_tremonte_pedido_servico" FOREIGN KEY ("pedido") REFERENCES "tremonte_pedido"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tremonte_produto" ADD CONSTRAINT "fk_marca_produto" FOREIGN KEY ("marca_produto") REFERENCES "tremonte_marca_produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_produto" ADD CONSTRAINT "fk_produto_fabricante" FOREIGN KEY ("fk_fabricante") REFERENCES "tremonte_fabricante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_produto" ADD CONSTRAINT "fk_produto_grupo_produto" FOREIGN KEY ("grupo_produto") REFERENCES "tremonte_grupo_produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_produto" ADD CONSTRAINT "fk_produto_linha_produto" FOREIGN KEY ("linha_produto") REFERENCES "tremonte_linha_produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_produto" ADD CONSTRAINT "fk_produto_motivo_bloqueio" FOREIGN KEY ("motivo_bloqueio") REFERENCES "tremonte_motivo_bloqueio_produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_produto" ADD CONSTRAINT "fk_produto_unidade" FOREIGN KEY ("unidade_medida") REFERENCES "tremonte_unidade_medida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_transportadora" ADD CONSTRAINT "fk_transportadora_uf" FOREIGN KEY ("uf") REFERENCES "estado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_usuario_modelo" ADD CONSTRAINT "tremonte_usuario_modelo_fk_tremonte_usuario" FOREIGN KEY ("fk_tremonte_usuario") REFERENCES "tremonte_usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tremonte_vendedor_banco" ADD CONSTRAINT "fk_vendedor_banco" FOREIGN KEY ("fk_vendedor") REFERENCES "tremonte_vendedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_vendedor_regiao" ADD CONSTRAINT "fk_vendedor_regiao" FOREIGN KEY ("regiao") REFERENCES "tremonte_regiao_zona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tremonte_vendedor_regiao" ADD CONSTRAINT "fk_vendedor_zona" FOREIGN KEY ("fk_vendedor") REFERENCES "tremonte_vendedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_menu" ADD CONSTRAINT "tremonte_usuario_fk_menu" FOREIGN KEY ("fk_usuario") REFERENCES "tremonte_usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuario_menu" ADD CONSTRAINT "usuario_menu_fk_funcao" FOREIGN KEY ("fk_func") REFERENCES "funcao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuario_menu" ADD CONSTRAINT "usuario_menu_fk_menu" FOREIGN KEY ("fk_menu") REFERENCES "menu"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuario_vendedor" ADD CONSTRAINT "fk_usuario_vendedor_usuario" FOREIGN KEY ("fk_usuario") REFERENCES "tremonte_usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuario_vendedor" ADD CONSTRAINT "fk_usuario_vendedor_vendedor" FOREIGN KEY ("fk_vendedor") REFERENCES "tremonte_vendedor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
