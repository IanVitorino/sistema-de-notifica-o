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

    const bancos = await db.tremonte_vendedor_banco.findMany({
      where: { fk_vendedor: vendedorId },
      orderBy: [
        { preferencial: 'desc' },
        { banco: 'asc' }
      ]
    });

    return NextResponse.json(bancos);
  } catch (error) {
    console.error('Erro ao buscar dados bancários:', error);
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
    
    const { banco, agencia, conta, tipo, preferencial } = data;

    // Validações obrigatórias
    if (!banco || !agencia || !conta) {
      return NextResponse.json(
        { error: 'Banco, agência e conta são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar tamanhos dos campos
    if (banco.length > 30) {
      return NextResponse.json(
        { error: 'Nome do banco deve ter no máximo 30 caracteres' },
        { status: 400 }
      );
    }

    if (agencia.length > 7) {
      return NextResponse.json(
        { error: 'Agência deve ter no máximo 7 caracteres' },
        { status: 400 }
      );
    }

    if (conta.length > 10) {
      return NextResponse.json(
        { error: 'Conta deve ter no máximo 10 caracteres' },
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

    // Se for marcado como preferencial, desmarcar outros como preferenciais
    if (preferencial) {
      await db.tremonte_vendedor_banco.updateMany({
        where: { fk_vendedor: vendedorId },
        data: { preferencial: false }
      });
    }

    const vendedorBanco = await db.tremonte_vendedor_banco.create({
      data: {
        fk_vendedor: vendedorId,
        banco: banco.trim(),
        agencia: agencia.trim(),
        conta: conta.trim(),
        tipo: tipo || 1,
        preferencial: preferencial || false,
      }
    });

    return NextResponse.json(vendedorBanco, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar dados bancários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 