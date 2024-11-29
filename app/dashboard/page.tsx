import { redirect } from 'next/navigation'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/auth-options"
import PatientDashboard from '../../components/PatientDashboard'
import DoctorDashboard from '../../components/DoctorDashboard'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  // Redirecionar admin para o dashboard administrativo
  if (session.user.role === 'ADMIN') {
    redirect('/admin/dashboard')
  }

  // Renderizar o dashboard apropriado com base na role do usuário
  return session.user.role === 'DOCTOR' ? <DoctorDashboard /> : <PatientDashboard />
}


