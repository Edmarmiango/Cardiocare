import { NextResponse } from 'next/server'

// Simulating a database of news
const newsDatabase = [
  {
    id: '1',
    title: 'Novos Avanços no Tratamento de Insuficiência Cardíaca',
    summary: 'Pesquisadores descobrem terapia promissora para pacientes com insuficiência cardíaca avançada.',
    imageUrl: '/images/news/heart-treatment.jpg'
  },
  {
    id: '2',
    title: 'Dieta Mediterrânea e Saúde do Coração',
    summary: 'Estudo confirma benefícios da dieta mediterrânea na prevenção de doenças cardiovasculares.',
    imageUrl: '/images/news/mediterranean-diet.jpg'
  },
  // Add more news items as needed
]

export async function GET() {
  try {
    return NextResponse.json(newsDatabase)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar notícias' },
      { status: 500 }
    )
  }
}

