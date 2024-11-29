import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@cardiocare.com'
  const adminPassword = 'adminPassword123' // Você deve mudar isso para uma senha forte

  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: 'ADMIN',
    },
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'APPROVED',
      },
    })

    console.log('Admin padrão criado com sucesso.')
  } else {
    console.log('Um admin já existe no sistema. Nenhum admin padrão foi criado.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
