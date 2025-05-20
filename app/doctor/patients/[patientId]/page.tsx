import { notFound } from 'next/navigation'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../../api/auth/[...nextauth]/auth-options'
import { redirect } from 'next/navigation'
import prisma from '../../../../lib/prisma'
import { Role } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { format } from 'date-fns'

interface HealthData {
  id: string
  date: Date
  systolic: number | null
  diastolic: number | null
  heartRate: number | null
  glucose: number | null
  cholesterol: number | null
  source: "manual" | "googleFit"
}

interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  startDate: Date
  endDate?: Date | null
}

async function fetchGoogleFitData(patientId: string): Promise<HealthData[]> {
  const sharedData = await prisma.sharedHealthData.findFirst({
    where: { patientId },
    select: { googleFitData: true },
  })

  if (sharedData?.googleFitData) {
    try {
      const parsedData = JSON.parse(sharedData.googleFitData)
      return parsedData.map((item: any) => ({
        ...item,
        date: new Date(item.date),
        source: "googleFit",
      }))
    } catch (error) {
      console.error("Error parsing Google Fit data:", error)
    }
  }

  return []
}

export default async function PatientHistoryPage({ params }: { params: { patientId: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "DOCTOR") {
    redirect("/dashboard")
  }

  const patient = await prisma.user.findUnique({
    where: { id: params.patientId, role: Role.PATIENT },
    include: {
      healthData: { orderBy: { date: "desc" } },
      prescriptions: {
        where: { doctorId: session.user.id },
        orderBy: { startDate: "desc" },
      },
    },
  })

  if (!patient) {
    notFound()
  }

  const googleFitData = await fetchGoogleFitData(params.patientId)

  // Combine manual and Google Fit data
  const allHealthData: HealthData[] = [
    ...patient.healthData.map((data) => ({ ...data, source: "manual" as const })),
    ...googleFitData,
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Histórico Médico de {patient.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Dados de Saúde</CardTitle>
        </CardHeader>
        <CardContent>
          {allHealthData.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pressão Sistólica
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pressão Diastólica
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequência Cardíaca
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Glicose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colesterol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fonte
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allHealthData.map((data: HealthData) => (
                  <tr key={data.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{format(data.date, "dd/MM/yyyy")}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{data.systolic ?? "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{data.diastolic ?? "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{data.heartRate ?? "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{data.glucose ?? "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{data.cholesterol ?? "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {data.source === "manual" ? "Manual" : "Google Fit"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Nenhum dado de saúde encontrado.</p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Prescrições</CardTitle>
        </CardHeader>
        <CardContent>
          {patient.prescriptions.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dosagem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequência
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Início
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Término
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patient.prescriptions.map((prescription: Prescription) => (
                  <tr key={prescription.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{prescription.medication}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{prescription.dosage}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{prescription.frequency}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{format(prescription.startDate, "dd/MM/yyyy")}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {prescription.endDate ? format(prescription.endDate, "dd/MM/yyyy") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Nenhuma prescrição encontrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

