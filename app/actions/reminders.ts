"use server"

import prisma from "../../lib/prisma"
import { revalidatePath } from "next/cache"

interface ReminderInput {
  userId: string
  type: "appointment" | "medication" | "exam"
  title: string
  description: string
  datetime: Date | string
  createdBy: string
}

export async function createReminderAction(data: ReminderInput) {
  console.log("Received data in createReminderAction:", data)

  try {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid reminder data: data is null or not an object")
    }

    const { userId, type, title, description, datetime, createdBy } = data

    if (!userId || !type || !title || !datetime || !createdBy) {
      throw new Error(`Missing required fields for reminder creation. Received: ${JSON.stringify(data)}`)
    }

    const parsedDatetime = datetime instanceof Date ? datetime : new Date(datetime)

    if (isNaN(parsedDatetime.getTime())) {
      throw new Error(`Invalid datetime format. Received: ${datetime}`)
    }

    console.log("Creating reminder with data:", {
      userId,
      type,
      title,
      description,
      datetime: parsedDatetime,
      createdBy,
    })

    const reminder = await prisma.reminder.create({
      data: {
        userId,
        type,
        title,
        description: description || "",
        datetime: parsedDatetime,
        createdBy,
      },
    })

    console.log("Reminder created:", reminder)

    revalidatePath("/prescriptions")
    return { success: true, reminder }
  } catch (error) {
    console.error("Error creating reminder:", error instanceof Error ? error.message : "Unknown error")
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create reminder",
    }
  }
}

