import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

// PUT: Atualizar transportadora
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const {
      razao,
      fantasia,
      cnpj,
      endereco,
      bairro,
      cep,
      cidade,
      uf,
      fone,
      fax,
      email,
      contato,
      contato2,
      codigo_servico,
    } = data;

    // Validações obrigatórias
    if (!razao || !fantasia || !cnpj || !uf) {
      return NextResponse.json(
        { error: 'Razão social, nome fantasia, CNPJ e UF são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar tamanhos dos campos
    if (razao.length > 80) {
      return NextResponse.json(
        { error: 'Razão social deve ter no máximo 80 caracteres' },
        { status: 400 }
      );
    }

    if (fantasia.length > 60) {
      return NextResponse.json(
        { error: 'Nome fantasia deve ter no máximo 60 caracteres' },
        { status: 400 }
      );
    }

    if (cnpj.length > 18) {
      return NextResponse.json(
        { error: 'CNPJ deve ter no máximo 18 caracteres' },
        { status: 400 }
      );
    }

    // Validar CNPJ (somente dígitos)
    const cnpjDigits = cnpj.replace(/\D/g, '');
    if (cnpjDigits.length !== 14) {
      return NextResponse.json(
        { error: 'CNPJ deve ter 14 dígitos' },
        { status: 400 }
      );
    }

    // Verificar se a transportadora existe
    const existingTransportadora = await db.tremonte_transportadora.findUnique({
      where: { id },
    });

    if (!existingTransportadora) {
      return NextResponse.json(
        { error: 'Transportadora não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se já existe outra transportadora com mesmo CNPJ ou razão social
    const duplicateTransportadora = await db.tremonte_transportadora.findFirst({
      where: {
        OR: [
          { cnpj: cnpj.trim() },
          { razao: razao.trim() },
        ],
        id: { not: id },
      },
    });

    if (duplicateTransportadora) {
      return NextResponse.json(
        { error: 'Já existe outra transportadora com esse CNPJ ou razão social' },
        { status: 409 }
      );
    }

    // Verificar se o estado existe
    if (uf) {
      const estado = await db.estado.findUnique({
        where: { id: uf },
      });
      if (!estado) {
        return NextResponse.json(
          { error: 'Estado não encontrado' },
          { status: 400 }
        );
      }
    }

    const transportadoraAtualizada = await db.tremonte_transportadora.update({
      where: { id },
      data: {
        razao: razao.trim(),
        fantasia: fantasia.trim(),
        cnpj: cnpj.trim(),
        endereco: endereco?.trim() || null,
        bairro: bairro?.trim() || null,
        cep: cep?.trim() || null,
        cidade: cidade?.trim() || null,
        uf,
        fone: fone?.trim() || null,
        fax: fax?.trim() || null,
        email: email?.trim() || null,
        contato: contato?.trim() || null,
        contato2: contato2?.trim() || null,
        codigo_servico: codigo_servico?.trim() || null,
      },
      include: {
        estado: {
          select: {
            id: true,
            uf: true,
            descricao: true,
          },
        },
      },
    });

    return NextResponse.json(transportadoraAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar transportadora:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Excluir transportadora
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar se a transportadora existe
    const transportadora = await db.tremonte_transportadora.findUnique({
      where: { id },
    });

    if (!transportadora) {
      return NextResponse.json(
        { error: 'Transportadora não encontrada' },
        { status: 404 }
      );
    }

    // Excluir a transportadora
    await db.tremonte_transportadora.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Transportadora excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir transportadora:', error);

    // Se o erro for de restrição de chave estrangeira
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return NextResponse.json(
        { error: 'Não é possível excluir a transportadora pois ela está sendo usada em outros registros' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
