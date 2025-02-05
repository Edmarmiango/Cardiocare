import { redirect } from 'next/navigation'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../api/auth/[...nextauth]/auth-options'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  // Redirect based on user role
  switch (session.user.role) {
    case 'ADMIN':
      redirect('/admin/dashboard')
    case 'DOCTOR':
      redirect('/doctor/dashboard')
    case 'PATIENT':
      redirect('/patient/dashboard')
    default:
      redirect('/')
  }
}




