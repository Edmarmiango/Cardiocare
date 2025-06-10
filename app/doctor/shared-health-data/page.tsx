"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { HealthDataChart } from "../../../components/HealthDataChart"
import { toast } from "../../../components/ui/use-toast"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert"
import { Button } from "../../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { Input } from "../../../components/ui/input"
import { Pagination } from "../../../components/Pagination"

interface SharedHealthData {
  id: string
  patientId: string
  patientName: string
  healthData: {
    date: string
    systolic: number
    diastolic: number
    heartRate: number
    glucose: number
    cholesterol: number
  }[]
}

interface ApiError {
  error: string
  message?: string
  details?: string
  status?: number
}

const ITEMS_PER_PAGE = 5

export default function SharedHealthDataPage() {
  const { data: session, status } = useSession()
  const [sharedData, setSharedData] = useState<SharedHealthData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchSharedHealthData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch('/api/shared-health-data/')
      if (!res.ok) {
        const err: ApiError = await res.json()
        throw new Error(err.details || err.error || 'Erro ao buscar dados')
      }
      const data = await res.json()
      setSharedData(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao buscar dados'
      setError(msg)
      toast({ title: "Erro", description: msg, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveSharing = async (id: string) => {
    setIsRemoving(id)
    try {
      const res = await fetch(`/api/shared-health-data/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err: ApiError = await res.json()
        throw new Error(err.details || err.error || 'Erro ao remover compartilhamento')
      }
      toast({ title: "Sucesso", description: "Compartilhamento removido com sucesso" })
      setSharedData(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      toast({ title: "Erro", description: msg, variant: "destructive" })
    } finally {
      setIsRemoving(null)
    }
  }

  const exportToPdf = async (patientName: string, chartId: string) => {
    const chartElement = document.getElementById(chartId)
    if (!chartElement) {
      toast({ title: "Erro", description: "Gráfico não encontrado.", variant: "destructive" })
      return
    }
    const canvas = await html2canvas(chartElement)
    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF()
    pdf.setFontSize(16)
    pdf.text(`Dados de Saúde - Paciente: ${patientName}`, 10, 20)

    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width

    pdf.addImage(imgData, "PNG", 10, 30, pdfWidth, imgHeight)
    pdf.save(`dados-saude-${patientName}.pdf`)
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'DOCTOR') {
      fetchSharedHealthData()
    }
  }, [status, session])

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-muted-foreground">Carregando dados compartilhados...</p>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'DOCTOR') {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription>Esta página é exclusiva para médicos.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const filteredData = sharedData.filter(p =>
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)


  function normalizeHealthData(data: SharedHealthData["healthData"]) {
    return data.map(entry => ({
      ...entry,
      systolic: entry.systolic > 0 ? entry.systolic : undefined,
      diastolic: entry.diastolic > 0 ? entry.diastolic : undefined,
      heartRate: entry.heartRate > 0 ? entry.heartRate : undefined,
      glucose: entry.glucose > 0 ? entry.glucose : undefined,
      cholesterol: entry.cholesterol > 0 ? entry.cholesterol : undefined,
      date: entry.date, // garante que a data não é alterada
    }))
  }

  return (
    <div className="container mx-auto bg-gradient-to-br from-white to-blue-50 p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Pacientes com Dados Compartilhados</h1>

      <Input
        placeholder="Pesquisar paciente..."
        value={searchTerm}
        onChange={e => {
          setSearchTerm(e.target.value)
          setCurrentPage(1)
        }}
        className="max-w-sm border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && filteredData.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Nenhum dado compartilhado no momento.
          </CardContent>
        </Card>
      ) : (
        paginatedData.map(patient => (
          <Card key={patient.id} className="bg-white border border-primary/40 rounded-2xl shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle>Paciente: {patient.patientName}</CardTitle>
              <div className="flex gap-2">
                <Button
                  className="px-4 py-2 text-sm rounded-md bg-black text-white hover:bg-gray-800"
                  variant="outline"
                  size="sm"
                  onClick={() => exportToPdf(patient.patientName, `chart-${patient.id}`)}
                >
                  Exportar PDF
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Remover Compartilhamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmar Remoção</DialogTitle>
                    </DialogHeader>
                    <p>Deseja realmente remover o acesso aos dados deste paciente?</p>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => document.querySelector('button[aria-label="Close"]')?.click()}>
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleRemoveSharing(patient.id)
                          document.querySelector('button[aria-label="Close"]')?.click()
                        }}
                        disabled={isRemoving === patient.id}
                      >
                        {isRemoving === patient.id ? 'Removendo...' : 'Confirmar'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div id={`chart-${patient.id}`}>
                <HealthDataChart data={normalizeHealthData(patient.healthData)} />
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  )
}







