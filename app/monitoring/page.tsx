"use client"

import { useState, useEffect } from 'react'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { toast } from "../../components/ui/use-toast"
import { HealthDataInput } from "../../components/HealthDataInput"
import { HealthDataChart } from "../../components/HealthDataChart"
import { ShareHealthData } from "../../components/ShareHealthData"

interface HealthData {
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  glucose: number;
  cholesterol: number;
}

export default function Monitoring() {
  const [healthData, setHealthData] = useState<HealthData[]>([])

  useEffect(() => {
    fetchHealthData()
  }, [])

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/health-data')
      if (response.ok) {
        const data = await response.json()
        setHealthData(data)
      } else {
        throw new Error('Failed to fetch health data')
      }
    } catch (error) {
      console.error('Error fetching health data:', error)
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

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Monitoramento de Saúde</h1>
      
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
          <HealthDataChart data={healthData} />
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
    </div>
  )
}

