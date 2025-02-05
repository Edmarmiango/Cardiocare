import DoctorDashboard from "../../../components/DoctorDashboard"
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../api/auth/[...nextauth]/auth-options'
import { redirect } from 'next/navigation'

export default async function DoctorDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'DOCTOR') {
    redirect('doctor/dashboard')
  }

  return <DoctorDashboard />
}

