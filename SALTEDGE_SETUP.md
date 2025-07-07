# Configuration Salt Edge API pour FinSight

## 🌟 Aperçu

FinSight utilise maintenant **Salt Edge API** pour connecter plus de **2,500 banques** dans **50+ pays** incluant toutes les banques françaises principales :

- 🟣 **Revolut** - Banque numérique leader
- 🏦 **BNP Paribas** - Leader bancaire français  
- 🌾 **Crédit Agricole** - Banque mutualiste
- 🔴 **Société Générale** - Banque internationale
- 📮 **La Banque Postale** - Service public
- 💰 **Boursorama** - Banque en ligne
- Et **2,494+ autres banques européennes**

---

## 🚀 Configuration rapide

### 1. Créer un compte Salt Edge

1. **Inscription gratuite** : [https://www.saltedge.com/dashboard](https://www.saltedge.com/dashboard)
2. **Créer une application** dans le dashboard Salt Edge
3. **Récupérer les clés API** :
   - `App-id` (identifiant de l'application)
   - `Secret` (clé secrète)

### 2. Variables d'environnement

Ajouter dans `.env.local` :

```bash
# Salt Edge API Configuration
SALTEDGE_APP_ID=your_app_id_here
SALTEDGE_SECRET=your_secret_here
SALTEDGE_BASE_URL=https://www.saltedge.com/api/v6

# Pour la production (optionnel avec signatures)
SALTEDGE_PUBLIC_KEY=your_public_key_here
SALTEDGE_PRIVATE_KEY=your_private_key_here

# URLs de callback
NEXTAUTH_URL=https://your-domain.vercel.app
```

### 3. Déploiement Vercel

```bash
# Variables d'environnement Vercel
vercel env add SALTEDGE_APP_ID
vercel env add SALTEDGE_SECRET
vercel env add SALTEDGE_BASE_URL
vercel env add NEXTAUTH_URL

# Déployer
vercel --prod
```

---

## 🔧 Configuration détaillée

### Salt Edge Dashboard

1. **Se connecter** au [Salt Edge Dashboard](https://www.saltedge.com/dashboard)
2. **Créer une nouvelle application** :
   - **Nom** : `FinSight Production`
   - **Type** : `Web Application`
   - **Environnement** : `Live` (pour la production)

3. **Configurer les callbacks** :
   - **Success URL** : `https://your-domain.vercel.app/api/saltedge/callback`
   - **Error URL** : `https://your-domain.vercel.app/api/saltedge/callback`

4. **Récupérer les credentials** :
   - Aller dans `Settings` > `API Keys`
   - Copier `App-id` et `Secret`

### Clés de signature (Optionnel - Recommandé pour la production)

Pour sécuriser davantage les requêtes API :

```bash
# Générer une paire de clés RSA
openssl genrsa -out private.pem 2048
openssl rsa -pubout -in private.pem -out public.pem
```

Ajouter la clé publique dans le Salt Edge Dashboard et configurer :

```bash
SALTEDGE_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nYOUR_PUBLIC_KEY\n-----END PUBLIC KEY-----"
SALTEDGE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"
```

---

## 🏗️ Architecture technique

### Structure des APIs

```
/api/saltedge/
├── auth/route.ts          # Initiation connexion bancaire
├── callback/route.ts      # Retour après authentification
└── data/route.ts          # Récupération données bancaires
```

### Flux de connexion

1. **Utilisateur** clique "Connecter ma banque"
2. **Frontend** appelle `/api/saltedge/auth`
3. **Salt Edge** crée un widget session
4. **Utilisateur** s'authentifie via le widget Salt Edge
5. **Salt Edge** redirige vers `/api/saltedge/callback`
6. **Dashboard** affiche les données bancaires

### Données récupérées

```typescript
interface BankingData {
  connection: {
    id: string
    provider_name: string
    status: 'active' | 'inactive'
    created_at: string
  }
  accounts: Array<{
    id: string
    name: string
    balance: number
    currency: string
    type: string
    iban?: string
  }>
  transactions: Array<{
    id: string
    date: string
    description: string
    amount: number
    type: 'credit' | 'debit'
    category: string
  }>
}
```

---

## 🌍 Banques supportées

### 🇫🇷 France (Sélection)
- **Revolut** - Banque numérique
- **BNP Paribas** - Leader français
- **Crédit Agricole** - Réseau mutualiste
- **Société Générale** - International
- **La Banque Postale** - Service public
- **Boursorama** - En ligne leader
- **LCL** - Crédit Lyonnais
- **ING Direct** - Banque digitale
- **Hello Bank!** - Mobile BNP
- **Crédit Mutuel** - Coopératif

### 🌍 Europe (2,500+ banques)
- **Allemagne** : Deutsche Bank, Commerzbank, DKB...
- **Espagne** : Santander, BBVA, CaixaBank...
- **Italie** : UniCredit, Intesa Sanpaolo...
- **Pays-Bas** : ING, ABN AMRO, Rabobank...
- **Et 45+ autres pays européens**

---

## 🔒 Sécurité

### Standards respectés
- ✅ **PSD2** - Directive européenne
- ✅ **Open Banking** - Standard ouvert
- ✅ **TLS 1.2+** - Chiffrement transport
- ✅ **RSA-256** - Signatures API
- ✅ **OAuth 2.0** - Authentification

### Bonnes pratiques
- 🔐 **Clés privées** jamais exposées côté client
- 🔒 **Signatures** pour les requêtes sensibles
- 🛡️ **HTTPS** obligatoire en production
- ⏰ **Tokens** avec expiration courte
- 🔍 **Logs** pour audit et debug

---

## 🚨 Dépannage

### Erreurs courantes

#### "SALTEDGE_APP_ID is required"
```bash
# Vérifier les variables d'environnement
echo $SALTEDGE_APP_ID
vercel env ls
```

#### "Connection failed" 
```bash
# Vérifier la configuration Salt Edge
curl -H "App-id: YOUR_APP_ID" \
     -H "Secret: YOUR_SECRET" \
     https://www.saltedge.com/api/v6/countries
```

#### "Callback URL mismatch"
- Vérifier que `NEXTAUTH_URL` est correctement configuré
- S'assurer que l'URL de callback dans Salt Edge Dashboard correspond

### Tests de connectivité

```bash
# Test API Salt Edge
curl -X GET "https://www.saltedge.com/api/v6/countries" \
  -H "App-id: YOUR_APP_ID" \
  -H "Secret: YOUR_SECRET"

# Test local
curl http://localhost:3000/api/saltedge/auth
```

---

## 📈 Monitoring

### Métriques importantes
- **Taux de connexion** bancaire réussie
- **Temps de synchronisation** des transactions
- **Erreurs API** Salt Edge
- **Latence** des requêtes

### Logs utiles
```typescript
// Connexions réussies
console.log(`✅ Bank connected: ${providerName} for ${customerEmail}`)

// Erreurs API
console.error(`❌ Salt Edge API error:`, error.message)

// Performance
console.time('saltedge-data-fetch')
// ... fetch logic
console.timeEnd('saltedge-data-fetch')
```

---

## 🔗 Ressources

### Documentation officielle
- 📖 **Salt Edge Docs** : [https://docs.saltedge.com/v6/](https://docs.saltedge.com/v6/)
- 🏦 **Banques supportées** : [https://www.saltedge.com/products/account_information/coverage](https://www.saltedge.com/products/account_information/coverage)
- 🔧 **API Reference** : [https://docs.saltedge.com/v6/general/](https://docs.saltedge.com/v6/general/)

### Support
- 💬 **Salt Edge Support** : support@saltedge.com
- 🐛 **Issues GitHub** : [GitHub Issues](https://github.com/your-repo/issues)
- 📧 **Contact FinSight** : contact@finsight.app

---

## ✅ Checklist de déploiement

### Avant le déploiement
- [ ] Compte Salt Edge créé et vérifié
- [ ] Application configurée dans Salt Edge Dashboard
- [ ] Variables d'environnement définies
- [ ] URLs de callback configurées
- [ ] Tests locaux réussis

### Après le déploiement
- [ ] Test de connexion avec une vraie banque
- [ ] Vérification des logs de production
- [ ] Monitoring des métriques
- [ ] Documentation mise à jour
- [ ] Équipe informée de la nouvelle API

---

**🎉 Félicitations ! Votre integration Salt Edge est maintenant opérationnelle avec plus de 2,500 banques européennes supportées !** 