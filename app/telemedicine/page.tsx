'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Textarea } from "../../components/ui/textarea"
import { format, parseISO, addMinutes } from 'date-fns'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { toast } from "../../components/ui/use-toast"
import { fetchAppointments } from "../../services/appointments"
import { AppointmentStatus, Role } from "../types"
import { useSession } from "next-auth/react"
import { GoogleMeetIntegration } from "../../components/GoogleMeetIntegration"
import { DoctorScheduleManager } from '../../components/DoctorScheduleManager'
import { AppointmentBooking } from '../../components/AppointmentBooking'

interface Appointment {
  id: string;
  date: string;
  meetLink: string | null;
  status: AppointmentStatus;
  doctor: {
    name: string;
  };
  user: {
    name: string;
  };
  cancelReason?: string;
}

const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus, cancelReason?: string) => {
  try {
    const response = await fetch('/api/appointments', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ appointmentId, status, cancelReason }),
    })

    if (response.ok) {
      toast({
        title: "Success",
        description: `Appointment ${status.toLowerCase()} successfully`,
      })
      return true
    } else {
      throw new Error('Failed to update appointment status')
    }
  } catch (error) {
    console.error('Error updating appointment status:', error)
    toast({
      title: "Error",
      description: "Failed to update appointment status",
      variant: "destructive",
    })
    return false
  }
}

export default function TelemedicinePage() {
  const { data: session } = useSession()
  const [appointments, setAppointments] = useState<Appointment[]>([])

  const fetchAppointmentsData = useCallback(async () => {
    try {
      const appointmentsData = await fetchAppointments()
      setAppointments(appointmentsData)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      })
    }
  }, [])

  useEffect(() => {
    fetchAppointmentsData()
  }, [fetchAppointmentsData])

  const joinMeeting = (meetLink: string) => {
    window.open(meetLink, '_blank')
  }

  const [cancelReason, setCancelReason] = useState('')

  const handleComplete = useCallback(async (appointmentId: string) => {
    const success = await updateAppointmentStatus(appointmentId, AppointmentStatus.COMPLETED)
    if (success) {
      fetchAppointmentsData()
    }
  }, [fetchAppointmentsData])

  const handleCancel = useCallback(async (appointmentId: string) => {
    const success = await updateAppointmentStatus(appointmentId, AppointmentStatus.CANCELLED, cancelReason)
    if (success) {
      fetchAppointmentsData()
      setCancelReason('')
    }
  }, [fetchAppointmentsData, cancelReason])

  const formatAppointmentDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return format(date, 'PPpp') // e.g. "Apr 29, 2023, 9:30 AM"
    } catch (error) {
      console.error('Error formatting date:', error)
      return dateString
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Telemedicine</h1>

      {session?.user?.role === Role.PATIENT && (
        <div className="mb-8">
          <AppointmentBooking onAppointmentCreated={fetchAppointmentsData} />
        </div>
      )}

      {session?.user?.role === Role.DOCTOR && (
        <div className="mb-8">
          <DoctorScheduleManager />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
      {appointments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <CardTitle>{session?.user?.role === Role.PATIENT ? `Dr. ${appointment.doctor.name}` : appointment.user.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Date:</strong> {format(parseISO(appointment.date), 'PPP')}
                  <br />
                  <strong>Time:</strong> {format(parseISO(appointment.date), 'HH:mm')} - {format(addMinutes(parseISO(appointment.date), 30), 'HH:mm')}
                </p>
                <p><strong>Status:</strong> {appointment.status}</p>
                {appointment.status === AppointmentStatus.SCHEDULED && (
                  <>
                    {appointment.meetLink ? (
                      <Button onClick={() => joinMeeting(appointment.meetLink!)} className="mt-2 mr-2">
                        Join Meeting
                      </Button>
                    ) : (
                      <GoogleMeetIntegration appointmentId={appointment.id} />
                    )}
                    {session?.user?.role === Role.DOCTOR && (
                      <Button onClick={() => handleComplete(appointment.id)} className="mt-2 mr-2">
                        Mark as Completed
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="mt-2">Cancel</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cancel Appointment</DialogTitle>
                        </DialogHeader>
                        <Textarea
                          placeholder="Reason for cancellation"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                        />
                        <Button onClick={() => handleCancel(appointment.id)} variant="destructive">
                          Confirm Cancellation
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
                {appointment.status === AppointmentStatus.CANCELLED && appointment.cancelReason && (
                  <p><strong>Cancellation Reason:</strong> {appointment.cancelReason}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>No appointments found.</p>
      )}
    </div>
  )
}




