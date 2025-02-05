import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/auth-options'
import prisma from '../../../lib/prisma'
import { Role } from '@prisma/client'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const url = new URL(request.url)
  const status = url.searchParams.get("status") || "ACTIVE"

  try {
    let prescriptions
    if (session.user.role === Role.DOCTOR) {
      prescriptions = await prisma.prescription.findMany({
        where: {
          doctorId: session.user.id,
          status: status,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    } else {
      prescriptions = await prisma.prescription.findMany({
        where: {
          userId: session.user.id,
          status: status,
        },
        include: {
          doctor: {
            select: {
              name: true,
              specialty: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    }

    return NextResponse.json(prescriptions)
  } catch (error) {
    console.error("Error fetching prescriptions:", error)
    return NextResponse.json(
      {
        error: "Error fetching prescriptions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  console.log("Received POST request to /api/prescriptions")

  try {
    // Check authentication first
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== Role.DOCTOR) {
      console.log("Authentication failed:", { userId: session?.user?.id, role: session?.user?.role })
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Clone the request for multiple reads
    const clone = request.clone()

    // Log raw request details
    console.log("Request headers:", Object.fromEntries(request.headers.entries()))
    console.log("Raw request body:", await clone.text())

    // Parse the original request body
    const body = await request.json()
    console.log("Parsed request body:", body)

    // Validate required fields
    const { patientId, medication, dosage, frequency, instructions, startDate, endDate } = body

    const missingFields = []
    if (!patientId) missingFields.push("patientId")
    if (!medication) missingFields.push("medication")
    if (!dosage) missingFields.push("dosage")
    if (!frequency) missingFields.push("frequency")
    if (!instructions) missingFields.push("instructions")
    if (!startDate) missingFields.push("startDate")

    if (missingFields.length > 0) {
      console.log("Missing required fields:", missingFields)
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: missingFields,
        },
        { status: 400 },
      )
    }

    // Validate dates
    const parsedStartDate = new Date(startDate)
    const parsedEndDate = endDate ? new Date(endDate) : null

    if (isNaN(parsedStartDate.getTime())) {
      console.log("Invalid start date:", startDate)
      return NextResponse.json(
        {
          error: "Invalid start date format",
          details: "Start date must be a valid date string",
        },
        { status: 400 },
      )
    }

    if (endDate && isNaN(parsedEndDate!.getTime())) {
      console.log("Invalid end date:", endDate)
      return NextResponse.json(
        {
          error: "Invalid end date format",
          details: "End date must be a valid date string",
        },
        { status: 400 },
      )
    }

    // Create prescription with validated data
    console.log("Creating prescription with data:", {
      medication,
      dosage,
      frequency,
      instructions,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      userId: patientId,
      doctorId: session.user.id,
    })

    const prescription = await prisma.prescription.create({
      data: {
        medication,
        dosage,
        frequency,
        instructions,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        userId: patientId,
        doctorId: session.user.id,
        status: "ACTIVE",
      },
    })

    console.log("Prescription created successfully:", prescription)

    return NextResponse.json(prescription)
  } catch (error) {
    console.error("Error in POST /api/prescriptions:", error)
    return NextResponse.json(
      {
        error: "Error creating prescription",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== Role.DOCTOR) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedPrescription = await prisma.prescription.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(updatedPrescription)
  } catch (error) {
    console.error("Error updating prescription:", error)
    return NextResponse.json(
      {
        error: "Error updating prescription",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

