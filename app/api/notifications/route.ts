import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/auth-options'
import prisma from '../../../lib/prisma'
import { sendEmail } from '../../../lib/emailService'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { appointmentId } = await request.json()

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        user: true,
        doctor: true,
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Send email notification
    await sendEmail(
      appointment.user.email!,
      'Appointment Reminder',
      `You have an appointment with Dr. ${appointment.doctor.name} on ${appointment.date.toLocaleString()}.`,
      `<h1>Appointment Reminder</h1>
      <p>You have an appointment with Dr. ${appointment.doctor.name} on ${appointment.date.toLocaleString()}.</p>
      <p>Join the meeting at: <a href="${appointment.meetLink}">${appointment.meetLink}</a></p>`
    )

    return NextResponse.json({ message: 'Notification sent successfully' })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json({ error: 'Error sending notification' }, { status: 500 })
  }
}
