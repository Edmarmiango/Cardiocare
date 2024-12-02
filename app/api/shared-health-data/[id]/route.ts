import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../auth/[...nextauth]/auth-options';
import prisma from '../../../../lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Acesso permitido apenas para médicos' },
        { status: 403 }
      );
    }

    const sharedDataId = params.id;

    if (!sharedDataId) {
      return NextResponse.json(
        { error: 'ID de compartilhamento não fornecido' },
        { status: 400 }
      );
    }

    const deletedShare = await prisma.sharedHealthData.delete({
      where: {
        id: sharedDataId,
        doctorId: session.user.id
      }
    });

    if (!deletedShare) {
      return NextResponse.json(
        { error: 'Dados compartilhados não encontrados ou você não tem permissão para removê-los' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Compartilhamento de dados removido com sucesso' });
  } catch (error) {
    console.error('Error removing shared health data:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Erro ao remover dados compartilhados', details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}


