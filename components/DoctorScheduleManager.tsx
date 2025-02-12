'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useToast } from "../components/ui/use-toast"
import { Badge } from "../components/ui/badge"
import {
  format,
  addDays,
  parseISO,
  addMinutes,
  startOfToday,
  endOfToday,
  startOfTomorrow,
  endOfTomorrow,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns"
import { ptBR } from "date-fns/locale"


interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

type FilterOption = "all" | "today" | "tomorrow" | "thisWeek" | "thisMonth" | "thisYear"

export function DoctorScheduleManager() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const { toast } = useToast()
  const [filterOption, setFilterOption] = useState<FilterOption>("all")
  const [newSlot, setNewSlot] = useState({ date: "", startTime: "", endTime: "" })


  useEffect(() => {
    fetchTimeSlots()
  }, [])

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch("/api/doctor-schedule")
      if (response.ok) {
        const data = await response.json()
        setTimeSlots(data)
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Falha ao carregar horários",
        })
      }
    } catch (error) {
      console.error("Error fetching time slots:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar horários",
      })
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const { date, startTime, endTime } = newSlot

    // Verificar se o horário já existe ou está ocupado
    const conflictingSlot = timeSlots.find((slot) => {
      if (slot.date !== date) return false
      const newStart = new Date(`${date}T${startTime}`)
      const newEnd = new Date(`${date}T${endTime}`)
      const slotStart = new Date(`${slot.date}T${slot.startTime}`)
      const slotEnd = new Date(`${slot.date}T${slot.endTime}`)
      return (
        (newStart >= slotStart && newStart < slotEnd) ||
        (newEnd > slotStart && newEnd <= slotEnd) ||
        (newStart <= slotStart && newEnd >= slotEnd)
      )
    })

    if (conflictingSlot) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Já existe uma disponibilidade neste horário. Por favor, escolha outro intervalo de tempo.",
      })
      return
    }

    try {
      const response = await fetch("/api/doctor-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSlot),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Horário criado com sucesso",
        })
        fetchTimeSlots()
        setNewSlot({
          date: "",
          startTime: "",
          endTime: "",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao criar horário")
      }
    } catch (error) {
      console.error("Erro ao criar horário:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Já existe uma disponibilidade neste horário. Por favor, escolha outro intervalo de tempo.",
      })
    }
  }


  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/doctor-schedule/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Horário removido com sucesso",
        })
        fetchTimeSlots()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao remover horário")
      }
    } catch (error) {
      console.error("Error deleting time slot:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao remover o horário. Por favor, tente novamente.",
      })
    }
  }


  const filteredSlots = useMemo(() => {
    const now = new Date()
    switch (filterOption) {
      case "today":
        return timeSlots.filter((slot) => {
          const slotDate = parseISO(slot.date)
          return slotDate >= startOfToday() && slotDate <= endOfToday()
        })
      case "tomorrow":
        return timeSlots.filter((slot) => {
          const slotDate = parseISO(slot.date)
          return slotDate >= startOfTomorrow() && slotDate <= endOfTomorrow()
        })
      case "thisWeek":
        return timeSlots.filter((slot) => {
          const slotDate = parseISO(slot.date)
          return slotDate >= startOfWeek(now, { locale: ptBR }) && slotDate <= endOfWeek(now, { locale: ptBR })
        })
      case "thisMonth":
        return timeSlots.filter((slot) => {
          const slotDate = parseISO(slot.date)
          return slotDate >= startOfMonth(now) && slotDate <= endOfMonth(now)
        })
      case "thisYear":
        return timeSlots.filter((slot) => {
          const slotDate = parseISO(slot.date)
          return slotDate >= startOfYear(now) && slotDate <= endOfYear(now)
        })
      default:
        return timeSlots
    }
  }, [timeSlots, filterOption])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Horários de Consulta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={newSlot.date}
                onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                min={format(new Date(), 'yyyy-MM-dd')}
                max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                required
              />
            </div>
            <div>
              <Label htmlFor="startTime">Hora de início</Label>
              <Input
                id="startTime"
                type="time"
                value={newSlot.startTime}
                onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">Hora de término</Label>
              <Input
                id="endTime"
                type="time"
                value={newSlot.endTime}
                onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                required
              />
            </div>
          </div>
          <Button type="submit">Adicionar Horário</Button>
        </form>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Horários Disponíveis</h3>
          <div className="w-64">
            <Label htmlFor="filter" className="sr-only">
              Filtrar por período
            </Label>
            <Select value={filterOption} onValueChange={(value: FilterOption) => setFilterOption(value)}>
              <SelectTrigger id="filter">
                <SelectValue placeholder="Selecione um período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="tomorrow">Amanhã</SelectItem>
                <SelectItem value="thisWeek">Esta semana</SelectItem>
                <SelectItem value="thisMonth">Este mês</SelectItem>
                <SelectItem value="thisYear">Este ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredSlots.length > 0 ? (
            <ul className="space-y-2">
              {filteredSlots.map((slot) => (
                <li key={slot.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                  <span>
                    {format(parseISO(slot.date), "dd/MM/yyyy", { locale: ptBR })} - {slot.startTime} às {slot.endTime}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={slot.isBooked ? "secondary" : "outline"}>
                      {slot.isBooked ? "Reservado" : "Disponível"}
                    </Badge>
                    <Button
                      onClick={() => handleDelete(slot.id)}
                      variant="destructive"
                      size="sm"
                      disabled={slot.isBooked}
                    >
                      Remover
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum horário disponível para o período selecionado.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
