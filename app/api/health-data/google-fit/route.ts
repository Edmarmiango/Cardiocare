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

    // Use the Fitness REST API endpoints
    const bloodPressureResponse = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/dataSources/raw:com.google.blood_pressure:com.google.android.apps.fitness:user_input/datasets/${datasetStart}-${datasetEnd}`,
      {
        headers: {
          Authorization: `Bearer ${user.googleFitAccessToken}`,
          Accept: "application/json",
        },
      },
    )

    if (!bloodPressureResponse.ok) {
      const errorText = await bloodPressureResponse.text()
      console.error("Blood pressure response error:", errorText)
      throw new Error(`Blood pressure API error: ${bloodPressureResponse.status}`)
    }

    const heartRateResponse = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/dataSources/raw:com.google.heart_rate.bpm:com.google.android.apps.fitness:user_input/datasets/${datasetStart}-${datasetEnd}`,
      {
        headers: {
          Authorization: `Bearer ${user.googleFitAccessToken}`,
          Accept: "application/json",
        },
      },
    )

    if (!heartRateResponse.ok) {
      const errorText = await heartRateResponse.text()
      console.error("Heart rate response error:", errorText)
      throw new Error(`Heart rate API error: ${heartRateResponse.status}`)
    }

    // Parse responses
    const [bloodPressureData, heartRateData] = await Promise.all([
      bloodPressureResponse.json(),
      heartRateResponse.json(),
    ])

    console.log("Google Fit API response:", {
      bloodPressureData,
      heartRateData,
    })

    const processedData = processGoogleFitData(bloodPressureData, heartRateData)

    console.log("Processed data:", processedData)

    if (processedData.length === 0) {
      console.log("No data found in Google Fit responses")
    }

    return NextResponse.json({
      success: true,
      data: processedData,
      message: processedData.length === 0 ? "Nenhum dado encontrado no período selecionado" : undefined,
      debug: {
        bloodPressureDataLength: bloodPressureData.point?.length || 0,
        heartRateDataLength: heartRateData.point?.length || 0,
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
        dataMap.set(date, {
          date,
          systolic,
          diastolic,
          heartRate: 0,
          glucose: 0,
          cholesterol: 0,
        })
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
          const entry = dataMap.get(date)
          entry.heartRate = heartRate
        } else {
          dataMap.set(date, {
            date,
            systolic: 0,
            diastolic: 0,
            heartRate,
            glucose: 0,
            cholesterol: 0,
          })
        }
      }
    })
  }

  // Convert Map to array and sort by date
  const sortedData = Array.from(dataMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  console.log("Processed Google Fit data:", sortedData)

  return sortedData
}

