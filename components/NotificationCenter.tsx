import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from "next-auth/react"

export function NotificationCenter() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications()
    }
  }, [session])

  const fetchNotifications = async () => {
    const response = await fetch(`/api/notifications?userId=${session.user.id}`)
    const data = await response.json()
    setNotifications(data)
  }

  const markAsRead = async (notificationId) => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notificationId }),
    })
    fetchNotifications()
  }

  return (
    <div className="relative">
      <Button onClick={() => setIsOpen(!isOpen)} variant="ghost">
        <Bell />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
            {notifications.length}
          </span>
        )}
      </Button>
      {isOpen && (
        <Card className="absolute right-0 mt-2 w-64 z-10">
          <CardContent className="p-4">
            {notifications.length === 0 ? (
              <p>Nenhuma notificação</p>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="mb-2 p-2 bg-gray-100 rounded">
                  <p>{notification.message}</p>
                  <Button onClick={() => markAsRead(notification.id)} variant="link" size="sm">
                    Marcar como lida
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

