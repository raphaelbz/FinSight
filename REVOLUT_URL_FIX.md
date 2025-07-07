# 🔧 Fix Revolut Redirect URL - Solutions

## ❌ **Problème actuel**
```
Redirect URL invalide : http://localhost:3000/api/revolut/callback
```

Revolut exige des URLs HTTPS sécurisées, même en sandbox.

## ✅ **Solution 1 : Tunnel HTTPS avec ngrok (Recommandé)**

### 1. Créer le tunnel HTTPS
```bash
# Démarrer le tunnel (garde cette fenêtre ouverte)
ngrok http 3000
```

### 2. Récupérer l'URL HTTPS
Ngrok va afficher quelque chose comme :
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

### 3. Configurer Revolut avec la nouvelle URL
Dans le portail Revolut, utilise cette URL :
```
https://abc123.ngrok.io/api/revolut/callback
```

### 4. Mettre à jour les variables d'environnement
```bash
# .env.local
NEXTAUTH_URL=https://abc123.ngrok.io
REVOLUT_REDIRECT_URI=https://abc123.ngrok.io/api/revolut/callback
```

## ✅ **Solution 2 : URL Revolut Sandbox Standards**

Certains portails Revolut acceptent ces formats :

### Format 1 : Localhost avec port
```
http://localhost:3000/api/revolut/callback
```

### Format 2 : IP local
```
http://127.0.0.1:3000/api/revolut/callback
```

### Format 3 : Custom domain (recommandé pour le développement)
```
http://finsight.local:3000/api/revolut/callback
```

Pour utiliser le format 3, ajoute à `/etc/hosts` :
```bash
127.0.0.1    finsight.local
```

## ✅ **Solution 3 : Vérification des paramètres Revolut**

### Checklist des paramètres requis :

1. **Environment** : `sandbox` 
2. **Grant Type** : `authorization_code`
3. **Response Type** : `code`
4. **Scopes** nécessaires :
   - `read`
   - `accounts`
   - `transactions`

### URLs de redirection testées :
- ✅ `https://votre-tunnel.ngrok.io/api/revolut/callback`
- ⚠️ `http://localhost:3000/api/revolut/callback` (peut ne pas marcher)
- ⚠️ `http://127.0.0.1:3000/api/revolut/callback` (peut ne pas marcher)

## 🚀 **Étapes recommandées**

1. **Utilise ngrok** (Solution 1)
2. **Redémarre ton serveur Next.js** avec la nouvelle URL
3. **Met à jour le portail Revolut** avec l'URL HTTPS
4. **Teste la connexion**

### Commandes à exécuter :
```bash
# Terminal 1 : Tunnel ngrok
ngrok http 3000

# Terminal 2 : Serveur Next.js  
npm run dev
```

## ⚡ **Test rapide**

Une fois configuré, teste avec :
```
https://votre-tunnel.ngrok.io/dashboard/add-account
```

L'URL de callback devrait maintenant être acceptée ! 🎉 