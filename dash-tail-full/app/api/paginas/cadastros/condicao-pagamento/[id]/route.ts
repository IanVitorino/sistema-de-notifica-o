import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface RouteParams {
  params: { id: string }
}

// GET: buscar uma condição de pagamento pelo ID
export async function GET(_request: Request, { params }: RouteParams) {
  const id = Number(params.id)
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 })
  }

  try {
    const condicao = await db.condicoes_pagamento.findUnique({
      where: { id },
      include: {
        tremonte_cliente: {
          select: { id: true, fantasia: true, razao_social: true, cnpj: true }
        },
        tremonte_fabricante: {
          select: { id: true, razao_social: true, fantasia: true }
        },
        tremonte_transportadora: {
          select: { id: true, razao: true, fantasia: true }
        }
      }
    })

    if (!condicao) {
      return NextResponse.json(
        { message: 'Condição de pagamento não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(condicao)
  } catch (error) {
    console.error(`GET /api/condicoes/${id}`, error)
    return NextResponse.json(
      { message: 'Erro interno ao buscar condição de pagamento' },
      { status: 500 }
    )
  }
}

// PUT: atualizar uma condição de pagamento existente
export async function PUT(request: Request, { params }: RouteParams) {
  const id = Number(params.id)
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 })
  }

  const data = await request.json()

  try {
    const exists = await db.condicoes_pagamento.findUnique({ where: { id } })
    if (!exists) {
      return NextResponse.json(
        { message: 'Condição de pagamento não encontrada' },
        { status: 404 }
      )
    }

    const updated = await db.condicoes_pagamento.update({
      where: { id },
      data: {
        fk_cliente:                   data.fk_cliente                    ?? exists.fk_cliente,
        fk_fabrica:                   data.fk_fabrica                    ?? exists.fk_fabrica,
        fk_transportadora:            data.fk_transportadora             ?? exists.fk_transportadora,
        cond_1:                       data.cond_1                        ?? exists.cond_1,
        cond_100:                     data.cond_100                      ?? exists.cond_100,
        cond_2:                       data.cond_2                        ?? exists.cond_2,
        cond_3:                       data.cond_3                        ?? exists.cond_3,
        cond_4:                       data.cond_4                        ?? exists.cond_4,
        cond_5:                       data.cond_5                        ?? exists.cond_5,
        descontos_1:                  data.descontos_1                   ?? exists.descontos_1,
        descontos_2:                  data.descontos_2                   ?? exists.descontos_2,
        descontos_3:                  data.descontos_3                   ?? exists.descontos_3,
        descontos_4:                  data.descontos_4                   ?? exists.descontos_4,
        descontos_5:                  data.descontos_5                   ?? exists.descontos_5,
        observacao:                   data.observacao                    ?? exists.observacao,
        codigo_cliente_fabrica:       data.codigo_cliente_fabrica        ?? exists.codigo_cliente_fabrica,
        desconto_ds:                  data.desconto_ds                   ?? exists.desconto_ds,
        lista_preco_ds:               data.lista_preco_ds                ?? exists.lista_preco_ds,
        codigo_transportadora_fabrica:data.codigo_transportadora_fabrica ?? exists.codigo_transportadora_fabrica,
        cod_cond_pagamento:           data.cod_cond_pagamento            ?? exists.cod_cond_pagamento
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(`PUT /api/condicoes/${id}`, error)
    return NextResponse.json(
      { message: 'Erro interno ao atualizar condição de pagamento' },
      { status: 500 }
    )
  }
}

// DELETE: remover uma condição de pagamento
export async function DELETE(_request: Request, { params }: RouteParams) {
  const id = Number(params.id)
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 })
  }

  try {
    const exists = await db.condicoes_pagamento.findUnique({ where: { id } })
    if (!exists) {
      return NextResponse.json(
        { message: 'Condição de pagamento não encontrada' },
        { status: 404 }
      )
    }

    await db.condicoes_pagamento.delete({ where: { id } })
    return NextResponse.json(
      { message: 'Condição de pagamento excluída com sucesso' }
    )
  } catch (error) {
    console.error(`DELETE /api/condicoes/${id}`, error)
    return NextResponse.json(
      { message: 'Erro interno ao excluir condição de pagamento' },
      { status: 500 }
    )
  }
}
