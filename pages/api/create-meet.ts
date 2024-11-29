import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../app/api/auth/[...nextauth]/auth-options';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { appointmentId } = req.body;

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { user: true, doctor: true },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Consulta não encontrada' });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `Consulta: ${appointment.user.name} com Dr. ${appointment.doctor.name}`,
        description: 'Consulta via CardioCare',
        start: {
          dateTime: appointment.date.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: new Date(appointment.date.getTime() + 30 * 60000).toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        attendees: [
          { email: appointment.user.email },
          { email: appointment.doctor.email },
        ],
        conferenceData: {
          createRequest: {
            requestId: appointmentId,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
      conferenceDataVersion: 1,
    });

    const meetLink = event.data.hangoutLink;

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { meetLink },
    });

    res.status(200).json({ meetLink });
  } catch (error) {
    console.error('Erro ao criar reunião:', error);
    res.status(500).json({ error: 'Erro ao criar reunião' });
  }
}

