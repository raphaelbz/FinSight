import { NextRequest, NextResponse } from 'next/server';
import { saltEdgeClient, recordTestUsage, parseSaltEdgeError } from '@/lib/saltedge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getOrCreateSaltEdgeInfo } from '@/lib/saltedge-db';

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

    // Log du test en cours
    console.log(`🧪 Test Salt Edge - Provider: ${provider_code || 'auto-selection'}`);

    try {
      // 1. Récupérer ou créer les informations Salt Edge pour cet utilisateur
      const saltEdgeInfo = await getOrCreateSaltEdgeInfo(session.user.email);
      console.log(`📋 Using Salt Edge customer: ${saltEdgeInfo.customerId}`);

      // 2. Créer le customer Salt Edge si ce n'est pas déjà fait
      let actualCustomerId = saltEdgeInfo.customerId;
      
      try {
        // Vérifier si le customer existe côté Salt Edge
        await saltEdgeClient.getCustomer(actualCustomerId);
        console.log(`✅ Customer ${actualCustomerId} already exists`);
      } catch (error: any) {
        // Si le customer n'existe pas, le créer
        if (error.message?.includes('CustomerNotFound')) {
          console.log(`🔄 Creating new Salt Edge customer...`);
          const newCustomer = await saltEdgeClient.createCustomer(actualCustomerId);
          actualCustomerId = newCustomer.id;
          console.log(`✅ Created customer: ${actualCustomerId}`);
        } else {
          throw error;
        }
      }

      // 3. Préparer l'URL de retour
      const returnUrl = `${process.env.NEXTAUTH_URL}/api/saltedge/callback`;

      // 4. Créer la session widget pour la connexion
      const sessionData: any = {
        customer_id: actualCustomerId,
        consent: {
          // PSD2 consent scopes
          scopes: ['accounts', 'transactions', 'holder_info']
        },
        attempt: {
          // Data scopes to fetch right after connect
          fetch_scopes: ['accounts', 'balance', 'transactions'],
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

      // Enregistrer l'utilisation d'un test
      const testStatus = recordTestUsage('connection_attempt', provider_code, true);
      console.log(`✅ Test enregistré - ${testStatus.usedTests}/${testStatus.totalTests} utilisés`);

      return NextResponse.json({
        success: true,
        data: {
          connect_url: widgetSession.connect_url,
          expires_at: widgetSession.expires_at,
          customer_id: actualCustomerId,
          test_status: testStatus
        }
      });

    } catch (saltEdgeError: any) {
      console.error('Salt Edge API Error:', saltEdgeError);
      
      // Enregistrer l'échec du test
      recordTestUsage('connection_failed', provider_code, false);
      
      // Utiliser la nouvelle gestion d'erreurs
      const errorInfo = parseSaltEdgeError(saltEdgeError);
      
      console.log(`❌ Salt Edge Error [${errorInfo.code}]: ${errorInfo.message}`);
      
      // Gestion spéciale pour les customers dupliqués (cas normal)
      if (errorInfo.code === 'DUPLICATE_CUSTOMER') {
        console.log('ℹ️ Customer already exists, this is expected behavior');
        return NextResponse.json(
          { 
            error: 'Profil utilisateur existant',
            code: errorInfo.code,
            userMessage: errorInfo.userMessage,
            retryable: errorInfo.retryable
          },
          { status: 409 }
        );
      }
      
      // Déterminer le code de statut HTTP approprié
      const statusCode = errorInfo.retryable ? 503 : 400;
      
      return NextResponse.json(
        { 
          error: errorInfo.userMessage,
          code: errorInfo.code,
          retryable: errorInfo.retryable,
          details: process.env.NODE_ENV === 'development' ? errorInfo.message : undefined
        },
        { status: statusCode }
      );
    }

  } catch (error: any) {
    console.error('Auth Error:', error);
    
    const errorInfo = parseSaltEdgeError(error);
    
    return NextResponse.json(
      { 
        error: errorInfo.userMessage,
        code: errorInfo.code,
        retryable: errorInfo.retryable,
        details: process.env.NODE_ENV === 'development' ? errorInfo.message : undefined
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