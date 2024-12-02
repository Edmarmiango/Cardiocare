import { useState, useEffect, useCallback } from 'react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useToast } from "../components/ui/use-toast"
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert"

interface ApiResponse {
  message?: string;
  error?: string;
}

export function ShareHealthData() {
  const [doctorEmail, setDoctorEmail] = useState('')
  const [isSharing, setIsSharing] = useState(false)
  const [sharedDoctors, setSharedDoctors] = useState<string[]>([])
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const { toast } = useToast()

  const fetchSharedDoctors = useCallback(async () => {
    try {
      const response = await fetch('/api/shared-health-data/doctors')
      if (!response.ok) {
        throw new Error('Falha ao buscar médicos compartilhados')
      }
      const data = await response.json()
      setSharedDoctors(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao buscar médicos compartilhados:', error)
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
      const response = await fetch('/api/health-data/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ doctorEmail }),
      })

      const data: ApiResponse = await response.json()

      if (response.ok) {
        setFeedback({ type: 'success', message: data.message || "Dados de saúde compartilhados com sucesso" })
        setDoctorEmail('')
        setSharedDoctors(prevDoctors => [...new Set([...prevDoctors, doctorEmail])])
        await fetchSharedDoctors()
      } else {
        setFeedback({ type: 'error', message: data.error || 'Falha ao compartilhar dados de saúde' })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar resposta do servidor'
      toast({
        title: "Erro",
        description: errorMessage,
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
          onChange={(e) => {
            setDoctorEmail(e.target.value)
            setFeedback(null)
          }}
          required
          disabled={isSharing}
          placeholder="Digite o email do médico"
        />
      </div>
      <Button type="submit" disabled={isSharing}>
        {isSharing ? "Compartilhando..." : "Compartilhar Dados"}
      </Button>
      {feedback && (
        <Alert variant={feedback.type === 'success' ? 'default' : 'destructive'}>
          <AlertTitle>{feedback.type === 'success' ? 'Sucesso' : 'Erro'}</AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}
      {sharedDoctors.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Médicos com acesso aos seus dados:</h3>
          <ul className="list-disc pl-5">
            {sharedDoctors.map((email) => (
              <li key={`doctor-${email}`}>{email}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  )
}











