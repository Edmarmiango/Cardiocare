'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

interface TimeSlot {
  id: string
  date: Date
  startTime: string
  endTime: string
}

interface TimeSlotSelectProps {
  timeSlots: TimeSlot[]
  selectedTimeSlot: string | null
  onTimeSlotSelect: (timeSlotId: string) => void
}

export function TimeSlotSelect({ 
  timeSlots, 
  selectedTimeSlot, 
  onTimeSlotSelect 
}: TimeSlotSelectProps) {
  const formatTimeSlot = (slot: TimeSlot) => {
    const formattedDate = format(new Date(slot.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    return `${formattedDate}, ${slot.startTime} - ${slot.endTime}`
  }

  return (
    <Select
      value={selectedTimeSlot || undefined}
      onValueChange={onTimeSlotSelect}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecione um horário" />
      </SelectTrigger>
      <SelectContent>
        {timeSlots.map((slot) => (
          <SelectItem key={slot.id} value={slot.id}>
            {formatTimeSlot(slot)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

