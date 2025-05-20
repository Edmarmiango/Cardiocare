import { NextResponse } from 'next/server'
import { Prisma, PrismaClient } from '@prisma/client'
import { getServerSession } from "next-auth"
import { authOptions } from '../../auth/[...nextauth]/auth-options'
Prisma

const prisma = new PrismaClient()

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const userId = params.userId

  try {
    await prisma.user.delete({
      where: { id: userId },
    })
    return NextResponse.json({ message: 'Usuário excluído com sucesso' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}



export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { userId } = params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        profileImage: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}




