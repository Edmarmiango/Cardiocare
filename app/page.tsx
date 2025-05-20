
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
import { Button } from "../components/ui/button"
import Link from 'next/link'
import { MedicalCard } from '../components/MedicalCard'
import { NewsCard } from '../components/NewsCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"


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
              src="/images/1.png"
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



      <section className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>O que são Doenças Cardiovasculares?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              Doenças cardiovasculares são um grupo de distúrbios que afetam o coração e os vasos sanguíneos. 
              Elas são a principal causa de morte globalmente, mas muitas podem ser prevenidas com mudanças no estilo de vida e tratamento adequado.
            </p>
            <Image 
              src="/images/11.jpg" 
              alt="Ilustração do sistema cardiovascular" 
              width={1000} 
              height={300} 
              className="mt-4 rounded-lg"
            />
          </CardContent>
        </Card>
      </section>

      <section className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Doenças Cardiovasculares</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Doença Arterial Coronariana</AccordionTrigger>
                <AccordionContent>
                  Ocorre quando as artérias que fornecem sangue ao coração ficam estreitas ou bloqueadas, geralmente devido à aterosclerose.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Acidente Vascular Cerebral (AVC)</AccordionTrigger>
                <AccordionContent>
                  Acontece quando o suprimento de sangue para uma parte do cérebro é interrompido ou reduzido, impedindo que o tecido cerebral receba oxigênio e nutrientes.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Insuficiência Cardíaca</AccordionTrigger>
                <AccordionContent>
                  Condição em que o coração não consegue bombear sangue de forma eficiente para atender às necessidades do corpo.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Arritmias</AccordionTrigger>
                <AccordionContent>
                  Problemas com a frequência ou o ritmo dos batimentos cardíacos.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Doença Cardíaca Valvular</AccordionTrigger>
                <AccordionContent>
                  Ocorre quando uma ou mais válvulas cardíacas não funcionam corretamente.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </section>

      <section className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Sintomas Comuns</CardTitle>
            <CardDescription>Os sintomas podem variar dependendo do tipo específico de doença cardiovascular, mas alguns sinais comuns incluem:</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dor ou desconforto no peito (angina)</li>
              <li>Falta de ar</li>
              <li>Batimentos cardíacos irregulares</li>
              <li>Inchaço nas pernas, tornozelos ou pés</li>
              <li>Fadiga extrema</li>
              <li>Tontura ou desmaio</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Como Prevenir</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">A prevenção é fundamental para reduzir o risco de doenças cardiovasculares. Algumas medidas importantes incluem:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Manter uma dieta saudável e equilibrada</li>
              <li>Praticar exercícios regularmente</li>
              <li>Não fumar e evitar o consumo excessivo de álcool</li>
              <li>Controlar o estresse</li>
              <li>Manter um peso saudável</li>
              <li>Controlar a pressão arterial, colesterol e diabetes</li>
              <li>Realizar check-ups regulares com seu médico</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Fatores de Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Idade e Sexo</AccordionTrigger>
                <AccordionContent>
                  O risco aumenta com a idade. Homens geralmente estão em maior risco em idades mais jovens, mas o risco para as mulheres aumenta após a menopausa.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Histórico Familiar</AccordionTrigger>
                <AccordionContent>
                  Se você tem parentes próximos com doenças cardíacas, seu risco pode ser maior.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Tabagismo</AccordionTrigger>
                <AccordionContent>
                  Fumar aumenta significativamente o risco de doenças cardiovasculares.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Dieta e Atividade Física</AccordionTrigger>
                <AccordionContent>
                  Uma dieta rica em gorduras saturadas, açúcar e sal, combinada com falta de exercícios, aumenta o risco.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Condições Médicas</AccordionTrigger>
                <AccordionContent>
                  Hipertensão, colesterol alto, obesidade e diabetes são fatores de risco significativos.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
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
      <section className="text-center mt-8">
        <p className="text-lg mb-4">
          Lembre-se, a prevenção e o diagnóstico precoce são fundamentais. Use o CardioCare para monitorar sua saúde cardiovascular e consulte um médico regularmente.
        </p>
      </section>
    </div>
  )
}









