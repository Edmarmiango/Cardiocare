import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/auth-options'
import prisma from '../../../lib/prisma'

// GET route handler
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const sharedData = await prisma.sharedHealthData.findMany({
      where: {
        doctorId: session.user.id,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const processedData = await Promise.all(
      sharedData.map(async (data) => {
        // Fetch manual health data
        const manualHealthData = await prisma.healthData.findMany({
          where: {
            userId: data.patientId,
          },
          orderBy: {
            date: "asc",
          },
        })

        // Parse Google Fit data
        let googleFitData = []
        if (data.googleFitData) {
          try {
            googleFitData = JSON.parse(data.googleFitData)
          } catch (error) {
            console.error("Error parsing Google Fit data:", error)
          }
        }

        // Combine and sort all health data
        const allHealthData = [...manualHealthData, ...googleFitData].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )

        return {
          id: data.id,
          patientId: data.patientId,
          patientName: data.patient.name,
          healthData: allHealthData,
        }
      }),
    )

    return NextResponse.json(processedData)
  } catch (error) {
    console.error("Error fetching shared health data:", error)
    return NextResponse.json(
      {
        error: "Error fetching shared health data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
// POST route handler
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Apenas pacientes podem compartilhar dados de saúde' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { doctorEmail } = body

    if (!doctorEmail) {
      return NextResponse.json(
        { error: 'Email do médico não fornecido' },
        { status: 400 }
      )
    }

    const doctor = await prisma.user.findUnique({
      where: {
        email: doctorEmail,
        role: 'DOCTOR',
        status: 'APPROVED'
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Médico não encontrado ou não aprovado' },
        { status: 404 }
      )
    }

    const existingShare = await prisma.sharedHealthData.findFirst({
      where: {
        patientId: session.user.id,
        doctorId: doctor.id,
      }
    })

    if (existingShare) {
      return NextResponse.json(
        { message: 'Dados já compartilhados com este médico' },
        { status: 200 }
      )
    }

    await prisma.sharedHealthData.create({
      data: {
        patientId: session.user.id,
        doctorId: doctor.id,
      }
    })

    return NextResponse.json(
      { message: 'Dados de saúde compartilhados com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao compartilhar dados de saúde:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}






