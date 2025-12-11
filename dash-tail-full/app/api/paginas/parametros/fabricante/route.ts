import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const fabricantes = await db.tremonte_fabricante.findMany({
      select: {
        id: true,
        razao_social: true,
        fantasia: true
      },
      orderBy: {
        fantasia: 'asc'
      }
    });

    return NextResponse.json(fabricantes);
  } catch (error) {
    console.error('Erro ao buscar fabricantes:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}