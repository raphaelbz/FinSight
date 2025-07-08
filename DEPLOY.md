# 🚀 Guide de Déploiement Vercel - FinSight

## 📋 Checklist Pre-Déploiement

- [x] ✅ Code pushé sur GitHub
- [ ] 🔑 Clés Salt Edge récupérées
- [ ] 🗄️ Base de données PostgreSQL créée
- [ ] 🔐 OAuth Google configuré
- [ ] 🌐 Déploiement Vercel

## 1. 🔑 Configuration Salt Edge

### Récupérer vos clés API
1. **Connectez-vous** à [Salt Edge Dashboard](https://www.saltedge.com/dashboard)
2. **Créez une application** AIS (Account Information Services)
3. **Notez vos clés** :
   - `APP_ID` : Votre identifiant d'application
   - `SECRET` : Votre clé secrète

### Configurer les callbacks
Dans votre application Salt Edge, configurez :
- **Callback URL** : `https://votre-app.vercel.app/api/saltedge/callback`
- **Webhook URL** : `https://votre-app.vercel.app/api/saltedge/callback`

## 2. 🗄️ Base de Données PostgreSQL

### Option A: Vercel Postgres (Recommandé)
```bash
# Après déploiement, dans Vercel Dashboard
1. Aller dans Storage → Create Database → Postgres
2. Copier la DATABASE_URL générée
```

### Option B: Supabase (Gratuit)
```bash
1. Aller sur https://supabase.com
2. Créer un nouveau projet
3. Aller dans Settings → Database
4. Copier la Connection String (mode session)
```

### Option C: Neon (Gratuit)
```bash
1. Aller sur https://neon.tech
2. Créer une base de données
3. Copier la Connection String
```

## 3. 🔐 Google OAuth Configuration

### Console Google Cloud
1. **Aller sur** [Google Cloud Console](https://console.cloud.google.com)
2. **Créer un projet** ou sélectionner un existant
3. **Activer Google+ API** :
   ```
   APIs & Services → Library → Google+ API → Enable
   ```
4. **Créer des identifiants OAuth 2.0** :
   ```
   APIs & Services → Credentials → Create OAuth 2.0 Client ID
   ```
5. **Configurer les URIs** :
   - **Authorized origins** : `https://votre-app.vercel.app`
   - **Authorized redirect URIs** : `https://votre-app.vercel.app/api/auth/callback/google`

## 4. 🌐 Déploiement Vercel

### Via Vercel Dashboard
1. **Connectez-vous** à [vercel.com](https://vercel.com)
2. **Import Project** → Sélectionnez votre repo GitHub
3. **Configure** le projet :
   - Framework : Next.js
   - Root Directory : `./`
   - Build Command : `npm run build`

### Variables d'environnement
Ajoutez toutes ces variables dans **Vercel Dashboard → Settings → Environment Variables** :

```env
# NextAuth
NEXTAUTH_URL=https://votre-app.vercel.app
NEXTAUTH_SECRET=votre-secret-aleatoire-long

# Database
DATABASE_URL=votre-connection-string-postgresql

# Google OAuth
GOOGLE_CLIENT_ID=votre-google-client-id
GOOGLE_CLIENT_SECRET=votre-google-client-secret

# Salt Edge API
SALTEDGE_APP_ID=votre-saltedge-app-id
SALTEDGE_SECRET=votre-saltedge-secret
SALTEDGE_STATUS=pending
SALTEDGE_BASE_URL=https://www.saltedge.com/api/v6

# Node Environment
NODE_ENV=production
```

### Déployer
```bash
# Cliquer sur "Deploy" dans Vercel
# Ou via CLI :
npx vercel --prod
```

## 5. 📊 Post-Déploiement

### Migration de la base de données
Une fois déployé, exécutez les migrations Prisma :

```bash
# Dans Vercel, aller dans Functions → Connect Terminal
npx prisma migrate deploy
npx prisma generate
```

### Test de l'application
1. **Ouvrir** votre URL Vercel
2. **Se connecter** avec Google
3. **Tester** une connexion bancaire avec une banque de test Salt Edge
4. **Vérifier** que les données s'affichent

### Vérification des webhooks
Dans Vercel Dashboard → Functions → View Function Logs, vérifiez que :
- Les callbacks Salt Edge arrivent bien
- Les données sont synchronisées en base
- Aucune erreur de webhooks

## 6. 🔧 Configuration Salt Edge Production

### Mise à jour des URLs
Dans Salt Edge Dashboard, mettez à jour :
- **Callback URL** : `https://votre-app.vercel.app/api/saltedge/callback`
- **Return URL** : `https://votre-app.vercel.app/dashboard`

### Test avec banques réelles
1. **Demander le passage en mode Test** à Salt Edge
2. **Tester avec vraies banques françaises**
3. **Valider le flow complet**

## 🎯 Commandes de Déploiement Rapide

```bash
# 1. Variables d'environnement (copier dans Vercel)
echo "NEXTAUTH_URL=https://your-app.vercel.app"
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo "DATABASE_URL=your-postgres-url"
echo "SALTEDGE_APP_ID=your-app-id"
echo "SALTEDGE_SECRET=your-secret"

# 2. Post-déploiement (Terminal Vercel)
npx prisma migrate deploy
npx prisma generate

# 3. Test
curl https://your-app.vercel.app/api/saltedge/auth
```

## 🐛 Dépannage

### Erreurs courantes

**1. Database connection failed**
```bash
# Vérifier DATABASE_URL dans Vercel
# S'assurer que la DB accepte les connexions SSL
```

**2. Salt Edge 401 Unauthorized**
```bash
# Vérifier SALTEDGE_APP_ID et SALTEDGE_SECRET
# Vérifier que l'URL de callback est correcte
```

**3. Google OAuth error**
```bash
# Vérifier GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET
# Vérifier les URIs de redirection autorisées
```

**4. Prisma Client error**
```bash
# Exécuter dans le terminal Vercel :
npx prisma generate
```

### Logs utiles
```bash
# Vercel Function Logs
vercel logs your-app.vercel.app

# Base de données
npx prisma studio

# Debug Salt Edge
curl -H "App-id: YOUR_ID" -H "Secret: YOUR_SECRET" \
  https://www.saltedge.com/api/v6/customers
```

## ✅ Validation finale

- [ ] 🌐 App accessible sur votre domaine Vercel
- [ ] 🔐 Connexion Google fonctionnelle
- [ ] 🏦 Connexion bancaire test Salt Edge réussie
- [ ] 💾 Données persistées en base
- [ ] 📡 Webhooks Salt Edge reçus
- [ ] 🔄 Synchronisation automatique opérationnelle

## 🎉 Félicitations !

Votre application FinSight est maintenant déployée et opérationnelle !

### 📞 Support
- **Issues GitHub** : [github.com/raphaelbz/FinSight/issues](https://github.com/raphaelbz/FinSight/issues)
- **Salt Edge Support** : [support@saltedge.com](mailto:support@saltedge.com)
- **Vercel Docs** : [vercel.com/docs](https://vercel.com/docs) 