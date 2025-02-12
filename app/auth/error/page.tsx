"use client"

import { useRouter } from "next/router"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"

export default function AuthError() {
  const router = useRouter()
  const { error } = router.query

  return (
    <div className="container mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Erro de Autenticação</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Ocorreu um erro durante o processo de autenticação: {error}</p>
          <Button onClick={() => router.push("/monitoring")}>Voltar para Monitoramento</Button>
        </CardContent>
      </Card>
    </div>
  )
}


