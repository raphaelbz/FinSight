import { NextRequest, NextResponse } from 'next/server';
import { getTestStatus, resetTestCounter } from '@/lib/saltedge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const testStatus = getTestStatus();

    return NextResponse.json({
      success: true,
      data: testStatus
    });

  } catch (error: any) {
    console.error('Error getting test status:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération du statut des tests',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'reset') {
      resetTestCounter();
      console.log('🔄 Compteur de tests réinitialisé');
      
      return NextResponse.json({
        success: true,
        message: 'Compteur de tests réinitialisé',
        data: getTestStatus()
      });
    }

    return NextResponse.json(
      { error: 'Action non supportée. Utilisez "reset".' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Error managing test status:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la gestion du statut des tests',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 