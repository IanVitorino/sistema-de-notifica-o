import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { format, parse } from 'date-fns';

// Tipo para os dados do relatório
interface RelatorioItem {
  id: number;
  numero: string;
  data: string;
  fabricante: string;
  cliente: string;
  pedido: number;
  faturamento: number;
  comissao: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      );
    }

    // Obter os parâmetros de filtro do corpo da requisição
    const filtros = await request.json();
    const {
      fabricanteId,
      clienteId,
      vendedorId,
      periodoInicial,
      periodoFinal
    } = filtros;

    // Validar datas
    if (!periodoInicial || !periodoFinal) {
      return NextResponse.json(
        { error: 'Período inicial e final são obrigatórios' },
        { status: 400 }
      );
    }

    // Converter datas do formato DD/MM/YYYY para objetos Date
    const dataInicial = parse(periodoInicial, 'dd/MM/yyyy', new Date());
    const dataFinal = parse(periodoFinal, 'dd/MM/yyyy', new Date());

    // Buscar informações de fabricante, cliente e vendedor para os filtros
    let nomeFabricante: string | null = null;
    let nomeCliente: string | null = null;
    let nomeVendedor: string | null = null;

    if (fabricanteId) {
      const fabricante = await db.tremonte_fabricante.findUnique({
        where: { id: fabricanteId },
        select: { fantasia: true }
      });
      nomeFabricante = fabricante?.fantasia || null;
    }

    if (clienteId) {
      const cliente = await db.tremonte_cliente.findUnique({
        where: { id: clienteId },
        select: { fantasia: true }
      });
      nomeCliente = cliente?.fantasia || null;
    }

    if (vendedorId) {
      const vendedor = await db.tremonte_vendedor.findUnique({
        where: { id: vendedorId },
        select: { apelido: true, nome: true }
      });
      nomeVendedor = vendedor?.apelido || vendedor?.nome || null;
    }

    // Construir a consulta SQL com os filtros
    const query = `
      SELECT
        a.id,
        a.pedido_original,
        a.data_pedido,
        b.fantasia AS fabricante_nome,
        c.fantasia AS cliente_nome,
        SUM(d.valor_descontado * d.quantidade)::numeric(16,2) AS total_pedido,
        SUM(d.valor_descontado * d.saldo)::numeric(16,2) AS total_faturado,
        SUM((d.valor_descontado * d.quantidade) * (b.porcent_comissao/100))::numeric(16,2) AS valor_comissao
      FROM tremonte_pedido a
      INNER JOIN tremonte_fabricante b ON a.fabricante = b.id
      INNER JOIN tremonte_cliente c ON c.id = a.cliente
      INNER JOIN tremonte_pedido_itens d ON a.id = d.pedido
      INNER JOIN tremonte_vendedor v ON c.fk_vendedor = v.id
      WHERE 1=1
      AND a.status = 2
      ${fabricanteId ? `AND a.fabricante = ${fabricanteId}` : ''}
      ${clienteId ? `AND a.cliente = ${clienteId}` : ''}
      ${vendedorId ? `AND c.fk_vendedor = ${vendedorId}` : ''}
      AND a.data_pedido >= '${format(dataInicial, 'yyyy-MM-dd')}'
      AND a.data_pedido <= '${format(dataFinal, 'yyyy-MM-dd')}'
      GROUP BY a.id, a.pedido_original, a.data_pedido, b.fantasia, c.fantasia
      ORDER BY b.fantasia ASC, a.data_pedido ASC
    `;

    // Executar a consulta
    const result = await db.$queryRawUnsafe<any[]>(query);

    // Processar os dados para o formato do relatório
    const items: RelatorioItem[] = result.map(item => {
      return {
        id: item.id,
        numero: item.pedido_original || `#${item.id}`,
        data: format(new Date(item.data_pedido), 'dd/MM/yyyy'),
        fabricante: item.fabricante_nome || 'N/A',
        cliente: item.cliente_nome || 'N/A',
        pedido: Number(item.total_pedido) || 0,
        faturamento: Number(item.total_faturado) || 0,
        comissao: Number(item.valor_comissao) || 0
      };
    });

    // Calcular totais
    const totais = items.reduce(
      (acc, item) => {
        return {
          pedido: acc.pedido + item.pedido,
          faturamento: acc.faturamento + item.faturamento,
          comissao: acc.comissao + item.comissao
        };
      },
      { pedido: 0, faturamento: 0, comissao: 0 }
    );

    // Retornar os dados para o frontend gerar o PDF
    return NextResponse.json({
      items,
      totais,
      filtros: {
        periodoInicial,
        periodoFinal,
        fabricante: nomeFabricante,
        cliente: nomeCliente,
        vendedor: nomeVendedor
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de comissão:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatório de comissão' },
      { status: 500 }
    );
  }
}
