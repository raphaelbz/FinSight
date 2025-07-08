import { NextRequest, NextResponse } from 'next/server';
import { 
  getTestStatus, 
  resetTestCounter, 
  getPerformanceMetrics, 
  getSaltEdgeLogs,
  clearSaltEdgeLogs,
  clearCustomerCache
} from '@/lib/saltedge';
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
    const includeMetrics = searchParams.get('metrics') === 'true';
    const includeLogs = searchParams.get('logs') === 'true';
    const logsLevel = searchParams.get('logs_level') || undefined;
    const logsCount = searchParams.get('logs_count') ? parseInt(searchParams.get('logs_count')!) : 20;

    const testStatus = getTestStatus();
    
    let response: any = {
      success: true,
      data: {
        test_status: testStatus,
        mode: process.env.SALTEDGE_STATUS || 'pending',
        environment: process.env.NODE_ENV,
        api_version: 'v6',
        migration_status: 'Updated to Salt Edge API v6 - 404 errors fixed',
        base_url: process.env.SALTEDGE_BASE_URL || 'https://www.saltedge.com/api/v6',
        recommendations: generateTestRecommendations(testStatus)
      }
    };

    // Ajouter les métriques de performance si demandées
    if (includeMetrics) {
      response.data.performance = getPerformanceMetrics();
    }

    // Ajouter les logs si demandés
    if (includeLogs) {
      const logFilter: any = { lastN: logsCount };
      if (logsLevel) logFilter.level = logsLevel;
      
      response.data.logs = getSaltEdgeLogs(logFilter);
    }

    return NextResponse.json(response);

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

    switch (action) {
      case 'reset':
        resetTestCounter();
        console.log('🔄 Compteur de tests réinitialisé');
        
        return NextResponse.json({
          success: true,
          message: 'Compteur de tests réinitialisé',
          data: getTestStatus()
        });

      case 'clear_logs':
        clearSaltEdgeLogs();
        console.log('🧹 Logs Salt Edge effacés');
        
        return NextResponse.json({
          success: true,
          message: 'Logs Salt Edge effacés'
        });

      case 'clear_cache':
        clearCustomerCache();
        console.log('🧹 Cache des customers effacé');
        
        return NextResponse.json({
          success: true,
          message: 'Cache des customers effacé'
        });

      case 'reset_all':
        resetTestCounter();
        clearSaltEdgeLogs();
        clearCustomerCache();
        console.log('🔄 Réinitialisation complète effectuée');
        
        return NextResponse.json({
          success: true,
          message: 'Réinitialisation complète effectuée',
          data: getTestStatus()
        });

      default:
        return NextResponse.json(
          { error: 'Action non supportée. Utilisez "reset", "clear_logs", "clear_cache" ou "reset_all".' },
          { status: 400 }
        );
    }

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

// Fonction pour générer des recommandations basées sur le statut des tests
function generateTestRecommendations(testStatus: any) {
  const { usedTests, totalTests, remainingTests } = testStatus;
  const usagePercentage = (usedTests / totalTests) * 100;

  const recommendations = [];

  if (usedTests === 0) {
    recommendations.push({
      priority: 'high',
      message: 'Commencez par tester avec les "fake banks" pour valider le flow technique',
      action: 'Utilisez les providers fake_oauth_client_xf ou fake_client_xf'
    });
  }

  if (usagePercentage < 30) {
    recommendations.push({
      priority: 'medium',
      message: 'Testez avec une banque française populaire pour valider l\'intégration réelle',
      action: 'Essayez Crédit Agricole (credit_agricole_particuliers_fr) ou BNP Paribas'
    });
  }

  if (usagePercentage >= 30 && usagePercentage < 70) {
    recommendations.push({
      priority: 'medium',
      message: 'Testez la gestion d\'erreurs et les cas limites',
      action: 'Essayez avec des identifiants incorrects ou annulez le processus'
    });
  }

  if (remainingTests <= 3) {
    recommendations.push({
      priority: 'high',
      message: 'Attention : Il vous reste peu de tests. Utilisez-les judicieusement.',
      action: 'Préparez vos identifiants à l\'avance et documentez chaque test'
    });
  }

  if (usedTests >= totalTests) {
    recommendations.push({
      priority: 'critical',
      message: 'Vous avez épuisé vos tests. Prêt pour demander le passage en mode "test".',
      action: 'Contactez Salt Edge pour upgrader votre compte vers le mode test'
    });
  }

  return recommendations;
} 