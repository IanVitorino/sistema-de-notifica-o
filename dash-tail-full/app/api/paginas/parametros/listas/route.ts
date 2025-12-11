import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Listar todas as listas de preço
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fabricante = searchParams.get('fabricante');
    const ativas = searchParams.get('ativas');

    const where: any = {};

    // Filtro por fabricante
    if (fabricante) {
      where.fk_fabricante = parseInt(fabricante);
    }

    // Filtro por listas ativas
    if (ativas === 'true') {
      where.atual = true;
    }

    const listas = await db.tremonte_lista_preco.findMany({
      where,
      include: {
        tremonte_fabricante: {
          select: {
            id: true,
            fantasia: true,
            razao_social: true,
            cnpj: true,
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
        },
      },
      orderBy: [
        { atual: 'desc' },
        { id: 'desc' },
      ],
    });

    return NextResponse.json(listas);
  } catch (error) {
    console.error('Erro ao buscar listas de preço:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST: Criar nova lista de preço
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      nome_lista,
      fk_fabricante,
      atual = false,
      itens = [],
    } = data;

    // Validações
    if (!nome_lista) {
      return NextResponse.json(
        { error: 'Nome da lista é obrigatório' },
        { status: 400 }
      );
    }

    if (nome_lista.length > 25) {
      return NextResponse.json(
        { error: 'Nome da lista deve ter no máximo 25 caracteres' },
        { status: 400 }
      );
    }

    if (!fk_fabricante) {
      return NextResponse.json(
        { error: 'Fabricante é obrigatório' },
        { status: 400 }
      );
    }

    // Se marcado como atual, desativar outras listas do mesmo fabricante
    const novaLista = await db.$transaction(async (tx) => {
      // Desativar outras listas se esta for marcada como atual
      if (atual && fk_fabricante) {
        await tx.tremonte_lista_preco.updateMany({
          where: {
            fk_fabricante,
            atual: true,
          },
          data: {
            atual: false,
          },
        });
      }

      // Criar a nova lista
      const lista = await tx.tremonte_lista_preco.create({
        data: {
          nome_lista: nome_lista.trim(),
          fk_fabricante,
          atual,
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

      // Criar itens se fornecidos
      if (itens.length > 0) {
        await tx.tremonte_lista_preco_item.createMany({
          data: itens.map((item: any) => ({
            fk_lista_preco: lista.id,
            fk_produto: item.fk_produto,
            preco: item.preco,
            master: item.master || 0,
          })),
        });
      }

      return lista;
    });

    return NextResponse.json(novaLista, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar lista de preço:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
