import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getVendasMensais } from '@/services/dashboardVendas';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const vendas = await getVendasMensais();

    return NextResponse.json(vendas);

  } catch (error) {
    console.error('Erro ao buscar vendas mensais:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar vendas mensais' },
      { status: 500 }
    );
  }
}
