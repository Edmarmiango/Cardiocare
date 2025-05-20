import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/auth-options"
import prisma from "../../../../lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (!params || !params.id) {
      return NextResponse.json({ error: "Missing patient ID" }, { status: 400 })
    }

    const patientId = params.id

    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, name: true },
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error("Error fetching patient:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

