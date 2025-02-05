import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/auth-options'
import prisma from '../../../lib/prisma'
import { getRemindersForUser } from "../../../lib/reminderService"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  try {
    const reminders = await prisma.reminder.findMany({
      where: {
        userId: userId || session.user.id,
        isCompleted: false,
      },
      orderBy: {
        datetime: 'asc',
      },
    })

    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json({ error: 'Error fetching reminders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { userId, type, title, description, datetime } = body

    const reminder = await prisma.reminder.create({
      data: {
        userId,
        type,
        title,
        description,
        datetime: new Date(datetime),
        createdBy: session.user.id,
      },
    })

    return NextResponse.json(reminder)
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json({ error: 'Error creating reminder' }, { status: 500 })
  }
}

