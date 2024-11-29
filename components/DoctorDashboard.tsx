import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import Link from "next/link"

export default function DoctorDashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bem-vindo, Doutor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Veja suas próximas consultas agendadas.</p>
            <Link href="/consultas" className="text-blue-500 hover:underline">
              Ver consultas
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Gerencie seus pacientes e veja seus históricos médicos.</p>
            <Link href="/pacientes" className="text-blue-500 hover:underline">
              Ver pacientes
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Prescrições</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Crie e gerencie prescrições médicas.</p>
            <Link href="/prescricoes" className="text-blue-500 hover:underline">
              Gerenciar prescrições
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Análise de Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Acesse análises e estatísticas dos seus pacientes.</p>
            <Link href="/analise" className="text-blue-500 hover:underline">
              Ver análises
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

