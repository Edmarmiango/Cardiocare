"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { PatientMetrics } from "../../components/PatientMetrics"
import { HealthTrends } from "../../components/HealthTrends"
import { RiskDistribution } from "../../components/RiskDistribution"

export default function AnalysisPage() {
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    }
    
    if (session?.user?.role !== 'DOCTOR') {
      redirect('/dashboard')
    }
  }, [session, status])

  if (status === 'loading') {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <p>Carregando análises...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Análise de Dados</CardTitle>
          <CardDescription>
            Acesse análises e estatísticas dos seus pacientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="metrics" className="space-y-4">
            <TabsList>
              <TabsTrigger value="metrics">Métricas Gerais</TabsTrigger>
              <TabsTrigger value="trends">Tendências de Saúde</TabsTrigger>
              <TabsTrigger value="risks">Distribuição de Riscos</TabsTrigger>
            </TabsList>
            <TabsContent value="metrics">
              <PatientMetrics />
            </TabsContent>
            <TabsContent value="trends">
              <HealthTrends />
            </TabsContent>
            <TabsContent value="risks">
              <RiskDistribution />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

