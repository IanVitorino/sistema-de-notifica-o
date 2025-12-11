import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDashboardVendasMetrics } from '@/services/dashboardVendas';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const dias = parseInt(searchParams.get('dias') || '30');

    const metrics = await getDashboardVendasMetrics({ dias });

    return NextResponse.json(metrics);

  } catch (error) {
    console.error('Erro ao buscar métricas de vendas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar métricas de vendas' },
      { status: 500 }
    );
  }
}
