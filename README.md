# FinSight - Financial Dashboard with Salt Edge v6

Un tableau de bord financier moderne intégrant l'API Salt Edge v6 pour la synchronisation bancaire française.

## 🚀 Fonctionnalités

- **Connexion bancaire sécurisée** via Salt Edge API v6
- **Synchronisation automatique** des comptes et transactions
- **Support complet des banques françaises** (BNP Paribas, Crédit Agricole, Société Générale, etc.)
- **Tableaux de bord en temps réel** avec métriques financières
- **Authentification Google** avec NextAuth.js
- **Base de données persistante** avec Prisma et PostgreSQL
- **Webhooks Salt Edge** pour la synchronisation en temps réel
- **Interface moderne** avec Tailwind CSS et shadcn/ui

## 🏗️ Architecture

```
FinSight/
├── app/                    # Next.js App Router
│   ├── api/               
│   │   └── saltedge/      # API Salt Edge v6
│   │       ├── auth/      # Authentification bancaire
│   │       ├── callback/  # Webhooks & redirections
│   │       └── data/      # Gestion des données
│   ├── dashboard/         # Interface utilisateur
│   └── login/             # Authentification
├── lib/                   # Utilities
│   ├── saltedge.ts        # Client Salt Edge v6
│   ├── saltedge-db.ts     # Helpers Prisma
│   ├── prisma.ts          # Configuration Prisma
│   └── auth.ts            # Configuration NextAuth
├── prisma/                # Schema base de données
└── components/            # Composants UI
```

## 📋 Prérequis

1. **Node.js 18+** et npm
2. **PostgreSQL** (local ou cloud)
3. **Compte Salt Edge** en mode Pending/Test
4. **Projet Google Cloud** pour OAuth

## 🛠️ Installation

### 1. Cloner et installer

```bash
git clone https://github.com/votre-user/FinSight.git
cd FinSight
npm install
```

### 2. Configuration des variables d'environnement

Copiez `env.example` vers `.env.local` :

```bash
cp env.example .env.local
```

Configurez les variables :

```env
# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-nextauth

# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/finsight"

# Google OAuth
GOOGLE_CLIENT_ID=votre-google-client-id
GOOGLE_CLIENT_SECRET=votre-google-client-secret

# Salt Edge API v6
SALTEDGE_APP_ID=votre-saltedge-app-id
SALTEDGE_SECRET=votre-saltedge-secret
SALTEDGE_STATUS=pending
SALTEDGE_BASE_URL=https://www.saltedge.com/api/v6
```

### 3. Configuration de la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Créer et appliquer les migrations
npx prisma migrate dev --name init

# (Optionnel) Interface Prisma Studio
npx prisma studio
```

### 4. Configuration Salt Edge

1. **Créez un compte** sur [Salt Edge Dashboard](https://www.saltedge.com/dashboard)
2. **Créez une application** et récupérez `APP_ID` et `SECRET`
3. **Configurez les callbacks** :
   - URL de callback : `https://votre-domaine.com/api/saltedge/callback`
   - Type : AIS (Account Information Services)

### 5. Configuration Google OAuth

1. **Console Google Cloud** → Créer un projet
2. **APIs & Services** → Identifiants → Créer OAuth 2.0
3. **URIs de redirection autorisées** :
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://votre-domaine.com/api/auth/callback/google` (prod)

## 🚀 Déploiement

### Développement local

```bash
npm run dev
```

Accédez à [http://localhost:3000](http://localhost:3000)

### Production (Vercel)

1. **Push sur GitHub** :
```bash
git add .
git commit -m "feat: complete Salt Edge v6 integration"
git push origin main
```

2. **Déploiement Vercel** :
   - Connectez votre repo GitHub
   - Ajoutez toutes les variables d'environnement
   - Configurez Vercel Postgres ou connectez votre DB externe
   - Déployez

3. **Post-déploiement** :
```bash
# Migration de la base de données
npx prisma migrate deploy

# Génération du client Prisma
npx prisma generate
```

### Configuration des webhooks en production

Mettez à jour vos callbacks Salt Edge avec l'URL de production :
- `https://votre-app.vercel.app/api/saltedge/callback`

## 📚 Utilisation

### 1. Connexion utilisateur
- Authentification Google via NextAuth.js
- Session persistante et sécurisée

### 2. Connexion bancaire
- Interface pour choisir sa banque française
- Widget Salt Edge sécurisé
- Support des banques de test (mode Pending)

### 3. Synchronisation des données
- **Automatique** : via webhooks Salt Edge
- **Manuelle** : bouton "Synchroniser maintenant"
- **Refresh** : renouvellement des tokens d'accès

### 4. Visualisation
- Dashboard avec métriques financières
- Liste des comptes avec soldes
- Historique des transactions
- Catégorisation automatique

## 🧪 Tests

### Banques de test Salt Edge

En mode Pending, utilisez ces providers de test :

```javascript
// Banques de test disponibles
fake_oauth_client_xf        // OAuth avec transactions
fake_client_xf              // Web form avec comptes multiples
fakebank_semi_interactive_xf // Requiert SMS
```

### Tests manuels

1. **Connexion** : Testez le flow complet
2. **Webhooks** : Vérifiez les logs de synchronisation
3. **Persistence** : Rechargez la page, données conservées
4. **Déconnexion** : Suppression propre des données

## 🔧 API Endpoints

### Authentification bancaire
```
POST /api/saltedge/auth
- Body: { provider_code?: string }
- Response: { connect_url, expires_at }
```

### Récupération des données
```
GET /api/saltedge/data?type=all
- Response: { accounts[], transactions[], connection }
```

### Synchronisation
```
POST /api/saltedge/data
- Body: { type: 'sync' | 'refresh' | 'reconnect' }
```

### Suppression
```
DELETE /api/saltedge/data
- Response: { success: true }
```

## 🔐 Sécurité

- **Signatures Salt Edge** : Vérification automatique en mode Live
- **Sessions chiffrées** : NextAuth.js avec JWT
- **Variables d'environnement** : Secrets protégés
- **HTTPS obligatoire** : Callbacks sécurisés
- **Isolation utilisateur** : Données strictement séparées

## 📊 Base de données

### Modèles Prisma

```prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  saltEdge SaltEdgeInfo?
  accounts Account[]
}

model SaltEdgeInfo {
  customerId   String  @unique
  connectionId String? @unique
  status       String  // pending, active, error
  lastSyncAt   DateTime?
}

model Account {
  id           String @id
  name         String
  balance      Float
  currency     String
  transactions Transaction[]
}

model Transaction {
  id          String @id
  description String
  amount      Float
  madeOn      DateTime
  category    String
}
```

## 🤝 Contribution

1. Fork du projet
2. Créer une branche feature
3. Commit des changements
4. Push et Pull Request

## 📝 Licence

MIT License - voir [LICENSE](LICENSE)

## 🆘 Support

- **Issues GitHub** : Rapportez les bugs
- **Salt Edge Docs** : [https://docs.saltedge.com/v6/](https://docs.saltedge.com/v6/)
- **NextAuth.js** : [https://next-auth.js.org/](https://next-auth.js.org/)

---

**FinSight** - Votre tableau de bord financier personnel 🇫🇷 