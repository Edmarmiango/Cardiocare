import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../[...nextauth]/auth-options"
import { cookies } from "next/headers"
import { generateState } from "../../../../lib/auth-utils"
import { OAuth2Client } from "google-auth-library"

// Create OAuth2Client with the correct configuration
const oauth2Client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google-fit`,
  })
  
  export async function GET(request: Request) {
    try {
      const session = await getServerSession(authOptions)
  
      if (!session) {
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
  
      // Generate the authorization URL using the OAuth2Client
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
          "https://www.googleapis.com/auth/fitness.activity.read",
          "https://www.googleapis.com/auth/fitness.blood_pressure.read",
          "https://www.googleapis.com/auth/fitness.heart_rate.read",
        ],
        state: state,
        prompt: "consent",
      })
  
      return NextResponse.redirect(authUrl)
    } catch (error) {
      console.error("Google Fit auth error:", error)
      return NextResponse.redirect(new URL("/auth/error", request.url))
    }
  }
  