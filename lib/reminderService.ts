import prisma from './prisma'

interface ReminderInput {
  userId: string
  type: 'appointment' | 'medication'
  title: string
  description: string
  datetime: Date
}

export async function createReminder(reminderData: ReminderInput) {
  try {
    const reminder = await prisma.reminder.create({
      data: reminderData,
    })
    return reminder
  } catch (error) {
    console.error('Error creating reminder:', error)
    throw new Error('Failed to create reminder')
  }
}

export async function getRemindersForUser(userId: string) {
  try {
    const reminders = await prisma.reminder.findMany({
      where: {
        userId: userId,
        datetime: {
          gte: new Date(), // Only fetch future reminders
        },
      },
      orderBy: {
        datetime: 'asc',
      },
    })
    return reminders
  } catch (error) {
    console.error('Error fetching reminders:', error)
    throw new Error('Failed to fetch reminders')
  }
}

