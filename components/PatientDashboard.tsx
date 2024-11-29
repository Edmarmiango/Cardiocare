import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import Link from "next/link"

export default function PatientDashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bem-vindo, Paciente</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Seu Resumo de Saúde</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Veja seus dados de saúde mais recentes e previsões aqui.</p>
            <Link href="/monitoramento" className="text-blue-500 hover:underline">
              Ver monitoramento
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Você não tem consultas agendadas.</p>
            <Link href="/agendar-consulta" className="text-blue-500 hover:underline">
              Agendar consulta
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Predição de Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Faça uma avaliação do seu risco cardiovascular.</p>
            <Link href="/predicao" className="text-blue-500 hover:underline">
              Fazer predição
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Suas Prescrições</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Veja suas prescrições médicas atuais.</p>
            <Link href="/prescricoes" className="text-blue-500 hover:underline">
              Ver prescrições
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

