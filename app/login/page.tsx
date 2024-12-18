'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert"

export default function Login() {
 const [email, setEmail] = useState('')
 const [password, setPassword] = useState('')
 const [isLoading, setIsLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const router = useRouter()

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)

  try {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })

    if (result?.error) {
      setError('Email ou senha incorrecta')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  } catch (error) {
    setError('Ocorreu um erro ao tentar fazer login')
  } finally {
    setIsLoading(false)
  }
 }

 return (
   <div className="container mx-auto flex h-screen items-center justify-center">
     <Card className="w-full max-w-md">
       <CardHeader>
         <CardTitle>Login</CardTitle>
       </CardHeader>
       <CardContent>
         <form onSubmit={handleSubmit} className="space-y-4">
           <div className="space-y-2">
             <Label htmlFor="email">Email</Label>
             <Input
               id="email"
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
               disabled={isLoading}
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="password">Senha</Label>
             <Input
               id="password"
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
               disabled={isLoading}
             />
           </div>
           {error && (
             <Alert variant="destructive">
               <AlertTitle>Erro</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
             </Alert>
           )}
           <Button type="submit" className="w-full" disabled={isLoading}>
             {isLoading ? "Entrando..." : "Entrar"}
           </Button>
         </form>
       </CardContent>
     </Card>
   </div>
 )
}

