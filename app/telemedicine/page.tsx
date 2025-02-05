"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"
import { format, parseISO } from "date-fns"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { toast } from "../../components/ui/use-toast"
import { fetchAppointments } from "../../services/appointments"
import { AppointmentStatus, Role } from "../types"
import { useSession } from "next-auth/react"
import { GoogleMeetIntegration } from "../../components/GoogleMeetIntegration"
import { DoctorScheduleManager } from "../../components/DoctorScheduleManager"
import { AppointmentBooking } from "../../components/AppointmentBooking"
import { ptBR } from "date-fns/locale"

interface Appointment {
  id: string
  date: string
  timeSlot: string
  meetLink: string | null
  status: AppointmentStatus
  doctor: {
    name: string
  }
  user: {
    name: string
  }
  cancelReason?: string
  startTime: string
  endTime: string
}

const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus, cancelReason?: string) => {
  try {
    const response = await fetch("/api/appointments", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
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
      throw new Error("Failed to update appointment status")
    }
  } catch (error) {
    console.error("Error updating appointment status:", error)
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
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL")
  const [cancelReason, setCancelReason] = useState("")

  const fetchAppointmentsData = useCallback(async () => {
    try {
      const appointmentsData = await fetchAppointments()
      setAppointments(appointmentsData)
    } catch (error) {
      console.error("Error fetching appointments:", error)
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
    window.open(meetLink, "_blank")
  }

  const handleComplete = useCallback(
    async (appointmentId: string) => {
      const success = await updateAppointmentStatus(appointmentId, AppointmentStatus.COMPLETED)
      if (success) {
        fetchAppointmentsData()
      }
    },
    [fetchAppointmentsData],
  )

  const handleCancel = useCallback(
    async (appointmentId: string) => {
      const success = await updateAppointmentStatus(appointmentId, AppointmentStatus.CANCELLED, cancelReason)
      if (success) {
        fetchAppointmentsData()
        setCancelReason("")
      }
    },
    [fetchAppointmentsData, cancelReason],
  )

  const translateStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      SCHEDULED: "Agendado",
      COMPLETED: "Concluído",
      CANCELLED: "Cancelado",
      ALL: "Todos",
    }

    return statusMap[status] || status
  }

  const filteredAppointments = appointments.filter((appointment) => {
    if (selectedStatus === "ALL") return true
    return appointment.status === selectedStatus
  })

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Telemedicina</h1>

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

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Seus compromissos</h2>
        <div className="w-[200px]">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="SCHEDULED">Agendado</SelectItem>
              <SelectItem value="COMPLETED">Concluído</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredAppointments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <CardTitle>
                  {session?.user?.role === Role.PATIENT ? `Dr. ${appointment.doctor.name}` : appointment.user.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Data:</strong> {format(parseISO(appointment.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  <br />
                  <strong>Hora:</strong> {appointment.startTime} - {appointment.endTime}
                </p>
                <p>
                  <strong>Status:</strong> {translateStatus(appointment.status)}
                </p>
                {appointment.status === AppointmentStatus.SCHEDULED && (
                  <>
                    {appointment.meetLink ? (
                      <Button onClick={() => joinMeeting(appointment.meetLink!)} className="mt-2 mr-2">
                        Participar da reunião
                      </Button>
                    ) : (
                      <GoogleMeetIntegration appointmentId={appointment.id} />
                    )}
                    {session?.user?.role === Role.DOCTOR && (
                      <Button onClick={() => handleComplete(appointment.id)} className="mt-2 mr-2">
                        Marcar como concluído
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="mt-2">
                          Cancelar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cancelar compromisso</DialogTitle>
                        </DialogHeader>
                        <Textarea
                          placeholder="Motivo do cancelamento"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                        />
                        <Button onClick={() => handleCancel(appointment.id)} variant="destructive">
                          Confirmar cancelamento
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
                {appointment.status === AppointmentStatus.CANCELLED && appointment.cancelReason && (
                  <p>
                    <strong>Motivo do cancelamento:</strong> {appointment.cancelReason}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>Nenhum compromisso encontrado.</p>
      )}
    </div>
  )
}


