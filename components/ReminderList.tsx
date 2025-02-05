import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { toast } from "../components/ui/use-toast"

interface Reminder {
  id: string
  type: 'appointment' | 'medication'
  title: string
  description: string
  datetime: string
}

export function ReminderList() {
  const [reminders, setReminders] = useState<Reminder[]>([])

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await fetch('/api/reminders')
        if (!response.ok) {
          throw new Error('Failed to fetch reminders')
        }
        const data = await response.json()
        setReminders(data)
      } catch (error) {
        console.error('Error fetching reminders:', error)
        toast({
          title: "Error",
          description: "Failed to load reminders",
          variant: "destructive",
        })
      }
    }

    fetchReminders()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seus lembretes</CardTitle>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <p>Nenhum lembrete agendado.</p>
        ) : (
          <ul className="space-y-2">
            {reminders.map((reminder) => (
              <li key={reminder.id} className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{reminder.title}</h3>
                  <p className="text-sm text-muted-foreground">{reminder.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(reminder.datetime).toLocaleString()}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary text-primary-foreground">
                  {reminder.type}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

