import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Listar todas as condições de pagamento ou filtrar por cliente
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const clienteId = url.searchParams.get('clienteId')

    const whereClause = clienteId && !Number.isNaN(Number(clienteId))
      ? { fk_cliente: Number(clienteId) }
      : {}

    const condicoesPagamento = await db.condicoes_pagamento.findMany({
      where: whereClause,
      include: {
        tremonte_cliente: {
          select: {
            id: true,
            fantasia: true,
            razao_social: true,
            cnpj: true
          }
        },
        tremonte_fabricante: {
          select: {
            id: true,
            fantasia: true,
            razao_social: true
          }
        },
        tremonte_transportadora: {
          select: {
            id: true,
            razao: true,
            fantasia: true
          }
        }
      }
    })

    const formattedCondicoes = condicoesPagamento.map(condicao => ({
      id: condicao.id,
      fk_cliente: condicao.fk_cliente,
      fk_fabrica: condicao.fk_fabrica,
      fk_transportadora: condicao.fk_transportadora,
      cond_1: condicao.cond_1,
      cond_100: condicao.cond_100,
      cond_2: condicao.cond_2,
      cond_3: condicao.cond_3,
      cond_4: condicao.cond_4,
      cond_5: condicao.cond_5,
      descontos_1: condicao.descontos_1,
      descontos_2: condicao.descontos_2,
      descontos_3: condicao.descontos_3,
      descontos_4: condicao.descontos_4,
      descontos_5: condicao.descontos_5,
      observacao: condicao.observacao,
      codigo_cliente_fabrica: condicao.codigo_cliente_fabrica,
      desconto_ds: condicao.desconto_ds,
      lista_preco_ds: condicao.lista_preco_ds,
      codigo_transportadora_fabrica: condicao.codigo_transportadora_fabrica,
      cod_cond_pagamento: condicao.cod_cond_pagamento,

      cliente: condicao.tremonte_cliente && {
        id: condicao.tremonte_cliente.id,
        fantasia: condicao.tremonte_cliente.fantasia,
        razao_social: condicao.tremonte_cliente.razao_social,
        cnpj: condicao.tremonte_cliente.cnpj
      },

      fabricante: condicao.tremonte_fabricante && {
        id: condicao.tremonte_fabricante.id,
        nome:
          condicao.tremonte_fabricante.fantasia
          ?? condicao.tremonte_fabricante.razao_social
      },

      transportadora: condicao.tremonte_transportadora && {
        id: condicao.tremonte_transportadora.id,
        nome: condicao.tremonte_transportadora.fantasia
        ?? condicao.tremonte_transportadora.razao
      }
    }))

    return NextResponse.json(formattedCondicoes)
  } catch (error) {
    console.error('Erro ao buscar condições de pagamento:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar condições de pagamento' },
      { status: 500 }
    )
  }
}

// POST: Criar uma nova condição de pagamento
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.fk_cliente) {
      return NextResponse.json(
        { message: 'Cliente é obrigatório' },
        { status: 400 }
      )
    }

    const novaCondicao = await db.condicoes_pagamento.create({
      data: {
        fk_cliente:                    data.fk_cliente,
        fk_fabrica:                    data.fk_fabrica ?? null,
        fk_transportadora:             data.fk_transportadora ?? null,
        cond_1:                        data.cond_1 ?? null,
        cond_100:                      data.cond_100 ?? null,
        cond_2:                        data.cond_2 ?? null,
        cond_3:                        data.cond_3 ?? null,
        cond_4:                        data.cond_4 ?? null,
        cond_5:                        data.cond_5 ?? null,
        descontos_1:                   data.descontos_1 ?? null,
        descontos_2:                   data.descontos_2 ?? null,
        descontos_3:                   data.descontos_3 ?? null,
        descontos_4:                   data.descontos_4 ?? null,
        descontos_5:                   data.descontos_5 ?? null,
        observacao:                    data.observacao ?? null,
        codigo_cliente_fabrica:        data.codigo_cliente_fabrica ?? null,
        desconto_ds:                   data.desconto_ds ?? null,
        lista_preco_ds:                data.lista_preco_ds ?? null,
        codigo_transportadora_fabrica: data.codigo_transportadora_fabrica ?? null,
        cod_cond_pagamento:            data.cod_cond_pagamento ?? null
      }
    })

    return NextResponse.json(novaCondicao, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar condição de pagamento:', error)
    return NextResponse.json(
      { message: 'Erro ao criar condição de pagamento' },
      { status: 500 }
    )
  }
}
