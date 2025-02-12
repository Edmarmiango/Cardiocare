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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface HealthData {
  date: string
  systolic: number
  diastolic: number
  heartRate: number
  glucose: number
  cholesterol: number
}

interface HealthDataChartProps {
  data: HealthData[]
}

type TimePeriod = "day" | "week" | "month" | "year" | "all"

export function HealthDataChart({ data }: HealthDataChartProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all")

  const filteredData = useMemo(() => {
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

    return data.filter((item) => isAfter(new Date(item.date), startDate))
  }, [data, timePeriod])

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Dados de Saúde",
      },
    },
    scales: {
      x: {
        type: "category",
      },
      y: {
        beginAtZero: true,
      },
    },
  }

  const chartData = {
    labels: filteredData.map((item) => item.date.split("T")[0]),
    datasets: [
      {
        label: "Pressão Sistólica",
        data: filteredData.map((item) => item.systolic),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Pressão Diastólica",
        data: filteredData.map((item) => item.diastolic),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Frequência Cardíaca",
        data: filteredData.map((item) => item.heartRate),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
      {
        label: "Glicose",
        data: filteredData.map((item) => item.glucose),
        borderColor: "rgb(255, 205, 86)",
        backgroundColor: "rgba(255, 205, 86, 0.5)",
      },
      {
        label: "Colesterol",
        data: filteredData.map((item) => item.cholesterol),
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
      <Line options={options} data={chartData} />
    </div>
  )
}



