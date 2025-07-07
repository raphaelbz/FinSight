import { NextRequest, NextResponse } from 'next/server';
import { saltEdgeClient } from '@/lib/saltedge';
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

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connection_id');
    const dataType = searchParams.get('type') || 'all'; // 'accounts', 'transactions', 'all'

    if (!connectionId) {
      return NextResponse.json(
        { error: 'Connection ID is required' },
        { status: 400 }
      );
    }

    try {
      // Vérifier que la connexion existe et appartient à l'utilisateur
      const connection = await saltEdgeClient.getConnection(connectionId);

      if (connection.status !== 'active') {
        return NextResponse.json(
          { 
            error: 'Connection is not active',
            status: connection.status,
            message: 'La connexion bancaire n\'est pas active. Veuillez la reconnecter.'
          },
          { status: 400 }
        );
      }

      let result: any = {
        connection: {
          id: connection.id,
          provider_name: connection.provider_name,
          status: connection.status,
          last_success_at: connection.last_success_at,
          created_at: connection.created_at
        }
      };

      // Récupérer les comptes si demandé
      if (dataType === 'accounts' || dataType === 'all') {
        try {
          const accounts = await saltEdgeClient.getAccounts(connectionId);
          result.accounts = accounts.map(account => 
            saltEdgeClient.formatAccountForDisplay(account)
          );
        } catch (error) {
          console.error('Error fetching accounts:', error);
          result.accounts_error = 'Impossible de récupérer les comptes';
        }
      }

      // Récupérer les transactions si demandé
      if (dataType === 'transactions' || dataType === 'all') {
        try {
          const transactions = await saltEdgeClient.getConnectionTransactions(connectionId);
          
          // Limiter à 100 transactions les plus récentes pour éviter les timeouts
          const limitedTransactions = transactions.slice(0, 100);
          
          result.transactions = limitedTransactions.map(transaction => 
            saltEdgeClient.formatTransactionForDisplay(transaction)
          );
          
          result.transactions_summary = {
            total_count: transactions.length,
            displayed_count: limitedTransactions.length,
            date_range: {
              from: transactions.length > 0 ? transactions[transactions.length - 1].made_on : null,
              to: transactions.length > 0 ? transactions[0].made_on : null
            }
          };
        } catch (error) {
          console.error('Error fetching transactions:', error);
          result.transactions_error = 'Impossible de récupérer les transactions';
        }
      }

      return NextResponse.json({
        success: true,
        data: result
      });

    } catch (saltEdgeError: any) {
      console.error('Salt Edge API Error:', saltEdgeError);
      
      if (saltEdgeError.message?.includes('ConnectionNotFound')) {
        return NextResponse.json(
          { error: 'Connection not found or access denied' },
          { status: 404 }
        );
      }

      if (saltEdgeError.message?.includes('Expired')) {
        return NextResponse.json(
          { 
            error: 'Connection expired',
            message: 'La connexion a expiré. Veuillez vous reconnecter à votre banque.'
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Salt Edge API error',
          details: saltEdgeError.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Data retrieval error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// POST endpoint pour déclencher une actualisation des données
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
    const { connection_id, type = 'refresh' } = body;

    if (!connection_id) {
      return NextResponse.json(
        { error: 'Connection ID is required' },
        { status: 400 }
      );
    }

    try {
      const returnUrl = `${process.env.NEXTAUTH_URL}/api/saltedge/callback`;

      let result;

      if (type === 'refresh') {
        // Actualiser les données existantes
        result = await saltEdgeClient.refreshConnection(connection_id, {
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
      } else if (type === 'reconnect') {
        // Reconnecter avec de nouveaux identifiants
        result = await saltEdgeClient.reconnectConnection(connection_id, {
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
      } else {
        return NextResponse.json(
          { error: 'Invalid refresh type. Use "refresh" or "reconnect"' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          connect_url: result.connect_url,
          expires_at: result.expires_at,
          type: type
        }
      });

    } catch (saltEdgeError: any) {
      console.error('Salt Edge refresh error:', saltEdgeError);
      
      if (saltEdgeError.message?.includes('ConnectionNotFound')) {
        return NextResponse.json(
          { error: 'Connection not found' },
          { status: 404 }
        );
      }

      if (saltEdgeError.message?.includes('CannotBeRefreshed')) {
        return NextResponse.json(
          { 
            error: 'Connection cannot be refreshed',
            message: 'Cette connexion ne peut pas être actualisée pour le moment.'
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { 
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
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
} 