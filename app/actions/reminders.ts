'use server'

import prisma from '../../lib/prisma'
import { revalidatePath } from 'next/cache'

interface ReminderInput {
  userId: string
  type: 'appointment' | 'medication'
  title: string
  description: string
  datetime: Date
}

export async function createReminderAction(data: ReminderInput) {
  try {
    const reminder = await prisma.reminder.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        description: data.description,
        datetime: data.datetime,
      },
    })
    
    revalidatePath('/prescriptions')
    return { success: true, reminder }
  } catch (error) {
    console.error('Error creating reminder:', error)
    return { success: false, error: 'Failed to create reminder' }
  }
}

