# Configuration Salt Edge - Passage en Production

## 🎯 Étapes de Migration : Pending → Test → Live

### 📋 Phase 1: Mode "Pending" (Actuel)
- ✅ **Status**: Complété
- ✅ **Tests disponibles**: 10 tests maximum
- ✅ **Fonctionnalités**: Toutes les APIs disponibles
- ✅ **Limitations**: Volume limité, pas de production

### 🧪 Phase 2: Mode "Test" (Prochaine étape)
#### Prérequis pour le passage en mode test :
1. **Tests complets effectués** en mode pending
2. **Documentation** des cas d'usage validés
3. **Demande officielle** à Salt Edge
4. **Validation technique** par leur équipe

#### Configuration pour le mode test :
```bash
# Variables d'environnement - Mode Test
SALTEDGE_STATUS=test
SALTEDGE_APP_ID=your_test_app_id
SALTEDGE_SECRET=your_test_secret
SALTEDGE_BASE_URL=https://www.saltedge.com/api/v6
SALTEDGE_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nYOUR_TEST_PUBLIC_KEY\n-----END PUBLIC KEY-----"
SALTEDGE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_TEST_PRIVATE_KEY\n-----END PRIVATE KEY-----"
```

#### Avantages du mode test :
- 🔄 **Tests illimités** avec des banques réelles
- 🔒 **Signatures obligatoires** pour la sécurité
- 📊 **Métriques avancées** et monitoring
- 🌐 **Support de toutes les banques européennes**

### 🚀 Phase 3: Mode "Live" (Production)
#### Prérequis pour le passage en mode live :
1. **Validation complète** en mode test
2. **Audit de sécurité** Salt Edge
3. **Conformité PSD2/GDPR** validée
4. **Approbation finale** Salt Edge

#### Configuration pour le mode live :
```bash
# Variables d'environnement - Mode Live
SALTEDGE_STATUS=live
SALTEDGE_APP_ID=your_live_app_id
SALTEDGE_SECRET=your_live_secret
SALTEDGE_BASE_URL=https://www.saltedge.com/api/v6
SALTEDGE_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nYOUR_LIVE_PUBLIC_KEY\n-----END PUBLIC KEY-----"
SALTEDGE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_LIVE_PRIVATE_KEY\n-----END PRIVATE KEY-----"

# Configuration de monitoring en production
SALTEDGE_WEBHOOK_URL=https://your-domain.com/api/saltedge/callback
SALTEDGE_MONITORING_ENABLED=true
SALTEDGE_LOG_LEVEL=info
```

---

## 🔧 Modifications de Code Nécessaires

### 1. Activation des signatures (Mode test/live)
```typescript
// Dans lib/saltedge.ts - déjà implémenté
private async makeRequest<T>(endpoint: string, options = {}) {
  const signed = process.env.SALTEDGE_STATUS !== 'pending';
  // Les signatures deviennent obligatoires en test/live
}
```

### 2. Validation stricte des webhooks (Mode live)
```typescript
// Dans app/api/saltedge/callback/route.ts - déjà implémenté
if (process.env.SALTEDGE_STATUS === 'live' && !isValidSignature) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

### 3. Rate limiting adaptatif
```typescript
// Dans lib/saltedge.ts - déjà implémenté
const maxRequests = process.env.SALTEDGE_STATUS === 'pending' ? 15 : 
                   process.env.SALTEDGE_STATUS === 'test' ? 100 : 300;
```

---

## 📊 Monitoring et Métriques

### APIs de monitoring disponibles :
```bash
# Statut complet avec métriques
GET /api/saltedge/test-status?metrics=true&logs=true

# Logs détaillés par niveau
GET /api/saltedge/test-status?logs=true&logs_level=error&logs_count=50

# Performance uniquement
GET /api/saltedge/test-status?metrics=true
```

### Métriques suivies :
- ✅ **Taux de succès** des requêtes API
- ⏱️ **Temps de réponse moyen** 
- 📈 **Volume de requêtes** par minute/heure
- ❌ **Types d'erreurs** et fréquence
- 🏦 **Banques les plus utilisées**

---

## 🔒 Sécurité Renforcée

### Génération des clés de production :
```bash
# Générer une paire de clés RSA-2048 pour la production
openssl genrsa -out saltedge_private_live.pem 2048
openssl rsa -pubout -in saltedge_private_live.pem -out saltedge_public_live.pem

# Vérifier les clés
openssl rsa -in saltedge_private_live.pem -check
```

### Configuration de sécurité avancée :
```bash
# Variables de sécurité additionnelles
SALTEDGE_WEBHOOK_SECRET=your_webhook_secret_key
SALTEDGE_IP_WHITELIST=1.2.3.4,5.6.7.8  # IPs Salt Edge autorisées
SALTEDGE_RATE_LIMIT_STRICT=true
SALTEDGE_AUDIT_LOGS=true
```

---

## 📋 Checklist de Migration

### ✅ Mode Pending → Test
- [ ] **Finaliser tous les tests** en mode pending
- [ ] **Documenter les banques testées** et résultats
- [ ] **Valider les cas d'erreur** et gestion des exceptions
- [ ] **Soumettre la demande** à Salt Edge avec logs
- [ ] **Configurer les clés de test** une fois approuvé
- [ ] **Activer les signatures** obligatoires
- [ ] **Tester en mode test** avec volume supérieur

### ✅ Mode Test → Live
- [ ] **Tests complets** sur toutes les banques cibles
- [ ] **Audit de sécurité** interne complet
- [ ] **Tests de charge** et performance
- [ ] **Validation PSD2/GDPR** et conformité
- [ ] **Configuration monitoring** production
- [ ] **Backup et récupération** validés
- [ ] **Approbation Salt Edge** pour passage en live
- [ ] **Déploiement production** avec surveillance

---

## 🚨 Points d'Attention

### Pendant la migration :
1. **Pas d'interruption** : L'ancien mode reste actif pendant la migration
2. **Tests graduels** : Commencer par quelques banques en mode test
3. **Monitoring renforcé** : Surveiller tous les KPIs pendant 48h
4. **Rollback plan** : Avoir un plan de retour en arrière

### En production :
1. **Surveillance 24/7** des APIs critiques
2. **Alertes automatiques** sur les échecs
3. **Logs structurés** pour le debugging
4. **Backup des données** sensibles chiffrées

---

## 📞 Support et Escalade

### Contacts Salt Edge :
- **Support technique** : support@saltedge.com
- **Demandes de migration** : Via le dashboard Salt Edge
- **Urgences production** : Selon SLA convenu

### Documentation officielle :
- [API Documentation](https://docs.saltedge.com/)
- [Migration Guide](https://docs.saltedge.com/account_information/v5/#migration)
- [Security Guidelines](https://docs.saltedge.com/guides/security/)

---

*Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}*
*Status actuel : PENDING - Prêt pour passage en TEST* 