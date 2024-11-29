interface Doctor {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
}

interface News {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
}

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import Link from 'next/link'
import { MedicalCard } from '../components/MedicalCard'
import { NewsCard } from '../components/NewsCard'

async function getTopDoctors(): Promise<Doctor[]> {
  const res = await fetch('http://localhost:3000/api/doctors/top', { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Falha ao carregar médicos')
  }
  return res.json()
}

async function getLatestNews(): Promise<News[]> {
  const res = await fetch('http://localhost:3000/api/news', { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Falha ao carregar notícias')
  }
  return res.json()
}

export default async function Home() {
  const topDoctors: Doctor[] = await getTopDoctors()
  const latestNews: News[] = await getLatestNews()

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-16">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl font-bold mb-4">Bem-vindo ao CardioCare</h1>
            <p className="text-xl mb-6">Sua plataforma de saúde cardiovascular personalizada</p>
            <Button asChild size="lg">
              <Link href="/register">Comece Agora</Link>
            </Button>
          </div>
          <div className="md:w-1/2">
            <Image
              src="/images/heart-health.jpg"
              alt="Saúde do Coração"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Nossos Serviços</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Acompanhe seus dados de saúde em tempo real</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Previsão de Risco</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Avalie seu risco cardiovascular com IA avançada</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Telemedicina</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Consulte-se com cardiologistas online</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Médicos em Destaque</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topDoctors.map((doctor) => (
            <MedicalCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6">Últimas Notícias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {latestNews.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      </section>
    </div>
  )
}





