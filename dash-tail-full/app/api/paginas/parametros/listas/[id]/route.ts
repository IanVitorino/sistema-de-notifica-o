import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET: Buscar lista específica
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const lista = await db.tremonte_lista_preco.findUnique({
      where: { id },
      include: {
        tremonte_fabricante: {
          select: {
            id: true,
            fantasia: true,
            razao_social: true,
          },
        },
        tremonte_lista_preco_item: {
          include: {
            tremonte_produto: {
              select: {
                codigo: true,
                descricao: true,
              },
            },
          },
          orderBy: {
            tremonte_produto: {
              codigo: 'asc',
            },
          },
        },
      },
    });

    if (!lista) {
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(lista);
  } catch (error) {
    console.error('Erro ao buscar lista de preço:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT: Atualizar lista
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const {
      nome_lista,
      fk_fabricante,
      atual,
      itens,
    } = data;

    // Validações
    if (nome_lista && nome_lista.length > 25) {
      return NextResponse.json(
        { error: 'Nome da lista deve ter no máximo 25 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se a lista existe
    const listaExistente = await db.tremonte_lista_preco.findUnique({
      where: { id },
    });

    if (!listaExistente) {
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 }
      );
    }

    const listaAtualizada = await db.$transaction(async (tx) => {
      // Se marcado como atual, desativar outras listas do mesmo fabricante
      if (atual && fk_fabricante) {
        await tx.tremonte_lista_preco.updateMany({
          where: {
            fk_fabricante,
            atual: true,
            id: { not: id },
          },
          data: {
            atual: false,
          },
        });
      }

      // Atualizar a lista
      const lista = await tx.tremonte_lista_preco.update({
        where: { id },
        data: {
          ...(nome_lista && { nome_lista: nome_lista.trim() }),
          ...(fk_fabricante && { fk_fabricante }),
          ...(atual !== undefined && { atual }),
        },
        include: {
          tremonte_fabricante: {
            select: {
              id: true,
              fantasia: true,
              razao_social: true,
            },
          },
        },
      });

      // Se itens foram fornecidos, substituir todos
      if (itens !== undefined) {
        // Deletar itens existentes
        await tx.tremonte_lista_preco_item.deleteMany({
          where: { fk_lista_preco: id },
        });

        // Criar novos itens
        if (itens.length > 0) {
          await tx.tremonte_lista_preco_item.createMany({
            data: itens.map((item: any) => ({
              fk_lista_preco: id,
              fk_produto: item.fk_produto,
              preco: item.preco,
              master: item.master || 0,
            })),
          });
        }
      }

      return lista;
    });

    return NextResponse.json(listaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar lista de preço:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Excluir lista
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar se a lista existe
    const lista = await db.tremonte_lista_preco.findUnique({
      where: { id },
    });

    if (!lista) {
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 }
      );
    }

    // Não permitir exclusão de lista ativa
    if (lista.atual) {
      return NextResponse.json(
        { error: 'Não é possível excluir uma lista ativa' },
        { status: 403 }
      );
    }

    // Excluir lista (os itens serão excluídos em cascata pelo Prisma)
    await db.tremonte_lista_preco.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Lista excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir lista de preço:', error);

    // Se o erro for de restrição de chave estrangeira
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return NextResponse.json(
        { error: 'Não é possível excluir a lista pois ela está sendo usada em outros registros' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
