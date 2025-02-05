import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { sendRegistrationEmail } from '../../../lib/emailService'
import { writeFile } from 'fs/promises'
import { join } from 'path'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const dateOfBirth = formData.get('dateOfBirth') as string
    const address = formData.get('address') as string
    const gender = formData.get('gender') as string
    const userType = formData.get('userType') as string
    const bi = formData.get('bi') as string
    const crm = formData.get('crm') as string
    const specialty = formData.get('specialty') as string
    const profileImage = formData.get('profileImage') as File | null
   

    // Verifique se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Usuário já existe' }, { status: 400 })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    let imageUrl = null
    if (profileImage) {
      // Generate a unique filename
      const bytes = await profileImage.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filename = `${Date.now()}-${profileImage.name}`
      const path = join(process.cwd(), 'public/uploads', filename)
      
      // Save the file
      await writeFile(path, buffer)
      imageUrl = `/uploads/${filename}`
    }

    // Crie o usuário com status APPROVED para pacientes e PENDING para médicos
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userType.toUpperCase(),
        crm: userType === 'DOCTOR' ? crm : null,
        specialty: userType === 'DOCTOR' ? specialty : null,
        profileImage: imageUrl,
        status: userType === 'DOCTOR' ? 'PENDING' : 'APPROVED',
        bi,
        dateOfBirth: new Date(dateOfBirth),
        address,
        gender
      },
    })

    // Enviar email para médicos
    if (userType === 'DOCTOR') {
      await sendRegistrationEmail(email, name)
    }

    const message = userType === 'DOCTOR' 
      ? 'Registro feito com sucesso. Aguarde a aprovação do administrador. Enviamos um email com mais informações.'
      : 'Registro realizado com sucesso.'

    return NextResponse.json({ message, userId: user.id }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

