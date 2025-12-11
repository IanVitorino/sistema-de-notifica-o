import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Interface para parâmetros de período
 */
interface PeriodoParams {
  dias?: number;
  dataInicio?: Date;
  dataFim?: Date;
}

/**
 * Calcula data de início baseado no número de dias
 */
function calcularPeriodo(params: PeriodoParams): { dataInicio: Date; dataFim: Date } {
  const dataFim = params.dataFim || new Date();

  if (params.dataInicio) {
    return { dataInicio: params.dataInicio, dataFim };
  }

  const dias = params.dias || 30;
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - dias);

  return { dataInicio, dataFim };
}

/**
 * Obtém métricas gerais do dashboard de vendas
 */
export async function getDashboardVendasMetrics(params: PeriodoParams = {}) {
  const { dataInicio, dataFim } = calcularPeriodo(params);

  try {
    // Total de vendas em valor
    const totalVendas = await prisma.$queryRaw<Array<{ total: number }>>`
      SELECT COALESCE(SUM(pi.quantidade * pi.valor_descontado), 0)::float as total
      FROM tremonte_pedido p
      JOIN tremonte_pedido_itens pi ON p.id = pi.pedido
      WHERE p.orcamento = false
        AND p.data_pedido >= ${dataInicio}::date
        AND p.data_pedido <= ${dataFim}::date
    `;

    // Quantidade de pedidos
    const totalPedidos = await prisma.tremonte_pedido.count({
      where: {
        orcamento: false,
        data_pedido: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
    });

    // Clientes ativos (que compraram no período)
    const clientesAtivos = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT cliente)::bigint as count
      FROM tremonte_pedido
      WHERE orcamento = false
        AND data_pedido >= ${dataInicio}::date
        AND data_pedido <= ${dataFim}::date
        AND cliente IS NOT NULL
    `;

    // Ticket médio
    const valorTotal = totalVendas[0]?.total || 0;
    const ticketMedio = totalPedidos > 0 ? valorTotal / totalPedidos : 0;

    return {
      totalVendas: valorTotal,
      totalPedidos,
      ticketMedio,
      clientesAtivos: Number(clientesAtivos[0]?.count || 0),
    };
  } catch (error) {
    console.error('Erro ao buscar métricas de vendas:', error);
    throw error;
  }
}

/**
 * Obtém vendas agrupadas por mês (últimos 12 meses)
 */
export async function getVendasMensais() {
  try {
    const resultado = await prisma.$queryRaw<
      Array<{
        ano: number;
        mes: number;
        total_vendas: number;
        quantidade_pedidos: bigint;
      }>
    >`
      SELECT
        EXTRACT(YEAR FROM p.data_pedido)::int as ano,
        EXTRACT(MONTH FROM p.data_pedido)::int as mes,
        COALESCE(SUM(pi.quantidade * pi.valor_descontado), 0)::float as total_vendas,
        COUNT(DISTINCT p.id)::bigint as quantidade_pedidos
      FROM tremonte_pedido p
      JOIN tremonte_pedido_itens pi ON p.id = pi.pedido
      WHERE p.orcamento = false
        AND p.data_pedido >= NOW() - INTERVAL '12 months'
      GROUP BY ano, mes
      ORDER BY ano, mes
    `;

    return resultado.map(r => ({
      ano: r.ano,
      mes: r.mes,
      totalVendas: r.total_vendas,
      quantidadePedidos: Number(r.quantidade_pedidos),
    }));
  } catch (error) {
    console.error('Erro ao buscar vendas mensais:', error);
    throw error;
  }
}

/**
 * Obtém vendas agrupadas por vendedor
 */
export async function getVendasPorVendedor(params: PeriodoParams & { top?: number } = {}) {
  const { dataInicio, dataFim } = calcularPeriodo(params);
  const top = params.top || 10;

  try {
    const resultado = await prisma.$queryRaw<
      Array<{
        id: number;
        vendedor: string;
        total_pedidos: bigint;
        total_vendas: number;
      }>
    >`
      SELECT
        v.id,
        v.nome as vendedor,
        COUNT(DISTINCT p.id)::bigint as total_pedidos,
        COALESCE(SUM(pi.quantidade * pi.valor_descontado), 0)::float as total_vendas
      FROM tremonte_pedido p
      JOIN tremonte_pedido_itens pi ON p.id = pi.pedido
      JOIN tremonte_cliente c ON p.cliente = c.id
      JOIN tremonte_vendedor v ON c.fk_vendedor = v.id
      WHERE p.orcamento = false
        AND p.data_pedido >= ${dataInicio}::date
        AND p.data_pedido <= ${dataFim}::date
      GROUP BY v.id, v.nome
      ORDER BY total_vendas DESC
      LIMIT ${top}
    `;

    return resultado.map(r => ({
      id: r.id,
      vendedor: r.vendedor,
      totalPedidos: Number(r.total_pedidos),
      totalVendas: r.total_vendas,
    }));
  } catch (error) {
    console.error('Erro ao buscar vendas por vendedor:', error);
    throw error;
  }
}

/**
 * Obtém top clientes que mais compram
 */
export async function getTopClientes(params: PeriodoParams & { top?: number } = {}) {
  const { dataInicio, dataFim } = calcularPeriodo(params);
  const top = params.top || 10;

  try {
    const resultado = await prisma.$queryRaw<
      Array<{
        id: number;
        cliente: string;
        cidade: string | null;
        total_pedidos: bigint;
        total_compras: number;
      }>
    >`
      SELECT
        c.id,
        COALESCE(c.razao_social, c.fantasia) as cliente,
        c.cidade,
        COUNT(DISTINCT p.id)::bigint as total_pedidos,
        COALESCE(SUM(pi.quantidade * pi.valor_descontado), 0)::float as total_compras
      FROM tremonte_pedido p
      JOIN tremonte_pedido_itens pi ON p.id = pi.pedido
      JOIN tremonte_cliente c ON p.cliente = c.id
      WHERE p.orcamento = false
        AND p.data_pedido >= ${dataInicio}::date
        AND p.data_pedido <= ${dataFim}::date
      GROUP BY c.id, c.razao_social, c.fantasia, c.cidade
      ORDER BY total_compras DESC
      LIMIT ${top}
    `;

    return resultado.map(r => ({
      id: r.id,
      cliente: r.cliente,
      cidade: r.cidade,
      totalPedidos: Number(r.total_pedidos),
      totalCompras: r.total_compras,
    }));
  } catch (error) {
    console.error('Erro ao buscar top clientes:', error);
    throw error;
  }
}

/**
 * Obtém vendas agrupadas por fabricante
 */
export async function getVendasPorFabricante(params: PeriodoParams & { top?: number } = {}) {
  const { dataInicio, dataFim } = calcularPeriodo(params);
  const top = params.top || 10;

  try {
    const resultado = await prisma.$queryRaw<
      Array<{
        id: number;
        fabricante: string;
        total_pedidos: bigint;
        total_vendas: number;
      }>
    >`
      SELECT
        f.id,
        COALESCE(f.fantasia, f.razao_social) as fabricante,
        COUNT(DISTINCT p.id)::bigint as total_pedidos,
        COALESCE(SUM(pi.quantidade * pi.valor_descontado), 0)::float as total_vendas
      FROM tremonte_pedido p
      JOIN tremonte_pedido_itens pi ON p.id = pi.pedido
      JOIN tremonte_fabricante f ON p.fabricante = f.id
      WHERE p.orcamento = false
        AND p.data_pedido >= ${dataInicio}::date
        AND p.data_pedido <= ${dataFim}::date
      GROUP BY f.id, f.fantasia, f.razao_social
      ORDER BY total_vendas DESC
      LIMIT ${top}
    `;

    return resultado.map(r => ({
      id: r.id,
      fabricante: r.fabricante,
      totalPedidos: Number(r.total_pedidos),
      totalVendas: r.total_vendas,
    }));
  } catch (error) {
    console.error('Erro ao buscar vendas por fabricante:', error);
    throw error;
  }
}

/**
 * Obtém vendas agrupadas por região
 */
export async function getVendasPorRegiao(params: PeriodoParams = {}) {
  const { dataInicio, dataFim } = calcularPeriodo(params);

  try {
    const resultado = await prisma.$queryRaw<
      Array<{
        id: number;
        regiao: string;
        codigo_regiao: string | null;
        total_pedidos: bigint;
        total_vendas: number;
      }>
    >`
      SELECT
        rz.id,
        rz.descricao_regiao as regiao,
        rz.codigo_regiao,
        COUNT(DISTINCT p.id)::bigint as total_pedidos,
        COALESCE(SUM(pi.quantidade * pi.valor_descontado), 0)::float as total_vendas
      FROM tremonte_pedido p
      JOIN tremonte_pedido_itens pi ON p.id = pi.pedido
      JOIN tremonte_cliente c ON p.cliente = c.id
      JOIN tremonte_regiao_zona rz ON c.contato_regiao = rz.id
      WHERE p.orcamento = false
        AND p.data_pedido >= ${dataInicio}::date
        AND p.data_pedido <= ${dataFim}::date
      GROUP BY rz.id, rz.descricao_regiao, rz.codigo_regiao
      ORDER BY total_vendas DESC
    `;

    return resultado.map(r => ({
      id: r.id,
      regiao: r.regiao,
      codigoRegiao: r.codigo_regiao,
      totalPedidos: Number(r.total_pedidos),
      totalVendas: r.total_vendas,
    }));
  } catch (error) {
    console.error('Erro ao buscar vendas por região:', error);
    throw error;
  }
}

/**
 * Obtém produtos mais vendidos
 */
export async function getProdutosMaisVendidos(params: PeriodoParams & { top?: number } = {}) {
  const { dataInicio, dataFim } = calcularPeriodo(params);
  const top = params.top || 20;

  try {
    const resultado = await prisma.$queryRaw<
      Array<{
        id: number;
        codigo: string | null;
        descricao: string | null;
        total_quantidade: number;
        total_valor: number;
      }>
    >`
      SELECT
        pr.id,
        pr.codigo,
        pr.descricao,
        COALESCE(SUM(pi.quantidade), 0)::float as total_quantidade,
        COALESCE(SUM(pi.quantidade * pi.valor_descontado), 0)::float as total_valor
      FROM tremonte_pedido_itens pi
      JOIN tremonte_produto pr ON pi.produto = pr.id
      JOIN tremonte_pedido p ON pi.pedido = p.id
      WHERE p.orcamento = false
        AND p.data_pedido >= ${dataInicio}::date
        AND p.data_pedido <= ${dataFim}::date
      GROUP BY pr.id, pr.codigo, pr.descricao
      ORDER BY total_quantidade DESC
      LIMIT ${top}
    `;

    return resultado.map(r => ({
      id: r.id,
      codigo: r.codigo,
      descricao: r.descricao,
      totalQuantidade: r.total_quantidade,
      totalValor: r.total_valor,
    }));
  } catch (error) {
    console.error('Erro ao buscar produtos mais vendidos:', error);
    throw error;
  }
}

/**
 * Obtém evolução diária de vendas
 */
export async function getEvolucaoDiariaVendas(params: { dias?: number } = {}) {
  const dias = params.dias || 30;
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - dias);

  try {
    const resultado = await prisma.$queryRaw<
      Array<{
        data: Date;
        total_pedidos: bigint;
        total_vendas: number;
      }>
    >`
      SELECT
        DATE(p.data_pedido) as data,
        COUNT(DISTINCT p.id)::bigint as total_pedidos,
        COALESCE(SUM(pi.quantidade * pi.valor_descontado), 0)::float as total_vendas
      FROM tremonte_pedido p
      JOIN tremonte_pedido_itens pi ON p.id = pi.pedido
      WHERE p.orcamento = false
        AND p.data_pedido >= ${dataInicio}::date
      GROUP BY DATE(p.data_pedido)
      ORDER BY data
    `;

    return resultado.map(r => ({
      data: r.data,
      totalPedidos: Number(r.total_pedidos),
      totalVendas: r.total_vendas,
    }));
  } catch (error) {
    console.error('Erro ao buscar evolução diária de vendas:', error);
    throw error;
  }
}
