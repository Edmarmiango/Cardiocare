import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/auth-options'
import prisma from '../../../lib/prisma'
import { getRemindersForUser } from "../../../lib/reminderService"
import { createReminderAction } from '../../actions/reminders'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()

    console.log("Received reminder data:", body)

    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 })
    }

    const { userId, type, title, description, datetime } = body

    if (!userId || !type || !title || !datetime) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

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

    console.log("Created reminder:", reminder)

    return NextResponse.json({ success: true, data: reminder })
  } catch (error) {
    console.error("Error creating reminder:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create reminder",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const reminders = await prisma.reminder.findMany({
      where: {
        userId: session.user.id,
        datetime: {
          gte: new Date(),
        },
      },
      orderBy: {
        datetime: "asc",
      },
    })

    return NextResponse.json({ success: true, data: reminders })
  } catch (error) {
    console.error("Error fetching reminders:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reminders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

