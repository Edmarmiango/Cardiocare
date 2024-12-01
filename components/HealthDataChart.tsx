import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface HealthData {
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  glucose: number;
  cholesterol: number;
}

interface HealthDataChartProps {
  data: HealthData[];
}

export function HealthDataChart({ data }: HealthDataChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="systolic" stroke="#8884d8" name="Pressão Sistólica" />
        <Line yAxisId="left" type="monotone" dataKey="diastolic" stroke="#82ca9d" name="Pressão Diastólica" />
        <Line yAxisId="right" type="monotone" dataKey="heartRate" stroke="#ffc658" name="Frequência Cardíaca" />
        <Line yAxisId="right" type="monotone" dataKey="glucose" stroke="#ff8042" name="Glicose" />
        <Line yAxisId="right" type="monotone" dataKey="cholesterol" stroke="#0088fe" name="Colesterol" />
      </LineChart>
    </ResponsiveContainer>
  )
}

