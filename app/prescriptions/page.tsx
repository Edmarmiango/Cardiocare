'use client'

import type React from "react"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { useToast } from '../../components/ui/use-toast'
import { createReminderAction } from '../../app/actions/reminders'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { PrescriptionPrintDownload } from "../../components/PrescriptionPrintDownload"

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  instructions: string;
  startDate: string;
  endDate: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  userId: string;
  doctorId: string;
  user: {
    name: string;
  };
  doctor: {
    name: string;
    specialty: string;
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
  const [activeTab, setActiveTab] = useState('ACTIVE')
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPrescriptions(activeTab)
      if (session?.user.role === 'DOCTOR') {
        fetchPatients()
      }
    }
  }, [status, session, activeTab])

  const fetchPrescriptions = async (status: string) => {
    try {
      const response = await fetch(`/api/prescriptions?status=${status}`)
      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch prescriptions")
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch prescriptions",
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
        throw new Error('Failed to fetch patients')
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      })
    }
  }

  const createReminders = async (prescription: typeof newPrescription) => {
    if (!prescription.patientId) {
      console.error("Patient ID is missing for reminder creation")
      return []
    }

    const startDateTime = new Date(prescription.startDate)
    const endDateTime = prescription.endDate ? new Date(prescription.endDate) : null
    const reminderResults = []

     // Ajustar o horário inicial dependendo da frequência
      if (prescription.frequency === "três vezes ao dia (8 em 8 horas)") {
        startDateTime.setHours(6, 0, 0, 0); // Iniciar em 6h para essa frequência
      } else {
        startDateTime.setHours(8, 0, 0, 0); // Para outras frequências, se necessário
      }

    while (!endDateTime || startDateTime <= endDateTime) {
      const reminderData = {
        userId: prescription.patientId,
        type: "medication" as const,
        title: `Tomar ${prescription.medication}`,
        description: `Dosagem: ${prescription.dosage}. ${prescription.instructions}`,
        datetime: startDateTime.toISOString(),
        createdBy: session?.user?.id || "",
      }

      console.log("Sending reminder data:", reminderData)

      const reminderResult = await createReminderAction(reminderData)

      reminderResults.push(reminderResult)
      console.log("Reminder creation result:", reminderResult)

      // Increment the date based on frequency
      if (prescription.frequency === "uma vez por dia (manhã)") {
        startDateTime.setDate(startDateTime.getDate() + 1)
        startDateTime.setHours(8, 0, 0, 0)
      }else if(prescription.frequency === "uma vez por dia (Tarde)"){
        startDateTime.setDate(startDateTime.getDate() + 1)
        startDateTime.setHours(14, 0, 0, 0)
      }else if(prescription.frequency === "uma vez por dia (Noite)"){
        startDateTime.setDate(startDateTime.getDate() + 1)
        startDateTime.setHours(20, 0, 0, 0)
      } else if (prescription.frequency === "duas vezes ao dia (12 em 12 horas)") {
        if (startDateTime.getHours() < 20) {
          startDateTime.setHours(20, 0, 0, 0)
        } else {
          startDateTime.setDate(startDateTime.getDate() + 1)
          startDateTime.setHours(8, 0, 0, 0)
        }
      } else if (prescription.frequency === "três vezes ao dia (6 em 6 horas)") {
        if (startDateTime.getHours() === 8) {
          startDateTime.setHours(14, 0, 0, 0)
        } else if (startDateTime.getHours() === 14) {
          startDateTime.setHours(20, 0, 0, 0)
        } else {
          startDateTime.setDate(startDateTime.getDate() + 1)
          startDateTime.setHours(8, 0, 0, 0)
        }
      } else if (prescription.frequency === "três vezes ao dia (8 em 8 horas)") {
        if (startDateTime.getHours() === 6) {
          startDateTime.setHours(14, 0, 0, 0);
        } else if (startDateTime.getHours() === 14) {
          startDateTime.setHours(22, 0, 0, 0);
        } else {
          startDateTime.setDate(startDateTime.getDate() + 1);
          startDateTime.setHours(6, 0, 0, 0);
        }
    
      } else {
        // If frequency is not recognized, create only one reminder
        console.error(`Frequência desconhecida: ${prescription.frequency}`);
        break
      }
    }

    return reminderResults
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (session?.user.role !== "DOCTOR") {
      toast({
        title: "Error",
        description: "Only doctors can create prescriptions",
        variant: "destructive",
      })
      return
    }

    if (
      !newPrescription.patientId ||
      !newPrescription.medication ||
      !newPrescription.dosage ||
      !newPrescription.frequency ||
      !newPrescription.instructions ||
      !newPrescription.startDate
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPrescription),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create prescription")
      }

      const prescriptionData = await response.json()

      // Create reminders
      const reminderResults = await createReminders(newPrescription)
      console.log("Reminder creation results:", reminderResults)

      const allRemindersCreated = reminderResults.every((result) => result.success)
      const failedReminders = reminderResults.filter((result) => !result.success).length

      if (allRemindersCreated) {
        toast({
          title: "Sucesso",
          description: "Prescrição criada e todos os lembretes configurados com sucesso.",
        })
      } else if (reminderResults.length > 0) {
        toast({
          title: "Sucesso Parcial",
          description: `Prescrição criada, mas ${failedReminders} lembrete(s) falharam ao serem configurados. Por favor, verifique e configure-os manualmente se necessário.`,
          variant: "warning",
        })
      } else {
        toast({
          title: "Aviso",
          description: "Prescrição criada, mas nenhum lembrete foi configurado. Por favor, configure-os manualmente.",
          variant: "warning",
        })
      }

      // Clear the form
      setNewPrescription({
        patientId: "",
        medication: "",
        dosage: "",
        frequency: "",
        instructions: "",
        startDate: "",
        endDate: "",
      })

      // Refresh the prescriptions list
      fetchPrescriptions(activeTab)
    } catch (error) {
      console.error("Error creating prescription:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }


  const handleStatusChange = async (prescriptionId: string, newStatus: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED') => {
    try {
      const response = await fetch('/api/prescriptions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: prescriptionId, status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Status da prescrição atualizado com sucesso.",
        })
        fetchPrescriptions(activeTab)
      } else {
        throw new Error('Failed to update prescription status')
      }
    } catch (error) {
      console.error('Error updating prescription status:', error)
      toast({
        title: "Error",
        description: "Falha ao atualizar o status da prescrição",
        variant: "destructive",
      })
    }
  }

  const renderPrescriptions = (status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED') => {
    const filteredPrescriptions = prescriptions.filter(p => p.status === status);
    return filteredPrescriptions.length > 0 ? (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPrescriptions.map((prescription) => (
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
                <p><strong>Prescrito por:</strong> Dr(a). {prescription.doctor.name} ({prescription.doctor.specialty})</p>
              )}
              {session?.user.role === 'DOCTOR' && prescription.user && (
                <p><strong>Paciente:</strong> {prescription.user.name}</p>
              )}
       
                <div className="mt-4">
                  <Select
                    value={prescription.status}
                    onValueChange={(value) => handleStatusChange(prescription.id, value as 'ACTIVE' | 'COMPLETED' | 'ARCHIVED')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Activo</SelectItem>
                      <SelectItem value="COMPLETED">Concluído</SelectItem>
                      <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <p>Nenhuma prescrição {status.toLowerCase()} encontrada.</p>
    );
  };

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    return <div>Please log in to view prescriptions.</div>
  }

  return (
    <div className="container mx-auto p-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <h1 className="text-2xl font-bold mb-4">Prescrições</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ACTIVE">Ativas</TabsTrigger>
          <TabsTrigger value="COMPLETED">Concluídas</TabsTrigger>
          <TabsTrigger value="ARCHIVED">Arquivadas</TabsTrigger>
        </TabsList>
        <TabsContent value="ACTIVE">{isLoading ? ( 
          <div>Carregando...</div>
           ): ( 
           <> 
            {renderPrescriptions("ACTIVE")}
             {session?.user.role === "PATIENT" && prescriptions.some((p) => p.status === "ACTIVE") && 
             ( <PrescriptionPrintDownload prescriptions={prescriptions.filter((p) => p.status ==="ACTIVE")} />
             )}
             </>
            )}
        </TabsContent>
        <TabsContent value="COMPLETED">
          {isLoading ? <div>Carregando...</div> : renderPrescriptions("COMPLETED")}
        </TabsContent>
        <TabsContent value="ARCHIVED">
          {isLoading ? <div>Carregando...</div> : renderPrescriptions("ARCHIVED")}
        </TabsContent>
      </Tabs>

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
                    <SelectValue placeholder="Selecione o paciente" />
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
                <Select
                  value={newPrescription.frequency}
                  onValueChange={(value) => setNewPrescription({ ...newPrescription, frequency: value })}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uma vez por dia (manhã)">Uma vez por dia (8h00)</SelectItem>
                    <SelectItem value="uma vez por dia (Tarde)">Uma vez por dia (14h00)</SelectItem>
                    <SelectItem value="uma vez por dia (Noite)">Uma vez por dia (20h00)</SelectItem>
                    <SelectItem value="duas vezes ao dia (12 em 12 horas)">Duas vezes ao dia (8h00 e 20h00)</SelectItem>
                    <SelectItem value="três vezes ao dia (6 em 6 horas)">Três vezes ao dia (8h00, 14h00 e 20h00)</SelectItem>
                    <SelectItem value="três vezes ao dia (8 em 8 horas)">Três vezes ao dia (6h00, 14h00 e 22h00)</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="startDate">Data de início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newPrescription.startDate}
                  onChange={(e) => setNewPrescription({...newPrescription, startDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">Data de término (opcional)</Label>
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



