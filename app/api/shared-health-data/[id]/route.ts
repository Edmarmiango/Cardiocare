import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/auth-options"
import prisma from "../../../../lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { id } = params

    const sharedData = await prisma.sharedHealthData.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!sharedData) {
      return NextResponse.json({ error: "Shared data not found" }, { status: 404 })
    }

    // Fetch manual health data
    const manualHealthData = await prisma.healthData.findMany({
      where: {
        userId: sharedData.patientId,
      },
      orderBy: {
        date: "asc",
      },
    })

    // Parse Google Fit data if available
    let googleFitData = []
    if (sharedData.googleFitData) {
      try {
        googleFitData = JSON.parse(sharedData.googleFitData)
      } catch (error) {
        console.error("Error parsing Google Fit data:", error)
      }
    }

    // Combine and sort all health data
    const allHealthData = [...manualHealthData, ...googleFitData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    return NextResponse.json({
      patient: sharedData.patient,
      healthData: allHealthData,
    })
  } catch (error) {
    console.error("Error fetching shared health data:", error)
    return NextResponse.json(
      {
        error: "Error fetching shared health data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = params

    const share = await prisma.sharedHealthData.findUnique({
      where: { id },
    })

    if (!share) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 })
    }

    if (share.patientId !== session.user.id && share.doctorId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to remove this share" }, { status: 403 })
    }

    await prisma.sharedHealthData.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Health data share removed successfully",
    })
  } catch (error) {
    console.error("Error removing health data share:", error)
    return NextResponse.json({ error: "Error removing health data share" }, { status: 500 })
  }
}

