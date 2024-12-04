import cron from 'node-cron'
import prisma from './prisma'
import { sendReminderEmail } from './emailNotifications'

export function startReminderJob() {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('Checking for reminders...')

    const now = new Date()
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000)

    try {
      const upcomingReminders = await prisma.reminder.findMany({
        where: {
          datetime: {
            gte: now,
            lt: thirtyMinutesFromNow,
          },
          isCompleted: false,
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      })

      for (const reminder of upcomingReminders) {
        await sendReminderEmail(reminder.user.email, reminder)
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { isCompleted: true },
        })
      }

      console.log(`Sent ${upcomingReminders.length} reminder(s)`)
    } catch (error) {
      console.error('Error processing reminders:', error)
    }
  })
}




