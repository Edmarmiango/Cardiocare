import { Appointment } from "@prisma/client"

export async function fetchAppointments(): Promise<Appointment[]> {
  const response = await fetch('/api/appointments')
  if (!response.ok) {
    throw new Error('Failed to fetch appointments')
  }
  return response.json()
}



