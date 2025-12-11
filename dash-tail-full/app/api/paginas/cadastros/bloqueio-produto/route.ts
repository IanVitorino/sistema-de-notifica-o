import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const motivosBloqueio = await db.tremonte_motivo_bloqueio_produto.findMany({
      orderBy: {
        descricao: 'asc',
      },
    });

    return NextResponse.json(motivosBloqueio);
  } catch (error) {
    console.error('Erro ao buscar motivos de bloqueio:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar motivos de bloqueio' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { motivo, descricao, bloq } = body;

    // Validações básicas
    if (!motivo || !descricao) {
      return NextResponse.json(
        { error: 'Motivo e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    if (motivo.length > 20) {
      return NextResponse.json(
        { error: 'Motivo deve ter no máximo 20 caracteres' },
        { status: 400 }
      );
    }

    // Verificar duplicatas
    const motivoBloqueioExistente = await db.tremonte_motivo_bloqueio_produto.findFirst({
      where: {
        OR: [
          { motivo: motivo },
          { descricao: descricao },
        ],
      },
    });

    if (motivoBloqueioExistente) {
      return NextResponse.json(
        { error: 'Motivo ou descrição já existe' },
        { status: 400 }
      );
    }

    const novoMotivoBloqueio = await db.tremonte_motivo_bloqueio_produto.create({
      data: {
        motivo: motivo,
        descricao: descricao,
        bloq: bloq ?? false,
      },
    });

    return NextResponse.json(novoMotivoBloqueio);
  } catch (error) {
    console.error('Erro ao criar motivo de bloqueio:', error);
    return NextResponse.json(
      { error: 'Erro ao criar motivo de bloqueio' },
      { status: 500 }
    );
  }
}