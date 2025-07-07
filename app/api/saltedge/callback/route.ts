import { NextRequest, NextResponse } from 'next/server';
import { saltEdgeClient } from '@/lib/saltedge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Récupérer les paramètres de retour de Salt Edge
    const connectionId = searchParams.get('connection_id');
    const customerId = searchParams.get('customer_id');
    const stage = searchParams.get('stage');
    const errorMessage = searchParams.get('error_message');

    console.log('Salt Edge Callback:', {
      connectionId,
      customerId,
      stage,
      errorMessage
    });

    // Construire l'URL de redirection vers le dashboard
    const dashboardUrl = new URL('/dashboard', process.env.NEXTAUTH_URL);

    if (stage === 'success' && connectionId) {
      // Connexion réussie
      try {
        // Vérifier que la connexion existe et est active
        const connection = await saltEdgeClient.getConnection(connectionId);
        
        if (connection.status === 'active') {
          dashboardUrl.searchParams.set('status', 'success');
          dashboardUrl.searchParams.set('message', 'Votre compte bancaire a été connecté avec succès !');
          dashboardUrl.searchParams.set('connection_id', connectionId);
        } else {
          dashboardUrl.searchParams.set('status', 'pending');
          dashboardUrl.searchParams.set('message', 'Connexion en cours de traitement...');
        }
      } catch (error) {
        console.error('Error checking connection:', error);
        dashboardUrl.searchParams.set('status', 'warning');
        dashboardUrl.searchParams.set('message', 'Connexion créée mais vérification impossible.');
      }
    } else if (stage === 'error' || errorMessage) {
      // Erreur lors de la connexion
      const message = errorMessage || 'Une erreur est survenue lors de la connexion bancaire.';
      dashboardUrl.searchParams.set('status', 'error');
      dashboardUrl.searchParams.set('message', message);
    } else if (stage === 'fetching') {
      // Connexion en cours
      dashboardUrl.searchParams.set('status', 'pending');
      dashboardUrl.searchParams.set('message', 'Récupération des données bancaires en cours...');
    } else {
      // Statut inconnu ou annulation
      dashboardUrl.searchParams.set('status', 'info');
      dashboardUrl.searchParams.set('message', 'Connexion bancaire annulée ou incomplète.');
    }

    // Rediriger vers le dashboard avec le statut
    return NextResponse.redirect(dashboardUrl.toString());

  } catch (error: any) {
    console.error('Callback Error:', error);
    
    // En cas d'erreur, rediriger vers le dashboard avec un message d'erreur
    const dashboardUrl = new URL('/dashboard', process.env.NEXTAUTH_URL);
    dashboardUrl.searchParams.set('status', 'error');
    dashboardUrl.searchParams.set('message', 'Erreur lors du traitement du retour bancaire.');
    
    return NextResponse.redirect(dashboardUrl.toString());
  }
}

// Gérer les callbacks POST (webhooks) de Salt Edge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Salt Edge Webhook:', body);

    // Vérifier la signature du webhook (optionnel pour la sécurité)
    // TODO: Implémenter la vérification de signature avec la clé publique Salt Edge
    
    const { data } = body;
    
    if (data) {
      const { connection_id, stage, secret, api_stage } = data;
      
      // Log pour debug
      console.log(`Webhook - Connection ${connection_id}: ${stage} (${api_stage})`);
      
      // Ici on pourrait notifier l'utilisateur en temps réel via WebSocket
      // ou mettre à jour une base de données pour suivre l'état des connexions
      
      if (stage === 'success') {
        console.log(`✅ Connection ${connection_id} established successfully`);
      } else if (stage === 'error') {
        console.log(`❌ Connection ${connection_id} failed`);
      } else if (stage === 'fetching') {
        console.log(`🔄 Connection ${connection_id} is fetching data`);
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