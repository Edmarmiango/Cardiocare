import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import Image from 'next/image'

type Doctor = {
  id: string
  name: string
  specialty: string | null
  imageUrl: string | null
}

export function MedicalCard({ doctor }: { doctor: Doctor }) {
  return (
    <Card>
      <CardHeader>
        {doctor.imageUrl ? (
          <Image
            src={doctor.imageUrl}
            alt={doctor.name}
            width={100}
            height={100}
            className="rounded-full mx-auto"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto" />
        )}
        <CardTitle className="text-center mt-2">{doctor.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center">{doctor.specialty || 'Especialidade não informada'}</p>
      </CardContent>
    </Card>
  )
}

