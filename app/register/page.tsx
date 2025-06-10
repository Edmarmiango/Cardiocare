'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert"
import { Upload } from 'lucide-react'
import { useToast } from "../../components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"


export default function RegisterPage() {
 const [name, setName] = useState('')
 const [email, setEmail] = useState('')
 const [password, setPassword] = useState('')
 const [userType, setUserType] = useState('PATIENT')
 const [crm, setCrm] = useState('')
 const [specialty, setSpecialty] = useState('')
 const [profileImage, setProfileImage] = useState<File | null>(null)
 const [bi, setBi] = useState('')
 const [dateOfBirth, setDateOfBirth] = useState('')
 const [gender, setGender] = useState('')
 const [address, setAddress] = useState('')
 const [phoneNumber, setphoneNumber] = useState("") 
 const [isLoading, setIsLoading] = useState(false)
 const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)
 const [successMessage, setSuccessMessage] = useState<string | null>(null)
 const router = useRouter()
 const { toast } = useToast()

 const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   if (e.target.files && e.target.files[0]) {
     setProfileImage(e.target.files[0])
   }
 }

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault()
   setIsLoading(true)
   setFeedback(null)

   try {
     // Create FormData to handle file upload
     const formData = new FormData()
     formData.append('name', name)
     formData.append('email', email)
     formData.append('password', password)
     formData.append('userType', userType)
     formData.append('bi', bi)
     formData.append('dateOfBirth', dateOfBirth)
     formData.append('gender', gender)
     formData.append('address', address)
     formData.append("phoneNumber", phoneNumber)
     
     if (userType === 'DOCTOR') {
       formData.append('crm', crm)
       formData.append('specialty', specialty)
     }
     if (profileImage) {
        formData.append('profileImage', profileImage)
     }
    
     const response = await fetch('/api/register', {
       method: 'POST',
       body: formData,
     })

     const data = await response.json()

     if (response.ok) {
      toast({
        title: "Registro bem-sucedido",
        description: data.message,
      })

      // Aguarde um curto período antes de redirecionar
      setTimeout(() => {
        if (userType === "PATIENT") {
          router.push("/login")
        } else {
          router.push("/register/confirmation")
        }
      }, 1500) // Aguarda 1,5 segundos antes de redirecionar
    } else {
      switch (data.code) {
        case "MISSING_FIELDS":
          toast({
            variant: "destructive",
            title: "Campos obrigatórios faltando",
            description: data.error,
          })
          break
        case "INVALID_PHONE":
          toast({
            variant: "destructive",
            title: "Número de telefone inválido",
            description: data.error,
          })
          break
        case "INVALID_BI":
          toast({
            variant: "destructive",
            title: "BI inválido",
            description: data.error,
          })
          break
        case "INVALID_EMAIL":
          toast({
            variant: "destructive",
            title: "Email inválido",
            description: data.error,
          })
          break
        case "EMAIL_IN_USE":
        case "BI_IN_USE":
        case "PHONE_IN_USE":
          toast({
            variant: "destructive",
            title: "Dados já registrados",
            description: data.error,
          })
          break
        default:
          toast({
            variant: "destructive",
            title: "Erro no registro",
            description: data.error || "Ocorreu um erro durante o registro",
          })
      }
    }
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Erro no registro",
      description: "Ocorreu um erro durante o registro. Por favor, tente novamente.",
    })
  } finally {
    setIsLoading(false)
  }
}

 return (
   <div className="flex items-center justify-center min-h-screen py-8 px-4 bg-blue-50">
    <div className="container mx-auto flex items-center justify-center">
       <Card className="w-full bg-white border border-primary/20 rounded-2xl shadow-md p-6">
         <CardHeader>
           <CardTitle>Inscrever-se</CardTitle>
         </CardHeader>
         <CardContent>
           <form onSubmit={handleSubmit} className="space-y-4">
           {successMessage && (
              <Alert className="mb-4">
                <AlertTitle>Sucesso</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
             <div className="space-y-2 ">
               <Label htmlFor="name">Nome</Label>
               <Input
                 id="name"
                 type="text"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 required
                 className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="email">Email</Label>
               <Input
                 id="email"
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
                 className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
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
                 className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
               <Input
                 id="dateOfBirth"
                 type="date"
                 value={dateOfBirth}
                 onChange={(e) => setDateOfBirth(e.target.value)}
                 required
                 className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
               />
             </div>
             <div>
              <Label htmlFor="gender">Gênero</Label>
              <Select onValueChange={setGender} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Masculino</SelectItem>
                  <SelectItem value="FEMALE">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input 
                id="address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                required 
                 className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Número de Telefone</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={phoneNumber} onChange={(e) => setphoneNumber(e.target.value)} 
                required 
                 className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>
             <div className="space-y-2">
               <Label>Tipo de Usuário</Label>
               <RadioGroup value={userType} onValueChange={setUserType}>
                 <div className="flex items-center space-x-2 cursor-pointer">
                   <RadioGroupItem value="PATIENT" id="patient" />
                   <Label htmlFor="patient">Paciente</Label>
                 </div>
                 <div className="flex items-center space-x-2 cursor-pointer">
                   <RadioGroupItem value="DOCTOR" id="doctor" />
                   <Label htmlFor="doctor">Médico</Label>
                 </div>
               </RadioGroup>
             </div>
             {userType === 'DOCTOR' && (
               <>
                 <div className="space-y-2">
                   <Label htmlFor="crm">Número na Ordem dos Médicos </Label>
                   <Input
                     id="crm"
                     type="text"
                     value={crm}
                     onChange={(e) => setCrm(e.target.value)}
                     required
                      className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="specialty">Especialidade</Label>
                   <Input
                     id="specialty"
                     type="text"
                     value={specialty}
                     onChange={(e) => setSpecialty(e.target.value)}
                     required
                      className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                   />
                 </div>
                
               </>
             )}

             <div className="space-y-2">
                <Label htmlFor="profileImage">Foto de Perfil</Label>
                <div className="flex items-center gap-4">
                     <Input
                       id="profileImage"
                       type="file"
                       accept="image/*"
                       onChange={handleImageChange}
                       className="hidden"
                     />
                     <Button
                       type="button"
                       variant="outline"
                       onClick={() => document.getElementById('profileImage')?.click()}
                       className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                       
                     >
                       <Upload className="mr-2 h-4 w-4" />
                       {profileImage ? 'Trocar Imagem' : 'Carregar Imagem'}
                     </Button>
                  </div>
                   {profileImage && (
                     <p className="text-sm text-muted-foreground mt-1">
                       Arquivo selecionado: {profileImage.name}
                     </p>
                   )}
             </div>
             <div className="space-y-2">
               <Label htmlFor="bi">BI (Bilhete de Identidade)</Label>
               <Input
                 id="bi"
                 type="text"
                 value={bi}
                 onChange={(e) => setBi(e.target.value)}
                 required
                 className="w-full px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
               />
             </div>
             {feedback && (
               <Alert variant={feedback.type === 'success' ? 'default' : 'destructive'}>
                 <AlertTitle>{feedback.type === 'success' ? 'Sucesso' : 'Erro'}</AlertTitle>
                 <AlertDescription>{feedback.message}</AlertDescription>
               </Alert>
             )}
             <Button type="submit" className="w-full" disabled={isLoading}>
               {isLoading ? "Registrando..." : "Registrar"}
             </Button>
           </form>
         </CardContent>
       </Card>
      </div>
   </div>
 )
}

