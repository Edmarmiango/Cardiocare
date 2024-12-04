'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { toast } from "../components/ui/use-toast"

interface Reminder {
  id: string
  type: string
  title: string
  description: string
  datetime: string
}

export default function PatientDashboard() {
  const { data: session } = useSession()
  const [reminders, setReminders] = useState<Reminder[]>([])

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await fetch('/api/reminders')
        if (response.ok) {
          const data = await response.json()
          setReminders(data)
        } else {
          throw new Error('Failed to fetch reminders')
        }
      } catch (error) {
        console.error('Error fetching reminders:', error)
        toast({
          title: "Error",
          description: "Failed to load reminders",
          variant: "destructive",
        })
      }
    }

    if (session?.user) {
      fetchReminders()
    }
  }, [session])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bem-vindo, Paciente</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Seu Resumo de Saúde</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Veja seus dados de saúde mais recentes e previsões aqui.</p>
            <Link href="/monitoramento" className="text-blue-500 hover:underline">
              Ver monitoramento
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Você não tem consultas agendadas.</p>
            <Link href="/agendar-consulta" className="text-blue-500 hover:underline">
              Agendar consulta
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Predição de Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Faça uma avaliação do seu risco cardiovascular.</p>
            <Link href="/predicao" className="text-blue-500 hover:underline">
              Fazer predição
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Suas Prescrições</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Veja suas prescrições médicas atuais.</p>
            <Link href="/prescricoes" className="text-blue-500 hover:underline">
              Ver prescrições
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Seus Lembretes</CardTitle>
          </CardHeader>
          <CardContent>
            {reminders.length > 0 ? (
              <ul className="space-y-2">
                {reminders.map((reminder) => (
                  <li key={reminder.id} className="flex justify-between items-center">
                    <span>{reminder.title}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(reminder.datetime).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Você não tem lembretes no momento.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


