"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Checkbox } from "../components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { jsPDF } from "jspdf"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "../components/ui/use-toast"

interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  instructions: string
  startDate: string
  endDate?: string
  doctor: {
    name: string
    specialty: string
  }
  userId: string
  user?: {
    name: string
  }
  patientId: string
}

interface PrescriptionPrintDownloadProps {
  prescriptions: Prescription[]
}

export function PrescriptionPrintDownload({ prescriptions }: PrescriptionPrintDownloadProps) {
  console.log("Prescriptions received:", prescriptions)
  console.log(
    "Prescriptions with userId:",
    prescriptions.filter((p) => p.userId),
  )
  const [selectedPrescriptions, setSelectedPrescriptions] = useState<string[]>([])
  const [patientNames, setPatientNames] = useState<{ [key: string]: string }>({})
  const { toast } = useToast()

  useEffect(() => {
    const fetchPatientNames = async () => {
      const patientIds = [
        ...new Set(prescriptions.map((p) => p.userId).filter((id) => id !== undefined && id !== null)),
      ]
      console.log("Unique patient IDs:", patientIds)
      const names: { [key: string]: string } = {}

      for (const id of patientIds) {
        try {
          console.log(`Fetching name for patient ID: ${id}`)
          const response = await fetch(`/api/patients/${id}`)
          if (response.ok) {
            const data = await response.json()
            names[id] = data.name
            console.log(`Successfully fetched name for patient ID ${id}: ${data.name}`)
          } else {
            console.error(`Failed to fetch patient name for ID ${id}. Status: ${response.status}`)
          }
        } catch (error) {
          console.error(`Error fetching patient name for ID ${id}:`, error)
        }
      }

      console.log("Final patient names:", names)
      setPatientNames(names)
    }

    fetchPatientNames()
  }, [prescriptions])

  const handleSelectPrescription = (prescriptionId: string) => {
    setSelectedPrescriptions((prev) =>
      prev.includes(prescriptionId) ? prev.filter((id) => id !== prescriptionId) : [...prev, prescriptionId],
    )
  }

  const generatePDF = () => {
    const doc = new jsPDF()
    let yOffset = 20

    const addFooter = () => {
      const pageHeight = doc.internal.pageSize.height
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text("Gerado por Cardiocare", 20, pageHeight - 20)
      doc.text("Contacto: 921 291 610 | Email: admin@cardiocare.com", 20, pageHeight - 15)
    }

    selectedPrescriptions.forEach((id, index) => {
      const prescription = prescriptions.find((p) => p.id === id)
      if (!prescription) return

      if (index > 0) {
        doc.addPage()
        yOffset = 20
      }

      doc.setFontSize(18)
      doc.setTextColor(0)
      doc.text("Prescrição Médica", 105, yOffset, { align: "center" })
      yOffset += 15

      const patientName = patientNames[prescription.userId] || "Nome do paciente não disponível"
      doc.setFontSize(14)
      doc.text(`Paciente: ${patientName}`, 20, yOffset)
      yOffset += 15

      doc.setFontSize(12)
      doc.text(`Medicamento: ${prescription.medication}`, 20, yOffset)
      yOffset += 10
      doc.text(`Dosagem: ${prescription.dosage}`, 20, yOffset)
      yOffset += 10
      doc.text(`Frequência: ${prescription.frequency}`, 20, yOffset)
      yOffset += 10
      doc.text(`Instruções: ${prescription.instructions}`, 20, yOffset)
      yOffset += 10
      doc.text(
        `Data de Início: ${format(new Date(prescription.startDate), "dd/MM/yyyy", { locale: ptBR })}`,
        20,
        yOffset,
      )
      yOffset += 10
      if (prescription.endDate) {
        doc.text(
          `Data de Término: ${format(new Date(prescription.endDate), "dd/MM/yyyy", { locale: ptBR })}`,
          20,
          yOffset,
        )
        yOffset += 10
      }
      doc.text(`Médico: Dr. ${prescription.doctor.name}`, 20, yOffset)
      yOffset += 10
      doc.text(`Especialidade: ${prescription.doctor.specialty}`, 20, yOffset)

      addFooter()
    })

    return doc
  }

  const handlePrint = () => {
    if (selectedPrescriptions.length === 0) {
      toast({
        title: "Nenhuma prescrição selecionada",
        description: "Por favor, selecione pelo menos uma prescrição para imprimir.",
        variant: "destructive",
      })
      return
    }
    const doc = generatePDF()
    doc.autoPrint()
    doc.output("dataurlnewwindow")
  }

  const handleDownload = () => {
    if (selectedPrescriptions.length === 0) {
      toast({
        title: "Nenhuma prescrição selecionada",
        description: "Por favor, selecione pelo menos uma prescrição para baixar.",
        variant: "destructive",
      })
      return
    }
    const doc = generatePDF()
    doc.save("prescricoes.pdf")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imprimir/Baixar Prescrições</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="selectAll"
              checked={selectedPrescriptions.length === prescriptions.length && prescriptions.length > 0}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedPrescriptions(prescriptions.map((p) => p.id))
                } else {
                  setSelectedPrescriptions([])
                }
              }}
            />
            <label
              htmlFor="selectAll"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Selecionar Tudo
            </label>
          </div>
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="flex items-center space-x-2">
              <Checkbox
                id={prescription.id}
                checked={selectedPrescriptions.includes(prescription.id)}
                onCheckedChange={() => handleSelectPrescription(prescription.id)}
              />
              <label
                htmlFor={prescription.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {prescription.medication} - {prescription.dosage}
              </label>
            </div>
          ))}
        </div>
        <div className="flex space-x-2 mt-4">
          <Button onClick={handlePrint}>Imprimir Selecionadas</Button>
          <Button onClick={handleDownload}>Baixar Selecionadas</Button>
        </div>
      </CardContent>
    </Card>
  )
}

