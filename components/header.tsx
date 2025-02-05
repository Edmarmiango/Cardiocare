'use client'

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "../components/ui/button"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"

export function Header() {
 const { data: session, status } = useSession()
 const router = useRouter()

 const [profileImage, setProfileImage] = useState<string | null>(null);

 useEffect(() => {
  console.log('Session:', session); // For debugging
  if (session?.user?.image) {
    setProfileImage(session.user.image);
  } else if (session?.user?.profileImage) {
    setProfileImage(session.user.profileImage);
  } else {
    setProfileImage('/placeholder.svg'); // Fallback image
  }
}, [session]);

 useEffect(() => {
   // Verificação periódica da validade da sessão
   const interval = setInterval(() => {
     if (session && new Date(session.expires) < new Date()) {
       signOut({ redirect: false })
       router.push('/login')
     }
   }, 60000) // Verifica a cada minuto

   return () => clearInterval(interval)
 }, [session, router])

 const handleSignOut = async () => {
   await signOut({ redirect: false })
   // Limpa manualmente os cookies relacionados à sessão
   document.cookie = 'next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
   document.cookie = 'next-auth.csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
   router.push('/login')
 }

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
             Excluir Usuários
           </Link>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={profileImage || '/placeholder.svg'} alt={session?.user?.name || 'User'} />
                  <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
         </nav>
       </div>
     </header>
   )
 }

 // Renderiza navegação para médicos
 if (session?.user?.role === 'DOCTOR') {
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
         
         {status === 'authenticated' ? (
           <>
             <Link href="/doctor/dashboard" className="text-sm font-medium">
               Dashboard
             </Link>
             <Link href="/prediction" className="text-sm font-medium">
               Predição
             </Link>
             <Link href="/prescriptions" className="text-sm font-medium">
               Prescrições
             </Link>
             <Link href="/telemedicine" className="text-sm font-medium">
               Telemedicina
             </Link>
             <Link href="/chat" className="text-sm font-medium flex items-center">
               <MessageCircle className="mr-2 h-4 w-4" />
               Chat
             </Link>
             {status === 'authenticated' && session.user.role === 'DOCTOR' && (
            <Link href="/doctor/shared-health-data" className="text-sm font-medium">
              Dados Compartilhados
            </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={profileImage || '/placeholder.svg'} alt={session?.user?.name || 'User'} />
                  <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
 )}


 // Renderiza navegação para paciente
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
        
        {status === 'authenticated' ? (
          <>
            <Link href="/patient/dashboard" className="text-sm font-medium">
               Dashboard
             </Link>
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
            <Link href="/chat" className="text-sm font-medium flex items-center">
               <MessageCircle className="mr-2 h-4 w-4" />
               Chat
             </Link>
    
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={profileImage || '/placeholder.svg' } alt={session?.user?.name || 'User'} />
                  <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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



