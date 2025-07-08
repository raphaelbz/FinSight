#!/bin/bash

# FinSight Setup Script
echo "🚀 Configuration de FinSight - Dashboard Salt Edge v6"
echo "=================================================="

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 18+ avant de continuer."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ requis. Version actuelle: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) détecté"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé."
    exit 1
fi

echo "✅ npm $(npm -v) détecté"

# Installer les dépendances
echo ""
echo "📦 Installation des dépendances..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Échec de l'installation des dépendances"
    exit 1
fi

# Créer le fichier .env.local s'il n'existe pas
if [ ! -f ".env.local" ]; then
    echo ""
    echo "⚙️ Création du fichier .env.local..."
    cp env.example .env.local
    echo "✅ Fichier .env.local créé à partir de env.example"
    echo ""
    echo "🔧 IMPORTANT: Vous devez maintenant configurer vos variables d'environnement:"
    echo "   - Éditez .env.local avec vos clés Salt Edge"
    echo "   - Configurez votre base de données PostgreSQL"
    echo "   - Ajoutez vos identifiants Google OAuth"
else
    echo "✅ Fichier .env.local déjà présent"
fi

# Générer une clé NextAuth si nécessaire
if ! grep -q "NEXTAUTH_SECRET=" .env.local || grep -q "your-nextauth-secret-here" .env.local; then
    echo ""
    echo "🔐 Génération d'une clé NextAuth sécurisée..."
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    
    if command -v openssl &> /dev/null; then
        # Remplacer la clé dans .env.local
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=$NEXTAUTH_SECRET/" .env.local
        else
            # Linux
            sed -i "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=$NEXTAUTH_SECRET/" .env.local
        fi
        echo "✅ Clé NextAuth générée et configurée"
    else
        echo "⚠️ OpenSSL non trouvé. Veuillez générer manuellement NEXTAUTH_SECRET dans .env.local"
    fi
fi

# Vérifier si Prisma est configuré
echo ""
echo "🗄️ Vérification de la configuration Prisma..."

if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Schema Prisma non trouvé"
    exit 1
fi

# Générer le client Prisma
echo "📱 Génération du client Prisma..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Échec de la génération du client Prisma"
    echo "💡 Assurez-vous que DATABASE_URL est correctement configuré dans .env.local"
    exit 1
fi

echo "✅ Client Prisma généré"

# Tenter la migration (peut échouer si la DB n'est pas configurée)
echo ""
echo "🔄 Tentative de migration de la base de données..."
echo "   (Ceci peut échouer si la base de données n'est pas encore configurée)"

npx prisma migrate dev --name init 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Migration de la base de données réussie"
else
    echo "⚠️ Migration échouée - configurez votre base de données dans .env.local puis exécutez:"
    echo "   npx prisma migrate dev --name init"
fi

# Résumé de la configuration
echo ""
echo "🎉 Configuration de base terminée !"
echo "=================================================="
echo ""
echo "📋 Prochaines étapes:"
echo ""
echo "1. 🔧 Configurer .env.local avec vos vraies clés:"
echo "   - SALTEDGE_APP_ID et SALTEDGE_SECRET"
echo "   - DATABASE_URL (PostgreSQL)"
echo "   - GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET"
echo ""
echo "2. 🗄️ Configurer votre base de données:"
echo "   npx prisma migrate dev --name init"
echo ""
echo "3. 🚀 Lancer le serveur de développement:"
echo "   npm run dev"
echo ""
echo "4. 🌐 Ouvrir http://localhost:3000"
echo ""
echo "📚 Documentation complète: README.md"
echo "🔗 Salt Edge Dashboard: https://www.saltedge.com/dashboard"
echo "🔗 Google Cloud Console: https://console.cloud.google.com"
echo ""
echo "✨ Bon développement avec FinSight ! 🇫🇷" 