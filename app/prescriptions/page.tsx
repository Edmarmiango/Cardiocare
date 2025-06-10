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
import { PatientAutocomplete } from "../../components/PatientAutocomplete"

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
  const [currentPage, setCurrentPage] = useState(1);
  const prescriptionsPerPage = 9;
  const [searchTerm, setSearchTerm] = useState("")
  const [search, setSearch] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)


 useEffect(() => {
    if (status === 'authenticated') {
      fetchPrescriptions(activeTab)
      setCurrentPage(1); // Resetar para página 1 ao trocar o status
      if (session?.user.role === 'DOCTOR') {
        fetchPatients()
        setCurrentPage(1); // Resetar para página 1 ao trocar o status
      }
    }
  }, [status, session, activeTab])


  const updatePrescriptionStatus = async (id: string, newStatus: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED') => {
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar prescrição');
      }

      return await res.json();
    } catch (err) {
      console.error(`Erro ao atualizar status da prescrição ${id}:`, err);
      return null;
    }
  };


 const fetchPrescriptions = async (status: string) => {
  try {
    const response = await fetch(`/api/prescriptions?status=${status}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch prescriptions");
    }

    let data = await response.json();

    // ✅ Só verifica vencidas se for status 'ACTIVE'
    if (status === 'ACTIVE') {
      const today = new Date();

      const updated = await Promise.all(
        data.map(async (prescription: Prescription) => {
          const isExpired =
            prescription.status === 'ACTIVE' &&
            prescription.endDate &&
            new Date(prescription.endDate) < today;

          if (isExpired) {
            const updated = await updatePrescriptionStatus(prescription.id, 'COMPLETED');
            return updated ?? prescription;
          }

          return prescription;
        })
      );

      data = updated;
    }

    setPrescriptions(data);
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    toast({
      title: "Error",
      description:
        error instanceof Error
          ? error.message
          : "Failed to fetch prescriptions",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

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
  let filteredPrescriptions = prescriptions.filter(p => p.status === status);

   // Aplica filtro de pesquisa para médicos
  if (session?.user.role === 'DOCTOR' && searchTerm.trim() !== '') {
    const lowerSearch = searchTerm.toLowerCase();
    filteredPrescriptions = filteredPrescriptions.filter(prescription =>
      prescription.user.name.toLowerCase().includes(lowerSearch) ||
      prescription.medication.toLowerCase().includes(lowerSearch)
    );
  }

  // Paginação
  const indexOfLast = currentPage * prescriptionsPerPage;
  const indexOfFirst = indexOfLast - prescriptionsPerPage;
  const currentPrescriptions = filteredPrescriptions.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredPrescriptions.length / prescriptionsPerPage);

  return filteredPrescriptions.length > 0 ? (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentPrescriptions.map((prescription) => (
          <Card key={prescription.id} className="shadow-sm rounded-2xl border border-border border-primary/40 rounded-lg">
            <CardHeader>
              <CardTitle>{prescription.medication}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-black">
              {/* Conteúdo do card... */}
              <p><strong>Dosagem:</strong> {prescription.dosage}</p>
              <p><strong>Frequência:</strong> {prescription.frequency}</p>
              <p><strong>Instruções:</strong> {prescription.instructions}</p>
              <p><strong>Data de início:</strong> {new Date(prescription.startDate).toLocaleDateString()}</p>
              {prescription.endDate && (
                <p><strong>Data de término:</strong> {new Date(prescription.endDate).toLocaleDateString()}</p>
              )}
              {session?.user.role === 'PATIENT' && prescription.doctor && (
                <p className="font-semibold text-primary"><strong>Prescrito por:</strong> Dr(a). {prescription.doctor.name} ({prescription.doctor.specialty})</p>
              )}
              {session?.user.role === 'DOCTOR' && prescription.user && (
                <p><strong>Paciente:</strong> {prescription.user.name}</p>
              )}

              {session?.user.role === 'DOCTOR' && (
                <div>
                  <Label>Status</Label>
                  <Select
                    value={prescription.status}
                    onValueChange={(newStatus) => handleStatusChange(prescription.id, newStatus as 'ACTIVE' | 'COMPLETED' | 'ARCHIVED')}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Activa</SelectItem>
                      <SelectItem value="COMPLETED">Concluída</SelectItem>
                      <SelectItem value="ARCHIVED">Arquivada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controles de paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Anterior
          </Button>
          <span>Página {currentPage} de {totalPages}</span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  ) : (
    <p>Nenhuma prescrição {status.toLowerCase()} encontrada.</p>
  );
};


  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    return <div>Por favor faça login para ver as prescrições.</div>
  }


  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-white to-blue-50">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <h1 className="text-2xl font-bold mb-4">Prescrições</h1>
      {session?.user.role === 'DOCTOR' && (
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Pesquisar por paciente ou medicamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2"
          />
        </div>
      )}


      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ACTIVE">Activas ({prescriptions.filter(p => p.status === "ACTIVE").length})</TabsTrigger>
          <TabsTrigger value="COMPLETED">Concluídas</TabsTrigger>
          <TabsTrigger value="ARCHIVED">Arquivadas</TabsTrigger>
        </TabsList>
        <TabsContent value="ACTIVE">{isLoading ? ( 
          <div>Carregando...</div>
           ): ( 
           <> 
            <div className="space-y-4">
              {renderPrescriptions("ACTIVE")}
              {session?.user.role === "PATIENT" &&
                prescriptions.some((p) => p.status === "ACTIVE") && (
                  <div className="mt-6">
                    <PrescriptionPrintDownload
                      prescriptions={prescriptions.filter(
                        (p) => p.status === "ACTIVE"
                      )}
                    />
                  </div>
                )}
            </div>
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
                <Label>Paciente</Label>
                <PatientAutocomplete
                  value={selectedPatient || undefined}
                  onSelect={(patient) => {
                    console.log("Paciente selecionado:", patient)
                    setSelectedPatient(patient)
                    setNewPrescription((prev) => ({ ...prev, patientId: patient.id }))
                  }}
                />

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



