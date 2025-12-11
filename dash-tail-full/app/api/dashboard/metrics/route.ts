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

    // Buscar métricas em paralelo para otimizar performance
    const [
      totalClientes,
      clientesAtivos,
      totalProdutos,
      produtosAtivos,
      totalFabricantes,
      fabricantesAtivos,
      totalPedidos,
      pedidosAtivos,
      totalVendedores,
      vendedoresAtivos,
      totalGruposProdutos,
      totalMarcasProdutos
    ] = await Promise.all([
      // Total de Clientes
      db.tremonte_cliente.count(),

      // Clientes Ativos
      db.tremonte_cliente.count({
        where: { status: true }
      }),

      // Total de Produtos
      db.tremonte_produto.count(),

      // Produtos Ativos (sem bloqueio)
      db.tremonte_produto.count({
        where: {
          motivo_bloqueio: null
        }
      }),

      // Total de Fabricantes
      db.tremonte_fabricante.count(),

      // Fabricantes Ativos
      db.tremonte_fabricante.count({
        where: {
          status: true,
          habilitado: true
        }
      }),

      // Total de Pedidos
      db.tremonte_pedido.count(),

      // Pedidos Ativos (status diferente de cancelado/finalizado)
      db.tremonte_pedido.count({
        where: {
          status: {
            not: null
          }
        }
      }),

      // Total de Vendedores
      db.tremonte_vendedor.count(),

      // Vendedores Ativos
      db.tremonte_vendedor.count({
        where: { status: true }
      }),

      // Total de Grupos de Produtos
      db.tremonte_grupo_produto.count({
        where: { status: true }
      }),

      // Total de Marcas de Produtos
      db.tremonte_marca_produto.count()
    ]);

    return NextResponse.json({
      totalClientes,
      clientesAtivos,
      totalProdutos,
      produtosAtivos,
      totalFabricantes,
      fabricantesAtivos,
      totalPedidos,
      pedidosAtivos,
      totalVendedores,
      vendedoresAtivos,
      totalGruposProdutos,
      totalMarcasProdutos
    });

  } catch (error) {
    console.error('Erro ao buscar métricas do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar métricas do dashboard' },
      { status: 500 }
    );
  }
}
