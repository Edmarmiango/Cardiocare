const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    console.log('Attempting to connect to the database...')
    const result = await prisma.$queryRaw`SELECT 1 + 1 AS result`
    console.log('Database connection successful:', result)
  } catch (error) {
    console.error('Error connecting to the database:', error)
    console.error('Database URL:', process.env.DATABASE_URL)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

