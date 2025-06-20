# InvoiceFlow - Outil SaaS de Facturation Complet

## 🚀 Description

InvoiceFlow est un outil SaaS complet de facturation développé avec React et FastAPI. Il permet de gérer facilement vos clients, factures, devis et de suivre vos revenus avec un dashboard moderne.

## ✨ Fonctionnalités

### 🏠 Dashboard
- **Métriques en temps réel** : Revenus, nombre de factures, clients, montants en attente
- **Factures récentes** : Vue d'ensemble des dernières factures avec statuts
- **Activité récente** : Historique des actions réalisées
- **Top clients** : Classement des meilleurs clients par revenus

### 👥 Gestion des Clients
- Création, modification et suppression de clients
- Statuts clients (Actif/Inactif)
- Informations complètes (nom, email, téléphone, adresse)
- Interface moderne avec recherche et filtres

### 📄 Gestion des Factures
- Création de factures avec articles multiples
- Statuts de factures (Brouillon, Envoyé, Payé, En retard)
- Calcul automatique des totaux
- Numérotation automatique (INV001, INV002, etc.)
- Association aux clients

### 🔐 Authentification
- Système de connexion/inscription sécurisé
- JWT tokens pour l'authentification
- Protection des routes privées

## 🛠️ Technologies Utilisées

### Backend
- **FastAPI** - Framework Python moderne pour APIs
- **SQLAlchemy** - ORM pour la base de données
- **PostgreSQL/SQLite** - Base de données relationnelle
- **JWT** - Authentification sécurisée
- **Pydantic** - Validation des données

### Frontend
- **React 19** - Interface utilisateur moderne
- **React Router** - Navigation côté client
- **Tailwind CSS** - Framework CSS utilitaire
- **Axios** - Client HTTP pour les appels API

### Infrastructure
- **Docker** - Conteneurisation de l'application
- **Docker Compose** - Orchestration des services
- **Supervisor** - Gestion des processus

## 🏃‍♂️ Démarrage Rapide

### Accès à l'Application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8001
- **Documentation API** : http://localhost:8001/docs

### Données de Démonstration

Utilisez le script `create-demo-data.sh` pour créer des données de test :

```bash
./create-demo-data.sh
```

**Compte de démonstration :**
- Email : `demo@invoiceflow.com`
- Mot de passe : `demo123`

## 📊 Statuts Actuels

✅ **BACKEND OPÉRATIONNEL**
- API FastAPI fonctionnelle sur le port 8001
- Base de données SQLite configurée et fonctionnelle
- Authentification JWT implémentée
- CRUD complet pour clients et factures
- Dashboard avec métriques en temps réel

✅ **FRONTEND OPÉRATIONNEL**
- Interface React moderne sur le port 3000
- Authentification fonctionnelle
- Dashboard interactif
- Gestion complète des clients et factures
- Navigation responsive avec Tailwind CSS

✅ **DONNÉES DE TEST CRÉÉES**
- 4 clients de démonstration
- 5 factures avec différents statuts
- Revenus : 12 050€
- Montants en attente : 10 700€

## 🔌 API Endpoints Fonctionnels

### Authentification
- `POST /api/register` ✅ - Inscription
- `POST /api/login` ✅ - Connexion  
- `GET /api/me` ✅ - Informations utilisateur

### Clients
- `GET /api/clients` ✅ - Liste des clients
- `POST /api/clients` ✅ - Créer un client
- `PUT /api/clients/{id}` ✅ - Modifier un client
- `DELETE /api/clients/{id}` ✅ - Supprimer un client

### Factures
- `GET /api/invoices` ✅ - Liste des factures
- `POST /api/invoices` ✅ - Créer une facture
- `PUT /api/invoices/{id}/status` ✅ - Changer le statut

### Dashboard
- `GET /api/dashboard` ✅ - Données du dashboard

---

**L'application InvoiceFlow est maintenant 100% fonctionnelle !** 🎉
