"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useToast } from "../components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"

interface SharedDoctor {
  id: string
  name: string
  email: string
  sharedHealthDataId: string
}

export function ShareHealthData() {
  const [doctorEmail, setDoctorEmail] = useState("")
  const [isSharing, setIsSharing] = useState(false)
  const [sharedDoctors, setSharedDoctors] = useState<SharedDoctor[]>([])
  const { toast } = useToast()

  const fetchSharedDoctors = useCallback(async () => {
    try {
      const response = await fetch("/api/shared-health-data/doctors")
      if (!response.ok) {
        throw new Error("Falha ao buscar médicos compartilhados")
      }
      const data = await response.json()
      setSharedDoctors(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Erro ao buscar médicos compartilhados:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de médicos compartilhados",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    fetchSharedDoctors()
  }, [fetchSharedDoctors])

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!doctorEmail) {
      toast({
        title: "Erro",
        description: "Por favor, insira o email do médico",
        variant: "destructive",
      })
      return
    }

    setIsSharing(true)
    try {
      const response = await fetch("/api/health-data/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ doctorEmail }),
      })
      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: data.message || "Dados de saúde compartilhados com sucesso",
        })
        setDoctorEmail("")
        await fetchSharedDoctors()
      } else {
        toast({
          title: "Erro",
          description: data.error || "Falha ao compartilhar dados de saúde",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao compartilhar dados de saúde:", error)
      toast({
        title: "Erro",
        description: "Erro ao processar resposta do servidor",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleRemoveShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/shared-health-data/${shareId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Compartilhamento de dados removido com sucesso",
        })
        await fetchSharedDoctors()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao remover compartilhamento de dados")
      }
    } catch (error) {
      console.error("Error removing health data share:", error)
      toast({
        title: "Erro",
        description: "Falha ao remover compartilhamento de dados",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compartilhar Dados de Saúde</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <Label htmlFor="doctorEmail">Email do Médico</Label>
            <Input
              id="doctorEmail"
              type="email"
              value={doctorEmail}
              onChange={(e) => setDoctorEmail(e.target.value)}
              required
              disabled={isSharing}
              placeholder="Digite o email do médico"
            />
          </div>
          <Button type="submit" disabled={isSharing}>
            {isSharing ? "Compartilhando..." : "Compartilhar Dados"}
          </Button>
        </form>
        {sharedDoctors.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Médicos com acesso aos seus dados:</h3>
            <ul className="space-y-2">
              {sharedDoctors.map((doctor) => (
                <li key={doctor.id} className="flex justify-between items-center">
                  <span>
                    {doctor.name} ({doctor.email})
                  </span>
                  <Button variant="destructive" size="sm" onClick={() => handleRemoveShare(doctor.sharedHealthDataId)}>
                    Remover
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

