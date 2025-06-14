"use client"

import { useState } from 'react'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { toast } from "../../components/ui/use-toast"

type PredictionInput = {
  age_years: number;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  ap_hi: number;
  ap_lo: number;
  cholesterol: number;
  gluc: number;
  smoke: boolean;
  alco: boolean;
  active: boolean;
}

type PredictionResult = {
  probability: string;
  risk_category: string;
  bp_recommendation: string;
  bmi_recommendation: string;
  chol_recommendation: string;
  gluc_recommendation: string;
}

export default function Prediction() {
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [formData, setFormData] = useState<PredictionInput>({
    age_years: 0,
    gender: 'male',
    height: 0,
    weight: 0,
    ap_hi: 0,
    ap_lo: 0,
    cholesterol: 0,
    gluc: 0,
    smoke: false,
    alco: false,
    active: true
  })

  const handleChange = (name: keyof PredictionInput, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const calculateBMI = (weight: number, height: number): number => {
    const heightInMeters = height / 100
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(2))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const bmi = calculateBMI(formData.weight, formData.height)
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, Bmi: bmi }),
      })
   
      if (!response.ok) {
        throw new Error('Erro na resposta da API')
      }
   
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Erro ao prever risco:', error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao calcular o risco. Por favor, tente novamente.",
        variant: "destructive"
      })
    }
  }

  {/* Função auxiliar opcional (pode ser fora do componente): */}
const getRiskColor = (category: string) => {
  switch (category) {
    case 'Muito alto':
      return 'text-red-600';
    case 'Alto':
      return 'text-orange-500';
    case 'Moderado':
      return 'text-yellow-500';
    case 'Baixo':
      return 'text-green-600';
    case 'Muito baixo':
      return 'text-emerald-500'; // verde mais suave
    default:
      return 'text-gray-700';
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">Predição de Risco Cardiovascular</h1>
        <p className="text-center text-gray-600 mb-8">
          Preencha o formulário abaixo com seus dados de saúde para obter uma avaliação de risco.
        </p>

    <Card className="bg-white border border-primary/20 rounded-2xl shadow-lg p-6">                                                                                                                                                                                                            
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="age_years">Idade (anos)</Label>
            <Input 
              id="age_years" 
              type="number" 
              required 
              value={formData.age_years} 
              onChange={(e) => handleChange('age_years', parseInt(e.target.value))} 
              className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>
          <div>
            <Label htmlFor="gender">Gênero</Label>
            <Select 
              value={formData.gender} 
              onValueChange={(value) => handleChange('gender', value as 'male' | 'female')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="height">Altura (cm)</Label>
            <Input 
              id="height" 
              type="number" 
              required 
              value={formData.height} 
              onChange={(e) => handleChange('height', parseInt(e.target.value))} 
              className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>
          <div>
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input 
              id="weight" 
              type="number" 
              required 
              value={formData.weight} 
              onChange={(e) => handleChange('weight', parseInt(e.target.value))} 
              className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>
          <div>
            <Label htmlFor="ap_hi">Pressão Arterial Sistólica</Label>
            <Input 
              id="ap_hi" 
              type="number" 
              required 
              value={formData.ap_hi} 
              onChange={(e) => handleChange('ap_hi', parseInt(e.target.value))} 
              className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>
          <div>
            <Label htmlFor="ap_lo">Pressão Arterial Diastólica</Label>
            <Input 
              id="ap_lo" 
              type="number" 
              required 
              value={formData.ap_lo} 
              onChange={(e) => handleChange('ap_lo', parseInt(e.target.value))} 
              className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>
          <div>
            <Label htmlFor="cholesterol">Colesterol (mg/dL)</Label>
            <Input 
              id="cholesterol" 
              type="number" 
              required 
              value={formData.cholesterol} 
              onChange={(e) => handleChange('cholesterol', parseInt(e.target.value))} 
              className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>
          <div>
            <Label htmlFor="gluc">Glicose (mg/dL)</Label>
            <Input 
              id="gluc" 
              type="number" 
              required 
              value={formData.gluc} 
              onChange={(e) => handleChange('gluc', parseInt(e.target.value))} 
              className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>
          <div>
            <Label htmlFor="smoke">Fumante?</Label>
            <Select 
              value={formData.smoke ? 'yes' : 'no'} 
              onValueChange={(value) => handleChange('smoke', value === 'yes')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Sim</SelectItem>
                <SelectItem value="no">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="alco">Consome álcool?</Label>
            <Select 
              value={formData.alco ? 'yes' : 'no'} 
              onValueChange={(value) => handleChange('alco', value === 'yes')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Sim</SelectItem>
                <SelectItem value="no">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="active">Pratica atividade física?</Label>
            <Select 
              value={formData.active ? 'yes' : 'no'} 
              onValueChange={(value) => handleChange('active', value === 'yes')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Sim</SelectItem>
                <SelectItem value="no">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">Calcular Risco</Button>
        </form>
        {result && (
          <div className="mt-8 p-6 bg-blue-100 border-l-4 border-blue-500 rounded-xl shadow">
              <h2 className="text-xl font-bold text-blue-800 mb-2">Resultado da Predição</h2>
              <p className="font-medium text-gray-700">
                Probabilidade: <span className={`${getRiskColor(result.risk_category)} font-bold`}>{result.probability}</span>
              </p>
              <p className="text-gray-700">Categoria: <strong>{result.risk_category}</strong></p>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p className="mt-2">{result.bp_recommendation}</p>
              <p className="mt-2">{result.bmi_recommendation}</p>
              <p className="mt-2">{result.chol_recommendation}</p>
              <p className="mt-2">{result.gluc_recommendation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
   </div>
  </div>
  )
}



