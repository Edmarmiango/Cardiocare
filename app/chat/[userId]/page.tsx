import { Chat } from '../../../components/Chat'
import prisma from '../../../lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../api/auth/[...nextauth]/auth-options'
import { redirect } from 'next/navigation'

export default async function ChatWithUserPage({ params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  const otherUser = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { id: true, name: true }
  })

  if (!otherUser) {
    return <div>Usuário não encontrado</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Chat otherUserId={otherUser.id} otherUserName={otherUser.name} />
    </div>
  )
}

