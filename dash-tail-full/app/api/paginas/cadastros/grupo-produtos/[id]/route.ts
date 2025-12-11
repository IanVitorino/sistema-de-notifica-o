import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { codigo, descricao, status } = body;

    // Validações básicas
    if (!codigo || !descricao) {
      return NextResponse.json(
        { error: 'Código e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    if (codigo.length > 6) {
      return NextResponse.json(
        { error: 'Código deve ter no máximo 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar duplicatas excluindo o registro atual
    const grupoProdutoExistente = await db.tremonte_grupo_produto.findFirst({
      where: {
        OR: [
          { codigo: codigo },
          { descricao: descricao },
        ],
        NOT: {
          id: id,
        },
      },
    });

    if (grupoProdutoExistente) {
      return NextResponse.json(
        { error: 'Código ou descrição já existe' },
        { status: 400 }
      );
    }

    const grupoProdutoAtualizado = await db.tremonte_grupo_produto.update({
      where: { id },
      data: {
        codigo: codigo,
        descricao: descricao,
        status: status ?? true,
      },
    });

    return NextResponse.json(grupoProdutoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar grupo de produto:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar grupo de produto' },
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

    await db.tremonte_grupo_produto.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Grupo de produto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir grupo de produto:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir grupo de produto' },
      { status: 500 }
    );
  }
}