import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        setError('Erreur lors du chargement des données');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Payé':
        return 'text-green-600 bg-green-100';
      case 'Envoyé':
        return 'text-blue-600 bg-blue-100';
      case 'En retard':
        return 'text-red-600 bg-red-100';
      case 'Accepté':
        return 'text-green-600 bg-green-100';
      case 'Refusé':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const MetricCard = ({ title, value, change, icon, color, link }) => (
    <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-lg`}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                {change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {change > 0 ? '+' : ''}{change}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
        {link && (
          <div className="mt-4">
            <Link
              to={link}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              Voir plus
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon, color, action, link }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start">
        <div className={`flex-shrink-0 w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          <Link
            to={link}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {action}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  const { metrics, recent_invoices, recent_quotes, recent_activities, top_clients, expenses_by_category } = dashboardData;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tableau de bord intelligent</h1>
            <p className="text-blue-100 text-lg">
              Bienvenue ! Voici un aperçu de votre activité commerciale.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Revenus"
          value={formatCurrency(metrics.revenue)}
          change={metrics.revenue_change}
          color="bg-gradient-to-r from-emerald-500 to-emerald-600"
          link="/invoices"
          icon={
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          }
        />
        
        <MetricCard
          title="Factures"
          value={metrics.invoices_count}
          change={metrics.invoices_change}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          link="/invoices"
          icon={
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          }
        />
        
        <MetricCard
          title="Clients"
          value={metrics.clients_count}
          change={metrics.clients_change}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          link="/clients"
          icon={
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          }
        />
        
        <MetricCard
          title="En attente"
          value={formatCurrency(metrics.pending_amount)}
          change={metrics.pending_change}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
          link="/invoices"
          icon={
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          }
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques avancées</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Devis en cours</span>
              <span className="font-semibold text-gray-900">{metrics.quotes_pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total devis</span>
              <span className="font-semibold text-gray-900">{metrics.quotes_count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Dépenses totales</span>
              <span className="font-semibold text-gray-900">{formatCurrency(metrics.expenses_total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Profit estimé</span>
              <span className="font-semibold text-green-600">{formatCurrency(metrics.revenue - metrics.expenses_total)}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <QuickActionCard
              title="Nouvelle facture"
              description="Créer et envoyer une facture rapidement"
              color="bg-blue-500"
              action="Créer"
              link="/invoices"
              icon={
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              }
            />
            
            <QuickActionCard
              title="Nouveau devis"
              description="Préparer un devis pour un client"
              color="bg-purple-500"
              action="Créer"
              link="/quotes"
              icon={
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h8a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                </svg>
              }
            />
            
            <QuickActionCard
              title="Ajouter client"
              description="Enregistrer un nouveau client"
              color="bg-green-500"
              action="Ajouter"
              link="/clients"
              icon={
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
              }
            />
            
            <QuickActionCard
              title="Ajouter dépense"
              description="Enregistrer une nouvelle dépense"
              color="bg-red-500"
              action="Ajouter"
              link="/expenses"
              icon={
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Invoices */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Factures récentes</h3>
            <Link to="/invoices" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Voir tout
            </Link>
          </div>
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recent_invoices && recent_invoices.length > 0 ? recent_invoices.map((invoice, index) => (
                <li key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {invoice.invoice_id}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{invoice.client}</div>
                        <div className="text-sm text-gray-500">{invoice.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{invoice.amount}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                </li>
              )) : (
                <li className="px-6 py-8 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Aucune facture récente</p>
                  <Link to="/invoices" className="text-blue-600 hover:text-blue-800 text-sm">
                    Créer votre première facture
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Devis récents</h3>
            <Link to="/quotes" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Voir tout
            </Link>
          </div>
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recent_quotes && recent_quotes.length > 0 ? recent_quotes.map((quote, index) => (
                <li key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {quote.quote_id}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{quote.client}</div>
                        <div className="text-sm text-gray-500">{quote.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{quote.amount}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quote.status)}`}>
                        {quote.status}
                      </span>
                    </div>
                  </div>
                </li>
              )) : (
                <li className="px-6 py-8 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>Aucun devis récent</p>
                  <Link to="/quotes" className="text-blue-600 hover:text-blue-800 text-sm">
                    Créer votre premier devis
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white shadow-lg rounded-xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
          </div>
          <div className="overflow-hidden max-h-96 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {recent_activities && recent_activities.length > 0 ? recent_activities.map((activity, index) => (
                <li key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="text-sm text-gray-900">{activity.description}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(activity.created_at).toLocaleDateString('fr-FR')} à {new Date(activity.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </li>
              )) : (
                <li className="px-6 py-8 text-center text-gray-500">
                  Aucune activité récente
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Meilleurs clients</h3>
            <Link to="/clients" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Voir tout
            </Link>
          </div>
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {top_clients && top_clients.length > 0 ? top_clients.map((client, index) => (
                <li key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {client.client_id}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{client.revenue}</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        client.status === 'Actif' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                      }`}>
                        {client.status}
                      </span>
                    </div>
                  </div>
                </li>
              )) : (
                <li className="px-6 py-8 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p>Aucun client</p>
                  <Link to="/clients" className="text-blue-600 hover:text-blue-800 text-sm">
                    Ajouter votre premier client
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;