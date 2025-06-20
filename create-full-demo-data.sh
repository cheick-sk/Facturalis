#!/bin/bash

# Script pour créer des données de démonstration complètes pour InvoiceFlow SaaS

BACKEND_URL="http://localhost:8001"
API="${BACKEND_URL}/api"

echo "🚀 Création des données de démonstration InvoiceFlow SaaS Complet..."

# Login to get token
echo "🔐 Connexion..."
LOGIN_RESPONSE=$(curl -s -X POST ${API}/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@invoiceflow.fr", "password": "admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Erreur de connexion"
    exit 1
fi

echo "✅ Connecté avec succès"

# Create Products/Services
echo "📦 Création des produits et services..."

PRODUCTS=(
  '{"name": "Développement site web", "description": "Création de site web sur mesure", "price": 2500.00, "unit": "forfait", "category": "Développement", "is_service": true}'
  '{"name": "Design logo", "description": "Création d'\''identité visuelle", "price": 800.00, "unit": "forfait", "category": "Design", "is_service": true}'
  '{"name": "Consultation SEO", "description": "Audit et optimisation SEO", "price": 150.00, "unit": "heure", "category": "Conseil", "is_service": true}'
  '{"name": "Formation WordPress", "description": "Formation à l'\''utilisation de WordPress", "price": 300.00, "unit": "jour", "category": "Formation", "is_service": true}'
  '{"name": "Maintenance mensuelle", "description": "Maintenance et mise à jour site web", "price": 120.00, "unit": "mois", "category": "Maintenance", "is_service": true}'
  '{"name": "Licence logiciel", "description": "Licence d'\''utilisation annuelle", "price": 500.00, "unit": "pièce", "category": "Produit", "is_service": false}'
)

PRODUCT_IDS=()

for product in "${PRODUCTS[@]}"; do
    RESPONSE=$(curl -s -X POST ${API}/products \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$product")
    
    PRODUCT_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    PRODUCT_IDS+=("$PRODUCT_ID")
    PRODUCT_NAME=$(echo $product | grep -o '"name":"[^"]*' | cut -d'"' -f4)
    echo "   ✅ Produit/Service créé: $PRODUCT_NAME"
done

# Create Clients
echo "👥 Création des clients..."

CLIENTS=(
  '{"name": "TechStart SARL", "email": "contact@techstart.fr", "phone": "01 23 45 67 89", "address": "123 Avenue de l'\''Innovation\n75001 Paris", "status": "Actif", "siret": "12345678901234", "contact_person": "Marie Dubois"}'
  '{"name": "Digital Corp", "email": "info@digitalcorp.com", "phone": "02 34 56 78 90", "address": "456 Rue du Numérique\n69000 Lyon", "status": "Actif", "siret": "23456789012345", "contact_person": "Pierre Martin"}'
  '{"name": "Creative Agency", "email": "hello@creative.agency", "phone": "03 45 67 89 01", "address": "789 Boulevard Créatif\n13000 Marseille", "status": "Actif", "siret": "34567890123456", "contact_person": "Sophie Leclerc"}'
  '{"name": "Startup Innovante", "email": "team@startup.fr", "phone": "04 56 78 90 12", "address": "321 Place de l'\''Entrepreneuriat\n31000 Toulouse", "status": "Inactif", "siret": "45678901234567", "contact_person": "Thomas Moreau"}'
  '{"name": "E-commerce Plus", "email": "support@ecommerceplus.fr", "phone": "05 67 89 01 23", "address": "654 Avenue du Commerce\n33000 Bordeaux", "status": "Actif", "siret": "56789012345678", "contact_person": "Julie Bernard"}'
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

# Create Quotes
echo "📋 Création des devis..."

QUOTES=(
  '{"client_id": "'${CLIENT_IDS[0]}'", "status": "Envoyé", "description": "Refonte complète du site web", "notes": "Devis valable 30 jours", "discount": 5.0, "items": [{"product_id": "'${PRODUCT_IDS[0]}'", "description": "Développement site web", "quantity": 1, "price": 2500.00, "tax_rate": 20.0}, {"product_id": "'${PRODUCT_IDS[1]}'", "description": "Design logo", "quantity": 1, "price": 800.00, "tax_rate": 20.0}]}'
  '{"client_id": "'${CLIENT_IDS[1]}'", "status": "Accepté", "description": "Optimisation SEO complète", "notes": "Includes 3 months follow-up", "discount": 0.0, "items": [{"product_id": "'${PRODUCT_IDS[2]}'", "description": "Consultation SEO", "quantity": 20, "price": 150.00, "tax_rate": 20.0}]}'
  '{"client_id": "'${CLIENT_IDS[2]}'", "status": "Brouillon", "description": "Formation équipe WordPress", "items": [{"product_id": "'${PRODUCT_IDS[3]}'", "description": "Formation WordPress", "quantity": 2, "price": 300.00, "tax_rate": 20.0}]}'
)

QUOTE_IDS=()

for quote in "${QUOTES[@]}"; do
    RESPONSE=$(curl -s -X POST ${API}/quotes \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$quote")
    
    QUOTE_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    QUOTE_IDS+=("$QUOTE_ID")
    QUOTE_NUMBER=$(echo $RESPONSE | grep -o '"quote_number":"[^"]*' | cut -d'"' -f4)
    echo "   ✅ Devis créé: $QUOTE_NUMBER"
done

# Create Invoices
echo "📄 Création des factures..."

INVOICES=(
  '{"client_id": "'${CLIENT_IDS[0]}'", "status": "Payé", "description": "Développement application mobile", "payment_terms": "30 jours", "discount": 0.0, "items": [{"product_id": "'${PRODUCT_IDS[0]}'", "description": "Développement site web", "quantity": 1, "price": 2500.00, "tax_rate": 20.0}, {"product_id": "'${PRODUCT_IDS[4]}'", "description": "Maintenance 6 mois", "quantity": 6, "price": 120.00, "tax_rate": 20.0}]}'
  '{"client_id": "'${CLIENT_IDS[1]}'", "status": "Envoyé", "description": "Consultation et audit technique", "payment_terms": "15 jours", "items": [{"product_id": "'${PRODUCT_IDS[2]}'", "description": "Consultation SEO", "quantity": 15, "price": 150.00, "tax_rate": 20.0}]}'
  '{"client_id": "'${CLIENT_IDS[2]}'", "status": "Payé", "description": "Design et branding complet", "items": [{"product_id": "'${PRODUCT_IDS[1]}'", "description": "Design logo", "quantity": 1, "price": 800.00, "tax_rate": 20.0}, {"description": "Charte graphique", "quantity": 1, "price": 1200.00, "tax_rate": 20.0}]}'
  '{"client_id": "'${CLIENT_IDS[4]}'", "status": "En retard", "description": "Licences logiciels annuelles", "items": [{"product_id": "'${PRODUCT_IDS[5]}'", "description": "Licence logiciel", "quantity": 3, "price": 500.00, "tax_rate": 20.0}]}'
  '{"client_id": "'${CLIENT_IDS[0]}'", "status": "Payé", "description": "Formation équipe technique", "items": [{"product_id": "'${PRODUCT_IDS[3]}'", "description": "Formation WordPress", "quantity": 3, "price": 300.00, "tax_rate": 20.0}]}'
)

for invoice in "${INVOICES[@]}"; do
    RESPONSE=$(curl -s -X POST ${API}/invoices \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$invoice")
    
    INVOICE_NUMBER=$(echo $RESPONSE | grep -o '"invoice_number":"[^"]*' | cut -d'"' -f4)
    echo "   ✅ Facture créée: $INVOICE_NUMBER"
done

# Create Expenses
echo "💰 Création des dépenses..."

EXPENSES=(
  '{"title": "Déplacement client Paris", "description": "Réunion client TechStart", "amount": 85.50, "category": "Transport", "is_billable": true, "client_id": "'${CLIENT_IDS[0]}'", "status": "Approuvé"}'
  '{"title": "Repas d'\''affaires", "description": "Déjeuner avec prospect", "amount": 45.00, "category": "Repas", "is_billable": false, "status": "Approuvé"}'
  '{"title": "Abonnement Adobe Creative Suite", "description": "Licence mensuelle design", "amount": 60.00, "category": "Logiciels", "is_billable": false, "status": "Approuvé"}'
  '{"title": "Formation React.js", "description": "Formation développement frontend", "amount": 350.00, "category": "Formation", "is_billable": false, "status": "En attente"}'
  '{"title": "Matériel informatique", "description": "Disque dur externe 2To", "amount": 120.00, "category": "Matériel", "is_billable": false, "status": "Approuvé"}'
  '{"title": "Hébergement serveur", "description": "VPS pour projet client", "amount": 25.00, "category": "Télécommunications", "is_billable": true, "client_id": "'${CLIENT_IDS[1]}'", "status": "Approuvé"}'
)

for expense in "${EXPENSES[@]}"; do
    RESPONSE=$(curl -s -X POST ${API}/expenses \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$expense")
    
    EXPENSE_TITLE=$(echo $expense | grep -o '"title":"[^"]*' | cut -d'"' -f4)
    echo "   ✅ Dépense créée: $EXPENSE_TITLE"
done

echo ""
echo "🎉 Données de démonstration créées avec succès!"
echo ""
echo "📊 Récapitulatif:"
echo "   📦 6 Produits/Services"
echo "   👥 5 Clients"  
echo "   📋 3 Devis"
echo "   📄 5 Factures"
echo "   💰 6 Dépenses"
echo ""
echo "🌐 Accédez à l'application sur: http://localhost:3000"
echo "📧 Email: admin@invoiceflow.fr"
echo "🔑 Mot de passe: admin123"
echo ""
echo "✨ Fonctionnalités disponibles:"
echo "   🏠 Dashboard intelligent avec métriques"
echo "   👥 Gestion complète des clients"
echo "   📄 Facturation avancée avec TVA"
echo "   📋 Système de devis avec conversion"
echo "   📦 Catalogue produits/services"
echo "   💰 Suivi des dépenses et notes de frais"
echo "   📊 Rapports et analyses détaillées"
echo "   ⚙️ Paramètres utilisateur complets"
echo ""