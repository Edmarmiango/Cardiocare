import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/auth-options'
import prisma from '../../../lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    let chatPartners

    if (session.user.role === 'DOCTOR') {
      // Doctors can see all patients
      chatPartners = await prisma.user.findMany({
        where: {
          role: 'PATIENT',
          status: 'APPROVED',
        },
        select: {
          id: true,
          name: true,
          role: true,
        },
        orderBy: {
          name: 'asc',
        },
      })
    } else {
      // Patients can see all approved doctors
      chatPartners = await prisma.user.findMany({
        where: {
          role: 'DOCTOR',
          status: 'APPROVED',
        },
        select: {
          id: true,
          name: true,
          role: true,
        },
        orderBy: {
          name: 'asc',
        },
      })
    }

    return NextResponse.json(chatPartners)
  } catch (error) {
    console.error('Error fetching chat partners:', error)
    return NextResponse.json({ error: 'Error fetching chat partners' }, { status: 500 })
  }
}

