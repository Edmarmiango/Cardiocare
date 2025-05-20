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
   const [
     totalPatients,
     patientsWithAge,
     highRiskPatients,
     activeMonitoring
   ] = await Promise.all([
     // Total number of patients
     prisma.user.count({
       where: {
         role: 'PATIENT',
         status: 'APPROVED'
       }
     }),
     // Patients with age data for average calculation
     prisma.healthData.groupBy({
       by: ['userId'],
       _avg: {
         age_years: true
       },
       where: {
         age_years: {
           not: null
         }
       }
     }),
     // High risk patients (last prediction > 50%)
     prisma.prediction.groupBy({
       by: ['userId'],
       _max: {
         probability: true
       },
       having: {
         probability: {
           _max: {
             gt: 0.5
           }
         }
       }
     }).then(results => results.length),
     // Patients with recent health data (last 30 days)
     prisma.healthData.groupBy({
       by: ['userId'],
       where: {
         createdAt: {
           gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
         }
       }
     }).then(results => results.length)
   ])

   const averageAge = patientsWithAge.reduce((sum, p) => sum + (p._avg.age_years || 0), 0) / 
                     (patientsWithAge.length || 1)

   return NextResponse.json({
     totalPatients,
     averageAge,
     highRiskCount: highRiskPatients,
     activeMonitoring
   })
 } catch (error) {
   console.error('Error fetching metrics:', error)
   return NextResponse.json(
     { error: 'Error fetching metrics', details: error instanceof Error ? error.message : 'Unknown error' },
     { status: 500 }
   )
 }
}


