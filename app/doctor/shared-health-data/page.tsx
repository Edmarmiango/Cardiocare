"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { HealthDataChart } from "../../../components/HealthDataChart"
import { toast } from "../../../components/ui/use-toast"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert"

interface HealthData {
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  glucose: number;
  cholesterol: number;
}

interface SharedHealthData {
  patientId: string;
  patientName: string;
  healthData: HealthData[];
}

export default function SharedHealthDataPage() {
  const { data: session, status } = useSession()
  const [sharedData, setSharedData] = useState<SharedHealthData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'DOCTOR') {
      fetchSharedHealthData()
    }
  }, [status, session])

  const fetchSharedHealthData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/shared-health-data')
      
      if (!response.ok) {
        throw new Error('Falha ao buscar dados de saúde compartilhados')
      }
      
      const data = await response.json()
      setSharedData(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar dados de saúde compartilhados'
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <p>Carregando dados...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'DOCTOR') {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription>
            Esta página é restrita para médicos. Por favor, faça login com uma conta de médico.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Dados de Saúde Compartilhados</h1>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && sharedData.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Nenhum dado compartilhado encontrado.
            </p>
          </CardContent>
        </Card>
      ) : (
        sharedData.map((patientData) => (
          <Card key={patientData.patientId} className="shadow-md">
            <CardHeader>
              <CardTitle>Paciente: {patientData.patientName}</CardTitle>
            </CardHeader>
            <CardContent>
              <HealthDataChart data={patientData.healthData} />
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

