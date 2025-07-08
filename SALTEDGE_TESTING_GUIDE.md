# Guide d'utilisation Salt Edge - Mode Pending (10 tests)

## 🧪 Statut actuel: PENDING avec 10 tests disponibles

### 📋 Tests recommandés à effectuer

#### 1. **Test de base - Connexion Fake Bank** (2 tests)
- Utiliser le provider `fake_oauth_client_xf` pour tester le flow OAuth
- Utiliser le provider `fake_client_xf` pour tester le flow Web
- ✅ **Avantage**: Connexion garantie sans vraie banque

#### 2. **Test banque française populaire** (2 tests)
- Crédit Agricole (`credit_agricole_particuliers_fr`)
- BNP Paribas (`bnp_paribas_particuliers_fr`)
- ✅ **Objectif**: Tester avec vraies banques françaises

#### 3. **Test Revolut** (1 test)
- Provider: `revolut_gb` ou `revolut_business_gb`
- ✅ **Important**: Tester la banque en ligne moderne

#### 4. **Test de gestion d'erreurs** (2 tests)
- Tester avec identifiants incorrects
- Tester l'annulation du process
- ✅ **Objectif**: Valider la robustesse

#### 5. **Test de rafraîchissement** (2 tests)
- Tester le refresh des données
- Tester la reconnexion
- ✅ **Objectif**: Valider la persistence

#### 6. **Test de déconnexion** (1 test)
- Tester la suppression de connexion
- ✅ **Objectif**: Valider le cycle complet

---

## 🚀 Optimisations ajoutées pour les tests

### 1. Mode Test automatique
- Détection automatique du statut pending
- Affichage du compteur de tests restants
- Recommandations de banques à tester

### 2. Logs détaillés
- Suivi précis de chaque appel API
- Compteur de tests utilisés
- Sauvegarde des résultats de tests

### 3. Banques recommandées pour tests
- Liste prioritaire des providers fiables
- Fake banks pour tests sans risque
- Banques françaises principales

---

## 📊 Progression des tests

| Test | Status | Provider | Résultat |
|------|--------|----------|----------|
| 1. Fake OAuth | ⏳ | `fake_oauth_client_xf` | - |
| 2. Fake Web | ⏳ | `fake_client_xf` | - |
| 3. Crédit Agricole | ⏳ | `credit_agricole_particuliers_fr` | - |
| 4. BNP Paribas | ⏳ | `bnp_paribas_particuliers_fr` | - |
| 5. Revolut | ⏳ | `revolut_gb` | - |
| 6. Test erreur 1 | ⏳ | Identifiants incorrects | - |
| 7. Test erreur 2 | ⏳ | Annulation process | - |
| 8. Refresh | ⏳ | Rafraîchissement | - |
| 9. Reconnexion | ⏳ | Reconnexion | - |
| 10. Déconnexion | ⏳ | Suppression | - |

---

## 🔧 Configuration pour tests optimaux

### Variables d'environnement nécessaires
```bash
SALTEDGE_APP_ID=your_app_id
SALTEDGE_SECRET=your_secret
SALTEDGE_BASE_URL=https://www.saltedge.com/api/v6
SALTEDGE_STATUS=pending
SALTEDGE_TESTS_REMAINING=10
```

### URLs de test locales
- **Dashboard**: http://localhost:3000/dashboard
- **Auth Salt Edge**: http://localhost:3000/api/saltedge/auth
- **Callback**: http://localhost:3000/api/saltedge/callback

---

## ⚠️ Bonnes pratiques pour économiser les tests

1. **Utilisez d'abord les fake banks** pour valider le flow technique
2. **Testez une seule vraie banque française** pour valider l'intégration
3. **Documentez chaque test** pour éviter les répétitions
4. **Préparez vos identifiants** avant de lancer le test
5. **Ne pas quitter le process** une fois commencé

---

## 🆘 En cas de problème

### Erreurs communes et solutions
- **DuplicatedCustomer**: Normal, gestion automatique
- **InvalidCredentials**: Vérifier les identifiants de test
- **ConnectionTimeout**: Réessayer avec une autre banque
- **ProviderDisabled**: Choisir un autre provider

### Codes d'erreur Salt Edge
- `200`: Succès ✅
- `400`: Erreur de paramètres
- `401`: Authentification échouée
- `404`: Ressource non trouvée
- `429`: Limite de taux atteinte

---

## 📈 Après validation

Une fois vos tests concluants:
1. **Soumettre la demande de production** à Salt Edge
2. **Documenter les cas d'usage validés**
3. **Préparer la mise en production**
4. **Configurer la surveillance**

---

*Dernière mise à jour: ${new Date().toLocaleDateString('fr-FR')}* 