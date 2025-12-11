import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Listar todas as marcas de produto
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const marcas = await db.tremonte_marca_produto.findMany({
      orderBy: {
        descricao: 'asc'
      }
    });

    return NextResponse.json(marcas);
  } catch (error) {
    console.error('Erro ao buscar marcas de produto:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar marcas de produto' },
      { status: 500 }
    );
  }
}

// POST - Criar nova marca de produto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
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

    // Verificar duplicidade
    const existente = await db.tremonte_marca_produto.findFirst({
      where: {
        OR: [
          { codigo: codigo.trim() },
          { descricao: descricao.trim() }
        ]
      }
    });

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe uma marca com esse código ou descrição' },
        { status: 409 }
      );
    }

    const novaMarca = await db.tremonte_marca_produto.create({
      data: {
        codigo: codigo.trim(),
        descricao: descricao.trim()
      }
    });

    return NextResponse.json(novaMarca, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar marca de produto:', error);
    return NextResponse.json(
      { error: 'Erro ao criar marca de produto' },
      { status: 500 }
    );
  }
}
