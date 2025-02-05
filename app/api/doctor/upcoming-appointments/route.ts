import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../auth/[...nextauth]/auth-options'
import prisma from '../../../../lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: session.user.id,
        date: {
          gte: new Date(),
        },
        status: 'SCHEDULED',
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: 5, // Limit to the next 5 appointments
    })

    return NextResponse.json(upcomingAppointments)
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error)
    return NextResponse.json({ error: 'Error fetching upcoming appointments' }, { status: 500 })
  }
}

