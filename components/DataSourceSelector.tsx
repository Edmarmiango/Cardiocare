"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { useToast } from "../components/ui/use-toast"

interface DataSourceSelectorProps {
  onGoogleFitAuth: () => void
  isGoogleFitConnected: boolean
}

export function DataSourceSelector({ onGoogleFitAuth, isGoogleFitConnected }: DataSourceSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleGoogleFitAuth = async () => {
    setIsLoading(true)
    try {
      console.log("Iniciando autenticação do Google Fit")
      const response = await fetch("/api/auth/google-fit", {
        redirect: "follow",
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log("Resposta da API de autenticação:", data)
      if (data.url) {
        console.log("Redirecionando para:", data.url)
        window.location.href = data.url
      } else {
        throw new Error("Failed to get Google Fit auth URL")
      }
    } catch (error) {
      console.error("Error initiating Google Fit auth:", error)
      toast({
        title: "Erro",
        description: "Falha ao iniciar autenticação com o Google Fit. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {!isGoogleFitConnected ? (
        <Button onClick={handleGoogleFitAuth} disabled={isLoading} className="flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0z" />
            <path fill="#fff" d="M9.5 6.5v11h2v-11h-2zm3 0v11h2v-11h-2z" />
          </svg>
          {isLoading ? "Conectando..." : "Conectar Google Fit"}
        </Button>
      ) : (
        <p className="text-green-600">Google Fit conectado</p>
      )}
    </div>
  )
}

