import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const gruposClientes = await db.tremonte_grupo_clientes.findMany({
      orderBy: {
        descricao: 'asc',
      },
    });

    return NextResponse.json(gruposClientes);
  } catch (error) {
    console.error('Erro ao buscar grupos de clientes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar grupos de clientes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { codigo, descricao, status } = body;

    // Validações básicas
    if (!codigo || !descricao) {
      return NextResponse.json(
        { error: 'Código e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    if (codigo.length > 6) {
      return NextResponse.json(
        { error: 'Código deve ter no máximo 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar duplicatas
    const grupoClienteExistente = await db.tremonte_grupo_clientes.findFirst({
      where: {
        OR: [
          { codigo_grupo: codigo },
          { descricao: descricao },
        ],
      },
    });

    if (grupoClienteExistente) {
      return NextResponse.json(
        { error: 'Código ou descrição já existe' },
        { status: 400 }
      );
    }

    const novoGrupoCliente = await db.tremonte_grupo_clientes.create({
      data: {
        codigo_grupo: codigo,
        descricao: descricao,
        status: status ?? true,
      },
    });

    return NextResponse.json(novoGrupoCliente);
  } catch (error) {
    console.error('Erro ao criar grupo de cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao criar grupo de cliente' },
      { status: 500 }
    );
  }
}