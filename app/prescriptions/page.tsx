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
import { createReminderAction } from '../../app/actions/reminders'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"

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

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPrescriptions(activeTab)
      if (session?.user.role === 'DOCTOR') {
        fetchPatients()
      }
    }
  }, [status, session, activeTab])

  const fetchPrescriptions = async (status: string) => {
    setError(null)
    try {
      const response = await fetch(`/api/prescriptions?status=${status}`)
      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data)
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || 'Failed to fetch prescriptions'
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch prescriptions'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setError(errorMessage)
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
  
    // Validate form data
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
      // Log the request payload for debugging
      console.log("Sending prescription data:", newPrescription)
  
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPrescription),
      })
  
      // Log the response status and headers for debugging
      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create prescription")
      }
  
      const prescriptionData = await response.json()
  
      // Create reminders for the medication
      try {
        const startDate = new Date(prescriptionData.startDate)
        const endDate = prescriptionData.endDate ? new Date(prescriptionData.endDate) : null
        const [frequency, period] = prescriptionData.frequency.split(" ")
  
        const currentDate = new Date(startDate)
        while (!endDate || currentDate <= endDate) {
          const reminderResult = await createReminderAction({
            userId: prescriptionData.userId,
            type: "medication",
            title: `Take ${prescriptionData.medication}`,
            description: `Dosage: ${prescriptionData.dosage}. ${prescriptionData.instructions}`,
            datetime: new Date(currentDate),
          })
  
          if (!reminderResult.success) {
            throw new Error("Failed to create reminders")
          }
  
          // Move to the next occurrence based on frequency
          if (period === "daily") {
            currentDate.setDate(currentDate.getDate() + 1)
          } else if (period === "weekly") {
            currentDate.setDate(currentDate.getDate() + 7)
          } else if (period === "monthly") {
            currentDate.setMonth(currentDate.getMonth() + 1)
          }
        }
  
        toast({
          title: "Success",
          description: "Prescription created successfully. Reminders have been set.",
        })
  
        // Reset form and refresh data
        fetchPrescriptions(activeTab)
        setNewPrescription({
          patientId: "",
          medication: "",
          dosage: "",
          frequency: "",
          instructions: "",
          startDate: "",
          endDate: "",
        })
      } catch (reminderError) {
        console.error("Error creating reminders:", reminderError)
        toast({
          title: "Warning",
          description: "Prescription created but failed to set reminders",
          variant: "destructive",
        })
      }
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
          description: "Prescription status updated successfully.",
        })
        fetchPrescriptions(activeTab)
      } else {
        throw new Error('Failed to update prescription status')
      }
    } catch (error) {
      console.error('Error updating prescription status:', error)
      toast({
        title: "Error",
        description: "Failed to update prescription status",
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
              {session?.user.role === 'DOCTOR' && (
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
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <p>Nenhuma prescrição {status.toLowerCase()} encontrada.</p>
    );
  };

  if (isLoading) {
    return <div>Loading...</div>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="ACTIVE">Activo</TabsTrigger>
          <TabsTrigger value="COMPLETED">Concluído</TabsTrigger>
          <TabsTrigger value="ARCHIVED">Arquivado</TabsTrigger>
        </TabsList>
        <TabsContent value="ACTIVE">
          {renderPrescriptions('ACTIVE')}
        </TabsContent>
        <TabsContent value="COMPLETED">
          {renderPrescriptions('COMPLETED')}
        </TabsContent>
        <TabsContent value="ARCHIVED">
          {renderPrescriptions('ARCHIVED')}
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



