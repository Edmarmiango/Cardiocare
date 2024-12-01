'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { toast } from "../components/ui/use-toast"
import { format, parseISO } from 'date-fns'

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

interface TimeSlot {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface AppointmentBookingProps {
  onAppointmentCreated: () => void;
}

export function AppointmentBooking({ onAppointmentCreated }: AppointmentBookingProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<string>('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('')

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
      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
      } else {
        throw new Error('Failed to fetch doctors')
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      toast({
        title: "Error",
        description: "Failed to fetch doctors",
        variant: "destructive",
      })
    }
  }

  const fetchTimeSlots = async (doctorId: string) => {
    try {
      const response = await fetch(`/api/doctor-schedule?doctorId=${doctorId}`)
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

  const handleBookAppointment = async () => {
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

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment booked successfully",
        })
        setSelectedDoctor('')
        setSelectedSlot('')
        setSelectedSpecialty('')
        setTimeSlots([])
        onAppointmentCreated()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to book appointment')
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      })
    }
  }

  const formatTimeSlot = (slot: TimeSlot) => {
    const date = parseISO(slot.date)
    const formattedDate = format(date, 'PP')
    return `${formattedDate}, ${slot.startTime} - ${slot.endTime}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book an Appointment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="specialty">Select Specialty</Label>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Select a specialty" />
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
            <Label htmlFor="doctor">Select Doctor</Label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor" />
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
              <Label htmlFor="timeSlot">Select Time Slot</Label>
              <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a time slot" />
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
          {selectedSlot && (
            <Button onClick={handleBookAppointment}>Book Appointment</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}




