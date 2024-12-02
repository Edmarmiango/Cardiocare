import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../auth/[...nextauth]/auth-options'
import prisma from '../../../../lib/prisma'

export async function GET() {
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
          { error: 'Acesso permitido apenas para pacientes' },
          { status: 403 }
        )
      }
  
      const sharedDoctors = await prisma.sharedHealthData.findMany({
        where: {
          patientId: session.user.id
        },
        include: {
          doctor: {
            select: {
              email: true
            }
          }
        }
      })
  
      const doctorEmails = sharedDoctors.map(share => share.doctor.email)
  
      return NextResponse.json(doctorEmails)
    } catch (error) {
      console.error('Erro ao buscar médicos compartilhados:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    } finally {
      await prisma.$disconnect()
    }
  }
  
  