'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { toast } from "../components/ui/use-toast"
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { createReminder } from "../lib/reminderService"

interface Doctor {
  id: string
  name: string
  specialty: string
}

interface TimeSlot {
  id: string
  doctorId: string
  date: string
  startTime: string
  endTime: string
}

interface AppointmentBookingProps {
  onAppointmentCreated?: () => void
}

export function AppointmentBooking({ onAppointmentCreated }: AppointmentBookingProps) {
  const { data: session } = useSession()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<string>('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const formatTimeSlot = (slot: TimeSlot) => {
    const formattedDate = format(new Date(slot.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    return `${formattedDate}, ${slot.startTime} - ${slot.endTime}`
  }

  // Extract unique specialties from doctors array
  const specialties = useMemo(() => {
    const uniqueSpecialties = [...new Set(doctors.map(doctor => doctor.specialty))]
    return uniqueSpecialties.sort()
  }, [doctors])

  // Filter doctors based on selected specialty
  const filteredDoctors = useMemo(() => {
    if (!selectedSpecialty) return doctors
    return doctors.filter(doctor => doctor.specialty === selectedSpecialty)
  }, [doctors, selectedSpecialty])

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    if (selectedDoctor) {
      fetchTimeSlots(selectedDoctor)
    } else {
      setTimeSlots([])
    }
  }, [selectedDoctor])

  // Reset selected doctor when specialty changes
  useEffect(() => {
    setSelectedDoctor('')
    setSelectedSlot('')
  }, [selectedSpecialty])

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors')
      if (!response.ok) {
        throw new Error('Falha ao buscar médicos')
      }
      const data = await response.json()
      setDoctors(data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
      toast({
        title: "Erro",
        description: "Falha ao buscar lista de médicos",
        variant: "destructive",
      })
    }
  }

  const fetchTimeSlots = async (doctorId: string) => {
    try {
      const response = await fetch(`/api/doctor-schedule?doctorId=${doctorId}`)
      if (!response.ok) {
        throw new Error('Falha ao buscar horários disponíveis')
      }
      const data = await response.json()
      setTimeSlots(data)
    } catch (error) {
      console.error('Error fetching time slots:', error)
      toast({
        title: "Erro",
        description: "Falha ao buscar horários disponíveis",
        variant: "destructive",
      })
    }
  }

  const handleBookAppointment = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para agendar uma consulta",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          timeSlotId: selectedSlot,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Falha ao agendar consulta')
      }

      const appointmentData = await response.json()
      
      // Create a reminder for the appointment
      await createReminder({
        userId: session.user.id,
        type: 'appointment',
        title: `Consulta Online com Dr. ${appointmentData.doctor.name}`,
        description: 'Agendamento de videoconferência',
        datetime: new Date(appointmentData.date),
      })

      toast({
        title: "Sucesso",
        description: "Consulta agendada com sucesso. Um lembrete foi definido.",
      })

      // Reset form
      setSelectedDoctor('')
      setSelectedSlot('')
      setSelectedSpecialty('')
      setTimeSlots([])
      
      // Callback
      onAppointmentCreated?.()
    } catch (error) {
      console.error('Error booking appointment:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marque uma consulta</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="specialty">Especialidade</Label>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a especialidade" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="doctor">Médico</Label>
            <Select 
              value={selectedDoctor} 
              onValueChange={setSelectedDoctor}
              disabled={!selectedSpecialty}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um médico" />
              </SelectTrigger>
              <SelectContent>
                {filteredDoctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDoctor && (
            <div>
              <Label htmlFor="timeSlot">Intervalo de tempo (Duração)</Label>
              <Select 
                value={selectedSlot} 
                onValueChange={setSelectedSlot}
                disabled={!selectedDoctor || timeSlots.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o intervalo de tempo" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {formatTimeSlot(slot)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button 
            onClick={handleBookAppointment} 
            disabled={!selectedSlot || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Agendando...
              </>
            ) : (
              'Agendar consulta'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}





