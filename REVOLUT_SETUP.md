# Intégration Revolut API - Guide de Configuration

Ce guide explique comment configurer l'intégration avec l'API Open Banking de Revolut dans FinSight.

## 🔧 Correction récente : Header x-fapi-financial-id

**Problème résolu** : L'erreur `403 Forbidden - Incorrect 'x-fapi-financial-id' value` a été corrigée.

L'API Revolut Open Banking exige le header `x-fapi-financial-id` avec la valeur officielle : `001580000103UAvAAM`

Cette correction a été automatiquement appliquée dans le code.

## Prérequis

1. **Compte Revolut Business** - Nécessaire pour accéder aux APIs développeur
2. **Enregistrement développeur** - S'inscrire sur [developer.revolut.com](https://developer.revolut.com)
3. **Application Open Banking** - Créer une application via le portail développeur

## Étapes de Configuration

### 1. Inscription et Enregistrement

1. Créez un compte sur [Revolut Developer Portal](https://developer.revolut.com)
2. Allez dans la section "Open Banking API"
3. Créez une nouvelle application
4. Demandez l'accès au Sandbox pour les tests

### 2. Certificats (Production)

Pour la production, vous devez :
- Obtenir un certificat de transport OBIE ou eIDAS valide
- Générer une CSR (Certificate Signing Request)
- Convertir les certificats au format requis

### 3. Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (existant)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Revolut Open Banking API
REVOLUT_CLIENT_ID=your-revolut-client-id
REVOLUT_CLIENT_SECRET=your-revolut-client-secret
REVOLUT_SANDBOX_BASE_URL=https://sandbox-oba.revolut.com
REVOLUT_PRODUCTION_BASE_URL=https://oba.revolut.com
REVOLUT_ENVIRONMENT=sandbox

# Revolut Certificates (pour production uniquement)
REVOLUT_TRANSPORT_CERT_PATH=./certs/transport.pem
REVOLUT_PRIVATE_KEY_PATH=./certs/private.key
```

### 4. Configuration de l'Application

Dans le portail développeur Revolut :

1. **Redirect URIs** : Ajoutez `http://localhost:3000/api/revolut/callback`
2. **Scopes** : Sélectionnez `accounts` et `transactions`
3. **Environment** : Commencez par `sandbox`

## Fonctionnalités Implémentées

### ✅ OAuth 2.0 Flow
- Authentification sécurisée avec Revolut
- Gestion des états et nonces pour la sécurité
- Redirection automatique après autorisation

### ✅ Récupération des Données
- Comptes bancaires de l'utilisateur
- Transactions des 3 derniers mois
- Soldes en temps réel

### ✅ Interface Utilisateur
- Page de connexion dédiée avec badge "BETA"
- Dashboard avec données réelles
- Gestion des erreurs et messages de statut

### ✅ Sécurité
- Tokens stockés de manière sécurisée
- Validation des paramètres OAuth
- Gestion des sessions

## Architecture

```
lib/revolut.ts              # Utilitaires API Revolut
app/api/revolut/
  ├── auth/route.ts         # Initiation OAuth
  ├── callback/route.ts     # Callback OAuth
  └── data/route.ts         # Récupération/suppression données

app/dashboard/
  ├── page.tsx              # Dashboard avec données réelles
  └── add-account/page.tsx  # Interface de connexion
```

## API Endpoints

- `GET /api/revolut/auth` - Démarre le flow OAuth
- `GET /api/revolut/callback` - Reçoit le callback Revolut
- `GET /api/revolut/data` - Récupère les données utilisateur
- `DELETE /api/revolut/data` - Déconnecte le compte

## Test en Mode Sandbox

1. Configurez `REVOLUT_ENVIRONMENT=sandbox`
2. Utilisez les clés API sandbox
3. Testez le flow complet de connexion
4. Vérifiez la récupération des données de test

## Passage en Production

1. Obtenez les certificats de production
2. Configurez `REVOLUT_ENVIRONMENT=production`
3. Mettez à jour les clés API
4. Testez avec de vrais comptes Revolut

## Sécurité et Conformité

- **PSD2 Compliant** : Utilise la directive européenne PSD2
- **Open Banking** : Conforme aux standards Open Banking
- **Chiffrement** : Toutes les communications sont chiffrées
- **Read-Only** : Accès en lecture seule aux données

## Limitations Actuelles

- Mode Sandbox uniquement par défaut
- Supports Revolut uniquement (extensible)
- Stockage temporaire en cookies (à améliorer pour la production)

## Prochaines Étapes

1. **Base de données** : Stocker les tokens de manière persistante
2. **Refresh tokens** : Implémenter le renouvellement automatique
3. **Webhooks** : Recevoir les notifications de changement
4. **Autres banques** : Étendre à d'autres APIs bancaires

## Support

Pour toute question :
- Documentation : [developer.revolut.com](https://developer.revolut.com)
- Support API : Utiliser l'email fourni dans le portail développeur
- Issues : Créer une issue dans ce repository 