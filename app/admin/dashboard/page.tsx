'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import Link from 'next/link'
import { Users, UserCheck, ClockIcon } from 'lucide-react'
import { toast } from "../../../components/ui/use-toast"

type DashboardStats = {
  totalUsers: number
  pendingDoctors: number
  approvedDoctors: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingDoctors: 0,
    approvedDoctors: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/')
    } else {
      fetchDashboardStats()
    }
  }, [session, status, router])

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/dashboard-stats')
      
      if (!response.ok) {
        throw new Error('Falha ao buscar estatísticas')
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setStats(data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as estatísticas do dashboard"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">Carregando estatísticas...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (session?.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard do Administrador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                    <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Médicos Aprovados</p>
                    <h3 className="text-2xl font-bold">{stats.approvedDoctors}</h3>
                  </div>
                  <UserCheck className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Médicos Pendentes</p>
                    <h3 className="text-2xl font-bold">{stats.pendingDoctors}</h3>
                  </div>
                  <ClockIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-2">
            <Button asChild className="w-full bg-primary">
              <Link href="/admin/pending-registrations">
                Ver Registos Pendentes ({stats.pendingDoctors})
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/admin/manage-users">Gerenciar Usuários</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


