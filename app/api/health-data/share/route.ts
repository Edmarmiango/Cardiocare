import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../auth/[...nextauth]/auth-options'
import prisma from '../../../../lib/prisma'

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


export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { doctorEmail } = await request.json()

    if (!doctorEmail) {
      return NextResponse.json({ error: "Email do médico é obrigatório" }, { status: 400 })
    }

    // Find the doctor by email
    const doctor = await prisma.user.findUnique({
      where: { email: doctorEmail },
    })

    if (!doctor) {
      return NextResponse.json({ error: "Médico não encontrado" }, { status: 404 })
    }

    // Remove the sharing relationship
    await prisma.sharedHealthData.delete({
      where: {
        userId_doctorId: {
          userId: session.user.id,
          doctorId: doctor.id,
        },
      },
    })

    return NextResponse.json({
      message: "Acesso removido com sucesso",
    })
  } catch (error) {
    console.error("Erro ao remover acesso:", error)
    return NextResponse.json({ error: "Erro ao remover acesso" }, { status: 500 })
  }
}


