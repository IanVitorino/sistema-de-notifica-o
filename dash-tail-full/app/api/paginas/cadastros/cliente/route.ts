import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// GET: Listar todos os clientes
export async function GET(request: NextRequest) {
  try {
    const clientes = await prisma.tremonte_cliente.findMany({
      where: {
        status: true
      },
      select: {
        id: true,
        razao_social: true,
        fantasia: true,
        cnpj: true,
        contato_nome: true,
        contato_email: true,
        contato_telefone: true,
        status: true,
      },
      orderBy: {
        razao_social: 'asc'
      }
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar clientes' },
      { status: 500 }
    );
  }
}

// POST - Criar novo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validação básica
    if (!body.razao_social?.trim()) {
      return NextResponse.json(
        { error: 'Razão social é obrigatória' },
        { status: 400 }
      );
    }

    // Verificar se CNPJ ou razão social já existem
    if (body.cnpj?.trim() || body.razao_social?.trim()) {
      const existingCliente = await prisma.tremonte_cliente.findFirst({
        where: {
          OR: [
            body.cnpj?.trim() ? { cnpj: body.cnpj.trim() } : {},
            body.razao_social?.trim() ? { razao_social: body.razao_social.trim() } : {},
          ].filter(condition => Object.keys(condition).length > 0),
        },
      });

      if (existingCliente) {
        return NextResponse.json(
          { error: 'CNPJ ou razão social já existem no sistema' },
          { status: 400 }
        );
      }
    }

    // Preparar dados para inserção
    const clienteData = {
      razao_social: body.razao_social?.trim(),
      fantasia: body.fantasia?.trim() || null,
      cnpj: body.cnpj?.trim() || null,
      grupo_clientes: body.grupo_clientes || null,
      endereco: body.endereco?.trim() || null,
      bairro: body.bairro?.trim() || null,
      cidade: body.cidade?.trim() || null,
      estado: body.estado || null,
      cep: body.cep?.trim() || null,
      inscricao_estadual: body.inscricao_estadual?.trim() || null,
      contato_email: body.contato_email?.trim() || null,
      contato_nome: body.contato_nome?.trim() || null,
      contato_telefone: body.contato_telefone?.trim() || null,
      contato_telefone_ramal: body.contato_telefone_ramal?.trim() || null,
      contato_celular: body.contato_celular?.trim() || null,
      contato_radio: body.contato_radio?.trim() || null,
      contato_fax: body.contato_fax?.trim() || null,
      contato_regiao: body.contato_regiao || null,
      fk_vendedor: body.fk_vendedor || null,
      entrega_endereco: body.entrega_endereco?.trim() || null,
      entrega_bairro: body.entrega_bairro?.trim() || null,
      entrega_cidade: body.entrega_cidade?.trim() || null,
      entrega_estado: body.entrega_estado || null,
      entrega_cep: body.entrega_cep?.trim() || null,
      entrega_nfexml: body.entrega_nfexml?.trim() || null,
      cobranca_endereco: body.cobranca_endereco?.trim() || null,
      cobranca_bairro: body.cobranca_bairro?.trim() || null,
      cobranca_cidade: body.cobranca_cidade?.trim() || null,
      cobranca_estado: body.cobranca_estado || null,
      cobranca_cep: body.cobranca_cep?.trim() || null,
      transportadora: body.transportadora || null,
      situacao: body.situacao ?? true,
      situacao_desde: body.situacao_desde ? new Date(body.situacao_desde) : null,
      situacao_ate: body.situacao_ate ? new Date(body.situacao_ate) : null,
      receber_email_servico: body.receber_email_servico ?? false,
      habilitado: body.habilitado ?? true,
      criterio_pagamento: body.criterio_pagamento || null,
      motivo_bloqueio: body.motivo_bloqueio || null,
      status: body.status ?? true,
      observacao: body.observacao?.trim() || null,
    };

    const cliente = await prisma.tremonte_cliente.create({
      data: clienteData,
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
