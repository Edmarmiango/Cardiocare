'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { ScrollArea } from "../components/ui/scroll-area"
import { toast } from "../components/ui/use-toast"
import { useRouter } from 'next/navigation'
import { ArrowLeft, Paperclip, ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  fileUrl?: string
  fileType?: 'image' | 'document'
}

interface ChatProps {
  otherUserId: string
  otherUserName: string
}

export function Chat({ otherUserId, otherUserName }: ChatProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?otherUserId=${otherUserId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch messages')
        }
        const data = await response.json()
        setMessages(data)
        scrollToBottom()
      } catch (error) {
        console.error('Error fetching messages:', error)
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        })
      }
    }

    if (session?.user) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 5000) // Poll for new messages every 5 seconds
      return () => clearInterval(interval)
    }
  }, [session, otherUserId])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && !file) || isLoading) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('content', newMessage)
      formData.append('receiverId', otherUserId)
      if (file) {
        formData.append('file', file)
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const sentMessage = await response.json()
      setMessages([...messages, sentMessage])
      setNewMessage('')
      setFile(null)
      scrollToBottom()
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <CardTitle>Chat com {otherUserName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <ScrollArea className="flex-grow mb-4">
          <div className="space-y-4 p-4" ref={scrollAreaRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[70%] break-words ${
                    message.senderId === session?.user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.fileUrl && message.fileType === 'image' && (
                    <Image
                      src={message.fileUrl}
                      alt="Uploaded image"
                      width={200}
                      height={200}
                      className="mb-2 rounded"
                    />
                  )}
                  {message.fileUrl && message.fileType === 'document' && (
                    <a
                      href={message.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View Document
                    </a>
                  )}
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          <Button type="button" onClick={triggerFileInput} variant="outline">
            {file ? <ImageIcon className="h-4 w-4" /> : <Paperclip className="h-4 w-4" />}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar"}
          </Button>
        </form>
        {file && <p className="mt-2 text-sm text-muted-foreground">File selected: {file.name}</p>}
      </CardContent>
    </Card>
  )
}




