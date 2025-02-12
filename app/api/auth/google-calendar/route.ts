import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../[...nextauth]/auth-options"
import { oauth2Client } from "../../../../lib/google-calendar"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"],
    prompt: "consent",
  })

  console.log("Redirecting to Google Calendar auth URL:", authUrl)
  return NextResponse.redirect(authUrl)
}


  
