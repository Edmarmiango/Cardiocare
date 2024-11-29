import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Esta chave secreta deve ser armazenada de forma segura, preferencialmente como uma variável de ambiente
const ADMIN_CREATION_SECRET = process.env.ADMIN_CREATION_SECRET || 'sua_chave_secreta_muito_segura'

export async function POST(request: Request) {
  try {
    const { name, email, password, secret } = await request.json()

    // Verificar se o segredo fornecido corresponde ao segredo definido
    if (secret !== ADMIN_CREATION_SECRET) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Usuário já existe' }, { status: 400 })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Criar o usuário administrador
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    return NextResponse.json({ message: 'Administrador criado com sucesso', userId: user.id }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar administrador:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

