import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const unidadesMedida = await db.tremonte_unidade_medida.findMany({
      select: {
        id: true,
        unidade: true,
        descricao: true
      },
      orderBy: {
        unidade: 'asc'
      }
    });

    return NextResponse.json(unidadesMedida);
  } catch (error) {
    console.error('Erro ao buscar unidades de medida:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}