'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { toast } from "../../components/ui/use-toast"
import { Upload } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState('PATIENT')
  const [crm, setCrm] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [bi, setBi] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create FormData to handle file upload
      const formData = new FormData()
      formData.append('name', name)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('userType', userType)
      formData.append('bi', bi)
      
      if (userType === 'DOCTOR') {
        formData.append('crm', crm)
        formData.append('specialty', specialty)
        if (profileImage) {
          formData.append('profileImage', profileImage)
        }
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
        
        if (userType === 'PATIENT') {
          router.push('/login')
        } else {
          router.push('/register/confirmation')
        }
      } else {
        throw new Error(data.message || 'Ocorreu um erro durante o registro')
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no registro",
        description: error instanceof Error ? error.message : 'Ocorreu um erro durante o registro',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Registro</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
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
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Usuário</Label>
                <RadioGroup value={userType} onValueChange={setUserType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PATIENT" id="patient" />
                    <Label htmlFor="patient">Paciente</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="DOCTOR" id="doctor" />
                    <Label htmlFor="doctor">Médico</Label>
                  </div>
                </RadioGroup>
              </div>
              {userType === 'DOCTOR' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="crm">CRM</Label>
                    <Input
                      id="crm"
                      type="text"
                      value={crm}
                      onChange={(e) => setCrm(e.target.value)}
                      required
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
                    />
                  </div>
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
                        className="w-full"
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
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="bi">BI (Bilhete de Identidade)</Label>
                <Input
                  id="bi"
                  type="text"
                  value={bi}
                  onChange={(e) => setBi(e.target.value)}
                  required
                />
              </div>
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

