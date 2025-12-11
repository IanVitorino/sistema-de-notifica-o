import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendedorId = parseInt(params.id);
    if (isNaN(vendedorId)) {
      return NextResponse.json(
        { error: 'ID do vendedor inválido' },
        { status: 400 }
      );
    }

    const regioes = await db.tremonte_vendedor_regiao.findMany({
      where: { fk_vendedor: vendedorId },
      include: {
        tremonte_regiao_zona: true
      },
      orderBy: {
        tremonte_regiao_zona: {
          descricao_regiao: 'asc'
        }
      }
    });

    return NextResponse.json(regioes);
  } catch (error) {
    console.error('Erro ao buscar regiões do vendedor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendedorId = parseInt(params.id);
    if (isNaN(vendedorId)) {
      return NextResponse.json(
        { error: 'ID do vendedor inválido' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { regiao } = data;

    // Validações obrigatórias
    if (!regiao) {
      return NextResponse.json(
        { error: 'ID da região é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o vendedor existe
    const vendedor = await db.tremonte_vendedor.findUnique({
      where: { id: vendedorId }
    });

    if (!vendedor) {
      return NextResponse.json(
        { error: 'Vendedor não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se a região existe
    const regiaoZona = await db.tremonte_regiao_zona.findUnique({
      where: { id: regiao }
    });

    if (!regiaoZona) {
      return NextResponse.json(
        { error: 'Região não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a associação já existe
    const associacaoExistente = await db.tremonte_vendedor_regiao.findFirst({
      where: {
        fk_vendedor: vendedorId,
        regiao: regiao
      }
    });

    if (associacaoExistente) {
      return NextResponse.json(
        { error: 'Esta região já está associada ao vendedor' },
        { status: 409 }
      );
    }

    const vendedorRegiao = await db.tremonte_vendedor_regiao.create({
      data: {
        fk_vendedor: vendedorId,
        regiao: regiao,
      },
      include: {
        tremonte_regiao_zona: true
      }
    });

    return NextResponse.json(vendedorRegiao, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar associação de região:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 