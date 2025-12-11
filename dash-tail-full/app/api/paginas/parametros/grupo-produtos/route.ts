import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const gruposProduto = await db.tremonte_grupo_produto.findMany({
      select: {
        id: true,
        codigo: true,
        descricao: true
      },
      orderBy: {
        codigo: 'asc'
      }
    });

    return NextResponse.json(gruposProduto);
  } catch (error) {
    console.error('Erro ao buscar grupos de produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}