import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { sendRegistrationEmail } from '../../../lib/emailService'
import { writeFile } from 'fs/promises'
import { join } from 'path'

// Validation functions
function isValidAngolanPhoneNumber(phoneNumber: string): boolean {
  // Angolan phone numbers: +244 9xx xxx xxx or 9xx xxx xxx
  const phoneRegex = /^(\+244|0)?9\d{8}$/
  return phoneRegex.test(phoneNumber)
}

function isValidBI(bi: string): boolean {
  // BI format: 000000000LA000 (9 digits, 2 letters, 3 digits)
  const biRegex = /^\d{9}[A-Z]{2}\d{3}$/
  return biRegex.test(bi)
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

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
    const phoneNumber = formData.get("phoneNumber") as string
    const crm = formData.get('crm') as string
    const specialty = formData.get('specialty') as string
    const profileImage = formData.get('profileImage') as File | null
   
    // Validate required fields
    const requiredFields = { name, email, password, dateOfBirth, gender, address, phoneNumber, userType, bi }
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
          code: "MISSING_FIELDS",
        },
        { status: 400 },
      )
    }

    // Validate phone number
    if (!isValidAngolanPhoneNumber(phoneNumber)) {
      return NextResponse.json(
        {
          error:
            "O número de telefone é inválido. Por favor, insira um número de telefone angolano válido (ex: 9xx xxx xxx).",
          code: "INVALID_PHONE",
        },
        { status: 400 },
      )
    }

    // Validate BI
    if (!isValidBI(bi)) {
      return NextResponse.json(
        {
          error:
            "O formato do BI é inválido. O BI deve conter 9 dígitos, seguidos de 2 letras e 3 dígitos (ex: 000000000LA000).",
          code: "INVALID_BI",
        },
        { status: 400 },
      )
    }

    // Validate email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error: "O formato do email é inválido. Por favor, insira um endereço de email válido.",
          code: "INVALID_EMAIL",
        },
        { status: 400 },
      )
    }


    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { bi }, { phoneNumber }],
      },
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          {
            error: "Este email já está em uso. Por favor, use um email diferente.",
            code: "EMAIL_IN_USE",
          },
          { status: 400 },
        )
      }
      if (existingUser.bi === bi) {
        return NextResponse.json(
          {
            error: "Este BI já está registrado. Se você já tem uma conta, por favor faça login.",
            code: "BI_IN_USE",
          },
          { status: 400 },
        )
      }
      if (existingUser.phoneNumber === phoneNumber) {
        return NextResponse.json(
          {
            error: "Este número de telefone já está em uso. Por favor, use um número diferente.",
            code: "PHONE_IN_USE",
          },
          { status: 400 },
        )
      }
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
        gender,
        phoneNumber
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

