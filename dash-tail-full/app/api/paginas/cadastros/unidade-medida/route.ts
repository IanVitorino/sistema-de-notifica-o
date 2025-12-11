import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const unidadesMedida = await db.tremonte_unidade_medida.findMany({
      orderBy: {
        descricao: 'asc',
      },
    });

    return NextResponse.json(unidadesMedida);
  } catch (error) {
    console.error('Erro ao buscar unidades de medida:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar unidades de medida' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, sigla } = body;

    // Validações básicas
    if (!nome || !sigla) {
      return NextResponse.json(
        { error: 'Nome e unidade são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar duplicatas
    const unidadeMedidaExistente = await db.tremonte_unidade_medida.findFirst({
      where: {
        OR: [
          { descricao: nome },
          { unidade: sigla },
        ],
      },
    });

    if (unidadeMedidaExistente) {
      return NextResponse.json(
        { error: 'Unidade de medida ou unidade já existe' },
        { status: 400 }
      );
    }

    const novaUnidadeMedida = await db.tremonte_unidade_medida.create({
      data: {
        descricao: nome,
        unidade: sigla,
      },
    });

    return NextResponse.json(novaUnidadeMedida);
  } catch (error) {
    console.error('Erro ao criar unidade de medida:', error);
    return NextResponse.json(
      { error: 'Erro ao criar unidade de medida' },
      { status: 500 }
    );
  }
}