import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const topDoctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        status: 'APPROVED'
      },
      select: {
        id: true,
        name: true,
        specialty: true,
        profileImage: true
      },
      take: 3
    })

    return NextResponse.json(topDoctors)
  } catch (error) {
    console.error('Error fetching top doctors:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar médicos em destaque' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}






