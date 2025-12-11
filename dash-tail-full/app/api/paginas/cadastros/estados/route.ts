import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const estados = await db.estado.findMany({
      orderBy: {
        descricao: 'asc',
      },
    });

    return NextResponse.json(estados);
  } catch (error) {
    console.error('Erro ao buscar estados:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estados' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { nome, uf } = data;

    // Validações
    if (!nome || !uf) {
      return NextResponse.json(
        { error: 'Nome e UF são obrigatórios' },
        { status: 400 }
      );
    }

    if (uf.length !== 2) {
      return NextResponse.json(
        { error: 'UF deve ter exatamente 2 caracteres' },
        { status: 400 }
      );
    }

    // Verificar duplicatas
    const estadoExistente = await db.estado.findFirst({
      where: {
        OR: [
          { descricao: { equals: nome, mode: 'insensitive' } },
          { uf: { equals: uf, mode: 'insensitive' } },
        ],
      },
    });

    if (estadoExistente) {
      return NextResponse.json(
        { error: 'Estado ou UF já existe' },
        { status: 400 }
      );
    }

    const novoEstado = await db.estado.create({
      data: {
        descricao: nome.trim(),
        uf: uf.toUpperCase().trim(),
      },
    });

    return NextResponse.json(novoEstado, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar estado:', error);
    return NextResponse.json(
      { error: 'Erro ao criar estado' },
      { status: 500 }
    );
  }
}