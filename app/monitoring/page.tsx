"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { useToast } from "../../components/ui/use-toast"
import { HealthDataInput } from "../../components/HealthDataInput"
import { HealthDataChart } from "../../components/HealthDataChart"
import { ShareHealthData } from "../../components/ShareHealthData"
import { DataSourceSelector } from "../../components/DataSourceSelector"

interface HealthData {
  date: string
  systolic?: number
  diastolic?: number
  heartRate?: number
  glucose?: number
  cholesterol?: number
  source?: string
}

export default function Monitoring() {
  const { data: session } = useSession()
  const [healthData, setHealthData] = useState<HealthData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleFitConnected, setIsGoogleFitConnected] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (session) {
      checkGoogleFitStatus()
    }
  }, [session])

  useEffect(() => {
    if (isGoogleFitConnected) {
      fetchHealthData()
    }
  }, [isGoogleFitConnected])

  const checkGoogleFitStatus = async () => {
    try {
      const response = await fetch("/api/user/google-fit-status")
      if (response.ok) {
        const data = await response.json()
        setIsGoogleFitConnected(data.isConnected)
      }
    } catch (error) {
      console.error("Erro ao verificar status do Google Fit:", error)
    }
  }

  const fetchHealthData = async () => {
    setIsLoading(true)
    try {
      let allHealthData: HealthData[] = []

      // Buscar dados manuais
      const manualResponse = await fetch("/api/health-data")
      if (!manualResponse.ok) {
        throw new Error("Falha ao buscar dados de saúde manuais")
      }
      const manualDataResult = await manualResponse.json()
      allHealthData = manualDataResult.data.map((item: HealthData) => ({ ...item, source: "manual" })) || []

      // Buscar dados do Google Fit se estiver conectado
      if (isGoogleFitConnected) {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 30) // Buscar os últimos 30 dias de dados

        const googleFitResponse = await fetch(
          `/api/health-data/google-fit?startTime=${startDate.toISOString()}&endTime=${endDate.toISOString()}`,
        )
        if (googleFitResponse.ok) {
          const googleFitResult = await googleFitResponse.json()
          if (googleFitResult.success && Array.isArray(googleFitResult.data)) {
            const googleFitData = googleFitResult.data.map((item: HealthData) => ({ ...item, source: "googleFit" }))
            allHealthData = [...allHealthData, ...googleFitData]
          } else {
            console.warn("Formato de dados do Google Fit inesperado:", googleFitResult)
          }
        } else {
          throw new Error("Falha ao buscar dados do Google Fit")
        }
      }

      // Ordenar dados combinados por data
      allHealthData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setHealthData(allHealthData)
    } catch (error) {
      console.error("Erro ao buscar dados de saúde:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar dados de saúde. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleFitAuth = () => {
    setIsGoogleFitConnected(true)
  }

  const handleNewData = (newData: Partial<HealthData>) => {
    setHealthData((prevData) => [...prevData, newData])
    fetchHealthData() // Atualiza os dados após adicionar novos dados manualmente
  }

  if (!session) {
    return <div>Please sign in to view your health monitoring data.</div>
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-4">Monitoramento de Saúde</h1>

      <DataSourceSelector onGoogleFitAuth={handleGoogleFitAuth} isGoogleFitConnected={isGoogleFitConnected} />

      <HealthDataInput onSubmit={handleNewData} />

      {isLoading ? (
        <div>Carregando dados de saúde...</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Seus Dados de Saúde</CardTitle>
          </CardHeader>
          <CardContent>
            <HealthDataChart data={healthData} />
          </CardContent>
        </Card>
      )}

      <ShareHealthData />
    </div>
  )
}


