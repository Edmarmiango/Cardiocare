import { useState } from 'react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { toast } from "../components/ui/use-toast"

export function ShareHealthData() {
  const [doctorEmail, setDoctorEmail] = useState('')
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSharing(true)
    try {
      const response = await fetch('/api/shared-health-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ doctorEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: data.message || "Dados de saúde compartilhados com sucesso",
        })
        setDoctorEmail('')
      } else {
        throw new Error(data.error || 'Falha ao compartilhar dados de saúde')
      }
    } catch (error) {
      console.error('Erro ao compartilhar dados de saúde:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao compartilhar dados de saúde",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <form onSubmit={handleShare} className="space-y-4">
      <div>
        <Label htmlFor="doctorEmail">Email do Médico</Label>
        <Input
          id="doctorEmail"
          type="email"
          value={doctorEmail}
          onChange={(e) => setDoctorEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isSharing}>
        {isSharing ? "Compartilhando..." : "Compartilhar Dados"}
      </Button>
    </form>
  )
}

