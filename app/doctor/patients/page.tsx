import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/auth-options"
import { redirect } from 'next/navigation'
import prisma from "../../../lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import Link from 'next/link'
import { Button } from "../../../components/ui/button"

export default async function PatientsPage() {
  const session = await getServerSession(authOptions)
 
  if (!session || session.user.role !== 'DOCTOR') {
    redirect('/dashboard')
  }

  const patients = await prisma.user.findMany({
    where: { role: 'PATIENT' },
    select: { id: true, name: true, email: true }
  })

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Pacientes</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {patients.map((patient) => (
          <Card key={patient.id}>
            <CardHeader>
              <CardTitle>{patient.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{patient.email}</p>
              <Button asChild className="mt-2">
              <Link href={`/doctor/patients/${patient.id}`}>Ver histórico médico</Link>
            </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

