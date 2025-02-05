import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../[...nextauth]/auth-options"
import prisma from "../../../../../lib/prisma"
import { OAuth2Client } from "google-auth-library"
import { cookies } from "next/headers"
import { validateState } from "../../../../../lib/auth-utils"

// Create OAuth2Client with the correct configuration
const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google-fit`,
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const receivedState = searchParams.get("state")

    const cookieStore = await cookies()
    const savedState = cookieStore.get("oauth_state")?.value

    cookieStore.delete("oauth_state")

    if (!validateState(savedState, receivedState)) {
      console.error("State validation failed", { savedState, receivedState })
      return NextResponse.redirect(new URL("/auth/error?error=InvalidState", request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL("/auth/error?error=NoCode", request.url))
    }

    try {
      // Get tokens using the authorization code
      const { tokens } = await oauth2Client.getToken(code)

      // Set credentials for future requests
      oauth2Client.setCredentials(tokens)

      // Store the tokens in the database
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          googleFitAccessToken: tokens.access_token,
          googleFitRefreshToken: tokens.refresh_token,
          googleFitTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
      })

      return NextResponse.redirect(new URL("/monitoring?success=true", request.url))
    } catch (error: any) {
      console.error("Token exchange error:", error.response?.data || error)
      return NextResponse.redirect(new URL("/auth/error?error=TokenExchange", request.url))
    }
  } catch (error) {
    console.error("Callback error:", error)
    return NextResponse.redirect(new URL("/auth/error?error=Callback", request.url))
  }
}

