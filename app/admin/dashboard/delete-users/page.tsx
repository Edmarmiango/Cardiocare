'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table"
import Link from 'next/link'

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    crm: string | null;
  }
  
  export default function DeleteUsersPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [pendingUsers, setPendingUsers] = useState<User[]>([])
    const [approvedUsers, setApprovedUsers] = useState<User[]>([])
  
    useEffect(() => {
      if (status === 'unauthenticated') {
        router.push('/login')
      } else if (session?.user?.role !== 'ADMIN') {
        router.push('/')
      } else {
        fetchUsers()
      }
    }, [session, status, router])
  
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        if (!response.ok) {
          throw new Error('Erro ao buscar usuários')
        }
        const data = await response.json()
        setPendingUsers(data.filter((user: User) => user.status === 'PENDING'))
        setApprovedUsers(data.filter((user: User) => user.status === 'APPROVED'))
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
  
    const handleDelete = async (userId: string) => {
      if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
        const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
        if (response.ok) {
          fetchUsers()
        }
      }
    }
  
    const renderUserTable = (users: User[], title: string) => (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>CRM</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.crm || 'N/A'}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleDelete(user.id)} variant="destructive">Excluir</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  
    if (status === 'loading') {
      return <div>Carregando...</div>
    }
  
    if (session?.user?.role !== 'ADMIN') {
      return null
    }
  
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Gerenciar Usuários</CardTitle>
            <Button asChild>
              <Link href="/admin/dashboard">Voltar para o Dashboard</Link>
            </Button>
          </CardHeader>
        </Card>
        {renderUserTable(pendingUsers, "Usuários Pendentes")}
        {renderUserTable(approvedUsers, "Usuários Aprovados")}
      </div>
    )
  }
  
  