import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const motivosBloqueio = await db.tremonte_motivo_bloqueio_produto.findMany({
      select: {
        id: true,
        motivo: true,
        descricao: true
      },
      orderBy: {
        motivo: 'asc'
      }
    });

    return NextResponse.json(motivosBloqueio);
  } catch (error) {
    console.error('Erro ao buscar motivos de bloqueio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}