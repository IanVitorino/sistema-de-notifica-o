import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const fabricante = await db.tremonte_fabricante.findUnique({
      where: {
        id: id,
      },
      include: {
        tremonte_criterio_pagamento: true
      }
    });

    if (!fabricante) {
      return NextResponse.json(
        { error: 'Fabricante não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(fabricante);
  } catch (error) {
    console.error('Erro ao buscar fabricante:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
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
      habilitado,
      status,
      anexo_xml,
      ident_usuario,
      ident_empresa,
      anexo_json,
      num_ped_cli
    } = body;

    // Validar dados obrigatórios
    if (!razao_social || !fantasia) {
      return NextResponse.json(
        { error: 'Razão social e nome fantasia são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o fabricante existe
    const fabricanteExistente = await db.tremonte_fabricante.findUnique({
      where: {
        id: id,
      },
    });

    if (!fabricanteExistente) {
      return NextResponse.json(
        { error: 'Fabricante não encontrado' },
        { status: 404 }
      );
    }

    // Verificar duplicidade (excluindo o próprio registro)
    const duplicado = await db.tremonte_fabricante.findFirst({
      where: {
        OR: [
          { razao_social: razao_social.trim() },
          { fantasia: fantasia.trim() }
        ],
        id: {
          not: id,
        },
      },
    });

    if (duplicado) {
      return NextResponse.json(
        { error: 'Já existe um fabricante com esta razão social ou nome fantasia' },
        { status: 400 }
      );
    }

    // Atualizar fabricante
    const fabricanteAtualizado = await db.tremonte_fabricante.update({
      where: {
        id: id,
      },
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

    return NextResponse.json(fabricanteAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar fabricante:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar se o fabricante existe
    const fabricanteExistente = await db.tremonte_fabricante.findUnique({
      where: {
        id: id,
      },
    });

    if (!fabricanteExistente) {
      return NextResponse.json(
        { error: 'Fabricante não encontrado' },
        { status: 404 }
      );
    }

    // Verificar integridade referencial - se há registros dependentes
    const [produtos, pedidos, listas] = await Promise.all([
      db.tremonte_produto.count({ where: { fk_fabricante: id } }),
      db.tremonte_pedido.count({ where: { fabricante: id } }),
      db.tremonte_lista_preco.count({ where: { fk_fabricante: id } })
    ]);

    if (produtos > 0 || pedidos > 0 || listas > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir este fabricante pois existem registros dependentes (produtos, pedidos ou listas de preço)' },
        { status: 400 }
      );
    }

    // Excluir fabricante
    await db.tremonte_fabricante.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(
      { message: 'Fabricante excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir fabricante:', error);
    
    // Verificar se é erro de constraint de chave estrangeira
    if ((error as any)?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Não é possível excluir este fabricante pois existem registros dependentes' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 