import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { StatusLembrete } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const now = new Date();

    const lembretesAtivos = await db.lembrete.findMany({
      where: {
        ativo: true,
      },
    });

    const results = {
      processados: 0,
      disparados: 0,
      reexibidos: 0,
      lembretesEnviados: 0,
    };

    for (const lembrete of lembretesAtivos) {
      results.processados++;

      if (lembrete.status === StatusLembrete.CONFIRMADO) {
        if (lembrete.proximoDisparo <= now) {
          await db.lembrete.update({
            where: { id: lembrete.id },
            data: {
              status: StatusLembrete.DISPARADO,
              dataDisparo: now,
              numeroExibicoes: 1,
              ultimaExibicao: now,
            },
          });

          await db.historicoLembrete.create({
            data: {
              lembreteId: lembrete.id,
              estadoAnterior: StatusLembrete.CONFIRMADO,
              estadoNovo: StatusLembrete.DISPARADO,
              acao: "DISPARO_AUTOMATICO",
              descricao: "Lembrete disparado automaticamente",
            },
          });

          results.disparados++;
        }
      }

      else if (lembrete.status === StatusLembrete.DISPARADO) {
        if (lembrete.ultimaExibicao) {
          const minutosDesdeUltimaExibicao = Math.floor(
            (now.getTime() - lembrete.ultimaExibicao.getTime()) / (1000 * 60)
          );

          if (minutosDesdeUltimaExibicao >= lembrete.intervaloRedisparo) {
            await db.lembrete.update({
              where: { id: lembrete.id },
              data: {
                numeroExibicoes: lembrete.numeroExibicoes + 1,
                ultimaExibicao: now,
              },
            });

            results.reexibidos++;
          }
        }
      }

      else if (lembrete.status === StatusLembrete.AGUARDANDO_CONFIRMACAO) {
        if (lembrete.ultimaExibicaoLembrete) {
          const minutosDesdeUltimoLembrete = Math.floor(
            (now.getTime() - lembrete.ultimaExibicaoLembrete.getTime()) / (1000 * 60)
          );

          if (minutosDesdeUltimoLembrete >= lembrete.intervaloLembreteConfirmacao) {
            await db.lembrete.update({
              where: { id: lembrete.id },
              data: {
                numeroExibicoesLembrete: lembrete.numeroExibicoesLembrete + 1,
                ultimaExibicaoLembrete: now,
              },
            });

            results.lembretesEnviados++;
          }
        } else {
          await db.lembrete.update({
            where: { id: lembrete.id },
            data: {
              numeroExibicoesLembrete: 1,
              ultimaExibicaoLembrete: now,
            },
          });

          results.lembretesEnviados++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error) {
    console.error("Erro no worker de lembretes:", error);
    return NextResponse.json(
      { error: "Erro ao processar lembretes" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const now = new Date();

    const lembretesPendentes = await db.lembrete.findMany({
      where: {
        ativo: true,
        status: StatusLembrete.DISPARADO,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        prioridade: 'desc',
      },
    });

    const lembretesAguardando = await db.lembrete.findMany({
      where: {
        ativo: true,
        status: StatusLembrete.AGUARDANDO_CONFIRMACAO,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        prioridade: 'desc',
      },
    });

    return NextResponse.json({
      timestamp: now.toISOString(),
      disparados: lembretesPendentes,
      aguardandoConfirmacao: lembretesAguardando,
      totalDisparados: lembretesPendentes.length,
      totalAguardando: lembretesAguardando.length,
    });
  } catch (error) {
    console.error("Erro ao buscar lembretes pendentes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar lembretes" },
      { status: 500 }
    );
  }
}
