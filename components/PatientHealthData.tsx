"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "../components/ui/use-toast"

interface PatientHealthDataProps {
  patientId: string
}

export function PatientHealthData({ patientId }: PatientHealthDataProps) {
  const { data: session } = useSession()
  const [healthData, setHealthData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchHealthData = async () => {
      if (session?.user?.role !== "DOCTOR") {
        toast({
          title: "Erro",
          description: "Apenas médicos podem acessar estes dados.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/shared-health-data/${patientId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch health data")
        }
        const data = await response.json()
        setHealthData(data)
      } catch (error) {
        console.error("Error fetching health data:", error)
        toast({
          title: "Erro",
          description: "Falha ao carregar dados de saúde do paciente.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchHealthData()
  }, [patientId, session, toast])

  if (isLoading) {
    return <div>Carregando dados de saúde...</div>
  }

  if (!healthData) {
    return <div>Nenhum dado de saúde disponível.</div>
  }

  // Render the health data here
  return (
    <div>
      <h2>Dados de Saúde do Paciente: {healthData.patient.name}</h2>
      {/* Render the health data in a table or chart */}
    </div>
  )
}

