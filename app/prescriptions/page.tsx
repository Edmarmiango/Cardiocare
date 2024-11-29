"use client"

import { useState } from 'react'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"

interface Prescription {
  id: number;
  medication: string;
  dosage: string;
  frequency: string;
  instructions: string;
}

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    { id: 1, medication: "Atenolol", dosage: "50mg", frequency: "1x ao dia", instructions: "Tomar pela manhã" },
    { id: 2, medication: "Aspirina", dosage: "100mg", frequency: "1x ao dia", instructions: "Tomar após o almoço" },
  ])

  const [newPrescription, setNewPrescription] = useState<Prescription>({
    id: 0,
    medication: "",
    dosage: "",
    frequency: "",
    instructions: ""
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPrescriptions([...prescriptions, { ...newPrescription, id: prescriptions.length + 1 }])
    setNewPrescription({ id: 0, medication: "", dosage: "", frequency: "", instructions: "" })
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Suas Prescrições</CardTitle>
        </CardHeader>
        <CardContent>
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="mb-4 p-4 border rounded">
              <p><strong>Medicamento:</strong> {prescription.medication}</p>
              <p><strong>Dosagem:</strong> {prescription.dosage}</p>
              <p><strong>Frequência:</strong> {prescription.frequency}</p>
              <p><strong>Instruções:</strong> {prescription.instructions}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nova Prescrição</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="medication">Medicamento</Label>
              <Input 
                id="medication" 
                value={newPrescription.medication}
                onChange={(e) => setNewPrescription({...newPrescription, medication: e.target.value})}
                required 
              />
            </div>
            <div>
              <Label htmlFor="dosage">Dosagem</Label>
              <Input 
                id="dosage" 
                value={newPrescription.dosage}
                onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                required 
              />
            </div>
            <div>
              <Label htmlFor="frequency">Frequência</Label>
              <Input 
                id="frequency" 
                value={newPrescription.frequency}
                onChange={(e) => setNewPrescription({...newPrescription, frequency: e.target.value})}
                required 
              />
            </div>
            <div>
              <Label htmlFor="instructions">Instruções</Label>
              <Textarea 
                id="instructions" 
                value={newPrescription.instructions}
                onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                required 
              />
            </div>
            <Button type="submit">Adicionar Prescrição</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

