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

    // Buscar vendedores no banco de dados que correspondam ao termo de busca
    const vendedores = await db.tremonte_vendedor.findMany({
      where: {
        OR: [
          { apelido: { contains: query, mode: 'insensitive' } },
          { nome: { contains: query, mode: 'insensitive' } },
          { cpf: { contains: query } }
        ],
        status: true // Apenas vendedores ativos
      },
      select: {
        id: true,
        apelido: true,
        nome: true,
        cpf: true
      },
      orderBy: {
        apelido: 'asc'
      },
      take: 20 // Limitar o número de resultados para melhor desempenho
    })

    return NextResponse.json(vendedores)
  } catch (error) {
    console.error('Erro ao buscar vendedores:', error)
    return NextResponse.json({ error: 'Erro ao buscar vendedores' }, { status: 500 })
  }
} 