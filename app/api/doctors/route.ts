import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/auth-options'
import prisma from '../../../lib/prisma'
import { Role, UserStatus } from '@prisma/client'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const doctors = await prisma.user.findMany({
      where: {
        role: Role.DOCTOR,
        status: UserStatus.APPROVED
      },
      select: {
        id: true,
        name: true,
        specialty: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(doctors)
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json({ error: 'Error fetching doctors' }, { status: 500 })
  }
}

