import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; regiaoId: string } }
) {
  try {
    const vendedorId = parseInt(params.id);
    const regiaoId = parseInt(params.regiaoId);
    
    if (isNaN(vendedorId) || isNaN(regiaoId)) {
      return NextResponse.json(
        { error: 'IDs inválidos' },
        { status: 400 }
      );
    }

    // Verificar se a associação existe
    const associacao = await db.tremonte_vendedor_regiao.findFirst({
      where: {
        fk_vendedor: vendedorId,
        regiao: regiaoId
      }
    });

    if (!associacao) {
      return NextResponse.json(
        { error: 'Associação de região não encontrada' },
        { status: 404 }
      );
    }

    await db.tremonte_vendedor_regiao.delete({
      where: { id: associacao.id }
    });

    return NextResponse.json({ message: 'Associação de região removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover associação de região:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 