import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import Link from "next/link"
import { Button } from "../../../components/ui/button"

export default function RegistrationConfirmationPage() {
  return (
    <div className="container mx-auto flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Registro Recebido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Seu registro foi recebido com sucesso. Por favor, aguarde a aprovação do administrador.
            Enviaremos um feedback para o email fornecido assim que sua conta for revisada.
          </p>
          <p>
            Obrigado por escolher o CardioCare!
          </p>
          <Button asChild className="w-full">
            <Link href="/">Voltar para a página inicial</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

