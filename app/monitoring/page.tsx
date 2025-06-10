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
   return <div className="text-center mt-20 text-lg">Faça login para acessar seus dados de saúde.</div>
  }

  return (
   <div className="container mx-auto p-6 space-y-10 bg-gradient-to-br from-white to-blue-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">Monitoramento de Saúde</h1>
        <p className="text-muted-foreground">Acompanhe sua saúde em tempo real e compartilhe com profissionais.</p>
      </div>

      <Card className="p-4 shadow-md border border-muted rounded-2xl border-primary/40 rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg">Fontes de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <DataSourceSelector
            onGoogleFitAuth={handleGoogleFitAuth}
            isGoogleFitConnected={isGoogleFitConnected}
          />
        </CardContent>
      </Card>

      <Card className="p-4 shadow-md border border-muted rounded-2xl border-primary/40 rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg">Inserir Dados Manualmente</CardTitle>
        </CardHeader>
        <CardContent>
          <HealthDataInput onSubmit={handleNewData} />
        </CardContent>
      </Card>

      <Card className="p-4 shadow-md border border-muted rounded-2xl border-primary/40 rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg">Visualização dos Dados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-sm text-muted-foreground">Carregando dados de saúde...</p>
          ) : healthData.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">Nenhum dado de saúde disponível.</p>
          ) : (
            <HealthDataChart data={healthData} />
          )}
        </CardContent>
      </Card>

      <ShareHealthData />
    </div>
  )
}