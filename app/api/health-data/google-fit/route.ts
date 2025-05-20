import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/auth-options"
import { OAuth2Client } from "google-auth-library"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startTime = searchParams.get("startTime")
    const endTime = searchParams.get("endTime")

    if (!startTime || !endTime) {
      return NextResponse.json({ error: "Parâmetros startTime e endTime são obrigatórios" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        googleFitAccessToken: true,
        googleFitRefreshToken: true,
        googleFitTokenExpiry: true,
      },
    })

    if (!user?.googleFitAccessToken) {
      return NextResponse.json({ error: "Token do Google Fit não encontrado" }, { status: 400 })
    }

    // Check if token needs refresh
    if (user.googleFitTokenExpiry && new Date(user.googleFitTokenExpiry) < new Date()) {
      if (!user.googleFitRefreshToken) {
        return NextResponse.json(
          { error: "Refresh token não encontrado. Por favor, reconecte sua conta do Google Fit." },
          { status: 401 },
        )
      }

      try {
        oauth2Client.setCredentials({
          refresh_token: user.googleFitRefreshToken,
        })
        const { credentials } = await oauth2Client.refreshAccessToken()

        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            googleFitAccessToken: credentials.access_token,
            googleFitTokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
          },
        })

        user.googleFitAccessToken = credentials.access_token
      } catch (error) {
        console.error("Error refreshing token:", error)
        return NextResponse.json(
          { error: "Erro ao atualizar token. Por favor, reconecte sua conta do Google Fit." },
          { status: 401 },
        )
      }
    }

    const datasetStart = new Date(startTime).getTime() * 1000000
    const datasetEnd = new Date(endTime).getTime() * 1000000

    console.log("Fetching Google Fit data with parameters:", {
      startTime,
      endTime,
      datasetStart,
      datasetEnd,
    })

    // Fetch data from different endpoints with proper error handling
    const fetchDataWithErrorHandling = async (dataType: string, endpoint: string) => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/fitness/v1/users/me/dataSources/${endpoint}/datasets/${datasetStart}-${datasetEnd}`,
          {
            headers: {
              Authorization: `Bearer ${user.googleFitAccessToken}`,
              Accept: "application/json",
            },
          },
        )

        if (!response.ok) {
          console.warn(`${dataType} data fetch failed:`, await response.text())
          return { point: [] } // Return empty data structure on error
        }

        return response.json()
      } catch (error) {
        console.error(`Error fetching ${dataType} data:`, error)
        return { point: [] } // Return empty data structure on error
      }
    }

    // Fetch only blood pressure and heart rate data
    const [bloodPressureData, heartRateData] = await Promise.all([
      fetchDataWithErrorHandling(
        "blood pressure",
        "raw:com.google.blood_pressure:com.google.android.apps.fitness:user_input",
      ),
      fetchDataWithErrorHandling(
        "heart rate",
        "raw:com.google.heart_rate.bpm:com.google.android.apps.fitness:user_input",
      ),
    ])

    console.log("Blood pressure data points:", bloodPressureData.point?.length || 0)
    console.log("Heart rate data points:", heartRateData.point?.length || 0)

    const processedData = processGoogleFitData(bloodPressureData, heartRateData)

    return NextResponse.json({
      success: true,
      data: processedData,
      message: processedData.length === 0 ? "Nenhum dado encontrado no período selecionado" : undefined,
      debug: {
        bloodPressureDataLength: bloodPressureData.point?.length || 0,
        heartRateDataLength: heartRateData.point?.length || 0,
        dataTypes: {
          bloodPressure: bloodPressureData.point?.length > 0,
          heartRate: heartRateData.point?.length > 0,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching Google Fit data:", error)
    return NextResponse.json(
      {
        error: "Falha ao buscar dados do Google Fit",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

function processGoogleFitData(bloodPressureData: any, heartRateData: any) {
  const dataMap = new Map()

  // Process blood pressure data
  if (bloodPressureData.point?.length > 0) {
    bloodPressureData.point.forEach((point: any) => {
      const timestamp = new Date(Number(point.startTimeNanos) / 1000000)
      const date = timestamp.toISOString().split("T")[0]

      const systolic = point.value?.[0]?.fpVal || 0
      const diastolic = point.value?.[1]?.fpVal || 0

      if (systolic > 0 || diastolic > 0) {
        if (!dataMap.has(date)) {
          dataMap.set(date, { date, systolic, diastolic, heartRate: 0, source: "googleFit" })
        } else {
          const existingData = dataMap.get(date)
          existingData.systolic = systolic || existingData.systolic
          existingData.diastolic = diastolic || existingData.diastolic
        }
      }
    })
  }

  // Add heart rate data
  if (heartRateData.point?.length > 0) {
    heartRateData.point.forEach((point: any) => {
      const timestamp = new Date(Number(point.startTimeNanos) / 1000000)
      const date = timestamp.toISOString().split("T")[0]
      const heartRate = point.value?.[0]?.fpVal || 0

      if (heartRate > 0) {
        if (dataMap.has(date)) {
          const existingData = dataMap.get(date)
          existingData.heartRate = heartRate
        } else {
          dataMap.set(date, { date, systolic: 0, diastolic: 0, heartRate, source: "googleFit" })
        }
      }
    })
  }

  // Convert Map to array and sort by date
  let sortedData = Array.from(dataMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  console.log("Processed Google Fit data:", sortedData)

  // Remove null or zero values from each data point
  sortedData = sortedData.map((item) => {
    Object.keys(item).forEach((key) => (item[key] === null || item[key] === 0) && delete item[key])
    return item
  })

  console.log("Processed Google Fit data after removing null/zero values:", sortedData)

  return sortedData
}

