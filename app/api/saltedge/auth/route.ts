import { NextRequest, NextResponse } from 'next/server';
import { saltEdgeClient } from '@/lib/saltedge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
    const { provider_code } = body;

    // Créer un identifiant unique pour le customer Salt Edge
    const customerIdentifier = `finsight_${session.user.email}`;

    try {
      // Créer le customer Salt Edge
      let customer;
      try {
        customer = await saltEdgeClient.createCustomer(customerIdentifier);
      } catch (error: any) {
        // Si le customer existe déjà, on récupère l'erreur et on continue
        if (error.message?.includes('DuplicatedCustomer')) {
          // Pour l'instant, on crée un identifiant avec timestamp pour éviter les doublons
          const uniqueIdentifier = `${customerIdentifier}_${Date.now()}`;
          customer = await saltEdgeClient.createCustomer(uniqueIdentifier);
        } else {
          throw error;
        }
      }

      // Préparer l'URL de retour
      const returnUrl = `${process.env.NEXTAUTH_URL}/api/saltedge/callback`;

      // Créer la session widget pour la connexion
      const sessionData: any = {
        customer_id: customer.id,
        consent: ['accounts', 'transactions', 'holder_info'],
        attempt: {
          return_to: returnUrl,
          locale: 'fr',
          show_consent_confirmation: true,
          credentials_strategy: 'store'
        },
        widget: {
          template: 'default_v3',
          theme: 'light',
          javascript_callback_type: 'post_message',
          show_consent_confirmation: true,
          disable_provider_search: false,
          popular_providers_country: 'FR'
        }
      };

      // Ajouter le code du provider si spécifié
      if (provider_code) {
        sessionData.provider_code = provider_code;
      }

      const widgetSession = await saltEdgeClient.createConnectionSession(sessionData);

      return NextResponse.json({
        success: true,
        data: {
          connect_url: widgetSession.connect_url,
          expires_at: widgetSession.expires_at,
          customer_id: customer.id
        }
      });

    } catch (saltEdgeError: any) {
      console.error('Salt Edge API Error:', saltEdgeError);
      
      // Gérer les erreurs spécifiques de Salt Edge
      if (saltEdgeError.message?.includes('Customer')) {
        return NextResponse.json(
          { 
            error: 'Erreur lors de la création du profil utilisateur',
            details: saltEdgeError.message 
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Erreur de configuration Salt Edge',
          details: saltEdgeError.message 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Auth Error:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET endpoint pour récupérer les banques françaises disponibles
export async function GET() {
  try {
    const frenchBanks = await saltEdgeClient.getFrenchBanks();
    
    return NextResponse.json({
      success: true,
      data: frenchBanks.map(bank => ({
        code: bank.code,
        name: bank.name,
        logo_url: bank.logo_url,
        country_code: bank.country_code,
        mode: bank.mode,
        status: bank.status
      }))
    });

  } catch (error: any) {
    console.error('Error fetching French banks:', error);
    return NextResponse.json(
      { 
        error: 'Impossible de récupérer la liste des banques',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 