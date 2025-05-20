"use client"

import { useState, useMemo } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { startOfDay, startOfWeek, startOfMonth, startOfYear, isAfter } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface HealthData {
  date: string
  systolic?: number
  diastolic?: number
  heartRate?: number
  glucose?: number
  cholesterol?: number
  source?: "manual" | "googleFit"
}

interface HealthDataChartProps {
  data: HealthData[]
}

type TimePeriod = "day" | "week" | "month" | "year" | "all"

const formatDate = (dateString: string) => {
  const date = parseISO(dateString)
  return format(date, "dd/MM/yyyy", { locale: ptBR })
}

export function HealthDataChart({ data }: HealthDataChartProps) {
  // Ensure all data points have all fields, even if they're undefined
  const normalizedData = data.map((item) => ({
    date: item.date,
    systolic: item.systolic ?? undefined,
    diastolic: item.diastolic ?? undefined,
    heartRate: item.heartRate ?? undefined,
    glucose: item.glucose ?? undefined,
    cholesterol: item.cholesterol ?? undefined,
    source: item.source,
  }))

  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all")

  const aggregateData = (
    data: HealthData[],
  ): {
    bloodPressure: HealthData[]
    glucose: HealthData[]
    cholesterol: HealthData[]
  } => {
    return data.reduce(
      (acc, item) => {
        if (item.systolic || item.diastolic || item.heartRate) {
          acc.bloodPressure.push(item)
        }
        if (item.glucose) {
          acc.glucose.push(item)
        }
        if (item.cholesterol) {
          acc.cholesterol.push(item)
        }
        return acc
      },
      { bloodPressure: [], glucose: [], cholesterol: [] },
    )
  }

  const filteredData = useMemo(() => {
    const filtered = filterDataByTimePeriod(normalizedData, timePeriod)
    return aggregateData(filtered)
  }, [normalizedData, timePeriod, aggregateData]) // Added aggregateData to dependencies

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        type: "category",
        title: {
          display: true,
          text: "Data",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Valor",
        },
      },
    },
  }

  const bloodPressureChartData = {
    labels: filteredData.bloodPressure.map((item) => formatDate(item.date)),
    datasets: [
      {
        label: "Pressão Sistólica",
        data: filteredData.bloodPressure.map((item) => item.systolic || null),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Pressão Diastólica",
        data: filteredData.bloodPressure.map((item) => item.diastolic || null),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Frequência Cardíaca",
        data: filteredData.bloodPressure.map((item) => item.heartRate || null),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  }

  const glucoseChartData = {
    labels: filteredData.glucose.map((item) => formatDate(item.date)),
    datasets: [
      {
        label: "Glicose",
        data: filteredData.glucose.map((item) => item.glucose || null),
        borderColor: "rgb(255, 205, 86)",
        backgroundColor: "rgba(255, 205, 86, 0.5)",
      },
    ],
  }

  const cholesterolChartData = {
    labels: filteredData.cholesterol.map((item) => formatDate(item.date)),
    datasets: [
      {
        label: "Colesterol",
        data: filteredData.cholesterol.map((item) => item.cholesterol || null),
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.5)",
      },
    ],
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Último dia</SelectItem>
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Último mês</SelectItem>
            <SelectItem value="year">Último ano</SelectItem>
            <SelectItem value="all">Todos os dados</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filteredData.bloodPressure.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Pressão Arterial e Frequência Cardíaca</CardTitle>
          </CardHeader>
          <CardContent>
            <Line options={options} data={bloodPressureChartData} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pressão Arterial e Frequência Cardíaca</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Nenhum dado disponível para o período selecionado.</p>
          </CardContent>
        </Card>
      )}
      {filteredData.glucose.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Glicose</CardTitle>
          </CardHeader>
          <CardContent>
            <Line options={options} data={glucoseChartData} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Glicose</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Nenhum dado disponível para o período selecionado.</p>
          </CardContent>
        </Card>
      )}
      {filteredData.cholesterol.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Colesterol</CardTitle>
          </CardHeader>
          <CardContent>
            <Line options={options} data={cholesterolChartData} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Colesterol</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Nenhum dado disponível para o período selecionado.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function filterDataByTimePeriod(data: HealthData[], timePeriod: TimePeriod) {
  const now = new Date()
  let startDate: Date

  switch (timePeriod) {
    case "day":
      startDate = startOfDay(now)
      break
    case "week":
      startDate = startOfWeek(now)
      break
    case "month":
      startDate = startOfMonth(now)
      break
    case "year":
      startDate = startOfYear(now)
      break
    default:
      return data
  }

  return data.filter((item) => isAfter(parseISO(item.date), startDate))
}

