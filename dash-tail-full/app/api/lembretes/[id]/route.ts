import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
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

    await db.lembrete.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir lembrete:", error);
    return NextResponse.json(
      { error: "Erro ao excluir lembrete" },
      { status: 500 }
    );
  }
}

export async function GET(
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
      include: {
        historico: {
          orderBy: {
            dataHora: 'desc'
          },
        }
      }
    });

    if (!lembrete) {
      return NextResponse.json(
        { error: "Lembrete não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(lembrete);
  } catch (error) {
    console.error("Erro ao buscar lembrete:", error);
    return NextResponse.json(
      { error: "Erro ao buscar lembrete" },
      { status: 500 }
    );
  }
}
