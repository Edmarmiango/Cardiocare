'use client'

import { useState, useEffect } from 'react'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { toast } from "../components/ui/use-toast"
import { format, addDays } from 'date-fns'

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export function DoctorScheduleManager() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: ''
  })

  useEffect(() => {
    fetchTimeSlots()
  }, [])

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch('/api/doctor-schedule')
      if (response.ok) {
        const data = await response.json()
        setTimeSlots(data)
      } else {
        throw new Error('Failed to fetch time slots')
      }
    } catch (error) {
      console.error('Error fetching time slots:', error)
      toast({
        title: "Error",
        description: "Failed to fetch time slots",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const response = await fetch('/api/doctor-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSlot),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Time slot created successfully",
        })
        fetchTimeSlots()
        setNewSlot({
          date: '',
          startTime: '',
          endTime: ''
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create time slot')
      }
    } catch (error) {
      console.error('Error creating time slot:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Your Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
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
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={newSlot.startTime}
              onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={newSlot.endTime}
              onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
              required
            />
          </div>
          <Button type="submit">Add Time Slot</Button>
        </form>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Current Time Slots</h3>
          {timeSlots.map((slot) => (
            <div key={slot.id} className="mb-2">
              <p>{format(new Date(slot.date), 'dd/MM/yyyy')}: {slot.startTime} - {slot.endTime} {slot.isBooked ? '(Booked)' : '(Available)'}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

