import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; bancoId: string } }
) {
  try {
    const vendedorId = parseInt(params.id);
    const bancoId = parseInt(params.bancoId);
    
    if (isNaN(vendedorId) || isNaN(bancoId)) {
      return NextResponse.json(
        { error: 'IDs inválidos' },
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

    // Verificar se o registro existe
    const existingBanco = await db.tremonte_vendedor_banco.findFirst({
      where: {
        id: bancoId,
        fk_vendedor: vendedorId
      }
    });

    if (!existingBanco) {
      return NextResponse.json(
        { error: 'Dados bancários não encontrados' },
        { status: 404 }
      );
    }

    // Se for marcado como preferencial, desmarcar outros como preferenciais
    if (preferencial) {
      await db.tremonte_vendedor_banco.updateMany({
        where: { 
          fk_vendedor: vendedorId,
          id: { not: bancoId }
        },
        data: { preferencial: false }
      });
    }

    const updatedBanco = await db.tremonte_vendedor_banco.update({
      where: { id: bancoId },
      data: {
        banco: banco.trim(),
        agencia: agencia.trim(),
        conta: conta.trim(),
        tipo: tipo || 1,
        preferencial: preferencial || false,
      }
    });

    return NextResponse.json(updatedBanco);
  } catch (error) {
    console.error('Erro ao atualizar dados bancários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; bancoId: string } }
) {
  try {
    const vendedorId = parseInt(params.id);
    const bancoId = parseInt(params.bancoId);
    
    if (isNaN(vendedorId) || isNaN(bancoId)) {
      return NextResponse.json(
        { error: 'IDs inválidos' },
        { status: 400 }
      );
    }

    // Verificar se o registro existe
    const existingBanco = await db.tremonte_vendedor_banco.findFirst({
      where: {
        id: bancoId,
        fk_vendedor: vendedorId
      }
    });

    if (!existingBanco) {
      return NextResponse.json(
        { error: 'Dados bancários não encontrados' },
        { status: 404 }
      );
    }

    await db.tremonte_vendedor_banco.delete({
      where: { id: bancoId }
    });

    return NextResponse.json({ message: 'Dados bancários excluídos com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir dados bancários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 