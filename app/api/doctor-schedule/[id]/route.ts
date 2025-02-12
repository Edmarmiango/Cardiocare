import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/auth-options"
import prisma from "../../../../lib/prisma"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { id } = params

  try {
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id },
    })

    if (!timeSlot) {
      return NextResponse.json({ error: "Time slot not found" }, { status: 404 })
    }

    if (timeSlot.doctorId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    if (timeSlot.isBooked) {
      return NextResponse.json({ error: "Cannot delete a booked time slot" }, { status: 400 })
    }

    await prisma.timeSlot.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Time slot deleted successfully" })
  } catch (error) {
    console.error("Error deleting time slot:", error)
    return NextResponse.json({ error: "Error deleting time slot" }, { status: 500 })
  }
}

