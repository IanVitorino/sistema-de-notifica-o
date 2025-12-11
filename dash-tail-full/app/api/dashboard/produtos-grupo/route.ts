import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar produtos agrupados por grupo de produto
    const resultado = await db.tremonte_produto.groupBy({
      by: ['grupo_produto'],
      _count: {
        id: true
      },
      where: {
        grupo_produto: {
          not: null
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    // Buscar nomes dos grupos
    const grupoIds = resultado.map((item: any) => item.grupo_produto).filter((id: any) => id !== null);

    const grupos = await db.tremonte_grupo_produto.findMany({
      where: {
        id: {
          in: grupoIds as number[]
        }
      },
      select: {
        id: true,
        descricao: true
      }
    });

    // Criar mapa de IDs para nomes
    const grupoMap = new Map(
      grupos.map((g: any) => [g.id, g.descricao])
    );

    // Formatar resposta
    const dados = resultado.map((item: any) => ({
      grupo: grupoMap.get(item.grupo_produto!) || 'Não informado',
      quantidade: item._count.id
    }));

    return NextResponse.json(dados);

  } catch (error) {
    console.error('Erro ao buscar produtos por grupo:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados de grupo' },
      { status: 500 }
    );
  }
}
