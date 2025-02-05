'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"
import { toast } from "../components/ui/use-toast"

interface Patient {
  id: string
  name: string
}

export function ReminderManager() {
  const { data: session } = useSession()
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [reminderType, setReminderType] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [datetime, setDatetime] = useState('')

  useEffect(() => {
    const fetchPatients = async () => {
      const response = await fetch('/api/patients')
      if (response.ok) {
        const data = await response.json()
        setPatients(data)
      }
    }

    if (session?.user?.role === 'DOCTOR') {
      fetchPatients()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedPatient,
          type: reminderType,
          title,
          description,
          datetime,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Reminder created successfully",
        })
        // Reset form
        setSelectedPatient('')
        setReminderType('')
        setTitle('')
        setDescription('')
        setDatetime('')
      } else {
        throw new Error('Failed to create reminder')
      }
    } catch (error) {
      console.error('Error creating reminder:', error)
      toast({
        title: "Error",
        description: "Failed to create reminder",
        variant: "destructive",
      })
    }
  }

  if (session?.user?.role !== 'DOCTOR') {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar lembrete</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patient">Paciente</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="type">Tipo de lembrete</Label>
            <Select value={reminderType} onValueChange={setReminderType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de lembrete" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medication">Medicamento</SelectItem>
                <SelectItem value="appointment">Consulta Online</SelectItem>
                <SelectItem value="exam">Exame</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="datetime">Data e hora</Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Criar Lembrete</Button>
        </form>
      </CardContent>
    </Card>
  )
}

