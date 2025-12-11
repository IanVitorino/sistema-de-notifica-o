import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const fabricante = searchParams.get('fabricante');

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    // Filtro de busca
    if (search) {
      where.OR = [
        { codigo: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } },
        { desc_reduzida: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filtro de fabricante
    if (fabricante && fabricante !== '0') {
      where.fk_fabricante = parseInt(fabricante);
    }

    // Buscar produtos com paginação
    const [produtos, total] = await Promise.all([
      prisma.tremonte_produto.findMany({
        where,
        include: {
          tremonte_fabricante: {
            select: {
              id: true,
              fantasia: true
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
        },
        orderBy: {
          codigo: 'asc'
        },
        skip,
        take: limit
      }),
      prisma.tremonte_produto.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      produtos,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Verificar se já existe produto com mesmo código
    const existingProduto = await prisma.tremonte_produto.findFirst({
      where: {
        codigo: codigo.trim()
      }
    });

    if (existingProduto) {
      return NextResponse.json(
        { error: 'Já existe um produto com esse código' },
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

    const novoProduto = await prisma.tremonte_produto.create({
      data: {
        fk_fabricante: fk_fabricante === undefined ? null : fk_fabricante,
        codigo: codigo.trim(),
        descricao: descricao.trim(),
        desc_reduzida: desc_reduzida === undefined ? null : desc_reduzida.trim(),
        grupo_produto: grupo_produto === undefined ? null : grupo_produto,
        codigo_original: codigo_original === undefined ? null : codigo_original.trim(),
        unidade_medida: unidade_medida === undefined ? null : unidade_medida,
        produto_substituido: produto_substituido === undefined ? null : produto_substituido.trim(),
        validade: validade === undefined ? null : validade,
        motivo_bloqueio: motivo_bloqueio === undefined ? null : motivo_bloqueio,
        inicio_bloq: inicio_bloq === undefined ? null : inicio_bloq,
        termino_bloq: termino_bloq === undefined ? null : termino_bloq,
        grupo_2: grupo_2 === undefined ? null : grupo_2.trim()
      },
      include: {
        tremonte_fabricante: {
          select: {
            id: true,
            fantasia: true
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

    return NextResponse.json(novoProduto, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
