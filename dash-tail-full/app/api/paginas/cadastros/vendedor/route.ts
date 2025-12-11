import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const vendedores = await db.tremonte_vendedor.findMany({
      orderBy: {
        nome: 'asc'
      }
    });

    return NextResponse.json(vendedores);
  } catch (error) {
    console.error('Erro ao buscar vendedores:', error);
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
      apelido,
      nome, 
      endereco,
      cep,
      bairro,
      cidade,
      uf,
      celular,
      telefone,
      ramal,
      comissao,
      email,
      rg,
      cpf,
      status 
    } = data;

    // Validações obrigatórias
    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    // Validar tamanhos dos campos
    if (apelido && apelido.length > 20) {
      return NextResponse.json(
        { error: 'Apelido deve ter no máximo 20 caracteres' },
        { status: 400 }
      );
    }

    if (nome.length > 60) {
      return NextResponse.json(
        { error: 'Nome deve ter no máximo 60 caracteres' },
        { status: 400 }
      );
    }

    if (endereco && endereco.length > 60) {
      return NextResponse.json(
        { error: 'Endereço deve ter no máximo 60 caracteres' },
        { status: 400 }
      );
    }

    if (cep && cep.length > 10) {
      return NextResponse.json(
        { error: 'CEP deve ter no máximo 10 caracteres' },
        { status: 400 }
      );
    }

    if (bairro && bairro.length > 60) {
      return NextResponse.json(
        { error: 'Bairro deve ter no máximo 60 caracteres' },
        { status: 400 }
      );
    }

    if (cidade && cidade.length > 20) {
      return NextResponse.json(
        { error: 'Cidade deve ter no máximo 20 caracteres' },
        { status: 400 }
      );
    }

    if (celular && celular.length > 16) {
      return NextResponse.json(
        { error: 'Celular deve ter no máximo 16 caracteres' },
        { status: 400 }
      );
    }

    if (telefone && telefone.length > 16) {
      return NextResponse.json(
        { error: 'Telefone deve ter no máximo 16 caracteres' },
        { status: 400 }
      );
    }

    if (ramal && ramal.length > 4) {
      return NextResponse.json(
        { error: 'Ramal deve ter no máximo 4 caracteres' },
        { status: 400 }
      );
    }

    if (email && email.length > 120) {
      return NextResponse.json(
        { error: 'E-mail deve ter no máximo 120 caracteres' },
        { status: 400 }
      );
    }

    if (rg && rg.length > 12) {
      return NextResponse.json(
        { error: 'RG deve ter no máximo 12 caracteres' },
        { status: 400 }
      );
    }

    if (cpf && cpf.length > 18) {
      return NextResponse.json(
        { error: 'CPF deve ter no máximo 18 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se já existe vendedor com mesmo CPF ou e-mail
    if (cpf || email) {
      const existingVendedor = await db.tremonte_vendedor.findFirst({
        where: {
          OR: [
            ...(cpf ? [{ cpf: cpf.trim() }] : []),
            ...(email ? [{ email: email.trim() }] : [])
          ]
        }
      });

      if (existingVendedor) {
        return NextResponse.json(
          { error: 'Já existe um vendedor com esse CPF ou e-mail' },
          { status: 409 }
        );
      }
    }

    const vendedor = await db.tremonte_vendedor.create({
      data: {
        apelido: apelido?.trim() || null,
        nome: nome.trim(),
        endereco: endereco?.trim() || null,
        cep: cep?.trim() || null,
        bairro: bairro?.trim() || null,
        cidade: cidade?.trim() || null,
        uf: uf || null,
        celular: celular?.trim() || null,
        telefone: telefone?.trim() || null,
        ramal: ramal?.trim() || null,
        comissao: comissao || null,
        email: email?.trim() || null,
        rg: rg?.trim() || null,
        cpf: cpf?.trim() || null,
        status: status ?? true,
      }
    });

    return NextResponse.json(vendedor, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar vendedor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 