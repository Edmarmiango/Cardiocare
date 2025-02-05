import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../app/api/auth/[...nextauth]/auth-options';
import prisma from '../../lib/prisma';
import { createGoogleMeetLink } from "../../lib/googleMeet"
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ error: 'Appointment ID is required' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { user: true, doctor: true },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

     // Format date in Portuguese
    const formattedDate = format(appointment.date, 'dd/MM/yyyy', { locale: ptBR });

    const meetLink = await createGoogleMeetLink(
      appointmentId,
      appointment.doctor.name,
      appointment.user.name,
      formattedDate,
      appointment.startTime,
      appointment.endTime
    );

    if (!meetLink) {
      return res.status(500).json({ error: 'Failed to create Google Meet link' });
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { meetLink },
    });

    return res.status(200).json({ meetLink });
  } catch (error) {
    console.error('Error in create-meet API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}



