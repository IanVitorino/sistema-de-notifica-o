import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PrioridadeLembrete, StatusLembrete } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      titulo,
      descricao,
      prioridade,
      intervaloInicial,
      intervaloRecorrencia,
      intervaloRedisparo,
      intervaloLembreteConfirmacao,
      proximoDisparo,
    } = body;

    if (
      !titulo ||
      !prioridade ||
      !intervaloInicial ||
      !intervaloRecorrencia ||
      !intervaloRedisparo ||
      !intervaloLembreteConfirmacao ||
      !proximoDisparo
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const lembrete = await db.lembrete.create({
      data: {
        titulo,
        descricao: descricao || null,
        prioridade: prioridade as PrioridadeLembrete,
        intervaloInicial,
        intervaloRecorrencia,
        intervaloRedisparo,
        intervaloLembreteConfirmacao,
        proximoDisparo: new Date(proximoDisparo),
        status: StatusLembrete.CONFIRMADO,
        userId: session.user.id,
      },
    });

    await db.historicoLembrete.create({
      data: {
        lembreteId: lembrete.id,
        estadoAnterior: null,
        estadoNovo: StatusLembrete.CONFIRMADO,
        acao: "CRIACAO",
        descricao: "Lembrete criado",
      },
    });

    return NextResponse.json(lembrete, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar lembrete:", error);
    return NextResponse.json(
      { error: "Erro ao criar lembrete" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const lembretes = await db.lembrete.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        proximoDisparo: "asc",
      },
    });

    return NextResponse.json(lembretes);
  } catch (error) {
    console.error("Erro ao buscar lembretes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar lembretes" },
      { status: 500 }
    );
  }
}
