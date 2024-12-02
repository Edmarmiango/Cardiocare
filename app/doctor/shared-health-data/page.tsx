"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { HealthDataChart } from "../../../components/HealthDataChart"
import { toast } from "../../../components/ui/use-toast"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert"
import { Button } from "../../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog"

interface SharedHealthData {
 id: string;
 patientId: string;
 patientName: string;
 healthData: {
   date: string;
   systolic: number;
   diastolic: number;
   heartRate: number;
   glucose: number;
   cholesterol: number;
 }[];
}

interface ApiError {
 error: string;
 message?: string;
 details?: string;
 status?: number;
}

export default function SharedHealthDataPage() {
 const { data: session, status } = useSession()
 const [sharedData, setSharedData] = useState<SharedHealthData[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const [isRemoving, setIsRemoving] = useState(false)

 const fetchSharedHealthData = async () => {
   try {
     setIsLoading(true)
     setError(null)
     const response = await fetch('/api/shared-health-data/')
     
     if (!response.ok) {
       const errorData: ApiError = await response.json()
       throw new Error(errorData.details || errorData.error || 'Falha ao buscar dados de saúde compartilhados')
     }
     
     const data = await response.json()
     setSharedData(data)
   } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar dados de saúde compartilhados'
     setError(errorMessage)
     toast({
       title: "Erro",
       description: errorMessage,
       variant: "destructive",
     })
   } finally {
     setIsLoading(false)
   }
 }

 const handleRemoveSharing = async (sharedDataId: string) => {
   if (!sharedDataId) {
     toast({
       title: "Erro",
       description: "ID de compartilhamento inválido",
       variant: "destructive",
     })
     return
   }

   try {
     setIsRemoving(true)
     const response = await fetch(`/api/shared-health-data/${sharedDataId}`, {
       method: 'DELETE',
     })

     if (!response.ok) {
       const errorData: ApiError = await response.json()
       throw new Error(errorData.details || errorData.error || 'Falha ao remover compartilhamento de dados')
     }

     toast({
       title: "Sucesso",
       description: "Compartilhamento de dados removido com sucesso",
     })

     // Atualiza a lista removendo o item
     setSharedData(prevData => prevData.filter(data => data.id !== sharedDataId))
   } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'Erro ao remover compartilhamento de dados'
     toast({
       title: "Erro",
       description: errorMessage,
       variant: "destructive",
     })
   } finally {
     setIsRemoving(false)
   }
 }

 useEffect(() => {
   if (status === 'authenticated' && session?.user?.role === 'DOCTOR') {
     fetchSharedHealthData()
   }
 }, [status, session])

 if (status === 'loading' || isLoading) {
   return (
     <div className="container mx-auto p-4">
       <Card>
         <CardContent className="flex items-center justify-center p-6">
           <p>Carregando dados...</p>
         </CardContent>
       </Card>
     </div>
   )
 }

 if (status === 'unauthenticated' || session?.user?.role !== 'DOCTOR') {
   return (
     <div className="container mx-auto p-4">
       <Alert variant="destructive">
         <AlertCircle className="h-4 w-4" />
         <AlertTitle>Acesso Negado</AlertTitle>
         <AlertDescription>
           Esta página é restrita para médicos. Por favor, faça login com uma conta de médico.
         </AlertDescription>
       </Alert>
     </div>
   )
 }

 return (
   <div className="container mx-auto p-4 space-y-8">
     <h1 className="text-2xl font-bold mb-4">Dados de Saúde Compartilhados</h1>
     
     {error && (
       <Alert variant="destructive">
         <AlertCircle className="h-4 w-4" />
         <AlertTitle>Erro</AlertTitle>
         <AlertDescription>{error}</AlertDescription>
       </Alert>
     )}

     {!error && sharedData.length === 0 ? (
       <Card>
         <CardContent className="p-6">
           <p className="text-center text-muted-foreground">
             Nenhum dado compartilhado encontrado.
           </p>
         </CardContent>
       </Card>
     ) : (
       sharedData.map((patientData) => (
         <Card key={patientData.id} className="shadow-md">
           <CardHeader>
             <CardTitle className="flex justify-between items-center">
               <span>Paciente: {patientData.patientName}</span>
               <Dialog>
                 <DialogTrigger asChild>
                   <Button variant="destructive">
                     Remover Compartilhamento
                   </Button>
                 </DialogTrigger>
                 <DialogContent>
                   <DialogHeader>
                     <DialogTitle>Confirmar Remoção</DialogTitle>
                   </DialogHeader>
                   <p className="py-4">
                     Tem certeza que deseja remover o compartilhamento de dados com este paciente?
                   </p>
                   <div className="flex justify-end space-x-2">
                     <Button
                       variant="outline"
                       onClick={() => document.querySelector('button[aria-label="Close"]')?.click()}
                     >
                       Cancelar
                     </Button>
                     <Button
                       variant="destructive"
                       onClick={() => {
                         handleRemoveSharing(patientData.id)
                         document.querySelector('button[aria-label="Close"]')?.click()
                       }}
                       disabled={isRemoving}
                     >
                       {isRemoving ? "Removendo..." : "Confirmar Remoção"}
                     </Button>
                   </div>
                 </DialogContent>
               </Dialog>
             </CardTitle>
           </CardHeader>
           <CardContent>
             <HealthDataChart data={patientData.healthData} />
           </CardContent>
         </Card>
       ))
     )}
   </div>
 )
}









