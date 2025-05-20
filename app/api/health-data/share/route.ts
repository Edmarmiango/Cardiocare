import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/auth-options"
import prisma from "../../../../lib/prisma"
import { fetchGoogleFitData } from "../../../../lib/googleFit"

export async function POST(request: Request) {
  try {
    console.log("🔄 Iniciando handler POST")

    const session = await getServerSession(authOptions)
    console.log("📌 Sessão:", JSON.stringify(session, null, 2))

    if (!session?.user) {
      console.log("❌ Nenhum usuário autenticado encontrado")
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    if (session.user.role !== "PATIENT") {
      console.log("❌ Usuário não é um paciente")
      return NextResponse.json({ error: "Apenas pacientes podem compartilhar dados de saúde" }, { status: 403 })
    }

    const body = await request.json()
    console.log("📦 Corpo da requisição:", JSON.stringify(body, null, 2))

    const { doctorEmail } = body

    if (!doctorEmail) {
      console.log("❌ Email do médico não fornecido")
      return NextResponse.json({ error: "Email do médico não fornecido" }, { status: 400 })
    }

    const doctor = await prisma.user.findUnique({
      where: {
        email: doctorEmail,
        role: "DOCTOR",
        status: "APPROVED",
      },
    })
    console.log("👨‍⚕️ Médico encontrado:", JSON.stringify(doctor, null, 2))

    if (!doctor) {
      console.log("❌ Médico não encontrado ou não aprovado")
      return NextResponse.json({ error: "Médico não encontrado ou não aprovado" }, { status: 404 })
    }

    const existingShare = await prisma.sharedHealthData.findFirst({
      where: {
        patientId: session.user.id,
        doctorId: doctor.id,
      },
    })
    console.log("🔍 Compartilhamento existente:", JSON.stringify(existingShare, null, 2))

    if (existingShare) {
      console.log("ℹ️ Dados já compartilhados com este médico")
      return NextResponse.json({ message: "Dados já compartilhados com este médico" }, { status: 200 })
    }

    // Buscar dados do Google Fit
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        googleFitAccessToken: true,
        googleFitRefreshToken: true,
        googleFitTokenExpiry: true,
      },
    })

    let googleFitData = null
    if (user?.googleFitAccessToken) {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30) // Buscar os últimos 30 dias de dados

      const googleFitResult = await fetchGoogleFitData(user.googleFitAccessToken, startDate, endDate)
      if (googleFitResult.success) {
        googleFitData = googleFitResult.data
      }
    }

    const newShare = await prisma.sharedHealthData.create({
      data: {
        patientId: session.user.id,
        doctorId: doctor.id,
        googleFitData: googleFitData ? JSON.stringify(googleFitData) : null,
      },
    })
    console.log("✅ Novo compartilhamento criado:", JSON.stringify(newShare, null, 2))

    console.log("🎉 Compartilhamento bem-sucedido, retornando resposta")
    return NextResponse.json({ message: "Dados de saúde compartilhados com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("🔥 Erro ao compartilhar dados:", error instanceof Error ? error.message : "Erro desconhecido")
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get("doctorId")

    if (!doctorId) {
      return NextResponse.json({ error: "ID do médico é obrigatório" }, { status: 400 })
    }

    await prisma.sharedHealthData.deleteMany({
      where: {
        patientId: session.user.id,
        doctorId: doctorId,
      },
    })

    return NextResponse.json({ message: "Acesso removido com sucesso" })
  } catch (error) {
    console.error("Erro ao remover acesso:", error instanceof Error ? error.message : "Erro desconhecido")
    return NextResponse.json(
      { error: "Erro ao remover acesso", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}

