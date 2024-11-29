"use client"

import { useState } from 'react'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function Monitoring() {
  const [bloodPressure, setBloodPressure] = useState<string>("")
  const [heartRate, setHeartRate] = useState<string>("")

  const [data, setData] = useState<Array<{
    date: string;
    bloodPressure: number;
    heartRate: number;
  }>>([
    { date: '2023-11-01', bloodPressure: 120, heartRate: 72 },
    { date: '2023-11-02', bloodPressure: 118, heartRate: 70 },
    { date: '2023-11-03', bloodPressure: 122, heartRate: 74 },
  ])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const newData = {
      date: new Date().toISOString().split('T')[0],
      bloodPressure: parseInt(bloodPressure),
      heartRate: parseInt(heartRate)
    }
    setData([...data, newData])
    setBloodPressure("")
    setHeartRate("")
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Monitoramento de Saúde</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Seus Dados de Saúde</h2>
            <LineChart width={600} height={300} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="bloodPressure" stroke="#8884d8" name="Pressão Arterial" />
              <Line yAxisId="right" type="monotone" dataKey="heartRate" stroke="#82ca9d" name="Frequência Cardíaca" />
            </LineChart>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="bloodPressure">Pressão Arterial (sistólica)</Label>
              <Input 
                id="bloodPressure" 
                type="number" 
                value={bloodPressure}
                onChange={(e) => setBloodPressure(e.target.value)}
                required 
              />
            </div>
            <div>
              <Label htmlFor="heartRate">Frequência Cardíaca</Label>
              <Input 
                id="heartRate" 
                type="number" 
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                required 
              />
            </div>
            <Button type="submit">Adicionar Dados</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
