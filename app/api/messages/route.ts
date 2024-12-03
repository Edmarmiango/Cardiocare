import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/auth-options'
import prisma from '../../../lib/prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const content = formData.get('content') as string
    const receiverId = formData.get('receiverId') as string
    const file = formData.get('file') as File | null

    let fileUrl = null
    let fileType = null

    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Determine file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '')) {
        fileType = 'image'
      } else if (['pdf', 'doc', 'docx'].includes(fileExtension || '')) {
        fileType = 'document'
      }

      // Save the file
      const fileName = `${Date.now()}-${file.name}`
      const path = join(process.cwd(), 'public', 'uploads', fileName)
      await writeFile(path, buffer)
      fileUrl = `/uploads/${fileName}`
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        receiverId,
        fileUrl,
        fileType,
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Error sending message' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const url = new URL(request.url)
  const otherUserId = url.searchParams.get('otherUserId')

  if (!otherUserId) {
    return NextResponse.json({ error: 'Other user ID is required' }, { status: 400 })
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: session.user.id },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 })
  }
}


