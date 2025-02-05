import { OAuth2Client } from "google-auth-library"

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
})

export async function fetchGoogleFitData(accessToken: string, startTime: Date, endTime: Date) {
  try {
    oauth2Client.setCredentials({
      access_token: accessToken,
    })

    const datasetStart = startTime.getTime() * 1000000 // Convert to nanoseconds
    const datasetEnd = endTime.getTime() * 1000000

    // Fetch blood pressure data
    const bloodPressureResponse = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/dataSources/derived:com.google.blood_pressure:com.google.android.gms:merged/datasets/${datasetStart}-${datasetEnd}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    // Fetch heart rate data
    const heartRateResponse = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/dataSources/derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm/datasets/${datasetStart}-${datasetEnd}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    const [bloodPressureData, heartRateData] = await Promise.all([
      bloodPressureResponse.json(),
      heartRateResponse.json(),
    ])

    // Process and format the data
    const formattedData = processGoogleFitData(bloodPressureData, heartRateData)

    return {
      success: true,
      data: formattedData,
    }
  } catch (error) {
    console.error("Error fetching Google Fit data:", error)
    return {
      success: false,
      error: "Failed to fetch Google Fit data",
    }
  }
}

function processGoogleFitData(bloodPressureData: any, heartRateData: any) {
  const processedData: any[] = []

  // Process blood pressure data
  if (bloodPressureData.point) {
    bloodPressureData.point.forEach((point: any) => {
      const timestamp = new Date(Number(point.startTimeNanos) / 1000000)
      const systolic = point.value[0]?.fpVal || 0
      const diastolic = point.value[1]?.fpVal || 0

      processedData.push({
        date: timestamp.toISOString().split("T")[0],
        systolic,
        diastolic,
        heartRate: 0, // Will be updated if heart rate data exists
        glucose: 0, // Manual input only
        cholesterol: 0, // Manual input only
      })
    })
  }

  // Add heart rate data to matching dates or create new entries
  if (heartRateData.point) {
    heartRateData.point.forEach((point: any) => {
      const timestamp = new Date(Number(point.startTimeNanos) / 1000000)
      const date = timestamp.toISOString().split("T")[0]
      const heartRate = point.value[0]?.fpVal || 0

      const existingEntry = processedData.find((entry) => entry.date === date)
      if (existingEntry) {
        existingEntry.heartRate = heartRate
      } else {
        processedData.push({
          date,
          systolic: 0,
          diastolic: 0,
          heartRate,
          glucose: 0,
          cholesterol: 0,
        })
      }
    })
  }

  return processedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

async function fetchLastManualCholesterol() {
  // Fetch the last manual cholesterol entry from your database
  const response = await fetch("/api/health-data/last-cholesterol")
  if (!response.ok) {
    return null
  }
  const data = await response.json()
  return data.cholesterol
}

export function getGoogleFitAuthUrl() {
  const scopes = [
    "https://www.googleapis.com/auth/fitness.activity.read",
    "https://www.googleapis.com/auth/fitness.blood_pressure.read",
    "https://www.googleapis.com/auth/fitness.heart_rate.read",
    "https://www.googleapis.com/auth/fitness.blood_glucose.read",
  ]

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google-fit`,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: scopes.join(" "),
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

