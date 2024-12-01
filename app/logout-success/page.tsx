import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import Link from "next/link"

export default function LogoutSuccessPage() {
  return (
    <div className="container mx-auto flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Logout Bem-sucedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Você saiu com sucesso da sua conta. Obrigado por usar o CardioCare!
          </p>
          <Button asChild className="w-full">
            <Link href="/">Voltar para a página inicial</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

