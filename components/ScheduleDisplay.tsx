"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"

interface TimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  isBooked: boolean
}

interface GroupedTimeSlots {
  [key: string]: TimeSlot[]
}

export function ScheduleDisplay() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

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
        console.error("Failed to fetch time slots")
      }
    } catch (error) {
      console.error("Error fetching time slots:", error)
    }
  }

  const groupedTimeSlots: GroupedTimeSlots = timeSlots.reduce((acc, slot) => {
    const date = slot.date.split("T")[0]
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(slot)
    return acc
  }, {} as GroupedTimeSlots)

  return (
    <div className="space-y-6">
      {Object.entries(groupedTimeSlots).map(([date, slots]) => (
        <Card key={date} className="overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle>{format(parseISO(date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-200">
              {slots
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((slot) => (
                  <li
                    key={slot.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <Badge variant={slot.isBooked ? "secondary" : "outline"}>
                      {slot.isBooked ? "Reservado" : "Disponível"}
                    </Badge>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

