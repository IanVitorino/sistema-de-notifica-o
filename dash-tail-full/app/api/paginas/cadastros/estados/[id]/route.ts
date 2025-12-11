import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
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

    // Verificar se o estado existe
    const estadoExistente = await db.estado.findUnique({
      where: { id },
    });

    if (!estadoExistente) {
      return NextResponse.json(
        { error: 'Estado não encontrado' },
        { status: 404 }
      );
    }

    // Verificar duplicatas
    const duplicado = await db.estado.findFirst({
      where: {
        OR: [
          { descricao: { equals: nome, mode: 'insensitive' } },
          { uf: { equals: uf, mode: 'insensitive' } },
        ],
        NOT: {
          id,
        },
      },
    });

    if (duplicado) {
      return NextResponse.json(
        { error: 'Estado ou UF já existe' },
        { status: 400 }
      );
    }

    const estadoAtualizado = await db.estado.update({
      where: { id },
      data: {
        descricao: nome.trim(),
        uf: uf.toUpperCase().trim(),
      },
    });

    return NextResponse.json(estadoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar estado:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar estado' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    // Verificar se o estado existe
    const estado = await db.estado.findUnique({
      where: { id },
    });

    if (!estado) {
      return NextResponse.json(
        { error: 'Estado não encontrado' },
        { status: 404 }
      );
    }

    await db.estado.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao excluir estado:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir estado' },
      { status: 500 }
    );
  }
}