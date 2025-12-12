import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatusLembrete } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const lembrete = await db.lembrete.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!lembrete) {
      return NextResponse.json(
        { error: "Lembrete não encontrado" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { action } = body;

    let updatedLembrete;
    let historicoData: any = {
      lembreteId: lembrete.id,
      estadoAnterior: lembrete.status,
      acao: action.toUpperCase(),
    };

    switch (action) {
      case "confirmar":
        if (lembrete.status !== StatusLembrete.AGUARDANDO_CONFIRMACAO) {
          return NextResponse.json(
            { error: "Ação não permitida no estado atual" },
            { status: 400 }
          );
        }

        const proximoDisparo = new Date();
        proximoDisparo.setMinutes(
          proximoDisparo.getMinutes() + lembrete.intervaloInicial
        );

        updatedLembrete = await db.lembrete.update({
          where: { id: lembrete.id },
          data: {
            status: StatusLembrete.CONFIRMADO,
            dataUltimaConfirmacao: new Date(),
            proximoDisparo: proximoDisparo,
            numeroExibicoesLembrete: 0,
            ultimaExibicaoLembrete: null,
          },
        });

        historicoData.estadoNovo = StatusLembrete.CONFIRMADO;
        historicoData.descricao = "Lembrete confirmado pelo usuário";
        break;

      case "marcar_visto":
        if (lembrete.status !== StatusLembrete.DISPARADO) {
          return NextResponse.json(
            { error: "Ação não permitida no estado atual" },
            { status: 400 }
          );
        }

        updatedLembrete = await db.lembrete.update({
          where: { id: lembrete.id },
          data: {
            status: StatusLembrete.AGUARDANDO_CONFIRMACAO,
            dataVisto: new Date(),
            numeroExibicoes: 0,
            ultimaExibicao: null,
          },
        });

        historicoData.estadoNovo = StatusLembrete.AGUARDANDO_CONFIRMACAO;
        historicoData.descricao = "Lembrete marcado como visto";
        break;

      case "ativar":
        if (lembrete.ativo) {
          return NextResponse.json(
            { error: "Lembrete já está ativo" },
            { status: 400 }
          );
        }

        updatedLembrete = await db.lembrete.update({
          where: { id: lembrete.id },
          data: {
            ativo: true,
          },
        });

        historicoData.estadoNovo = lembrete.status;
        historicoData.descricao = "Lembrete ativado";
        break;

      case "desativar":
        if (!lembrete.ativo) {
          return NextResponse.json(
            { error: "Lembrete já está inativo" },
            { status: 400 }
          );
        }

        updatedLembrete = await db.lembrete.update({
          where: { id: lembrete.id },
          data: {
            ativo: false,
          },
        });

        historicoData.estadoNovo = lembrete.status;
        historicoData.descricao = "Lembrete desativado";
        break;

      default:
        return NextResponse.json(
          { error: "Ação não reconhecida" },
          { status: 400 }
        );
    }

    await db.historicoLembrete.create({
      data: historicoData,
    });

    return NextResponse.json(updatedLembrete);
  } catch (error) {
    console.error("Erro ao executar ação:", error);
    return NextResponse.json(
      { error: "Erro ao executar ação" },
      { status: 500 }
    );
  }
}
