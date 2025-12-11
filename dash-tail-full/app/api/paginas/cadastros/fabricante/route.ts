import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      );
    }

    const fabricantes = await db.tremonte_fabricante.findMany({
      include: {
        tremonte_criterio_pagamento: true,
        _count: {
          select: {
            tremonte_produto: true,
            tremonte_pedido: true,
            tremonte_lista_preco: true
          }
        }
      },
      orderBy: {
        fantasia: 'asc',
      },
    });
    
    return NextResponse.json(fabricantes);
  } catch (error) {
    console.error('Erro ao buscar fabricantes:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
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

    const body = await request.json();
    const { 
      razao_social,
      fantasia,
      endereco,
      bairro,
      cidade,
      estado,
      cep,
      cnpj,
      inscricao,
      contato_email_pedidos,
      contato_email_contato,
      contato_nfe_xml,
      contato_nome_contato,
      contato_telefone1,
      contato_telefone1_ramal,
      contato_telefone2,
      contato_telefone2_ramal,
      contato_fax,
      codigo_representada,
      inicio_representada,
      criterio_pagamento,
      base_do_dia,
      base_ate,
      anexo_txt,
      anexo_xls,
      dia_vencimento,
      porcent_comissao,
      fechamento_periodo,
      emite_nota,
      habilitado = true,
      status = true,
      anexo_xml = false,
      ident_usuario,
      ident_empresa,
      anexo_json,
      num_ped_cli = true
    } = body;

    // Validar dados obrigatórios
    if (!razao_social || !fantasia) {
      return NextResponse.json(
        { error: 'Razão social e nome fantasia são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe um fabricante com a mesma razão social ou fantasia
    const fabricanteExistente = await db.tremonte_fabricante.findFirst({
      where: {
        OR: [
          { razao_social: razao_social.trim() },
          { fantasia: fantasia.trim() }
        ]
      },
    });

    if (fabricanteExistente) {
      return NextResponse.json(
        { error: 'Já existe um fabricante com esta razão social ou nome fantasia' },
        { status: 400 }
      );
    }

    // Criar novo fabricante
    const novoFabricante = await db.tremonte_fabricante.create({
      data: {
        razao_social: razao_social.trim(),
        fantasia: fantasia.trim(),
        endereco: endereco?.trim(),
        bairro: bairro?.trim(),
        cidade: cidade?.trim(),
        estado,
        cep: cep?.trim(),
        cnpj: cnpj?.trim(),
        inscricao: inscricao?.trim(),
        contato_email_pedidos: contato_email_pedidos?.trim(),
        contato_email_contato: contato_email_contato?.trim(),
        contato_nfe_xml: contato_nfe_xml?.trim(),
        contato_nome_contato: contato_nome_contato?.trim(),
        contato_telefone1: contato_telefone1?.trim(),
        contato_telefone1_ramal: contato_telefone1_ramal?.trim(),
        contato_telefone2: contato_telefone2?.trim(),
        contato_telefone2_ramal: contato_telefone2_ramal?.trim(),
        contato_fax: contato_fax?.trim(),
        codigo_representada: codigo_representada?.trim(),
        inicio_representada: inicio_representada ? new Date(inicio_representada) : null,
        criterio_pagamento,
        base_do_dia: base_do_dia?.trim(),
        base_ate: base_ate?.trim(),
        anexo_txt,
        anexo_xls,
        dia_vencimento: dia_vencimento?.trim(),
        porcent_comissao,
        fechamento_periodo: fechamento_periodo?.trim(),
        emite_nota,
        habilitado,
        status,
        anexo_xml,
        ident_usuario: ident_usuario?.trim(),
        ident_empresa: ident_empresa?.trim(),
        anexo_json,
        num_ped_cli
      },
      include: {
        tremonte_criterio_pagamento: true
      }
    });

    return NextResponse.json(novoFabricante, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar fabricante:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 