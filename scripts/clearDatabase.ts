import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function clearDatabase() {
  try {
    // Delete all appointments
    await prisma.appointment.deleteMany()
    console.log("Todos os agendamentos foram apagados.")

    // Delete all prescriptions
    await prisma.prescription.deleteMany()
    console.log("Todas as prescrições foram apagadas.")

    // Delete all health data
    await prisma.healthData.deleteMany()
    console.log("Todos os dados de saúde foram apagados.")

    // Delete all time slots
    await prisma.timeSlot.deleteMany()
    console.log("Todos os horários foram apagados.")

    // Delete all shared health data
    await prisma.sharedHealthData.deleteMany()
    console.log("Todos os dados de saúde compartilhados foram apagados.")

    // Delete all reminders
    await prisma.reminder.deleteMany()
    console.log("Todos os lembretes foram apagados.")

    // Delete all messages
    await prisma.message.deleteMany()
    console.log("Todas as mensagens foram apagadas.")

    // Delete all users except the admin
    await prisma.user.deleteMany({
      where: {
        role: {
          not: "ADMIN",
        },
      },
    })
    console.log("Todos os usuários não-admin foram apagados.")

    console.log("Limpeza do banco de dados concluída com sucesso.")
  } catch (error) {
    console.error("Erro ao limpar o banco de dados:", error)
  } finally {
    await prisma.$disconnect()
  }
}

clearDatabase()

