import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Listar todas as transportadoras
export async function GET(request: NextRequest) {
  try {
    const transportadoras = await db.tremonte_transportadora.findMany({
      include: {
        estado: {
          select: {
            id: true,
            uf: true,
            descricao: true,
          },
        },
      },
      orderBy: {
        fantasia: 'asc',
      },
    });

    return NextResponse.json(transportadoras);
  } catch (error) {
    console.error('Erro ao buscar transportadoras:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST: Criar nova transportadora
export async function POST(request: NextRequest) {
  try {
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

    // Verificar se já existe transportadora com mesmo CNPJ ou razão social
    const existingTransportadora = await db.tremonte_transportadora.findFirst({
      where: {
        OR: [
          { cnpj: cnpj.trim() },
          { razao: razao.trim() },
        ],
      },
    });

    if (existingTransportadora) {
      return NextResponse.json(
        { error: 'Já existe uma transportadora com esse CNPJ ou razão social' },
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

    const novaTransportadora = await db.tremonte_transportadora.create({
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

    return NextResponse.json(novaTransportadora, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar transportadora:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
