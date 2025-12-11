import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Buscar marca por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const marca = await db.tremonte_marca_produto.findUnique({
      where: { id }
    });

    if (!marca) {
      return NextResponse.json({ error: 'Marca não encontrada' }, { status: 404 });
    }

    return NextResponse.json(marca);
  } catch (error) {
    console.error('Erro ao buscar marca de produto:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar marca de produto' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar marca
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const data = await request.json();
    const { codigo, descricao } = data;

    // Validações
    if (!codigo || !descricao) {
      return NextResponse.json(
        { error: 'Código e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se existe
    const marcaExistente = await db.tremonte_marca_produto.findUnique({
      where: { id }
    });

    if (!marcaExistente) {
      return NextResponse.json({ error: 'Marca não encontrada' }, { status: 404 });
    }

    // Verificar duplicidade (excluindo o próprio registro)
    const duplicada = await db.tremonte_marca_produto.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { codigo: codigo.trim() },
              { descricao: descricao.trim() }
            ]
          }
        ]
      }
    });

    if (duplicada) {
      return NextResponse.json(
        { error: 'Já existe outra marca com esse código ou descrição' },
        { status: 409 }
      );
    }

    const marcaAtualizada = await db.tremonte_marca_produto.update({
      where: { id },
      data: {
        codigo: codigo.trim(),
        descricao: descricao.trim()
      }
    });

    return NextResponse.json(marcaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar marca de produto:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar marca de produto' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir marca
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Verificar se existe
    const marca = await db.tremonte_marca_produto.findUnique({
      where: { id },
      include: {
        tremonte_produto: true
      }
    });

    if (!marca) {
      return NextResponse.json({ error: 'Marca não encontrada' }, { status: 404 });
    }

    // Verificar se está em uso
    if (marca.tremonte_produto && marca.tremonte_produto.length > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir. Esta marca está sendo utilizada por ${marca.tremonte_produto.length} produto(s)` },
        { status: 409 }
      );
    }

    await db.tremonte_marca_produto.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Marca excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir marca de produto:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir marca de produto' },
      { status: 500 }
    );
  }
}
