'use client'

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "./ui/button"

export function Header() {
  const { data: session } = useSession()

  // Renderiza navegação específica para admin
  if (session?.user?.role === 'ADMIN') {
    return (
      <header className="w-full border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/admin/dashboard" className="flex items-center">
            <span className="text-2xl font-bold">CardioCare</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/admin/pending-registrations" className="text-sm font-medium">
              Registos Pendentes
            </Link>
            <Link href="/admin/manage-users" className="text-sm font-medium">
              Gerenciar Usuários
            </Link>
            <Button variant="outline" asChild>
              <Link href="/api/auth/signout">Sair</Link>
            </Button>
          </nav>
        </div>
      </header>
    )
  }

  // Renderiza navegação para outros usuários
  return (
    <header className="w-full border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold">CardioCare</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium">
            Home
          </Link>
          
          {session ? (
            <>
              <Link href="/prediction" className="text-sm font-medium">
                Predição
              </Link>
              <Link href="/monitoring" className="text-sm font-medium">
                Monitoramento
              </Link>
              <Link href="/prescriptions" className="text-sm font-medium">
                Prescrições
              </Link>
              <Link href="/telemedicine" className="text-sm font-medium">
                Telemedicina
              </Link>
              <Button variant="outline" asChild>
                <Link href="/api/auth/signout">Sair</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/register">Registrar-se</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

