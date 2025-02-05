import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../auth/[...nextauth]/auth-options'
import prisma from '../../../../lib/prisma'
import { format, subMonths } from 'date-fns'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'DOCTOR') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    // Get data for the last 6 months
    const sixMonthsAgo = subMonths(new Date(), 6)
    
    const healthData = await prisma.healthData.groupBy({
      by: ['date'],
      _avg: {
        systolic: true,
        diastolic: true,
        heartRate: true,
        glucose: true,
        cholesterol: true
      },
      where: {
        date: {
          gte: sixMonthsAgo
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    const trends = healthData.map(data => ({
      date: format(data.date, 'dd/MM/yyyy'),
      averageSystolic: Math.round(data._avg.systolic || 0),
      averageDiastolic: Math.round(data._avg.diastolic || 0),
      averageHeartRate: Math.round(data._avg.heartRate || 0),
      averageGlucose: Math.round(data._avg.glucose || 0),
      averageCholesterol: Math.round(data._avg.cholesterol || 0)
    }))

    return NextResponse.json(trends)
  } catch (error) {
    console.error('Error fetching trends:', error)
    return NextResponse.json(
      { error: 'Error fetching trends', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

