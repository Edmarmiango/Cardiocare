import prisma from './prisma'
import { Notification, NotificationType, User } from '@prisma/client'

export async function createNotification(userId: string, message: string, type: NotificationType): Promise<Notification> {
  return prisma.notification.create({
    data: {
      userId,
      message,
      type,
    },
  })
}

export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  return prisma.notification.findMany({
    where: {
      userId,
      read: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  })
}

export async function sendAppointmentReminder(appointment: any): Promise<void> {
  const reminderTime = new Date(appointment.date.getTime() - 24 * 60 * 60 * 1000) // 24 hours before
  if (reminderTime > new Date()) {
    setTimeout(async () => {
      await createNotification(
        appointment.userId,
        `Lembrete: Você tem uma consulta amanhã às ${appointment.date.toLocaleTimeString()}`,
        NotificationType.APPOINTMENT_REMINDER
      )
    }, reminderTime.getTime() - Date.now())
  }
}

export async function sendMedicationReminder(user: User, medication: string, time: string): Promise<void> {
  const [hours, minutes] = time.split(':').map(Number)
  const now = new Date()
  const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes)
  if (reminderTime < now) {
    reminderTime.setDate(reminderTime.getDate() + 1)
  }

  setTimeout(async () => {
    await createNotification(
      user.id,
      `Lembrete: Hora de tomar ${medication}`,
      NotificationType.MEDICATION_REMINDER
    )
    // Agendar o próximo lembrete para o dia seguinte
    sendMedicationReminder(user, medication, time)
  }, reminderTime.getTime() - Date.now())
}

