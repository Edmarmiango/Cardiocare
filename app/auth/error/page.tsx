"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import Link from "next/link"

const errorMessages: Record<string, string> = {
  AccessDenied: "Acesso negado. Por favor, verifique suas permissões.",
  Configuration: "Erro de configuração do OAuth. Por favor, contate o administrador.",
  InvalidState: "Erro de validação do estado da autenticação. Por favor, tente novamente.",
  NoCode: "Código de autorização não recebido. Por favor, tente novamente.",
  TokenExchange: "Erro ao trocar o código de autorização. Por favor, tente novamente.",
  default: "Ocorreu um erro durante a autenticação.",
}

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessage = error ? errorMessages[error] || errorMessages.default : errorMessages.default

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Erro de Autenticação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-destructive">
            <p>{errorMessage}</p>
          </div>
          <Button asChild className="w-full">
            <Link href="/monitoring">Voltar para Monitoramento</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

