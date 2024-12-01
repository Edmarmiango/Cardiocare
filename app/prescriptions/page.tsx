'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { toast } from "../../components/ui/use-toast"

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  instructions: string;
  startDate: string;
  endDate: string | null;
  doctor?: {
    name: string;
    specialty: string;
  };
  user?: {
    name: string;
  };
}

interface Patient {
  id: string;
  name: string;
}

export default function PrescriptionsPage() {
  const { data: session, status } = useSession()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    frequency: '',
    instructions: '',
    startDate: '',
    endDate: ''
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPrescriptions()
      if (session.user.role === 'DOCTOR') {
        fetchPatients()
      }
    }
  }, [status, session])

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch('/api/prescriptions')
      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data)
      } else {
        toast({
          title: "Error",
          description: "Falha ao buscar receitas",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Erro ao buscar prescrições:', error)
      toast({
        title: "Error",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients')
      if (response.ok) {
        const data = await response.json()
        setPatients(data)
      } else {
        toast({
          title: "Error",
          description: "Falha ao buscar pacientes",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error)
      toast({
        title: "Error",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (session?.user.role !== 'DOCTOR') {
      toast({
        title: "Error",
        description: "Somente médicos podem criar prescrições",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPrescription),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Prescrição criada com sucesso",
        })
        fetchPrescriptions()
        setNewPrescription({
          patientId: '',
          medication: '',
          dosage: '',
          frequency: '',
          instructions: '',
          startDate: '',
          endDate: ''
        })
      } else {
        toast({
          title: "Error",
          description: "Falha ao criar prescrição",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Erro ao criar prescrição:', error)
      toast({
        title: "Error",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Prescrições</h1>
      
      {prescriptions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id}>
              <CardHeader>
                <CardTitle>{prescription.medication}</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Dosagem:</strong> {prescription.dosage}</p>
                <p><strong>Frequência:</strong> {prescription.frequency}</p>
                <p><strong>Instruções:</strong> {prescription.instructions}</p>
                <p><strong>Data de início:</strong> {new Date(prescription.startDate).toLocaleDateString()}</p>
                {prescription.endDate && (
                  <p><strong>Data de término:</strong> {new Date(prescription.endDate).toLocaleDateString()}</p>
                )}
                {session?.user.role === 'PATIENT' && prescription.doctor && (
                  <p><strong>Prescrito por:</strong> Dr. {prescription.doctor.name} ({prescription.doctor.specialty})</p>
                )}
                {session?.user.role === 'DOCTOR' && prescription.user && (
                  <p><strong>Paciente:</strong> {prescription.user.name}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>Nenhuma prescrição encontrada.</p>
      )}

      {session?.user.role === 'DOCTOR' && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Criar nova prescrição</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patientId">Paciente</Label>
                <Select
                  value={newPrescription.patientId}
                  onValueChange={(value) => setNewPrescription({...newPrescription, patientId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>{patient.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newPrescription.startDate}
                  onChange={(e) => setNewPrescription({...newPrescription, startDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">Data de término (optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newPrescription.endDate}
                  onChange={(e) => setNewPrescription({...newPrescription, endDate: e.target.value})}
                />
              </div>
              <Button type="submit">Criar prescrição</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

