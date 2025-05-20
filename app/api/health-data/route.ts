import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/auth-options";
import prisma from "../../../lib/prisma";

interface HealthDataInput {
  date: string;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  glucose?: number;
  cholesterol?: number;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body: HealthDataInput | null = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
    }

    if (!body.date) {
      return NextResponse.json({ error: "A data é obrigatória" }, { status: 400 });
    }

    const hasHealthData = Object.entries(body)
      .filter(([key]) => key !== "date")
      .some(([, value]) => value !== null && value !== undefined);

    if (!hasHealthData) {
      return NextResponse.json({ error: "Pelo menos um dado de saúde é obrigatório" }, { status: 400 });
    }

    const healthData = await prisma.healthData.create({
      data: {
        userId: session.user.id,
        date: new Date(body.date),
        systolic: body.systolic ?? null,
        diastolic: body.diastolic ?? null,
        heartRate: body.heartRate ?? null,
        glucose: body.glucose ?? null,
        cholesterol: body.cholesterol ?? null,
      },
    });

    const responseData = Object.fromEntries(
      Object.entries(healthData).filter(([, value]) => value !== null)
    );

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error("🔥 Erro ao criar dados de saúde:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let dateFilter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        dateFilter = { date: { gte: start, lte: end } };
      }
    }

    const healthData = await prisma.healthData.findMany({
      where: {
        userId: session.user.id,
        ...dateFilter,
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ success: true, data: healthData });
  } catch (error) {
    console.error("🔥 Erro ao buscar dados de saúde:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
