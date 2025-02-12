import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getRemindersForUser } from "../lib/reminderService"
import { Loader2 } from "lucide-react"

interface Reminder {
  id: string
  title: string
  description: string
  datetime: string
  type: "medication" | "appointment" | "exam"
}

export function ReminderList() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReminders() {
      try {
        const fetchedReminders = await getRemindersForUser()
        setReminders(fetchedReminders)
      } catch (err) {
        console.error("Error fetching reminders:", err)
        setError("Falha ao carregar lembretes. Por favor, tente novamente mais tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReminders()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Carregando lembretes...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!reminders || reminders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Nenhum lembrete encontrado.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
    <CardHeader>
      <CardTitle>Seus Lembretes</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {reminders.map((reminder) => (
          <li key={reminder.id} className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{reminder.title}</h3>
              <p className="text-sm text-gray-500">{reminder.description}</p>
              <p className="text-sm text-gray-500">{format(new Date(reminder.datetime), "PPpp", { locale: ptBR })}</p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                reminder.type === "medication"
                  ? "bg-blue-100 text-blue-800"
                  : reminder.type === "appointment"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {reminder.type === "medication" ? "Medicação" : reminder.type === "appointment" ? "Consulta" : "Exame"}
            </span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
)
}