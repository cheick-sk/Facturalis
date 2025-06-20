#!/bin/bash

# Script pour créer des données de démonstration InvoiceFlow

BACKEND_URL="http://localhost:8001"
API="${BACKEND_URL}/api"

echo "🚀 Création des données de démonstration InvoiceFlow..."

# Créer un utilisateur admin
echo "📝 Création de l'utilisateur admin..."
ADMIN_RESPONSE=$(curl -s -X POST ${API}/register \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@invoiceflow.com", "name": "Démo InvoiceFlow", "password": "demo123"}')

if echo "$ADMIN_RESPONSE" | grep -q "id"; then
    echo "✅ Utilisateur admin créé"
else
    echo "⚠️  Utilisateur existe déjà ou erreur de création"
fi

# Se connecter
echo "🔐 Connexion..."
LOGIN_RESPONSE=$(curl -s -X POST ${API}/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@invoiceflow.com", "password": "demo123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Erreur de connexion"
    exit 1
fi

echo "✅ Connecté avec succès"

# Créer des clients
echo "👥 Création des clients..."

CLIENTS=(
  '{"name": "Acme Corporation", "email": "contact@acme.com", "phone": "01 23 45 67 89", "address": "123 Business Street, Paris 75001", "status": "Actif"}'
  '{"name": "TechStart SAS", "email": "hello@techstart.fr", "phone": "02 34 56 78 90", "address": "456 Innovation Avenue, Lyon 69000", "status": "Actif"}'
  '{"name": "Digital Solutions", "email": "info@digitalsolutions.com", "phone": "03 45 67 89 01", "address": "789 Tech Boulevard, Marseille 13000", "status": "Actif"}'
  '{"name": "Creative Agency", "email": "contact@creative.agency", "phone": "04 56 78 90 12", "address": "321 Design Street, Toulouse 31000", "status": "Inactif"}'
)

CLIENT_IDS=()

for client in "${CLIENTS[@]}"; do
    RESPONSE=$(curl -s -X POST ${API}/clients \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$client")
    
    CLIENT_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    CLIENT_IDS+=("$CLIENT_ID")
    CLIENT_NAME=$(echo $client | grep -o '"name":"[^"]*' | cut -d'"' -f4)
    echo "   ✅ Client créé: $CLIENT_NAME"
done

# Créer des factures
echo "📄 Création des factures..."

INVOICES=(
  '{"client_id": "'${CLIENT_IDS[0]}'", "status": "Payé", "description": "Développement site web corporate", "items": [{"description": "Design UI/UX", "quantity": 1, "price": 2500.00}, {"description": "Développement Frontend", "quantity": 1, "price": 3500.00}, {"description": "Intégration Backend", "quantity": 1, "price": 2000.00}]}'
  '{"client_id": "'${CLIENT_IDS[1]}'", "status": "Envoyé", "description": "Application mobile iOS/Android", "items": [{"description": "Développement iOS", "quantity": 1, "price": 4500.00}, {"description": "Développement Android", "quantity": 1, "price": 4200.00}]}'
  '{"client_id": "'${CLIENT_IDS[0]}'", "status": "Payé", "description": "Maintenance site web", "items": [{"description": "Maintenance mensuelle", "quantity": 3, "price": 450.00}]}'
  '{"client_id": "'${CLIENT_IDS[2]}'", "status": "En retard", "description": "Refonte identité visuelle", "items": [{"description": "Logo design", "quantity": 1, "price": 1200.00}, {"description": "Charte graphique", "quantity": 1, "price": 800.00}]}'
  '{"client_id": "'${CLIENT_IDS[1]}'", "status": "Payé", "description": "Consulting technique", "items": [{"description": "Audit sécurité", "quantity": 1, "price": 1500.00}, {"description": "Formation équipe", "quantity": 4, "price": 300.00}]}'
)

for invoice in "${INVOICES[@]}"; do
    RESPONSE=$(curl -s -X POST ${API}/invoices \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$invoice")
    
    INVOICE_NUMBER=$(echo $RESPONSE | grep -o '"invoice_number":"[^"]*' | cut -d'"' -f4)
    echo "   ✅ Facture créée: $INVOICE_NUMBER"
done

echo ""
echo "🎉 Données de démonstration créées avec succès!"
echo ""
echo "📊 Vous pouvez maintenant tester l'application avec:"
echo "   📧 Email: demo@invoiceflow.com"
echo "   🔑 Mot de passe: demo123"
echo ""
echo "🌐 Accédez à l'application sur: http://localhost:3000"
echo ""