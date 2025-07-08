#!/bin/bash

echo "🚀 Configuration Salt Edge pour FinSight"
echo "========================================"
echo ""

# Vérifier si .env.local existe
if [ ! -f ".env.local" ]; then
    echo "❌ Fichier .env.local non trouvé !"
    exit 1
fi

echo "📝 Entrez vos clés Salt Edge :"
echo ""

# Demander l'App ID
read -p "🔑 App-id Salt Edge : " SALTEDGE_APP_ID

# Demander le Secret
read -s -p "🔐 Secret Salt Edge : " SALTEDGE_SECRET
echo ""

# Valider les entrées
if [ -z "$SALTEDGE_APP_ID" ] || [ -z "$SALTEDGE_SECRET" ]; then
    echo "❌ App-id et Secret sont obligatoires !"
    exit 1
fi

echo ""
echo "⚙️ Configuration en cours..."

# Remplacer les valeurs dans .env.local
sed -i '' "s/SALTEDGE_APP_ID=your_app_id_here/SALTEDGE_APP_ID=$SALTEDGE_APP_ID/" .env.local
sed -i '' "s/SALTEDGE_SECRET=your_secret_here/SALTEDGE_SECRET=$SALTEDGE_SECRET/" .env.local

echo "✅ Configuration Salt Edge terminée !"
echo ""
echo "🚀 Prochaines étapes :"
echo "1. npm run dev      # Relancer le serveur"
echo "2. Ouvrir http://localhost:3000"
echo "3. Aller au dashboard et tester les banques fake"
echo ""
echo "📊 Statut actuel : Pending (10 tests disponibles)"
echo "🧪 Commencez par les banques de test (fake_oauth_client_xf)"
echo ""
echo "📖 Guide complet : SALTEDGE_TESTING_GUIDE.md" 