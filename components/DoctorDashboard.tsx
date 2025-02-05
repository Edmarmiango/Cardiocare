'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import Link from "next/link"
import { ReminderManager } from './ReminderManager'
import { Button } from "../components/ui/button"

export default function DoctorDashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bem-vindo, Doutor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
          </CardHeader>
          <CardContent>
          <CardDescription>Veja suas próximas consultas agendadas.</CardDescription>
            <Button asChild className="mt-4">
              <Link href="/telemedicine">Ver consultas</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
          <CardDescription>Gerencie seus pacientes e veja seus históricos médicos.</CardDescription>
            <Button asChild className="mt-4">
              <Link href="/doctor/patients">Ver pacientes</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Prescrições</CardTitle>
          </CardHeader>
          <CardContent>
          <CardDescription>Crie e gerencie prescrições médicas.</CardDescription>
            <Button asChild className="mt-4">
              <Link href="/prescriptions">Gerenciar prescrições</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Análise de Dados</CardTitle>
          </CardHeader>
          <CardContent>
          <CardDescription>Acesse análises e estatísticas dos seus pacientes.</CardDescription>
            <Button asChild className="mt-4">
              <Link href="/analysis">Ver análises</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <ReminderManager />
      </div>
    </div>
  )
}


