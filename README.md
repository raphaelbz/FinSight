# FinSight 🇫🇷

Une application de gestion financière intelligente propulsée par l'IA, spécialement conçue pour les banques françaises.

## ✨ Fonctionnalités

- 🏦 **Connexion multi-banques** - Plus de 2,500 banques européennes supportées
- 🇫🇷 **Banques françaises** - Revolut, BNP Paribas, Crédit Agricole, Société Générale...
- 📊 **Score financier intelligent** - Analyse automatique de vos finances
- 🤖 **Conseils IA personnalisés** - Recommandations adaptées à votre profil
- 💬 **Assistant financier 24/7** - Chat IA pour vos questions financières
- 📈 **Analyse des dépenses** - Catégorisation et suivi automatique
- 🔮 **Projections financières** - Prédictions basées sur vos habitudes
- 🔒 **Sécurité PSD2** - Connexion bancaire certifiée européenne

## 🏦 Banques supportées

### 🇫🇷 Principales banques françaises
- 🟣 **Revolut** - Banque numérique leader
- 🏦 **BNP Paribas** - Leader bancaire français
- 🌾 **Crédit Agricole** - Banque mutualiste
- 🔴 **Société Générale** - Banque internationale
- 📮 **La Banque Postale** - Service public
- 💰 **Boursorama** - Banque en ligne
- 💼 **LCL** - Le Crédit Lyonnais
- 🧡 **ING Direct** - Banque digitale
- 👋 **Hello Bank!** - Banque mobile
- 🤝 **Crédit Mutuel** - Banque coopérative

### 🌍 Et 2,490+ autres banques européennes
Toutes les banques dans 50+ pays européens via **Salt Edge API**

## 🚀 Démarrage rapide

### Développement local

```bash
# Cloner le projet
git clone https://github.com/your-username/finsight.git
cd finsight

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Salt Edge

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Configuration Salt Edge

1. **Créer un compte** : [Salt Edge Dashboard](https://www.saltedge.com/dashboard)
2. **Récupérer les clés API** (App-id et Secret)
3. **Configurer .env.local** :

```bash
SALTEDGE_APP_ID=your_app_id_here
SALTEDGE_SECRET=your_secret_here
SALTEDGE_BASE_URL=https://www.saltedge.com/api/v6
NEXTAUTH_URL=http://localhost:3000
```

Voir [SALTEDGE_SETUP.md](./SALTEDGE_SETUP.md) pour la configuration complète.

## 🛠️ Technologies

### Frontend
- **Next.js 14** - Framework React full-stack
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utility-first
- **Shadcn/UI** - Composants UI modernes
- **Lucide React** - Icônes SVG

### Backend & API
- **Salt Edge API** - Connexion bancaire PSD2
- **NextAuth.js** - Authentification
- **Server Actions** - Actions côté serveur
- **API Routes** - Endpoints REST

### Déploiement
- **Vercel** - Plateforme de déploiement
- **Google OAuth** - Authentification sociale
- **HTTPS** - Sécurité transport

## 📁 Structure du projet

```
finsight/
├── app/                      # App Router Next.js 14
│   ├── api/saltedge/        # API Salt Edge
│   ├── dashboard/           # Interface utilisateur
│   └── login/               # Authentification
├── lib/                     # Utilitaires
│   ├── saltedge.ts         # Client Salt Edge
│   └── auth.ts             # Configuration NextAuth
├── components/             # Composants React
└── docs/                   # Documentation
```

## 🔒 Sécurité

- ✅ **PSD2 compliant** - Directive européenne
- ✅ **Open Banking** - Standard sécurisé
- ✅ **TLS 1.2+** - Chiffrement transport
- ✅ **OAuth 2.0** - Authentification moderne
- ✅ **RSA signatures** - Validation des requêtes
- ✅ **Pas de stockage** des identifiants bancaires

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Configurer les variables d'environnement
vercel env add SALTEDGE_APP_ID
vercel env add SALTEDGE_SECRET
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET

# Déployer
vercel --prod
```

### Variables d'environnement production

```bash
SALTEDGE_APP_ID=your_production_app_id
SALTEDGE_SECRET=your_production_secret
SALTEDGE_BASE_URL=https://www.saltedge.com/api/v6
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 📊 Fonctionnalités avancées

### API Salt Edge
- **Connexion temps réel** aux banques
- **Synchronisation automatique** des transactions
- **Support multi-comptes** par banque
- **Catégorisation intelligente** des dépenses
- **Actualisation on-demand** des données

### Interface utilisateur
- **Design responsive** - Mobile et desktop
- **Mode sombre/clair** - Préférences utilisateur
- **Notifications** - Alertes en temps réel
- **Graphiques interactifs** - Visualisation des données
- **Export de données** - PDF et CSV

## 🔧 Développement

### Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linting ESLint
npm run type-check   # Vérification TypeScript
```

### API Endpoints

```
GET  /api/saltedge/auth          # Initier connexion bancaire
POST /api/saltedge/auth          # Créer widget connection
GET  /api/saltedge/callback      # Retour après auth
POST /api/saltedge/callback      # Webhooks Salt Edge
GET  /api/saltedge/data          # Récupérer données bancaires
POST /api/saltedge/data          # Actualiser connexion
```

## 📚 Documentation

- [Configuration Salt Edge](./SALTEDGE_SETUP.md) - Setup complet
- [Salt Edge API Docs](https://docs.saltedge.com/v6/) - Documentation officielle
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation

## 🐛 Support & Contributions

### Signaler un bug
- [GitHub Issues](https://github.com/your-username/finsight/issues)
- Inclure les logs et étapes de reproduction

### Contribuer
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- **Salt Edge** - API bancaire européenne
- **Vercel** - Plateforme de déploiement
- **Shadcn** - Composants UI
- **Lucide** - Icônes
- **Next.js** - Framework React

---

**Développé avec ❤️ pour la communauté financière française** 