import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/auth-options'
import prisma from '../../../lib/prisma'
import { Role } from '@prisma/client'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(request.url)
  const doctorId = searchParams.get('doctorId')

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    if (doctorId) {

        
      // Fetch time slots for a specific doctor (for patients)
      const timeSlots = await prisma.timeSlot.findMany({
        where: {
          doctorId: doctorId,
          isBooked: false,
          date: {
            gte: new Date(),
          },
        },
        orderBy: {
          date: 'asc',
        },
      })
      return NextResponse.json(timeSlots)
    } else if (session.user.role === Role.DOCTOR) {
      // Fetch time slots for the logged-in doctor
      const timeSlots = await prisma.timeSlot.findMany({
    
        where: {
          doctorId: session.user.id,
          date: {
            gte: new Date(),
          },
        },
        orderBy: {
          date: 'asc',
        },
      })
      return NextResponse.json(timeSlots)
    } else {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
  } catch (error) {
    console.error('Error fetching time slots:', error)
    return NextResponse.json({ error: 'Error fetching time slots' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== Role.DOCTOR) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { date, startTime, endTime } = body

    if (!date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verificar se já existe um horário conflitante
    const conflictingSlot = await prisma.timeSlot.findFirst({
      where: {
        doctorId: session.user.id,
        date: new Date(date),
        OR: [
          {
            AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
          },
          {
            AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
          },
          {
            AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
          },
        ],
      },
    })

    if (conflictingSlot) {
      return NextResponse.json({ error: "Já existe uma disponibilidade neste intervalo de tempo." }, { status: 400 })
    }

    const timeSlot = await prisma.timeSlot.create({
      data: {
        doctorId: session.user.id,
        date: new Date(date),
        startTime,
        endTime,
      },
    })

    return NextResponse.json(timeSlot)
  } catch (error) {
    console.error('Error creating time slot:', error)
    return NextResponse.json({ 
      error: 'Error creating time slot',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

