"use client"

import { useState } from 'react'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { toast } from "../../components/ui/use-toast"


interface Appointment {
  id: number;
  doctor: string;
  date: string;
  time: string;
}

const doctors = [
  "Dra. Maria Santos",
  "Dr. João Silva",
  "Dra. Ana Oliveira",
  "Dr. Carlos Ferreira"
]

export default function Telemedicine() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 1, doctor: "Dra. Maria Santos", date: "2023-12-01", time: "14:00" },
    { id: 2, doctor: "Dr. João Silva", date: "2023-12-03", time: "10:30" },
  ])

  const [newAppointment, setNewAppointment] = useState({
    doctor: "",
    date: "",
    time: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewAppointment(prev => ({ ...prev, [name]: value }))
  }

  const handleDoctorChange = (value: string) => {
    setNewAppointment(prev => ({ ...prev, doctor: value }))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!newAppointment.doctor || !newAppointment.date || !newAppointment.time) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      })
      return
    }

    const newAppointmentObj = {
      id: appointments.length + 1,
      ...newAppointment
    }
    setAppointments([...appointments, newAppointmentObj])
    setNewAppointment({ doctor: "", date: "", time: "" })
    toast({
      title: "Consulta Agendada",
      description: "Sua nova consulta foi agendada com sucesso.",
    })
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Telemedicina</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Suas Consultas</h2>
          {appointments.map((appointment) => (
            <div key={appointment.id} className="mb-4 p-4 border rounded">
              <p><strong>Médico:</strong> {appointment.doctor}</p>
              <p><strong>Data:</strong> {appointment.date}</p>
              <p><strong>Hora:</strong> {appointment.time}</p>
              <Button className="mt-2">Entrar na Consulta</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agendar Nova Consulta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="doctor">Médico</Label>
              <Select name="doctor" value={newAppointment.doctor} onValueChange={handleDoctorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um médico" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Data</Label>
              <Input 
                id="date" 
                name="date"
                type="date" 
                value={newAppointment.date}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div>
              <Label htmlFor="time">Hora</Label>
              <Input 
                id="time" 
                name="time"
                type="time" 
                value={newAppointment.time}
                onChange={handleInputChange}
                required 
              />
            </div>
            <Button type="submit">Agendar Consulta</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}



