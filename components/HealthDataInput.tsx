"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useToast } from "../components/ui/use-toast"
import { Label } from "../components/ui/label"
import { Checkbox } from "../components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"

interface HealthData {
  date: string
  systolic?: number
  diastolic?: number
  heartRate?: number
  glucose?: number
  cholesterol?: number
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
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("bloodPressure")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "date" ? value : value ? Number(value) : undefined,
    }))
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
    setIsLoading(true)

    try {
      const dataToSubmit: Partial<HealthData> = { date: formData.date }
      selectedFields.forEach((field) => {
        if (field !== "date" && formData[field] !== undefined && formData[field] !== "") {
          dataToSubmit[field] = Number(formData[field])
        }
      })

      // Verifica se há dados para enviar além da data
      if (Object.keys(dataToSubmit).length <= 1) {
        throw new Error("Por favor, preencha pelo menos um campo de dados de saúde")
      }

      console.log("Submitting data:", dataToSubmit)

      const response = await fetch("/api/health-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      })

      const responseText = await response.text()
      console.log("Raw response:", responseText)

      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Error parsing response:", responseText)
        throw new Error("Invalid response from server")
      }

      if (response.ok) {
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
    } finally {
      setIsLoading(false)
    }
  }

  const bloodPressureFields: { key: keyof HealthData; label: string }[] = [
    { key: "systolic", label: "Pressão Sistólica" },
    { key: "diastolic", label: "Pressão Diastólica" },
    { key: "heartRate", label: "Frequência Cardíaca" },
  ]

  const glucoseFields: { key: keyof HealthData; label: string }[] = [{ key: "glucose", label: "Glicose" }]

  const cholesterolFields: { key: keyof HealthData; label: string }[] = [{ key: "cholesterol", label: "Colesterol" }]

  const renderFields = (fields: { key: keyof HealthData; label: string }[]) => (
    <>
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
    </>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Novos Dados</CardTitle>
      </CardHeader>
      <CardContent>
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="bloodPressure">Pressão Arterial</TabsTrigger>
              <TabsTrigger value="glucose">Glicose</TabsTrigger>
              <TabsTrigger value="cholesterol">Colesterol</TabsTrigger>
            </TabsList>
            <TabsContent value="bloodPressure">{renderFields(bloodPressureFields)}</TabsContent>
            <TabsContent value="glucose">{renderFields(glucoseFields)}</TabsContent>
            <TabsContent value="cholesterol">{renderFields(cholesterolFields)}</TabsContent>
          </Tabs>
          <Button type="submit" disabled={disabled || isLoading || selectedFields.length === 0}>
            {isLoading ? "Enviando..." : "Registrar Dados"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

