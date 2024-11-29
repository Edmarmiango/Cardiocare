import { redirect } from 'next/navigation'
import { getServerSession } from "next-auth"
import { authOptions } from '../api/auth/[...nextauth]/auth-options'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return <>{children}</>
}

