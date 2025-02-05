import PatientDashboard from "../../../components/PatientDashboard"
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../api/auth/[...nextauth]/auth-options'
import { redirect } from 'next/navigation'

export default async function PatientDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'PATIENT') {
    redirect('/dashboard')
  }

  return <PatientDashboard />
}

