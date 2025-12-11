import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

// POST: Adicionar item à lista
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const listaId = parseInt(params.id);

    if (isNaN(listaId)) {
      return NextResponse.json(
        { error: 'ID da lista inválido' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { fk_produto, preco, master = 0 } = data;

    // Validações
    if (!fk_produto) {
      return NextResponse.json(
        { error: 'Produto é obrigatório' },
        { status: 400 }
      );
    }

    if (preco === undefined || preco === null) {
      return NextResponse.json(
        { error: 'Preço é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a lista existe
    const lista = await db.tremonte_lista_preco.findUnique({
      where: { id: listaId },
    });

    if (!lista) {
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o produto já existe na lista
    const itemExistente = await db.tremonte_lista_preco_item.findFirst({
      where: {
        fk_lista_preco: listaId,
        fk_produto,
      },
    });

    if (itemExistente) {
      return NextResponse.json(
        { error: 'Produto já existe nesta lista' },
        { status: 409 }
      );
    }

    // Criar o item
    const novoItem = await db.tremonte_lista_preco_item.create({
      data: {
        fk_lista_preco: listaId,
        fk_produto,
        preco: parseFloat(preco),
        master: parseInt(master),
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

    return NextResponse.json(novoItem, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar item à lista:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
