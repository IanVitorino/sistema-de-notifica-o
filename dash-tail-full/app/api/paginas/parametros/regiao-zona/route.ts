import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';



export async function GET() {
  try {
    const regioesZonas = await db.tremonte_regiao_zona.findMany({
      orderBy: {
        id: 'desc'
      }
    });

    return NextResponse.json(regioesZonas);
  } catch (error) {
    console.error('Erro ao buscar regiões e zonas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Verificar se já existe
    const existingRegiaoZona = await db.tremonte_regiao_zona.findFirst({
      where: {
        OR: [
          { codigo_regiao: codigo_regiao },
          { codigo_zona: codigo_zona },
          { descricao_regiao: descricao_regiao },
          { descricao_zona_estatica: descricao_zona_estatica },
          { descricao_reduzida: descricao_reduzida }
        ]
      }
    });

    if (existingRegiaoZona) {
      return NextResponse.json(
        { error: 'Já existe um registro com essas informações' },
        { status: 409 }
      );
    }

    const novaRegiaoZona = await db.tremonte_regiao_zona.create({
      data: {
        codigo_regiao,
        codigo_zona,
        descricao_regiao,
        descricao_zona_estatica,
        descricao_reduzida,
      },
    });

    return NextResponse.json(novaRegiaoZona, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar região e zona:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 