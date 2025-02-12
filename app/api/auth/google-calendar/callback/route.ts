import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../[...nextauth]/auth-options"
import { oauth2Client } from "../../../../../lib/google-calendar"
import prisma from "../../../../../lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      throw new Error("No authorization code received")
    }

    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    console.log("Received tokens:", JSON.stringify(tokens, null, 2))

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error("Invalid tokens received")
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    })

    console.log("Tokens stored successfully for user:", session.user.id)

    return NextResponse.redirect(new URL("/appointments", request.url))
  } catch (error) {
    console.error("Error in Google Calendar callback:", error)
    return NextResponse.redirect(new URL("/error?message=Failed to authenticate with Google Calendar", request.url))
  }
}


