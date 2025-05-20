import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../[...nextauth]/auth-options"
import { cookies } from "next/headers"
import { generateState } from "../../../../lib/auth-utils"
import { OAuth2Client } from "google-auth-library"

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google-fit`,
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      console.log("Usuário não autenticado, redirecionando para login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const state = generateState()
    const cookieStore = await cookies()

    cookieStore.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10, // 10 minutes
    })

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      response_type: "code", // Explicitly set response_type
      scope: [
        "https://www.googleapis.com/auth/fitness.activity.read",
        "https://www.googleapis.com/auth/fitness.blood_pressure.read",
        "https://www.googleapis.com/auth/fitness.heart_rate.read",
      ],
      state: state,
      prompt: "consent",
      include_granted_scopes: true,
    })

    console.log("URL de autenticação gerada:", authUrl)

    // Instead of redirecting, return the URL for client-side navigation
    return NextResponse.json({
      url: authUrl,
      state: state,
    })
  } catch (error) {
    console.error("Erro na autenticação do Google Fit:", error)
    return NextResponse.json(
      {
        error: "Erro na autenticação do Google Fit",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    )
  }
}

