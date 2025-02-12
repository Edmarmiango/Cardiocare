import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/auth-options"
import prisma from "../../../lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
        },
        {
          status: 401,
        },
      )
    }

    const body = await request.json()

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body format",
        },
        {
          status: 400,
        },
      )
    }

    const { date, systolic, diastolic, heartRate, glucose, cholesterol } = body

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          error: "Date is required",
        },
        {
          status: 400,
        },
      )
    }

    // Prepare data object with only defined fields
    const data: any = {
      userId: session.user.id,
      date: new Date(date),
    }

    // Only include fields that were sent in the request
    if ("systolic" in body) data.systolic = systolic === null ? null : Number(systolic)
    if ("diastolic" in body) data.diastolic = diastolic === null ? null : Number(diastolic)
    if ("heartRate" in body) data.heartRate = heartRate === null ? null : Number(heartRate)
    if ("glucose" in body) data.glucose = glucose === null ? null : Number(glucose)
    if ("cholesterol" in body) data.cholesterol = cholesterol === null ? null : Number(cholesterol)

    // Create the health data entry
    const healthData = await prisma.healthData.create({
      data,
    })

    return NextResponse.json({
      success: true,
      data: healthData,
    })
  } catch (error) {
    console.error("Error creating health data:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Error creating health data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
        },
        {
          status: 401,
        },
      )
    }

    const healthData = await prisma.healthData.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: healthData,
    })
  } catch (error) {
    console.error("Error fetching health data:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Error fetching health data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    )
  }
}

