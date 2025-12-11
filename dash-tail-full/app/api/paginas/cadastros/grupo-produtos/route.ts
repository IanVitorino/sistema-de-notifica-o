import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const gruposProdutos = await db.tremonte_grupo_produto.findMany({
      orderBy: {
        descricao: 'asc',
      },
    });

    return NextResponse.json(gruposProdutos);
  } catch (error) {
    console.error('Erro ao buscar grupos de produtos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar grupos de produtos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    // Verificar duplicatas
    const grupoProdutoExistente = await db.tremonte_grupo_produto.findFirst({
      where: {
        OR: [
          { codigo: codigo },
          { descricao: descricao },
        ],
      },
    });

    if (grupoProdutoExistente) {
      return NextResponse.json(
        { error: 'Código ou descrição já existe' },
        { status: 400 }
      );
    }

    const novoGrupoProduto = await db.tremonte_grupo_produto.create({
      data: {
        codigo: codigo,
        descricao: descricao,
        status: status ?? true,
      },
    });

    return NextResponse.json(novoGrupoProduto);
  } catch (error) {
    console.error('Erro ao criar grupo de produto:', error);
    return NextResponse.json(
      { error: 'Erro ao criar grupo de produto' },
      { status: 500 }
    );
  }
}