# Configuration Revolut - URLs de Redirection

## 🎯 Votre Redirect URL pour le Sandbox

```
http://localhost:3000/api/revolut/callback
```

## 📋 Configuration dans le Portail Revolut

### 1. Allez sur [developer.revolut.com](https://developer.revolut.com)
### 2. Créez/éditez votre application Open Banking
### 3. Dans **Redirect URIs**, ajoutez exactement :

```
http://localhost:3000/api/revolut/callback
```

## 🔧 Variables d'environnement requises

Créez un fichier `.env.local` avec :

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-cle-secrete-nextauth

# Revolut API
REVOLUT_CLIENT_ID=votre-client-id-revolut
REVOLUT_CLIENT_SECRET=votre-client-secret-revolut
REVOLUT_ENVIRONMENT=sandbox
```

## 🚀 Test de la Configuration

1. **Démarrez le serveur** : `npm run dev`
2. **Allez sur** : `http://localhost:3000/dashboard/add-account`
3. **Cliquez sur** "Connecter avec OAuth"
4. **Vous devriez être redirigé** vers Revolut

## ⚠️ URLs pour Production

Pour la production, changez :
- `NEXTAUTH_URL=https://votre-domaine.com`
- Redirect URL : `https://votre-domaine.com/api/revolut/callback`

## 🔍 Dépannage

Si ça ne marche pas :
1. ✅ Vérifiez que l'URL de redirection est **exactement** celle ci-dessus
2. ✅ Vérifiez vos variables d'environnement 
3. ✅ Redémarrez le serveur après modification du `.env.local`

## 📞 Support

- Documentation Revolut : [developer.revolut.com](https://developer.revolut.com)
- Endpoint de test : `GET /api/revolut/auth` 