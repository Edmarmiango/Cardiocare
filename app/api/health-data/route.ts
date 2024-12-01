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
    const healthData = await prisma.healthData.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json(healthData)
  } catch (error) {
    console.error('Error fetching health data:', error)
    return NextResponse.json({ error: 'Error fetching health data' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { date, systolic, diastolic, heartRate, glucose, cholesterol } = body

    const healthData = await prisma.healthData.create({
      data: {
        userId: session.user.id,
        date: new Date(date),
        systolic,
        diastolic,
        heartRate,
        glucose,
        cholesterol
      }
    })

    return NextResponse.json(healthData)
  } catch (error) {
    console.error('Error creating health data:', error)
    return NextResponse.json({ error: 'Error creating health data' }, { status: 500 })
  }
}

