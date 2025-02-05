"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/chart"

interface HealthTrend {
  date: string
  averageSystolic: number
  averageDiastolic: number
  averageHeartRate: number
  averageGlucose: number
  averageCholesterol: number
}

export function HealthTrends() {
  const [trends, setTrends] = useState<HealthTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch('/api/analysis/trends')
        if (!response.ok) throw new Error('Failed to fetch trends')
        const data = await response.json()
        setTrends(data)
      } catch (error) {
        console.error('Error fetching trends:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrends()
  }, [])

  if (isLoading) {
    return <div>Carregando tendências...</div>
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <ChartTooltip>
          <ChartTooltipContent>
            <p className="font-bold">{label}</p>
            {payload.map((entry: any, index: number) => (
              <p key={`item-${index}`} style={{ color: entry.color }}>
                {entry.name}: {entry.value}
              </p>
            ))}
          </ChartTooltipContent>
        </ChartTooltip>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendências de Saúde</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ChartContainer
            config={{
              systolic: {
                label: "Pressão Sistólica",
                color: "hsl(0, 100%, 50%)",
              },
              diastolic: {
                label: "Pressão Diastólica",
                color: "hsl(120, 100%, 25%)",
              },
              heartRate: {
                label: "Frequência Cardíaca",
                color: "hsl(240, 100%, 50%)",
              },
              glucose: {
                label: "Glicose",
                color: "hsl(39, 100%, 50%)",
              },
              cholesterol: {
                label: "Colesterol",
                color: "hsl(300, 100%, 25%)",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="averageSystolic" stroke="var(--color-systolic)" name="Pressão Sistólica" />
                <Line type="monotone" dataKey="averageDiastolic" stroke="var(--color-diastolic)" name="Pressão Diastólica" />
                <Line type="monotone" dataKey="averageHeartRate" stroke="var(--color-heartRate)" name="Frequência Cardíaca" />
                <Line type="monotone" dataKey="averageGlucose" stroke="var(--color-glucose)" name="Glicose" />
                <Line type="monotone" dataKey="averageCholesterol" stroke="var(--color-cholesterol)" name="Colesterol" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

