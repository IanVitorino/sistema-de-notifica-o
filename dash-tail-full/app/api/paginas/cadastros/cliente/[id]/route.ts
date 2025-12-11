import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// DELETE: Excluir cliente por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar se o cliente existe
    const cliente = await prisma.tremonte_cliente.findUnique({
      where: { id }
    });

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Excluir o cliente
    await prisma.tremonte_cliente.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir cliente' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET: Buscar cliente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const cliente = await prisma.tremonte_cliente.findUnique({
      where: { id }
    });

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cliente' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT: Atualizar cliente por ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Verificar se o cliente existe
    const clienteExists = await prisma.tremonte_cliente.findUnique({
      where: { id }
    });

    if (!clienteExists) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Preparar dados para atualização
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

    const cliente = await prisma.tremonte_cliente.update({
      where: { id },
      data: clienteData,
    });

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
