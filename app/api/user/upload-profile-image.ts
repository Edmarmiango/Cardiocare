import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/auth-options"
import prisma from "../../../lib/prisma"
import formidable from "formidable"
import path from "path"

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ message: "Not authenticated" })
  }

  const form = formidable({
    uploadDir: path.join(process.cwd(), "public", "uploads"),
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err)
      return res.status(500).json({ message: "Error parsing form data" })
    }

    const file = files.image as formidable.File
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const fileName = path.basename(file.filepath)
    const profileImagePath = `/uploads/${fileName}`

    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { profileImage: profileImagePath },
      })

      console.log("Profile image updated:", profileImagePath)
      res.status(200).json({ message: "Profile image updated successfully", profileImage: profileImagePath })
    } catch (error) {
      console.error("Error updating profile image:", error)
      res.status(500).json({ message: "Error updating profile image" })
    }
  })
}

