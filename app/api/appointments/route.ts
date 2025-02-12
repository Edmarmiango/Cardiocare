import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/auth-options'
import prisma from '../../../lib/prisma'
import { Role } from '@prisma/client'
import { createGoogleMeetLink } from '../../../lib/googleMeet'
import { format } from 'date-fns'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    let appointments;
    if (session.user.role === Role.DOCTOR) {
      appointments = await prisma.appointment.findMany({
        where: {
          doctorId: session.user.id,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          doctor: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      })
    } else {
      appointments = await prisma.appointment.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          doctor: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      })
    }

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { doctorId, timeSlotId } = body

    // Verify the time slot exists and is available
    const timeSlot = await prisma.timeSlot.findUnique({
      where: {
        id: timeSlotId,
        isBooked: false,
      },
      include: {
        doctor: true,
      },
    })

    if (!timeSlot) {
      return NextResponse.json(
        { error: 'Time slot not available' },
        { status: 400 }
      )
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('Creating appointment with data:', {
      userId: session.user.id,
      doctorId,
      date: timeSlot.date,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime
    });

    try {
      // Format the date as 'dd/MM/yyyy' for createGoogleMeetLink
      const formattedDate = format(timeSlot.date, 'dd/MM/yyyy');

      // Create Google Meet link
      const meetLink = await createGoogleMeetLink(
        `temp_${Date.now()}`, // Temporary ID until we have the actual appointment
        timeSlot.doctor.name,
        user.name || 'Patient',
        formattedDate,
        timeSlot.startTime,
        timeSlot.endTime
      )

      // Create the appointment with the meet link
      const [appointment] = await prisma.$transaction([
        prisma.appointment.create({
          data: {
            userId: session.user.id,
            doctorId,
            date: timeSlot.date,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            status: 'SCHEDULED',
            meetLink,
          },
        }),
        prisma.timeSlot.update({
          where: { id: timeSlotId },
          data: { isBooked: true },
        }),
      ])

      console.log('Successfully created appointment:', appointment);
      return NextResponse.json(appointment)
    } catch (error) {
      console.error('Error in appointment creation:', error)
      return NextResponse.json(
        { error: 'Failed to create Google Meet link' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in appointment route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { appointmentId, status, cancelReason } = body
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    })
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }
    // Verify user has permission to update this appointment
    if (
      session.user.role === Role.PATIENT && appointment.userId !== session.user.id ||
      session.user.role === Role.DOCTOR && appointment.doctorId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status,
        cancelReason: status === 'CANCELLED' ? cancelReason : null,
      },
    })
    return NextResponse.json(updatedAppointment)
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}
