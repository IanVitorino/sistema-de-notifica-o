import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getVendasPorFabricante } from '@/services/dashboardVendas';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const dias = parseInt(searchParams.get('dias') || '30');
    const top = parseInt(searchParams.get('top') || '10');

    const vendas = await getVendasPorFabricante({ dias, top });

    return NextResponse.json(vendas);

  } catch (error) {
    console.error('Erro ao buscar vendas por fabricante:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar vendas por fabricante' },
      { status: 500 }
    );
  }
}
