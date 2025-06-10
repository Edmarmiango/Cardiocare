import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../app/api/auth/[...nextauth]/auth-options"
import prisma from "../../../lib/prisma"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.toLowerCase() || ""

    const patients = await prisma.user.findMany({
      where: {
        role: 'PATIENT',
        name: {
          contains: query,
          mode: 'insensitive', // ignora maiúsculas/minúsculas
        }
      },
      select: {
        id: true,
        name: true,
        profileImage: true,
        bi: true
      },
      orderBy: {
        name: 'asc',
      },
      take: 10, // limita o número de resultados
    })

    return NextResponse.json(patients)
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json({ error: 'Error fetching patients' }, { status: 500 })
  }
}
