'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { useSession } from "next-auth/react"
import { toast } from "../components/ui/use-toast"
import { ReminderList } from './ReminderList'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"

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
          <CardDescription>Veja seus dados de saúde mais recentes e previsões aqui.</CardDescription>
            <Button asChild className="mt-4">
              <Link href="/monitoring">Ver monitoramento</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
          </CardHeader>
          <CardContent>
          <CardDescription>Veja suas próximas consultas agendadas.</CardDescription>
            <Button asChild className="mt-4">
              <Link href="/telemedicine">Agendar consulta</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Predição de Risco</CardTitle>
          </CardHeader>
          <CardContent>
          <CardDescription>Faça uma avaliação do seu risco cardiovascular.</CardDescription>
            <Button asChild className="mt-4">
              <Link href="/prediction">Fazer predição</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Suas Prescrições</CardTitle>
          </CardHeader>
          <CardContent>
          <CardDescription>Veja suas prescrições médicas atuais.</CardDescription>
            <Button asChild className="mt-4">
              <Link href="/prescriptions">Ver prescrições</Link>
            </Button>
          </CardContent>
        </Card>
        <ReminderList />
      </div>
    </div>
  )
}




