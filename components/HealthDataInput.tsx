import { useState } from 'react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { toast } from "../components/ui/use-toast"

interface HealthData {
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  glucose: number;
  cholesterol: number;
}

interface HealthDataInputProps {
  onSubmit: (data: HealthData) => void;
}

export function HealthDataInput({ onSubmit }: HealthDataInputProps) {
  const [formData, setFormData] = useState<HealthData>({
    date: new Date().toISOString().split('T')[0],
    systolic: 0,
    diastolic: 0,
    heartRate: 0,
    glucose: 0,
    cholesterol: 0,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'date' ? value : Number(value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/health-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSubmit(formData)
        toast({
          title: "Success",
          description: "Health data submitted successfully",
        })
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          systolic: 0,
          diastolic: 0,
          heartRate: 0,
          glucose: 0,
          cholesterol: 0,
        })
      } else {
        throw new Error('Failed to submit health data')
      }
    } catch (error) {
      console.error('Error submitting health data:', error)
      toast({
        title: "Error",
        description: "Failed to submit health data",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="systolic">Pressão Arterial Sistólica</Label>
        <Input
          id="systolic"
          name="systolic"
          type="number"
          value={formData.systolic}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="diastolic">Pressão Arterial Diastólica</Label>
        <Input
          id="diastolic"
          name="diastolic"
          type="number"
          value={formData.diastolic}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="heartRate">Frequência Cardíaca</Label>
        <Input
          id="heartRate"
          name="heartRate"
          type="number"
          value={formData.heartRate}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="glucose">Glicose</Label>
        <Input
          id="glucose"
          name="glucose"
          type="number"
          value={formData.glucose}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="cholesterol">Colesterol</Label>
        <Input
          id="cholesterol"
          name="cholesterol"
          type="number"
          value={formData.cholesterol}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit">Enviar Dados</Button>
    </form>
  )
}

