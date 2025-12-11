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

    // Buscar produtos agrupados por marca de produto
    const resultado = await db.tremonte_produto.groupBy({
      by: ['marca_produto'],
      _count: {
        id: true
      },
      where: {
        marca_produto: {
          not: null
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    // Buscar nomes das marcas
    const marcaIds = resultado.map((item: any) => item.marca_produto).filter((id: any) => id !== null);

    const marcas = await db.tremonte_marca_produto.findMany({
      where: {
        id: {
          in: marcaIds as number[]
        }
      },
      select: {
        id: true,
        descricao: true
      }
    });

    // Criar mapa de IDs para nomes
    const marcaMap = new Map(
      marcas.map((m: any) => [m.id, m.descricao])
    );

    // Formatar resposta
    const dados = resultado.map((item: any) => ({
      marca: marcaMap.get(item.marca_produto!) || 'Não informada',
      quantidade: item._count.id
    }));

    return NextResponse.json(dados);

  } catch (error) {
    console.error('Erro ao buscar produtos por marca:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados de marca' },
      { status: 500 }
    );
  }
}
