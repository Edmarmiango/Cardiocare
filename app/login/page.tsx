'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useToast } from '../../components/ui/use-toast'


export default function Login() {
 const [email, setEmail] = useState('')
 const [password, setPassword] = useState('')
 const [isLoading, setIsLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const [showPassword, setShowPassword] = useState(false)
 const router = useRouter()
 const { toast } = useToast()

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
      toast({
        variant: "destructive",
        title: "Erro de login",
        description: "Email ou senha incorreta",
      })
    } else {
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta!",
      })
      router.push("/dashboard")
      router.refresh()
    }
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Erro",
      description: "Ocorreu um erro ao tentar fazer login",
    })
  } finally {
    setIsLoading(false)
  }
}

 const togglePasswordVisibility = () => {
  setShowPassword(!showPassword)
}

 return (
   <div className="container mx-auto flex h-screen items-center justify-center">
     <Card className="w-full max-w-md">
       <CardHeader>
         <CardTitle>Login</CardTitle>
         <CardDescription>Entre com suas credenciais para acessar o sistema.</CardDescription>
       </CardHeader>
       <CardContent>
         <form onSubmit={handleSubmit} className="space-y-4">
           <div className="space-y-2">
             <Label htmlFor="email">Email</Label>
             <Input
               id="email"
               type="email"
               placeholder="Digite o seu email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
               disabled={isLoading}
             />
           </div>
           <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite a sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
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

