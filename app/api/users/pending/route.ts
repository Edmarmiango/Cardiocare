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

    const users = await prisma.user.findMany({
        where: {
          role: 'DOCTOR',
          status: 'PENDING',
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          crm: true,
          profileImage: true,
          specialty: true,
          bi: true,
          dateOfBirth: true,
          gender: true,
          address: true,
        },
      })

      // Format the date of birth to ISO string for consistent serialization
    const formattedUsers = users.map(user => ({
      ...user,
      dateOfBirth: user.dateOfBirth.toISOString(),
    }))

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching pending users:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

