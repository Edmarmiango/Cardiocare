'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
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
  
  export default function ManageUsersPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
  
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
        const response = await fetch('/api/users/approved')
        if (!response.ok) {
          throw new Error('Erro ao buscar usuários')
        }
        const data = await response.json()
        setUsers(data)
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
            <CardTitle>Gerenciar Usuários</CardTitle>
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
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.crm || 'N/A'}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleDelete(user.id)} variant="destructive">Excluir</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Não há usuários cadastrados
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
  
  