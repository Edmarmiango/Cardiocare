import prisma from './prisma'
import { sendEmail } from './emailService'

export async function scheduleAppointmentReminders() {
  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: new Date(),
        lte: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next 24 hours
      },
    },
    include: {
      user: true,
      doctor: true,
    },
  })

  for (const appointment of appointments) {
    const reminderTime = new Date(appointment.date.getTime() - 60 * 60 * 1000) // 1 hour before appointment
    const now = new Date()

    if (reminderTime > now) {
      const delay = reminderTime.getTime() - now.getTime()
      setTimeout(async () => {
        await sendEmail(
          appointment.user.email!,
          'Appointment Reminder',
          `You have an appointment with Dr. ${appointment.doctor.name} in 1 hour.`,
          `<h1>Appointment Reminder</h1>
          <p>You have an appointment with Dr. ${appointment.doctor.name} in 1 hour.</p>
          <p>Join the meeting at: <a href="${appointment.meetLink}">${appointment.meetLink}</a></p>`
        )
      }, delay)
    }
  }
}