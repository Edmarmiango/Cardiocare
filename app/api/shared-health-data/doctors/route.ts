import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/auth-options"
import prisma from "../../../../lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const sharedData = await prisma.sharedHealthData.findMany({
      where: {
        patientId: session.user.id,
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    const doctors = sharedData.map((data) => ({
      ...data.doctor,
      sharedHealthDataId: data.id,
    }))

    return NextResponse.json(doctors)
  } catch (error) {
    console.error("Erro ao buscar médicos compartilhados:", error)
    return NextResponse.json({ error: "Erro ao buscar médicos compartilhados" }, { status: 500 })
  }
}

