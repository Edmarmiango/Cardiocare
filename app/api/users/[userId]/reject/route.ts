import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from "next-auth"
import { authOptions } from '../../../auth/[...nextauth]/auth-options'

const prisma = new PrismaClient()

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const userId = params.userId

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: 'REJECTED' },
    })
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error rejecting user:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

