import { useState } from 'react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { toast } from "../components/ui/use-toast"

interface HealthData {
  date: string
  systolic: number
  diastolic: number
  heartRate: number
  glucose: number
  cholesterol: number
}

interface HealthDataInputProps {
  onSubmit: (data: HealthData) => void
  disabled?: boolean
  dataSource: {
    bloodPressure: "manual" | "googleFit"
    heartRate: "manual" | "googleFit"
    glucose: "manual" | "googleFit"
    cholesterol: "manual" | "googleFit"
  }
}

export function HealthDataInput({ onSubmit, disabled = false, dataSource }: HealthDataInputProps) {
  const [formData, setFormData] = useState<HealthData>({
    date: new Date().toISOString().split("T")[0],
    systolic: 0,
    diastolic: 0,
    heartRate: 0,
    glucose: 0,
    cholesterol: 0,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: name === "date" ? value : Number(value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/health-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSubmit(formData)
        toast({
          title: "Sucesso",
          description: "Dados de saúde registrados com sucesso",
        })
        // Reset form
        setFormData({
          date: new Date().toISOString().split("T")[0],
          systolic: 0,
          diastolic: 0,
          heartRate: 0,
          glucose: 0,
          cholesterol: 0,
        })
      } else {
        throw new Error("Falha ao registrar dados de saúde")
      }
    } catch (error) {
      console.error("Error submitting health data:", error)
      toast({
        title: "Erro",
        description: "Falha ao registrar dados de saúde",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="date">Data</label>
        <Input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          disabled={disabled}
        />
      </div>
      <div>
        <label htmlFor="systolic">Pressão Sistólica</label>
        <Input
          type="number"
          id="systolic"
          name="systolic"
          value={formData.systolic}
          onChange={handleChange}
          required
          disabled={disabled}
        />
      </div>
      <div>
        <label htmlFor="diastolic">Pressão Diastólica</label>
        <Input
          type="number"
          id="diastolic"
          name="diastolic"
          value={formData.diastolic}
          onChange={handleChange}
          required
          disabled={disabled}
        />
      </div>
      <div>
        <label htmlFor="heartRate">Frequência Cardíaca</label>
        <Input
          type="number"
          id="heartRate"
          name="heartRate"
          value={formData.heartRate}
          onChange={handleChange}
          required
          disabled={disabled}
        />
      </div>
      <div>
        <label htmlFor="glucose">Glicose</label>
        <Input
          type="number"
          id="glucose"
          name="glucose"
          value={formData.glucose}
          onChange={handleChange}
          required
          disabled={disabled}
        />
      </div>
      <div>
        <Label htmlFor="cholesterol">
          Colesterol
          <span className="ml-2 text-xs text-muted-foreground">(Entrada Manual)</span>
        </Label>
        <Input
          type="number"
          id="cholesterol"
          name="cholesterol"
          value={formData.cholesterol}
          onChange={handleChange}
          required
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground mt-1">
          O Google Fit não fornece dados de colesterol. Por favor, insira manualmente.
        </p>
      </div>
      <Button type="submit" disabled={disabled}>
        Registrar Dados
      </Button>
    </form>
  )
}
