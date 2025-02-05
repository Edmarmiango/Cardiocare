"use client"

import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

interface DataSourceSelectorProps {
  onSourceChange: (source: "manual" | "googleFit") => void
  onGoogleFitAuth: () => void
  isGoogleFitConnected: boolean
}

export function DataSourceSelector({ onSourceChange, onGoogleFitAuth, isGoogleFitConnected }: DataSourceSelectorProps) {
  const handleGoogleFitAuth = async () => {
    try {
      window.location.href = "/api/auth/google-fit"
    } catch (error) {
      console.error("Error initiating Google Fit auth:", error)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Select onValueChange={(value) => onSourceChange(value as "manual" | "googleFit")}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Selecione a fonte de dados" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="manual">Entrada Manual</SelectItem>
          <SelectItem value="googleFit">Google Fit</SelectItem>
        </SelectContent>
      </Select>
      {!isGoogleFitConnected && (
        <Button onClick={handleGoogleFitAuth} className="flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0z" />
            <path fill="#fff" d="M9.5 6.5v11h2v-11h-2zm3 0v11h2v-11h-2z" />
          </svg>
          Conectar Google Fit
        </Button>
      )}
    </div>
  )
}


