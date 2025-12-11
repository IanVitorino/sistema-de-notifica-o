import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db as prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

interface Params {
  id: string;
}

/**
 * GET /api/paginas/cadastros/grupo-clientes/[id]
 *
 * Retorna um grupo de cliente específico pelo ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      );
    }

    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const grupo = await prisma.tremonte_grupo_clientes.findUnique({
      where: { id },
    });

    if (!grupo) {
      return NextResponse.json(
        { error: 'Grupo de cliente não encontrado' },
        { status: 404 }
      );
    }

    // Formatar para o padrão esperado
    const grupoFormatado = {
      id: grupo.id,
      nome: grupo.descricao || 'Sem nome',
      codigo_grupo: grupo.codigo_grupo,
      status: grupo.status,
    };

    return NextResponse.json(grupoFormatado);
  } catch (error) {
    console.error(`Erro ao buscar grupo de cliente ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/paginas/cadastros/grupo-clientes/[id]
 *
 * Atualiza um grupo de cliente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      );
    }

    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { descricao, codigo_grupo, status } = body;

    // Verificar se o grupo existe
    const grupoExistente = await prisma.tremonte_grupo_clientes.findUnique({
      where: { id },
    });

    if (!grupoExistente) {
      return NextResponse.json(
        { error: 'Grupo de cliente não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já existe outro grupo com a mesma descrição
    if (descricao) {
      const grupoComMesmaDescricao = await prisma.tremonte_grupo_clientes.findFirst({
        where: {
          descricao: descricao.trim(),
          id: { not: id },
        },
      });

      if (grupoComMesmaDescricao) {
        return NextResponse.json(
          { error: 'Já existe um grupo de cliente com esta descrição' },
          { status: 400 }
        );
      }
    }

    // Atualizar grupo
    const grupoAtualizado = await prisma.tremonte_grupo_clientes.update({
      where: { id },
      data: {
        codigo_grupo: codigo_grupo?.trim() || grupoExistente.codigo_grupo,
        descricao: descricao?.trim() || grupoExistente.descricao,
        status: status !== undefined ? status : grupoExistente.status,
      },
    });

    return NextResponse.json(grupoAtualizado);
  } catch (error) {
    console.error(`Erro ao atualizar grupo de cliente ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/paginas/cadastros/grupo-clientes/[id]
 *
 * Remove um grupo de cliente (desativa)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      );
    }

    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar se o grupo existe
    const grupoExistente = await prisma.tremonte_grupo_clientes.findUnique({
      where: { id },
    });

    if (!grupoExistente) {
      return NextResponse.json(
        { error: 'Grupo de cliente não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o grupo está sendo usado por algum cliente
    const clientesUsandoGrupo = await prisma.tremonte_cliente.count({
      where: {
        grupo_clientes: id,
      },
    });

    if (clientesUsandoGrupo > 0) {
      return NextResponse.json(
        {
          error: 'Este grupo não pode ser excluído porque está sendo usado por clientes',
          clientesAssociados: clientesUsandoGrupo
        },
        { status: 400 }
      );
    }

    // Desativar o grupo em vez de excluir (soft delete)
    const grupoDesativado = await prisma.tremonte_grupo_clientes.update({
      where: { id },
      data: {
        status: false,
      },
    });

    return NextResponse.json({
      message: 'Grupo de cliente desativado com sucesso',
      id: grupoDesativado.id
    });
  } catch (error) {
    console.error(`Erro ao remover grupo de cliente ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}