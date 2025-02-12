import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/auth-options"
import prisma from "../../../../lib/prisma"

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await request.json()
  const { name, email, phone } = body

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, email, phone },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        profileImage: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Construct the full URL for the profile image
    const profileImageUrl = user.profileImage ? `${process.env.NEXT_PUBLIC_API_URL}/${user.profileImage}` : null

    return NextResponse.json({
      ...user,
      profileImage: profileImageUrl,
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ message: "Error fetching user profile" }, { status: 500 })
  }
}

