import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
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

    // Verificar duplicatas excluindo o registro atual
    const motivoBloqueioExistente = await db.tremonte_motivo_bloqueio_produto.findFirst({
      where: {
        OR: [
          { motivo: motivo },
          { descricao: descricao },
        ],
        NOT: {
          id: id,
        },
      },
    });

    if (motivoBloqueioExistente) {
      return NextResponse.json(
        { error: 'Motivo ou descrição já existe' },
        { status: 400 }
      );
    }

    const motivoBloqueioAtualizado = await db.tremonte_motivo_bloqueio_produto.update({
      where: { id },
      data: {
        motivo: motivo,
        descricao: descricao,
        bloq: bloq ?? false,
      },
    });

    return NextResponse.json(motivoBloqueioAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar motivo de bloqueio:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar motivo de bloqueio' },
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

    await db.tremonte_motivo_bloqueio_produto.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Motivo de bloqueio excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir motivo de bloqueio:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir motivo de bloqueio' },
      { status: 500 }
    );
  }
}