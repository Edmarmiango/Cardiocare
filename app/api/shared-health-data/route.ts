import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/auth-options'
import prisma from '../../../lib/prisma'

// GET route handler
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Acesso permitido apenas para médicos' }, { status: 403 })
    }

    const sharedData = await prisma.sharedHealthData.findMany({
      where: {
        doctorId: session.user.id
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            healthData: {
              orderBy: { date: 'desc' },
              take: 10, // Limit to last 10 entries for each patient
            }
          }
        }
      }
    })

    const formattedData = sharedData.map(data => ({
      patientId: data.patient.id,
      patientName: data.patient.name,
      healthData: data.patient.healthData.map(health => ({
        date: health.date.toISOString(),
        systolic: health.systolic,
        diastolic: health.diastolic,
        heartRate: health.heartRate,
        glucose: health.glucose,
        cholesterol: health.cholesterol
      }))
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Erro ao buscar dados de saúde compartilhados:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados de saúde compartilhados' },
      { status: 500 }
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

    const { doctorEmail } = await request.json()

    if (!doctorEmail) {
      return NextResponse.json(
        { error: 'Email do médico não fornecido' },
        { status: 400 }
      )
    }

    const doctor = await prisma.user.findUnique({
      where: {
        email: doctorEmail,
        role: 'DOCTOR'
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Médico não encontrado' },
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
        { message: 'Dados já compartilhados com este médico' }
      )
    }

    await prisma.sharedHealthData.create({
      data: {
        patientId: session.user.id,
        doctorId: doctor.id,
      }
    })

    return NextResponse.json(
      { message: 'Dados de saúde compartilhados com sucesso' }
    )
  } catch (error) {
    console.error('Error sharing health data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}






