import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nome, sigla } = body;

    // Validações básicas
    if (!nome || !sigla) {
      return NextResponse.json(
        { error: 'Nome e unidade são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar duplicatas excluindo o registro atual
    const unidadeMedidaExistente = await db.tremonte_unidade_medida.findFirst({
      where: {
        OR: [
          { descricao: nome },
          { unidade: sigla },
        ],
        NOT: {
          id: id,
        },
      },
    });

    if (unidadeMedidaExistente) {
      return NextResponse.json(
        { error: 'Unidade de medida ou unidade já existe' },
        { status: 400 }
      );
    }

    const unidadeMedidaAtualizada = await db.tremonte_unidade_medida.update({
      where: { id },
      data: {
        descricao: nome,
        unidade: sigla,
      },
    });

    return NextResponse.json(unidadeMedidaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar unidade de medida:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar unidade de medida' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await db.tremonte_unidade_medida.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Unidade de medida excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir unidade de medida:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir unidade de medida' },
      { status: 500 }
    );
  }
}