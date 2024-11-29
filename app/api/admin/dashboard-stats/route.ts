import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from "next-auth"
import { authOptions } from '../../auth/[...nextauth]/auth-options'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    // Buscar todas as estatísticas em uma única query para melhor performance
    const stats = await prisma.$transaction(async (tx) => {
      const totalUsers = await tx.user.count({
        where: {
          role: { not: 'ADMIN' }
        }
      })

      const pendingDoctors = await tx.user.count({
        where: {
          role: 'DOCTOR',
          status: 'PENDING'
        }
      })

      const approvedDoctors = await tx.user.count({
        where: {
          role: 'DOCTOR',
          status: 'APPROVED'
        }
      })

      return {
        totalUsers,
        pendingDoctors,
        approvedDoctors
      }
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas do dashboard' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

