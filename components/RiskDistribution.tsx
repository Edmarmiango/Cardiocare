"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/chart"

interface RiskDistribution {
  riskLevel: string
  count: number
  percentage: number
}

export function RiskDistribution() {
  const [distribution, setDistribution] = useState<RiskDistribution[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        const response = await fetch('/api/analysis/risk-distribution')
        if (!response.ok) throw new Error('Failed to fetch risk distribution')
        const data = await response.json()
        setDistribution(data)
      } catch (error) {
        console.error('Error fetching risk distribution:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDistribution()
  }, [])

  if (isLoading) {
    return <div>Carregando distribuição de riscos...</div>
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
        <CardTitle>Distribuição de Riscos Cardiovasculares</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ChartContainer
            config={{
              count: {
                label: "Número de Pacientes",
                color: "hsl(200, 100%, 50%)",
              },
              percentage: {
                label: "Porcentagem",
                color: "hsl(130, 100%, 40%)",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="riskLevel" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="var(--color-count)" name="Número de Pacientes" />
                <Bar yAxisId="right" dataKey="percentage" fill="var(--color-percentage)" name="Porcentagem" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

