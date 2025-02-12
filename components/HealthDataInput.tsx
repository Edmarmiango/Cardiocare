import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useToast } from "../components/ui/use-toast"
import { Label } from "../components/ui/label"
import { Checkbox } from "../components/ui/checkbox"

interface HealthData {
  date: string
  systolic: number | null
  diastolic: number | null
  heartRate: number | null
  glucose: number | null
  cholesterol: number | null
}

interface HealthDataInputProps {
  onSubmit: (data: Partial<HealthData>) => void
  disabled?: boolean
}

export function HealthDataInput({ onSubmit, disabled = false }: HealthDataInputProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<HealthData>>({
    date: new Date().toISOString().split("T")[0],
  })
  const [selectedFields, setSelectedFields] = useState<(keyof HealthData)[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: name === "date" ? value : value ? Number(value) : null }))
  }

  const handleCheckboxChange = (field: keyof HealthData) => {
    setSelectedFields((prev) => {
      if (prev.includes(field)) {
        const newFields = prev.filter((f) => f !== field)
        setFormData((prevData) => {
          const newData = { ...prevData }
          delete newData[field]
          return newData
        })
        return newFields
      }
      return [...prev, field]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Always include date and only selected fields
      const dataToSubmit = {
        date: formData.date,
      } as Partial<HealthData>

      // Add selected fields, ensuring they're numbers or null
      selectedFields.forEach((field) => {
        if (field !== "date") {
          dataToSubmit[field] = formData[field] !== undefined ? Number(formData[field]) : null
        }
      })

      const response = await fetch("/api/health-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      })

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Falha ao registrar dados de saúde")
      }

      const result = await response.json()

      if (result.success) {
        onSubmit(result.data)
        toast({
          title: "Sucesso",
          description: "Dados de saúde registrados com sucesso",
        })
        // Reset form except date
        setFormData({ date: formData.date })
        setSelectedFields([])
      } else {
        throw new Error(result.error || "Falha ao registrar dados de saúde")
      }
    } catch (error) {
      console.error("Error submitting health data:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao registrar dados de saúde",
        variant: "destructive",
      })
    }
  }

  const fields: { key: keyof HealthData; label: string }[] = [
    { key: "systolic", label: "Pressão Sistólica" },
    { key: "diastolic", label: "Pressão Diastólica" },
    { key: "heartRate", label: "Frequência Cardíaca" },
    { key: "glucose", label: "Glicose" },
    { key: "cholesterol", label: "Colesterol" },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="date">Data</Label>
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
      {fields.map((field) => (
        <div key={field.key} className="flex items-center space-x-2">
          <Checkbox
            id={field.key}
            checked={selectedFields.includes(field.key)}
            onCheckedChange={() => handleCheckboxChange(field.key)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              type="number"
              id={field.key}
              name={field.key}
              value={formData[field.key] || ""}
              onChange={handleChange}
              disabled={!selectedFields.includes(field.key) || disabled}
            />
          </div>
        </div>
      ))}
      <Button type="submit" disabled={disabled || selectedFields.length === 0}>
        Registrar Dados
      </Button>
    </form>
  )
}

