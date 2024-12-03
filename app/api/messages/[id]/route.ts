import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../auth/[...nextauth]/auth-options'
import prisma from '../../../../lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const messageId = params.id

  try {
    const message = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error marking message as read:', error)
    return NextResponse.json({ error: 'Error marking message as read' }, { status: 500 })
  }
}

