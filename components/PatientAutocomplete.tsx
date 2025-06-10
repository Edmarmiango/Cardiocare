"use client"

import { useEffect, useState } from "react"
import { Command, CommandInput, CommandItem, CommandList } from "../components/ui/command"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Skeleton } from "../components/ui/Skeleton"
import { useDebounce } from "../hooks/useDebounce"

interface Patient {
  id: string
  name: string
  profileImage?: string
  bi: string
}

interface PatientAutocompleteProps {
  onSelect: (patient: Patient) => void
  value?: Patient
}

export function PatientAutocomplete({ onSelect, value }: PatientAutocompleteProps) {
  const [input, setInput] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedInput = useDebounce(input, 300)

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/patients?q=${debouncedInput}`)
        if (res.ok) {
          const data = await res.json()
          setPatients(data)
        }
      } catch (err) {
        console.error("Erro ao buscar pacientes", err)
      } finally {
        setLoading(false)
      }
    }

    if (debouncedInput.length > 0) fetchPatients()
    else setPatients([])
  }, [debouncedInput])

  return (
    <Command>
      <CommandInput
        placeholder="Buscar paciente..."
        value={input}
        onValueChange={setInput}
      />
      <CommandList>
        {!loading &&
        patients.map((patient) => (
            <CommandItem
            key={patient.id}
            onSelect={() => {
                onSelect(patient)
                setInput(patient.name)
            }}
            className="list-none"
            >
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                <AvatarImage src={patient.profileImage || ""} />
                <AvatarFallback>{patient.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                <span className="font-medium">{patient.name}</span>
                <span className="text-xs text-muted-foreground">BI: {patient.bi}</span>
                </div>
            </div>
            </CommandItem>
        ))}


      </CommandList>
    </Command>
  )
}
