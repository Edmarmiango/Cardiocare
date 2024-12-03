'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import Link from 'next/link'
import { toast } from "../components/ui/use-toast"

interface ChatPartner {
  id: string
  name: string
  role: 'DOCTOR' | 'PATIENT'
}

export function ChatList() {
  const { data: session } = useSession()
  const [chatPartners, setChatPartners] = useState<ChatPartner[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchChatPartners = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/chat-partners')
        if (!response.ok) {
          throw new Error('Failed to fetch chat partners')
        }
        const data = await response.json()
        setChatPartners(data)
      } catch (error) {
        console.error('Error fetching chat partners:', error)
        toast({
          title: "Error",
          description: "Failed to load chat partners",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchChatPartners()
    }
  }, [session])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Carregando conversas...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suas Conversas</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {chatPartners.length === 0 ? (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {session?.user?.role === 'DOCTOR' 
                ? 'Nenhum paciente disponível para chat.'
                : 'Nenhum médico disponível para chat.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {chatPartners.map((partner) => (
              <Button
                key={partner.id}
                asChild
                variant="outline"
                className="w-full justify-start"
              >
                <Link href={`/chat/${partner.id}`}>
                  <span className="flex items-center">
                    <span className="mr-2">{partner.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({partner.role === 'DOCTOR' ? 'Médico' : 'Paciente'})
                    </span>
                  </span>
                </Link>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
