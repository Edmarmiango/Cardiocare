"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { toast } from "../../components/ui/use-toast"
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
  const { data: session } = useSession()
  const [healthData, setHealthData] = useState<HealthData[]>([])
  const [dataSource, setDataSource] = useState<"manual" | "googleFit">("manual")
  const [isGoogleFitConnected, setIsGoogleFitConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHealthData()
    checkGoogleFitConnection()
  }, [])

  const checkGoogleFitConnection = async () => {
    try {
      const response = await fetch("/api/user/google-fit-status")
      const data = await response.json()
      setIsGoogleFitConnected(data.isConnected)
    } catch (error) {
      console.error("Error checking Google Fit connection:", error)
    }
  }

  const fetchHealthData = async () => {
    try {
      const response = await fetch("/api/health-data")
      if (response.ok) {
        const data = await response.json()
        setHealthData(data)
      } else {
        throw new Error("Failed to fetch health data")
      }
    } catch (error) {
      console.error("Error fetching health data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch health data",
        variant: "destructive",
      })
    }
  }

  const handleNewData = (newData: HealthData) => {
    setHealthData([...healthData, newData])
  }

  const handleDataSourceChange = async (source: "manual" | "googleFit") => {
    setDataSource(source)
    setError(null)

    if (source === "googleFit" && isGoogleFitConnected) {
      setIsLoading(true)
      try {
        const endTime = new Date()
        const startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000) // Last 30 days

        const response = await fetch(
          `/api/health-data/google-fit?startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}`,
        )

        if (!response.ok) {
          throw new Error("Failed to fetch Google Fit data")
        }

        const result = await response.json()

        if (result.success && result.data) {
          setHealthData(result.data)
          toast({
            title: "Sucesso",
            description: "Dados do Google Fit importados com sucesso",
          })
        } else {
          throw new Error(result.error || "Falha ao importar dados do Google Fit")
        }
      } catch (error) {
        console.error("Error fetching Google Fit data:", error)
        setError("Falha ao carregar dados do Google Fit. Por favor, tente novamente.")
        toast({
          title: "Erro",
          description: "Falha ao importar dados do Google Fit",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
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
          <DataSourceSelector onSourceChange={handleDataSourceChange} isGoogleFitConnected={isGoogleFitConnected} />
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando dados do Google Fit...</span>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novos Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <HealthDataInput
                onSubmit={handleNewData}
                disabled={dataSource === "googleFit"}
                dataSource={{
                  bloodPressure: dataSource,
                  heartRate: dataSource,
                  glucose: "manual",
                  cholesterol: "manual",
                }}
              />
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
                <p className="text-center text-muted-foreground">
                  Nenhum dado de saúde disponível. Comece adicionando dados manualmente ou conecte sua conta do Google
                  Fit.
                </p>
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

