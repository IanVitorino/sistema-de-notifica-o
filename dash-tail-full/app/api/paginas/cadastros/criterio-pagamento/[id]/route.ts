import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { criterio, descricao } = body;

    // Validações básicas
    if (!criterio || !descricao) {
      return NextResponse.json(
        { error: 'Critério e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    if (criterio.length > 20) {
      return NextResponse.json(
        { error: 'Critério deve ter no máximo 20 caracteres' },
        { status: 400 }
      );
    }

    // Verificar duplicatas excluindo o registro atual
    const criterioPagamentoExistente = await db.tremonte_criterio_pagamento.findFirst({
      where: {
        OR: [
          { criterio: criterio },
          { descricao: descricao },
        ],
        NOT: {
          id: id,
        },
      },
    });

    if (criterioPagamentoExistente) {
      return NextResponse.json(
        { error: 'Critério ou descrição já existe' },
        { status: 400 }
      );
    }

    const criterioPagamentoAtualizado = await db.tremonte_criterio_pagamento.update({
      where: { id },
      data: {
        criterio: criterio,
        descricao: descricao,
      },
    });

    return NextResponse.json(criterioPagamentoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar critério de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar critério de pagamento' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await db.tremonte_criterio_pagamento.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Critério de pagamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir critério de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir critério de pagamento' },
      { status: 500 }
    );
  }
}