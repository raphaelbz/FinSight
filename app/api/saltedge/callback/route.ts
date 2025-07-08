import { NextRequest, NextResponse } from 'next/server';
import { saltEdgeClient } from '@/lib/saltedge';
import { createVerify } from 'crypto';
import { 
  updateSaltEdgeConnection, 
  getSaltEdgeInfoByCustomerId, 
  syncSaltEdgeData,
  createSyncLog 
} from '@/lib/saltedge-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Récupérer les paramètres de retour de Salt Edge
    const connectionId = searchParams.get('connection_id');
    const customerId = searchParams.get('customer_id');
    const stage = searchParams.get('stage');
    const errorMessage = searchParams.get('error_message');

    console.log('Salt Edge Callback GET:', {
      connectionId,
      customerId,
      stage,
      errorMessage
    });

    // Construire l'URL de redirection vers le dashboard
    const dashboardUrl = new URL('/dashboard', process.env.NEXTAUTH_URL);

    // 1. Gestion explicite des erreurs renvoyées par Salt Edge
    if (stage === 'error' || errorMessage) {
      const message = errorMessage || 'Une erreur est survenue lors de la connexion bancaire.';
      dashboardUrl.searchParams.set('status', 'error');
      dashboardUrl.searchParams.set('message', message);

    // 2. Si un connection_id est présent, on vérifie directement l'état de la connexion
    } else if (connectionId) {
      try {
        const connection = await saltEdgeClient.getConnection(connectionId);

        switch (connection.status) {
          case 'active':
            dashboardUrl.searchParams.set('status', 'success');
            dashboardUrl.searchParams.set('message', 'Votre compte bancaire a été connecté avec succès !');
            break;
          case 'inactive':
          case 'disabled':
            dashboardUrl.searchParams.set('status', 'warning');
            dashboardUrl.searchParams.set('message', 'Connexion créée mais inactive. Veuillez réessayer plus tard.');
            break;
          default:
            dashboardUrl.searchParams.set('status', 'info');
            dashboardUrl.searchParams.set('message', 'Connexion en cours de traitement...');
        }

        dashboardUrl.searchParams.set('connection_id', connectionId);

      } catch (error) {
        console.error('Error checking connection:', error);
        dashboardUrl.searchParams.set('status', 'warning');
        dashboardUrl.searchParams.set('message', 'Connexion créée mais vérification impossible.');
      }

    // 3. Étapes intermédiaires connues (« fetching », « interactive », etc.)
    } else if (stage === 'fetching' || stage === 'interactive') {
      dashboardUrl.searchParams.set('status', 'info');
      dashboardUrl.searchParams.set('message', 'Récupération des données bancaires en cours...');

    // 4. Cas restant : annulation ou statut inconnu
    } else {
      dashboardUrl.searchParams.set('status', 'info');
      dashboardUrl.searchParams.set('message', 'Connexion bancaire en cours ou à finaliser.');
    }

    // Rediriger vers le dashboard avec le statut
    return NextResponse.redirect(dashboardUrl.toString());

  } catch (error: any) {
    console.error('Callback GET Error:', error);
    
    // En cas d'erreur, rediriger vers le dashboard avec un message d'erreur
    const dashboardUrl = new URL('/dashboard', process.env.NEXTAUTH_URL);
    dashboardUrl.searchParams.set('status', 'error');
    dashboardUrl.searchParams.set('message', 'Erreur lors du traitement du retour bancaire.');
    
    return NextResponse.redirect(dashboardUrl.toString());
  }
}

