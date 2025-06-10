"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Badge } from "./ui/badge"
import { useMemo, useState } from "react"
import { startOfDay, startOfWeek, startOfMonth, startOfYear, isAfter, parseISO } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface HealthData {
  date: string
  systolic?: number
  diastolic?: number
  heartRate?: number
  glucose?: number
  cholesterol?: number
  source?: string
}

interface HealthDataChartProps {
  data: HealthData[]
}

type TimePeriod = "day" | "week" | "month" | "year" | "all"

export function HealthDataChart({ data }: HealthDataChartProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all")

  const groupedData = useMemo(() => {
    const filtered = filterDataByTimePeriod(data, timePeriod)
    const grouped = new Map<string, HealthData[]>()

    // Agrupar dados por data (YYYY-MM-DD)
    for (const entry of filtered) {
      const date = new Date(entry.date)
      const formatted = date.toLocaleDateString("en-CA")

      if (!grouped.has(formatted)) {
        grouped.set(formatted, [entry])
      } else {
        grouped.get(formatted)!.push(entry)
      }
    }

    // Média dos dados por dia
    const averaged = Array.from(grouped.entries()).map(([date, entries]) => {
      const total = {
        systolic: 0,
        diastolic: 0,
        heartRate: 0,
        glucose: 0,
        cholesterol: 0,
      }
      const counts = {
        systolic: 0,
        diastolic: 0,
        heartRate: 0,
        glucose: 0,
        cholesterol: 0,
      }

      for (const entry of entries) {
        if (typeof entry.systolic === "number") {
          total.systolic += entry.systolic
          counts.systolic++
        }
        if (typeof entry.diastolic === "number") {
          total.diastolic += entry.diastolic
          counts.diastolic++
        }
        if (typeof entry.heartRate === "number") {
          total.heartRate += entry.heartRate
          counts.heartRate++
        }
        if (typeof entry.glucose === "number") {
          total.glucose += entry.glucose
          counts.glucose++
        }
        if (typeof entry.cholesterol === "number") {
          total.cholesterol += entry.cholesterol
          counts.cholesterol++
        }
      }

      return {
        date,
        formattedDate: new Date(date).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        }),
         systolic: counts.systolic ? total.systolic / counts.systolic : null,
         diastolic: counts.diastolic ? total.diastolic / counts.diastolic : null,
         heartRate: counts.heartRate ? total.heartRate / counts.heartRate : null,
         glucose: counts.glucose ? total.glucose / counts.glucose : null,
         cholesterol: counts.cholesterol ? total.cholesterol / counts.cholesterol : null,
      }
    })

    return averaged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [data, timePeriod])

  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center">
        Nenhum dado disponível para exibir.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
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

      <div className="flex flex-wrap gap-2 text-sm">
        <Badge variant="outline" className="bg-blue-100 text-blue-800">Sistólica</Badge>
        <Badge variant="outline" className="bg-sky-100 text-sky-800">Diastólica</Badge>
        <Badge variant="outline" className="bg-red-100 text-red-800">Frequência Cardíaca</Badge>
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Glicose</Badge>
        <Badge variant="outline" className="bg-green-100 text-green-800">Colesterol</Badge>
      </div>

      <div className="health-chart-container w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={groupedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ccc" }}
              labelStyle={{ fontWeight: "bold" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="linear" dataKey="systolic" name="Sistólica" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} connectNulls={false}/>
            <Line type="linear" dataKey="diastolic" name="Diastólica" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 2 }} connectNulls={false}/>
            <Line type="linear" dataKey="heartRate" name="Frequência Cardíaca" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} connectNulls={false}/>
            <Line type="linear" dataKey="glucose" name="Glicose" stroke="#facc15" strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
            <Line type="linear" dataKey="cholesterol" name="Colesterol" stroke="#22c55e" strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-xs text-muted-foreground">
        Fonte dos dados:
        {" "}
        <Badge variant="outline" className="ml-1">Manual</Badge>
        {" "}
        <Badge variant="outline" className="ml-1 bg-gray-200 text-gray-800">Google Fit</Badge>
      </div>
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