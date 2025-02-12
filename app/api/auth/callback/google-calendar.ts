import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../[...nextauth]/auth-options"
import prisma from "../../../../lib/prisma"
import { OAuth2Client } from "google-auth-library"

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google-calendar`,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).end()
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.redirect("/login?error=Unauthorized")
  }

  const { code } = req.query

  if (!code || typeof code !== "string") {
    return res.redirect("/monitoring?error=NoAuthCode")
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Store the tokens in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        googleCalendarAccessToken: tokens.access_token,
        googleCalendarRefreshToken: tokens.refresh_token,
        googleCalendarTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    })

    // Redirect to the monitoring page with a success message
    res.redirect("/monitoring?success=GoogleCalendarConnected")
  } catch (error) {
    console.error("Error exchanging code for tokens:", error)
    res.redirect("/monitoring?error=TokenExchangeFailed")
  }
}

