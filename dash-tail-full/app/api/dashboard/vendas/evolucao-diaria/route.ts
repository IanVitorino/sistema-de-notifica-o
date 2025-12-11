import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getEvolucaoDiariaVendas } from '@/services/dashboardVendas';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const dias = parseInt(searchParams.get('dias') || '30');

    const evolucao = await getEvolucaoDiariaVendas({ dias });

    return NextResponse.json(evolucao);

  } catch (error) {
    console.error('Erro ao buscar evolução diária:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar evolução diária' },
      { status: 500 }
    );
  }
}
