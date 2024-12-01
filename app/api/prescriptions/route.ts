import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/auth-options'
import prisma from '../../../lib/prisma'
import { Role } from '@prisma/client'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    let prescriptions;
    if (session.user.role === Role.DOCTOR) {
      prescriptions = await prisma.prescription.findMany({
        where: {
          doctorId: session.user.id
        },
        include: {
          user: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      prescriptions = await prisma.prescription.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          doctor: {
            select: {
              name: true,
              specialty: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    return NextResponse.json(prescriptions)
  } catch (error) {
    console.error('Error fetching prescriptions:', error)
    return NextResponse.json({ error: 'Error fetching prescriptions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== Role.DOCTOR) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { patientId, medication, dosage, frequency, instructions, startDate, endDate } = body

    if (!patientId || !medication || !dosage || !frequency || !instructions || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const prescription = await prisma.prescription.create({
      data: {
        medication,
        dosage,
        frequency,
        instructions,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        userId: patientId,
        doctorId: session.user.id
      }
    })

    return NextResponse.json(prescription)
  } catch (error) {
    console.error('Error creating prescription:', error)
    return NextResponse.json({ error: 'Error creating prescription', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}



