import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import Image from 'next/image'

type News = {
  id: string
  title: string
  summary: string
  imageUrl: string
}

export function NewsCard({ news }: { news: News }) {
  return (
    <Card>
      <Image
        src={news.imageUrl}
        alt={news.title}
        width={400}
        height={200}
        className="w-full h-48 object-cover"
      />
      <CardHeader>
        <CardTitle>{news.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{news.summary}</p>
      </CardContent>
    </Card>
  )
}

