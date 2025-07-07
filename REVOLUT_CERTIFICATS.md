# 🔐 Configuration des Certificats Revolut Sandbox

## ✅ Étape 1 : CSR Généré !

Vous avez maintenant généré :
- `certs/revolut.csr` - À uploader sur Revolut
- `certs/private.key` - Votre clé privée (GARDEZ-LA SECRÈTE !)

## 📤 Étape 2 : Upload du CSR sur Revolut

### 1. Allez sur le portail développeur Revolut
- [developer.revolut.com](https://developer.revolut.com)
- Connectez-vous à votre compte

### 2. Dans votre application Open Banking
- Allez dans la section **"Certificates"** ou **"Sandbox certificates"**
- Cherchez **"Upload CSR file"**

### 3. Uploadez le fichier
```bash
# Le fichier à uploader :
certs/revolut.csr
```

## 📥 Étape 3 : Récupérer les certificats

Après l'upload, Revolut vous donnera :
- **Transport certificate** (`transport.pem`)
- **Signing certificate** (si nécessaire)

### Téléchargez et placez dans le dossier certs :
```
certs/
├── revolut.csr          ✅ (déjà créé)
├── private.key          ✅ (déjà créé)
├── transport.pem        📥 (à télécharger)
└── signing.pem          📥 (optionnel)
```

## 🔧 Étape 4 : Configuration de l'environnement

Mettez à jour votre `.env.local` :

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-nextauth

# Revolut API
REVOLUT_CLIENT_ID=votre-client-id
REVOLUT_CLIENT_SECRET=votre-client-secret
REVOLUT_ENVIRONMENT=sandbox

# Certificats (après téléchargement)
REVOLUT_TRANSPORT_CERT_PATH=./certs/transport.pem
REVOLUT_PRIVATE_KEY_PATH=./certs/private.key
```

## 🚀 Étape 5 : Test

Une fois configuré :
1. Redémarrez votre serveur : `npm run dev`
2. Allez sur `/dashboard/add-account`
3. Cliquez "Connecter avec OAuth"
4. Vous devriez être redirigé vers Revolut !

## ⚠️ Important

- **NE JAMAIS** commiter `private.key` dans Git
- Ajoutez `certs/` à votre `.gitignore`
- Gardez vos certificats en sécurité

## 🔒 Sécurité

Ajoutons `certs/` au `.gitignore` pour éviter de commiter les clés :

```bash
echo "certs/" >> .gitignore
```

## 📞 Problèmes ?

Si vous avez des problèmes :
1. Vérifiez que le CSR a été uploadé correctement
2. Vérifiez vos clés API dans le portail Revolut
3. Vérifiez votre `.env.local`

---

**Prochaine étape :** Uploadez `certs/revolut.csr` sur le portail Revolut ! 