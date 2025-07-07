# Configuration Google OAuth pour FinSight

## 🔧 Configuration locale (développement)

### 1. Créer le fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet avec :

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-aleatoire-ici-changez-en-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=votre-google-client-id
GOOGLE_CLIENT_SECRET=votre-google-client-secret
```

### 2. Obtenir les identifiants Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API "Google+ API" dans "APIs & Services"
4. Allez dans "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configurez :
   - **Application type**: Web application
   - **Name**: FinSight (ou le nom de votre choix)
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
   - **Authorized redirect URIs**: 
     - `http://localhost:3000/api/auth/callback/google`

6. Copiez le **Client ID** et **Client Secret** dans votre `.env.local`

### 3. Générer NEXTAUTH_SECRET

Générez une clé secrète aléatoirement :

```bash
openssl rand -base64 32
```

Ou utilisez ce site : https://generate-secret.vercel.app/32

## 🚀 Configuration Vercel (production)

### 1. Variables d'environnement sur Vercel

1. Allez dans votre projet sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Allez dans "Settings" → "Environment Variables"
3. Ajoutez :

```
NEXTAUTH_URL = https://votre-app-name.vercel.app
NEXTAUTH_SECRET = votre-secret-aleatoire-secure
GOOGLE_CLIENT_ID = votre-google-client-id
GOOGLE_CLIENT_SECRET = votre-google-client-secret
```

### 2. Mettre à jour Google OAuth pour production

Retournez sur [Google Cloud Console](https://console.cloud.google.com/) :

1. Dans "Credentials", éditez votre OAuth 2.0 Client ID
2. Ajoutez à "Authorized JavaScript origins":
   - `https://votre-app-name.vercel.app`
3. Ajoutez à "Authorized redirect URIs":
   - `https://votre-app-name.vercel.app/api/auth/callback/google`

### 3. Redéployer

Redéployez votre application sur Vercel pour que les variables d'environnement prennent effet.

## ✅ Test de la configuration

1. **Local**: Allez sur `http://localhost:3000/login`
2. **Production**: Allez sur `https://votre-app-name.vercel.app/login`
3. Cliquez sur "Continuer avec Google"
4. Vous devriez être redirigé vers Google pour l'authentification
5. Après connexion, vous arrivez sur le dashboard

## 🔒 Sécurité

- ❌ Ne commitez jamais votre `.env.local`
- ✅ Utilisez des secrets forts pour `NEXTAUTH_SECRET`
- ✅ Limitez les domaines autorisés dans Google Console
- ✅ Activez la vérification du domaine si nécessaire

## 🐛 Dépannage

### Erreur "Invalid client"
- Vérifiez que `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont corrects
- Vérifiez que l'URL de callback est correctement configurée

### Erreur "redirect_uri_mismatch"
- Vérifiez que l'URL de callback dans Google Console correspond exactement
- Format attendu : `http://localhost:3000/api/auth/callback/google`

### NextAuth ne fonctionne pas
- Vérifiez que `NEXTAUTH_URL` correspond à votre URL actuelle
- Redémarrez le serveur de développement après avoir modifié `.env.local` 