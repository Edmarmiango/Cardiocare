import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/auth-options"
import prisma from "../../../../lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { googleFitAccessToken: true },
    })

    const isConnected = !!user?.googleFitAccessToken

    return NextResponse.json({ isConnected })
  } catch (error) {
    console.error("Error checking Google Fit status:", error)
    return NextResponse.json({ error: "Failed to check Google Fit status" }, { status: 500 })
  }
}

