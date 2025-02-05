"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { toast } from "../components/ui/use-toast"

interface Appointment {
  id: string
  date: string
  user: {
    name: string
  }
}

export function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/doctor/appointments')
        if (!response.ok) {
          throw new Error('Failed to fetch appointments')
        }
        const data = await response.json()
        setAppointments(data)
      } catch (error) {
        console.error('Error fetching appointments:', error)
        toast({
          title: "Error",
          description: "Failed to load appointments",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximas Consultas</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando consultas...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas Consultas</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p>Não há consultas agendadas.</p>
        ) : (
          <ul className="space-y-4">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{appointment.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(appointment.date), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </li>
            ))}
          </ul>
        )}
        <Button asChild className="w-full mt-4">
          <Link href="/telemedicine">Ver todas as consultas</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