// Gérer les callbacks POST (webhooks) de Salt Edge
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    
    // Vérification de la signature du webhook pour la sécurité
    const signature = request.headers.get('signature');
    const isValidSignature = await verifyWebhookSignature(
      JSON.stringify(body), 
      signature
    );

    if (!isValidSignature) {
      console.warn('⚠️ Webhook signature validation failed');
      // En mode pending, on log l'avertissement mais on continue
      // En production, on devrait rejeter la requête
      if (process.env.SALTEDGE_STATUS === 'live') {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    }

    console.log('Salt Edge Webhook:', {
      ...body,
      signature_valid: isValidSignature
    });

    const { data } = body;
    
    if (data) {
      const { connection_id, stage, secret, api_stage, error_message } = data;
      
      // Log structuré pour debug
      console.log(`📡 Webhook - Connection ${connection_id}: ${stage} (${api_stage})`, {
        connection_id,
        stage,
        api_stage,
        error_message,
        timestamp: new Date().toISOString()
      });

      // Traitement basé sur le stage du webhook
      if (stage === 'success') {
        console.log(`✅ Connection ${connection_id} established successfully`);
        await handleSuccessfulConnection(connection_id, startTime);
        
      } else if (stage === 'error') {
        console.log(`❌ Connection ${connection_id} failed: ${error_message}`);
        await handleFailedConnection(connection_id, error_message, startTime);
        
      } else if (stage === 'fetching') {
        console.log(`🔄 Connection ${connection_id} is fetching data`);
        await handleFetchingConnection(connection_id, startTime);
        
      } else if (stage === 'interactive') {
        console.log(`🔐 Connection ${connection_id} requires user interaction`);
        await handleInteractiveConnection(connection_id, startTime);
      }
    }

    // Répondre à Salt Edge que le webhook a été traité
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────────────────────
// Handlers pour les différents types de webhooks
// ──────────────────────────────────────────────────────────────

async function handleSuccessfulConnection(connectionId: string, startTime: number) {
  try {
    // 1. Récupérer les détails de la connexion
    const connection = await saltEdgeClient.getConnection(connectionId);
    
    // 2. Mettre à jour la base de données avec les informations de connexion
    const saltEdgeInfo = await updateSaltEdgeConnection(
      connection.customer_id,
      connectionId,
      connection.provider_name
    );

    if (!saltEdgeInfo) {
      throw new Error(`No SaltEdgeInfo found for customer_id: ${connection.customer_id}`);
    }

    // 3. Synchroniser toutes les données (comptes + transactions)
    console.log(`🔄 Starting data sync for connection ${connectionId}...`);
    const syncResult = await syncSaltEdgeData(connectionId);
    
    const duration = Date.now() - startTime;
    
    // 4. Log du succès
    await createSyncLog(
      saltEdgeInfo.userId,
      connectionId,
      'webhook_success',
      'success',
      `Synchronized ${syncResult.accounts.length} accounts and ${syncResult.transactions.length} transactions`,
      duration
    );

    console.log(`✅ Connection ${connectionId} fully synchronized:`, {
      accounts: syncResult.accounts.length,
      transactions: syncResult.transactions.length,
      errors: syncResult.errors.length,
      duration: `${duration}ms`
    });

    if (syncResult.errors.length > 0) {
      console.warn(`⚠️ Sync warnings for ${connectionId}:`, syncResult.errors);
    }

  } catch (error: any) {
    console.error(`❌ Error handling successful connection ${connectionId}:`, error);
    
    // Log de l'erreur
    try {
      const connection = await saltEdgeClient.getConnection(connectionId);
      const saltEdgeInfo = await getSaltEdgeInfoByCustomerId(connection.customer_id);
      
      if (saltEdgeInfo) {
        await createSyncLog(
          saltEdgeInfo.userId,
          connectionId,
          'webhook_success_error',
          'error',
          `Failed to sync data: ${error.message}`,
          Date.now() - startTime
        );
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
}

async function handleFailedConnection(connectionId: string, errorMessage: string, startTime: number) {
  try {
    const connection = await saltEdgeClient.getConnection(connectionId);
    const saltEdgeInfo = await getSaltEdgeInfoByCustomerId(connection.customer_id);
    
    if (saltEdgeInfo) {
      await createSyncLog(
        saltEdgeInfo.userId,
        connectionId,
        'webhook_error',
        'error',
        errorMessage || 'Connection failed',
        Date.now() - startTime
      );
    }
  } catch (error) {
    console.error('Error logging failed connection:', error);
  }
}

async function handleFetchingConnection(connectionId: string, startTime: number) {
  try {
    const connection = await saltEdgeClient.getConnection(connectionId);
    const saltEdgeInfo = await getSaltEdgeInfoByCustomerId(connection.customer_id);
    
    if (saltEdgeInfo) {
      await createSyncLog(
        saltEdgeInfo.userId,
        connectionId,
        'webhook_fetching',
        'pending',
        'Data fetching in progress',
        Date.now() - startTime
      );
    }
  } catch (error) {
    console.error('Error logging fetching connection:', error);
  }
}

async function handleInteractiveConnection(connectionId: string, startTime: number) {
  try {
    const connection = await saltEdgeClient.getConnection(connectionId);
    const saltEdgeInfo = await getSaltEdgeInfoByCustomerId(connection.customer_id);
    
    if (saltEdgeInfo) {
      await createSyncLog(
        saltEdgeInfo.userId,
        connectionId,
        'webhook_interactive',
        'pending',
        'User interaction required',
        Date.now() - startTime
      );
    }
  } catch (error) {
    console.error('Error logging interactive connection:', error);
  }
}

// Fonction pour vérifier la signature du webhook
async function verifyWebhookSignature(
  payload: string, 
  signature: string | null
): Promise<boolean> {
  if (!signature) {
    console.warn('⚠️ No signature provided in webhook');
    return false;
  }

  const publicKey = process.env.SALTEDGE_PUBLIC_KEY;
  if (!publicKey) {
    console.warn('⚠️ SALTEDGE_PUBLIC_KEY not configured - skipping signature verification');
    return true; // En mode pending, on accepte sans signature
  }

  try {
    const verify = createVerify('RSA-SHA256');
    verify.update(payload);
    verify.end();
    
    return verify.verify(publicKey, signature, 'base64');
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
} 