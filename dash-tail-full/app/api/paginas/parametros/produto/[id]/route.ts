import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    const produto = await prisma.tremonte_produto.findUnique({
      where: { id },
      include: {
        tremonte_fabricante: {
          select: {
            id: true,
            fantasia: true,
            razao_social: true
          }
        },
        tremonte_grupo_produto: {
          select: {
            id: true,
            codigo: true,
            descricao: true
          }
        },
        tremonte_unidade_medida: {
          select: {
            id: true,
            unidade: true,
            descricao: true
          }
        },
        tremonte_motivo_bloqueio_produto: {
          select: {
            id: true,
            motivo: true,
            descricao: true
          }
        }
      }
    });

    if (!produto) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(produto);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();

    const {
      fk_fabricante,
      codigo,
      descricao,
      desc_reduzida,
      grupo_produto,
      codigo_original,
      unidade_medida,
      produto_substituido,
      validade,
      motivo_bloqueio,
      inicio_bloq,
      termino_bloq,
      grupo_2
    } = data;

    // Validações obrigatórias
    if (!codigo || !descricao) {
      return NextResponse.json(
        { error: 'Código e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar tamanhos dos campos
    if (codigo.length > 20) {
      return NextResponse.json(
        { error: 'Código deve ter no máximo 20 caracteres' },
        { status: 400 }
      );
    }

    if (descricao.length > 100) {
      return NextResponse.json(
        { error: 'Descrição deve ter no máximo 100 caracteres' },
        { status: 400 }
      );
    }

    if (desc_reduzida && desc_reduzida.length > 25) {
      return NextResponse.json(
        { error: 'Descrição reduzida deve ter no máximo 25 caracteres' },
        { status: 400 }
      );
    }

    if (codigo_original && codigo_original.length > 20) {
      return NextResponse.json(
        { error: 'Código original deve ter no máximo 20 caracteres' },
        { status: 400 }
      );
    }

    if (produto_substituido && produto_substituido.length > 20) {
      return NextResponse.json(
        { error: 'Produto substituído deve ter no máximo 20 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se o produto existe
    const existingProduto = await prisma.tremonte_produto.findUnique({
      where: { id }
    });

    if (!existingProduto) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já existe outro produto com o mesmo código
    const duplicateProduto = await prisma.tremonte_produto.findFirst({
      where: {
        codigo: codigo,
        id: { not: id }
      }
    });

    if (duplicateProduto) {
      return NextResponse.json(
        { error: 'Já existe outro produto com esse código' },
        { status: 409 }
      );
    }

    // Verificar se os relacionamentos existem
    if (fk_fabricante) {
      const fabricante = await prisma.tremonte_fabricante.findUnique({
        where: { id: fk_fabricante }
      });
      if (!fabricante) {
        return NextResponse.json(
          { error: 'Fabricante não encontrado' },
          { status: 400 }
        );
      }
    }

    if (grupo_produto) {
      const grupo = await prisma.tremonte_grupo_produto.findUnique({
        where: { id: grupo_produto }
      });
      if (!grupo) {
        return NextResponse.json(
          { error: 'Grupo de produto não encontrado' },
          { status: 400 }
        );
      }
    }

    if (unidade_medida) {
      const unidade = await prisma.tremonte_unidade_medida.findUnique({
        where: { id: unidade_medida }
      });
      if (!unidade) {
        return NextResponse.json(
          { error: 'Unidade de medida não encontrada' },
          { status: 400 }
        );
      }
    }

    if (motivo_bloqueio) {
      const motivo = await prisma.tremonte_motivo_bloqueio_produto.findUnique({
        where: { id: motivo_bloqueio }
      });
      if (!motivo) {
        return NextResponse.json(
          { error: 'Motivo de bloqueio não encontrado' },
          { status: 400 }
        );
      }
    }

    const updatedProduto = await prisma.tremonte_produto.update({
      where: { id },
      data: {
        fk_fabricante: fk_fabricante === undefined ? null : fk_fabricante,
        codigo,
        descricao,
        desc_reduzida: desc_reduzida === undefined ? null : desc_reduzida,
        grupo_produto: grupo_produto === undefined ? null : grupo_produto,
        codigo_original: codigo_original === undefined ? null : codigo_original,
        unidade_medida: unidade_medida === undefined ? null : unidade_medida,
        produto_substituido: produto_substituido === undefined ? null : produto_substituido,
        validade: validade === undefined ? null : new Date(validade),
        motivo_bloqueio: motivo_bloqueio === undefined ? null : motivo_bloqueio,
        inicio_bloq: inicio_bloq === undefined ? null : new Date(inicio_bloq),
        termino_bloq: termino_bloq === undefined ? null : new Date(termino_bloq),
        grupo_2: grupo_2 === undefined ? null : grupo_2,
      },
      include: {
        tremonte_fabricante: true,
        tremonte_grupo_produto: true,
        tremonte_unidade_medida: true,
        tremonte_motivo_bloqueio_produto: true,
      }
    });

    return NextResponse.json(updatedProduto);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    // Verificar se o produto existe
    const produto = await prisma.tremonte_produto.findUnique({
      where: { id }
    });

    if (!produto) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Excluir o produto
    await prisma.tremonte_produto.delete({
      where: { id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);

    // Se o erro for de restrição de chave estrangeira
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return NextResponse.json(
        { error: 'Não é possível excluir o produto pois ele está sendo usado em outros registros' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
