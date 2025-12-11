import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
    itemId: string;
  };
}

// PATCH: Atualizar item específico
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const itemId = parseInt(params.itemId);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'ID do item inválido' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { preco, master } = data;

    // Verificar se o item existe
    const itemExistente = await db.tremonte_lista_preco_item.findUnique({
      where: { id: itemId },
    });

    if (!itemExistente) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar o item
    const itemAtualizado = await db.tremonte_lista_preco_item.update({
      where: { id: itemId },
      data: {
        ...(preco !== undefined && { preco: parseFloat(preco) }),
        ...(master !== undefined && { master: parseInt(master) }),
      },
      include: {
        tremonte_produto: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
      },
    });

    return NextResponse.json(itemAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Excluir item específico
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const itemId = parseInt(params.itemId);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'ID do item inválido' },
        { status: 400 }
      );
    }

    // Verificar se o item existe
    const item = await db.tremonte_lista_preco_item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      );
    }

    // Excluir o item
    await db.tremonte_lista_preco_item.delete({
      where: { id: itemId },
    });

    return NextResponse.json({
      success: true,
      message: 'Item excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir item:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
