import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const fabricanteId = searchParams.get('fabricante');

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const where: any = {
      OR: [
        { codigo: { contains: query, mode: 'insensitive' } },
        { descricao: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (fabricanteId && !isNaN(parseInt(fabricanteId))) {
      where.fk_fabricante = parseInt(fabricanteId, 10);
    }

    const produtos = await prisma.tremonte_produto.findMany({
      where,
      select: {
        id: true,
        codigo: true,
        descricao: true
      },
      take: 20
    });

    return NextResponse.json(produtos);
  } catch (error) {
    console.error('Erro na busca de produtos por autocomplete:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
