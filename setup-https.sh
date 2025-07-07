#!/bin/bash

echo "🔧 Configuration automatique du tunnel HTTPS pour Revolut"
echo "=================================================="

# Vérifier si ngrok est installé
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok n'est pas installé. Installation..."
    brew install ngrok
    echo "✅ ngrok installé avec succès"
fi

# Démarrer ngrok en arrière-plan et capturer l'URL
echo "🚀 Démarrage du tunnel ngrok..."
ngrok http 3000 > /dev/null &
NGROK_PID=$!

# Attendre que ngrok se lance
sleep 3

# Récupérer l'URL HTTPS
echo "🔍 Récupération de l'URL HTTPS..."
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Erreur : Impossible de récupérer l'URL ngrok"
    echo "💡 Assure-toi que ngrok fonctionne : ngrok http 3000"
    exit 1
fi

echo "✅ URL HTTPS générée : $NGROK_URL"

# Mettre à jour le fichier .env.local
echo "📝 Mise à jour de .env.local..."

# Créer ou mettre à jour .env.local
if [ -f .env.local ]; then
    # Sauvegarder l'ancien fichier
    cp .env.local .env.local.backup
    
    # Supprimer les anciennes entrées
    grep -v "NEXTAUTH_URL=" .env.local > temp_env
    grep -v "REVOLUT_REDIRECT_URI=" temp_env > .env.local
    rm temp_env
fi

# Ajouter les nouvelles variables
echo "" >> .env.local
echo "# Configuration HTTPS pour Revolut (générée automatiquement)" >> .env.local
echo "NEXTAUTH_URL=$NGROK_URL" >> .env.local
echo "REVOLUT_REDIRECT_URI=$NGROK_URL/api/revolut/callback" >> .env.local

echo "✅ Variables d'environnement mises à jour :"
echo "   NEXTAUTH_URL=$NGROK_URL"
echo "   REVOLUT_REDIRECT_URI=$NGROK_URL/api/revolut/callback"

echo ""
echo "🎯 URL de redirection à configurer dans Revolut :"
echo "   $NGROK_URL/api/revolut/callback"
echo ""
echo "📋 Étapes suivantes :"
echo "1. ✅ Tunnel HTTPS créé automatiquement"
echo "2. ✅ Variables d'environnement configurées"
echo "3. 🔄 Va sur le portail Revolut et configure cette URL :"
echo "   → $NGROK_URL/api/revolut/callback"
echo "4. 🚀 Redémarre ton serveur : npm run dev"
echo ""
echo "⚠️  IMPORTANT : Garde ce terminal ouvert pour maintenir le tunnel !"
echo "   PID du processus ngrok : $NGROK_PID"
echo ""

# Attendre que l'utilisateur confirme
read -p "Appuie sur Entrée quand tu as configuré l'URL dans Revolut..."

echo "🎉 Configuration terminée ! Tu peux maintenant tester la connexion."
echo "🌐 Accède à ton app via : $NGROK_URL/dashboard/add-account" 