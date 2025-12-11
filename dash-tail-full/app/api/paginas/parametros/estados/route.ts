import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Listar todos os estados
export async function GET(request: NextRequest) {
  try {
    const estados = await db.estado.findMany({
      select: {
        id: true,
        uf: true,
        descricao: true,
      },
      orderBy: {
        descricao: 'asc',
      },
    });

    return NextResponse.json(estados);
  } catch (error) {
    console.error('Erro ao buscar estados:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
