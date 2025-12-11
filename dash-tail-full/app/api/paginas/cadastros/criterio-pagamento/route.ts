import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const criteriosPagamento = await db.tremonte_criterio_pagamento.findMany({
      orderBy: {
        descricao: 'asc',
      },
    });

    return NextResponse.json(criteriosPagamento);
  } catch (error) {
    console.error('Erro ao buscar critérios de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar critérios de pagamento' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    // Verificar duplicatas
    const criterioPagamentoExistente = await db.tremonte_criterio_pagamento.findFirst({
      where: {
        OR: [
          { criterio: criterio },
          { descricao: descricao },
        ],
      },
    });

    if (criterioPagamentoExistente) {
      return NextResponse.json(
        { error: 'Critério ou descrição já existe' },
        { status: 400 }
      );
    }

    const novoCriterioPagamento = await db.tremonte_criterio_pagamento.create({
      data: {
        criterio: criterio,
        descricao: descricao,
      },
    });

    return NextResponse.json(novoCriterioPagamento);
  } catch (error) {
    console.error('Erro ao criar critério de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar critério de pagamento' },
      { status: 500 }
    );
  }
}