import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      )
    }

    // Obter o termo de busca da URL
    const url = new URL(request.url)
    const query = url.searchParams.get('query')

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    // Buscar fabricantes no banco de dados que correspondam ao termo de busca
    const fabricantes = await db.tremonte_fabricante.findMany({
      where: {
        OR: [
          { fantasia: { contains: query, mode: 'insensitive' } },
          { razao_social: { contains: query, mode: 'insensitive' } }
        ],
        status: true // Apenas fabricantes ativos
      },
      select: {
        id: true,
        fantasia: true,
        razao_social: true
      },
      orderBy: {
        fantasia: 'asc'
      },
      take: 20 // Limitar o número de resultados para melhor desempenho
    })

    return NextResponse.json(fabricantes)
  } catch (error) {
    console.error('Erro ao buscar fabricantes:', error)
    return NextResponse.json({ error: 'Erro ao buscar fabricantes' }, { status: 500 })
  }
} 