'use client'

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "../components/ui/button"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle } from 'lucide-react'
import { UserAvatar } from "./UserAvatar"
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "../components/ui/dropdown-menu"

interface UserData {
  name: string
  email: string
  profileImage: string | null
}

export function Header() {
 const { data: session, status } = useSession()
 const router = useRouter()
 const [userData, setUserData] = useState<UserData | null>(null)
 const [isLoading, setIsLoading] = useState(true)


 useEffect(() => {
  if (session?.user?.id) {
    setIsLoading(true)
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched user data:", data)
        setUserData(data)
      })
      .catch((error) => {
        console.error("Error fetching user data:", error)
        setUserData(null)
      })
      .finally(() => setIsLoading(false))
  } else {
    setIsLoading(false)
    setUserData(null)
  }
}, [session])



const renderAvatar = () => {
  if (isLoading) {
    return <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
  }

  if (userData && userData.name) {
    return (
      <UserAvatar
        user={{
          name: userData.name,
          profileImage: userData.profileImage || "",
        }}
        className="w-10 h-10"
      />
    )
  }

  return <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
}

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
     <header className="w-full border-b bg-primary text-primary-foreground shadow-sm">
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
                <Avatar className="cursor-pointer">
                      {session?.user && (
                      <UserAvatar
                        user={{
                          name: session.user.name || "",
                          profileImage: session.user.image || "",
                        }}
                        className="w-10 h-10"
                      />
                    )}
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
   <header className="w-full border-b bg-primary text-primary-foreground shadow-sm">
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
                <Avatar className="cursor-pointer">
                   {renderAvatar()}
                  </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/edit">Editar Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Configurações</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onSelect={handleSignOut}>
                    Sair
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
           </>
         ) : (
           <>
             
              <Link className="text-sm font-medium" href="/register">Registrar-se</Link>
               <Link className="text-sm font-medium" href="/login">Entrar</Link>
            
           </>
         )}
       </nav>
     </div>
   </header>
 )}


 // Renderiza navegação para paciente
 return (
  <header className="w-full border-b bg-primary text-primary-foreground shadow-sm">
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
                <Avatar className="cursor-pointer">
                    {renderAvatar()}
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/edit">Editar Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Configurações</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onSelect={handleSignOut}>
                    Sair
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            
              <Link href="/register" className="text-sm font-medium">Registrar-se</Link>
              <Link href="/login" className="text-sm font-medium">Entrar</Link>
         
          </>
        )}
      </nav>
    </div>
  </header>
)
}



