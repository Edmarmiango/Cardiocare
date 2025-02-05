import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../auth/[...nextauth]/auth-options'
import prisma from '../../../../lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    const totalPredictions = await prisma.prediction.count()
    
    const riskLevels = [
      { min: 0, max: 0.2, label: 'Muito Baixo' },
      { min: 0.2, max: 0.4, label: 'Baixo' },
      { min: 0.4, max: 0.6, label: 'Moderado' },
      { min: 0.6, max: 0.8, label: 'Alto' },
      { min: 0.8, max: 1, label: 'Muito Alto' }
    ]

    const distribution = await Promise.all(
      riskLevels.map(async ({ min, max, label }) => {
        const count = await prisma.prediction.count({
          where: {
            probability: {
              gte: min,
              lt: max
            }
          }
        })

        return {
          riskLevel: label,
          count,
          percentage: Number(((count / totalPredictions) * 100).toFixed(1))
        }
      })
    )

    return NextResponse.json(distribution)
  } catch (error) {
    console.error('Error fetching risk distribution:', error)
    return NextResponse.json(
      { error: 'Error fetching risk distribution', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

