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
import Image from "next/image";


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
   <div className="flex min-h-screen">
    {/* Lado Esquerdo: Formulário de Login */}
      <div className="w-1/2 flex items-center justify-center p-16 bg-white">
         

         <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-6">

          {/* Título e Descrição */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-primary">Login</h1>
            <p className="text-gray-600">Entre com suas credenciais para acessar o sistema.</p>
          </div>


           <div className="space-y-2">
             <Label htmlFor="email">Email</Label>
             <Input
               id="email"
               type="email"
               placeholder="Digite o seu email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
               className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
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
                  className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-[15px] text-gray-500 hover:text-primary"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-blue-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-blue-400" />
                  )}
                </button>
                <div className="text-center mt-3">
                  <a href="/esqueci-senha" className="text-sm text-primary hover:underline">
                    Esqueceu a senha?
                  </a>
                </div>
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
           {/* Link Criar Conta */}
          <div className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <a href="/register" className="text-primary hover:underline">
              Criar uma conta
            </a>
          </div>
         </form>

   </div>
   {/* Lado Direito: SVG */}
    <div className="w-1/2 bg-blue-50 flex items-center justify-center">
      <Image
        src="/images/undraw_mobile-log-in_0n4q.svg" // coloque na pasta public/images
        alt="Ilustração Login"
        width={500}
        height={500}
        className="w-3/4 h-auto"
      />
    </div>
   </div>
 )
}

