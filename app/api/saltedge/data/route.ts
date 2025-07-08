import { NextRequest, NextResponse } from 'next/server';
import { saltEdgeClient } from '@/lib/saltedge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  getUserBankingData, 
  getSaltEdgeInfoByEmail, 
  syncSaltEdgeData,
  createSyncLog 
} from '@/lib/saltedge-db';

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

    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('type') || 'all'; // 'accounts', 'transactions', 'all'

    try {
      // 1. Récupérer toutes les données bancaires de l'utilisateur depuis la base
      const userData = await getUserBankingData(session.user.email);

      if (!userData || !userData.saltEdge) {
        return NextResponse.json(
          { 
            success: false,
            error: 'No banking connection found',
            message: 'Aucune connexion bancaire trouvée. Veuillez connecter votre banque.'
          },
          { status: 404 }
        );
      }

      const { saltEdge, accounts } = userData;

      // 2. Vérifier le statut de la connexion
      if (saltEdge.status !== 'active' || !saltEdge.connectionId) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Connection not active',
            status: saltEdge.status,
            message: 'La connexion bancaire n\'est pas active. Veuillez la reconnecter.'
          },
          { status: 400 }
        );
      }

      // 3. Construire la réponse basée sur le type demandé
      let result: any = {
        connection: {
          id: saltEdge.connectionId,
          provider_name: saltEdge.providerName,
          status: saltEdge.status,
          last_sync_at: saltEdge.lastSyncAt,
          created_at: saltEdge.createdAt
        }
      };

      // Inclure les comptes si demandé
      if (dataType === 'accounts' || dataType === 'all') {
        result.accounts = accounts.map((account: any) => ({
          id: account.id,
          name: account.name,
          balance: account.balance,
          currency: account.currency,
          type: account.nature,
          iban: account.iban,
          accountNumber: account.accountNumber
        }));
      }

      // Inclure les transactions si demandé
      if (dataType === 'transactions' || dataType === 'all') {
        // Récupérer toutes les transactions de tous les comptes
        const allTransactions = accounts.flatMap((account: any) => 
          account.transactions.map((transaction: any) => ({
            id: transaction.id,
            date: transaction.madeOn,
            description: transaction.description,
            amount: Math.abs(transaction.amount),
            currency: transaction.currency,
            type: transaction.amount >= 0 ? 'credit' : 'debit',
            category: transaction.category,
            balance: transaction.balance,
            account_name: account.name
          }))
        );

        // Trier par date (plus récentes en premier)
        allTransactions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        result.transactions = allTransactions.slice(0, 100); // Limiter à 100 transactions
        
        result.transactions_summary = {
          total_count: allTransactions.length,
          displayed_count: result.transactions.length,
          date_range: {
            from: allTransactions.length > 0 ? allTransactions[allTransactions.length - 1].date : null,
            to: allTransactions.length > 0 ? allTransactions[0].date : null
          }
        };
      }

      return NextResponse.json({
        success: true,
        data: result
      });

    } catch (error: any) {
      console.error('Error fetching user banking data:', error);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Database error',
          details: error.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Data retrieval error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// POST endpoint pour déclencher une actualisation des données
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
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
    const { type = 'refresh' } = body;

    // Récupérer les informations Salt Edge de l'utilisateur
    const saltEdgeInfo = await getSaltEdgeInfoByEmail(session.user.email);
    if (!saltEdgeInfo || !saltEdgeInfo.connectionId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No active connection found' 
        },
        { status: 404 }
      );
    }

    const connectionId = saltEdgeInfo.connectionId;

    try {
      let result;
      const returnUrl = `${process.env.NEXTAUTH_URL}/api/saltedge/callback`;

      if (type === 'sync') {
        // Synchronisation manuelle des données
        console.log(`🔄 Manual sync requested for connection ${connectionId}`);
        
        const syncResult = await syncSaltEdgeData(connectionId);
        
        const duration = Date.now() - startTime;
        
        await createSyncLog(
          saltEdgeInfo.userId,
          connectionId,
          'manual_sync',
          syncResult.errors.length === 0 ? 'success' : 'error',
          `Manual sync: ${syncResult.accounts.length} accounts, ${syncResult.transactions.length} transactions`,
          duration
        );

        return NextResponse.json({
          success: true,
          data: {
            type: 'sync',
            accounts: syncResult.accounts.length,
            transactions: syncResult.transactions.length,
            errors: syncResult.errors,
            duration
          }
        });

      } else if (type === 'refresh') {
        // Actualiser les données existantes via Salt Edge
        result = await saltEdgeClient.refreshConnection(connectionId, {
          attempt: {
            return_to: returnUrl,
            locale: 'fr',
            show_consent_confirmation: false
          },
          widget: {
            theme: 'light',
            javascript_callback_type: 'post_message'
          }
        });

        await createSyncLog(
          saltEdgeInfo.userId,
          connectionId,
          'refresh_initiated',
          'pending',
          'Refresh connection initiated',
          Date.now() - startTime
        );

      } else if (type === 'reconnect') {
        // Reconnecter avec de nouveaux identifiants
        result = await saltEdgeClient.reconnectConnection(connectionId, {
          attempt: {
            return_to: returnUrl,
            locale: 'fr',
            show_consent_confirmation: true,
            credentials_strategy: 'store'
          },
          widget: {
            theme: 'light',
            javascript_callback_type: 'post_message'
          }
        });

        await createSyncLog(
          saltEdgeInfo.userId,
          connectionId,
          'reconnect_initiated',
          'pending',
          'Reconnect connection initiated',
          Date.now() - startTime
        );

      } else {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid refresh type. Use "sync", "refresh" or "reconnect"' 
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          connect_url: result?.connect_url,
          expires_at: result?.expires_at,
          type: type
        }
      });

    } catch (saltEdgeError: any) {
      console.error('Salt Edge refresh error:', saltEdgeError);
      
      const duration = Date.now() - startTime;
      
      await createSyncLog(
        saltEdgeInfo.userId,
        connectionId,
        `${type}_error`,
        'error',
        saltEdgeError.message,
        duration
      );
      
      if (saltEdgeError.message?.includes('ConnectionNotFound')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Connection not found' 
          },
          { status: 404 }
        );
      }

      if (saltEdgeError.message?.includes('CannotBeRefreshed')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Connection cannot be refreshed',
            message: 'Cette connexion ne peut pas être actualisée pour le moment.'
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { 
          success: false,
          error: 'Refresh failed',
          details: saltEdgeError.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
} 

// DELETE endpoint pour supprimer / déconnecter une connexion Salt Edge
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Récupérer les informations Salt Edge de l'utilisateur
    const saltEdgeInfo = await getSaltEdgeInfoByEmail(session.user.email);
    if (!saltEdgeInfo || !saltEdgeInfo.connectionId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No active connection found' 
        },
        { status: 404 }
      );
    }

    const connectionId = saltEdgeInfo.connectionId;

    try {
      // Supprimer la connexion côté Salt Edge
      await saltEdgeClient.deleteConnection(connectionId);

      // Supprimer toutes les données de l'utilisateur
      const { deleteUserData } = await import('@/lib/saltedge-db');
      await deleteUserData(session.user.email);

      console.log(`🗑️ Connection ${connectionId} deleted for user ${session.user.email}`);

      return NextResponse.json({
        success: true,
        message: 'Connexion supprimée avec succès'
      });

    } catch (saltEdgeError: any) {
      console.error('Salt Edge delete error:', saltEdgeError);
      
      // Même si Salt Edge échoue, on supprime les données locales
      if (saltEdgeError.message?.includes('ConnectionNotFound')) {
        const { deleteUserData } = await import('@/lib/saltedge-db');
        await deleteUserData(session.user.email);
        
        return NextResponse.json({
          success: true,
          message: 'Connexion supprimée localement (déjà supprimée côté Salt Edge)'
        });
      }

      return NextResponse.json(
        { 
          success: false,
          error: 'Delete failed',
          details: saltEdgeError.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
} 