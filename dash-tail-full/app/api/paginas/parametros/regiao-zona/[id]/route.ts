import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';



export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    const { codigo_regiao, codigo_zona, descricao_regiao, descricao_zona_estatica, descricao_reduzida } = data;

    // Validações
    if (!codigo_regiao || !codigo_zona || !descricao_regiao || !descricao_zona_estatica || !descricao_reduzida) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (codigo_regiao.length > 20 || codigo_zona.length > 20) {
      return NextResponse.json(
        { error: 'Os códigos devem ter no máximo 20 caracteres' },
        { status: 400 }
      );
    }

    if (descricao_regiao.length > 80 || descricao_zona_estatica.length > 80) {
      return NextResponse.json(
        { error: 'As descrições devem ter no máximo 80 caracteres' },
        { status: 400 }
      );
    }

    if (descricao_reduzida.length > 50) {
      return NextResponse.json(
        { error: 'A descrição reduzida deve ter no máximo 50 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se já existe (excluindo o próprio registro)
    const existingRegiaoZona = await db.tremonte_regiao_zona.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { codigo_regiao: codigo_regiao },
              { codigo_zona: codigo_zona },
              { descricao_regiao: descricao_regiao },
              { descricao_zona_estatica: descricao_zona_estatica },
              { descricao_reduzida: descricao_reduzida }
            ]
          }
        ]
      }
    });

    if (existingRegiaoZona) {
      return NextResponse.json(
        { error: 'Já existe um registro com essas informações' },
        { status: 409 }
      );
    }

    const regiaoZonaAtualizada = await db.tremonte_regiao_zona.update({
      where: { id },
      data: {
        codigo_regiao,
        codigo_zona,
        descricao_regiao,
        descricao_zona_estatica,
        descricao_reduzida,
      },
    });

    return NextResponse.json(regiaoZonaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar região e zona:', error);
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
    const id = parseInt(params.id);

    await db.tremonte_regiao_zona.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Região e zona excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir região e zona:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 