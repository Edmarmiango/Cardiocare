"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { useToast } from "../../components/ui/use-toast"
import { HealthDataInput } from "../../components/HealthDataInput"
import { HealthDataChart } from "../../components/HealthDataChart"
import { ShareHealthData } from "../../components/ShareHealthData"
import { DataSourceSelector } from "../../components/DataSourceSelector"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Loader2 } from "lucide-react"

interface HealthData {
  date: string
  systolic: number
  diastolic: number
  heartRate: number
  glucose: number
  cholesterol: number
}

export default function Monitoring() {
  const { data: session, status } = useSession()
  const [healthData, setHealthData] = useState<HealthData[]>([])
  const [isGoogleFitConnected, setIsGoogleFitConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (status === "authenticated") {
      fetchHealthData()
      checkGoogleFitConnection()
    }
  }, [status])

  const checkGoogleFitConnection = async () => {
    try {
      const response = await fetch("/api/user/google-fit-status")
      const data = await response.json()
      setIsGoogleFitConnected(data.isConnected)
    } catch (error) {
      console.error("Error checking Google Fit connection:", error)
      toast({
        title: "Error",
        description: "Failed to check Google Fit connection status",
        variant: "destructive",
      })
    }
  }

  const fetchHealthData = async () => {
    setIsLoading(true)
    try {
      // Fetch manual data
      const manualResponse = await fetch("/api/health-data")
      if (!manualResponse.ok) {
        throw new Error("Failed to fetch manual health data")
      }
      const manualData = await manualResponse.json()

      // Initialize combined data with manual data
      let combinedData = manualData.data || []

      // Fetch Google Fit data if connected
      if (isGoogleFitConnected) {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 30) // Fetch last 30 days of data

        const googleFitResponse = await fetch(
          `/api/health-data/google-fit?startTime=${startDate.toISOString()}&endTime=${endDate.toISOString()}`,
        )
        if (googleFitResponse.ok) {
          const googleFitResult = await googleFitResponse.json()
          if (googleFitResult.success && Array.isArray(googleFitResult.data)) {
            combinedData = [...combinedData, ...googleFitResult.data]
          } else {
            console.warn("Unexpected Google Fit data format:", googleFitResult)
          }
        } else {
          throw new Error("Failed to fetch Google Fit data")
        }
      }

      // Sort combined data by date
      combinedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setHealthData(combinedData)
    } catch (error) {
      console.error("Error fetching health data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch health data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewData = (newData: Partial<HealthData>) => {
    setHealthData((prevData) => {
      const existingDataIndex = prevData.findIndex((data) => data.date === newData.date)
      if (existingDataIndex !== -1) {
        // Update existing data
        const updatedData = [...prevData]
        updatedData[existingDataIndex] = { ...updatedData[existingDataIndex], ...newData } as HealthData
        return updatedData
      } else {
        // Add new data
        return [...prevData, newData as HealthData].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )
      }
    })
  }

  const handleGoogleFitAuth = async () => {
    try {
      window.location.href = "/api/auth/google-fit"
    } catch (error) {
      console.error("Error initiating Google Fit auth:", error)
      toast({
        title: "Error",
        description: "Failed to connect to Google Fit",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Monitoramento de Saúde</h1>

      <Card>
        <CardHeader>
          <CardTitle>Fonte de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <DataSourceSelector
            onSourceChange={fetchHealthData}
            onGoogleFitAuth={handleGoogleFitAuth}
            isGoogleFitConnected={isGoogleFitConnected}
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando dados...</span>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novos Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <HealthDataInput onSubmit={handleNewData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seus Dados de Saúde</CardTitle>
            </CardHeader>
            <CardContent>
              {healthData.length > 0 ? (
                <HealthDataChart data={healthData} />
              ) : (
                <Alert>
                  <AlertTitle>Nenhum dado disponível</AlertTitle>
                  <AlertDescription>
                    Nenhum dado de saúde disponível. Comece adicionando dados manualmente ou conecte sua conta do Google
                    Fit.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compartilhar Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <ShareHealthData />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

