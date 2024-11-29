'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import Image from 'next/image'


type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  crm: string | null;
  imageUrl: string | null;
}

export default function PendingRegistrationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/')
    } else {
      fetchPendingUsers()
    }
  }, [session, status, router])

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch('/api/users/pending')
      if (!response.ok) {
        throw new Error('Erro ao buscar usuários pendentes')
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching pending users:', error)
    }
  }

  const handleApprove = async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/approve`, { method: 'POST' })
    if (response.ok) {
      fetchPendingUsers()
    }
  }

  const handleReject = async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/reject`, { method: 'POST' })
    if (response.ok) {
      fetchPendingUsers()
    }
  }

  if (status === 'loading') {
    return <div>Carregando...</div>
  }

  if (session?.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Registos Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>CRM</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <Image
                            src={user.imageUrl || '/placeholder.svg'}
                            alt={`Profile picture of ${user.name}`}
                            width={48}
                            height={48}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{user.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.crm || 'Não informado'}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleApprove(user.id)} className="mr-2">Aprovar</Button>
                    <Button onClick={() => handleReject(user.id)} variant="destructive">Rejeitar</Button>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Não há registos pendentes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


