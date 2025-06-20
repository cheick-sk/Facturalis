import React, { useState, useEffect } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Reports = () => {
  const [financialReport, setFinancialReport] = useState(null);
  const [cashflowData, setCashflowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchReports();
  }, [selectedPeriod]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch financial report
      const financialResponse = await fetch(`${API}/reports/financial?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Fetch cashflow data
      const cashflowResponse = await fetch(`${API}/reports/cashflow`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (financialResponse.ok && cashflowResponse.ok) {
        const financialData = await financialResponse.json();
        const cashflowData = await cashflowResponse.json();
        
        setFinancialReport(financialData);
        setCashflowData(cashflowData.cashflow || []);
      } else {
        setError('Erreur lors du chargement des rapports');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const SimpleBarChart = ({ data, title, color = "bg-blue-500" }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(item => Math.max(item.income || 0, item.expenses || 0)));
    
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
        <div className="space-y-4">
          {data.slice(-6).map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-16 text-sm text-gray-600">
                {new Date(item.month + '-01').toLocaleDateString('fr-FR', { month: 'short' })}
              </div>
              <div className="flex-1 space-y-2">
                {/* Income bar */}
                <div className="flex items-center space-x-2">
                  <div className="w-20 text-xs text-gray-500">Revenus</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(item.income / maxValue) * 100}%` }}
                    />
                  </div>
                  <div className="w-20 text-xs text-right font-medium">
                    {formatCurrency(item.income)}
                  </div>
                </div>
                
                {/* Expenses bar */}
                <div className="flex items-center space-x-2">
                  <div className="w-20 text-xs text-gray-500">Dépenses</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(item.expenses / maxValue) * 100}%` }}
                    />
                  </div>
                  <div className="w-20 text-xs text-right font-medium">
                    {formatCurrency(item.expenses)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const MetricCard = ({ title, value, subtitle, icon, color, trend }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
            {icon}
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Génération des rapports...</p>
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports & Analyses</h1>
          <p className="text-gray-600">Analyses détaillées de votre activité commerciale</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>

      {/* Financial Overview */}
      {financialReport && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Revenus totaux"
              value={formatCurrency(financialReport.total_revenue)}
              color="bg-gradient-to-r from-emerald-500 to-emerald-600"
              icon={
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              }
            />
            
            <MetricCard
              title="Dépenses totales"
              value={formatCurrency(financialReport.total_expenses)}
              color="bg-gradient-to-r from-red-500 to-red-600"
              icon={
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              }
            />
            
            <MetricCard
              title="Profit net"
              value={formatCurrency(financialReport.profit)}
              subtitle={financialReport.profit > 0 ? 'Bénéfice' : 'Perte'}
              color={`bg-gradient-to-r ${financialReport.profit > 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'}`}
              icon={
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              }
            />
            
            <MetricCard
              title="Marge brute"
              value={`${financialReport.total_revenue > 0 ? ((financialReport.profit / financialReport.total_revenue) * 100).toFixed(1) : 0}%`}
              subtitle="Rentabilité"
              color="bg-gradient-to-r from-purple-500 to-purple-600"
              icon={
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
              }
            />
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance des factures</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Factures payées</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{financialReport.invoices_paid}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ 
                          width: `${(financialReport.invoices_paid / (financialReport.invoices_paid + financialReport.invoices_pending)) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Factures en attente</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{financialReport.invoices_pending}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ 
                          width: `${(financialReport.invoices_pending / (financialReport.invoices_paid + financialReport.invoices_pending)) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Taux de paiement</span>
                  <span className="text-lg font-bold text-green-600">
                    {((financialReport.invoices_paid / (financialReport.invoices_paid + financialReport.invoices_pending)) * 100 || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance des devis</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Devis acceptés</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{financialReport.quotes_accepted}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ 
                          width: `${(financialReport.quotes_accepted / (financialReport.quotes_accepted + financialReport.quotes_pending)) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Devis en attente</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{financialReport.quotes_pending}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ 
                          width: `${(financialReport.quotes_pending / (financialReport.quotes_accepted + financialReport.quotes_pending)) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Taux d'acceptation</span>
                  <span className="text-lg font-bold text-blue-600">
                    {((financialReport.quotes_accepted / (financialReport.quotes_accepted + financialReport.quotes_pending)) * 100 || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Cashflow Chart */}
      {cashflowData.length > 0 && (
        <SimpleBarChart 
          data={cashflowData}
          title="Évolution des revenus et dépenses (6 derniers mois)"
        />
      )}

      {/* Export Options */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Exporter les données</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Exporter Excel
          </button>
          
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 11-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Exporter PDF
          </button>
          
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            Rapport personnalisé
          </button>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Analyses & Recommandations
        </h3>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="font-medium text-gray-900 mb-2">💡 Optimisation des revenus</h4>
            <p className="text-sm text-gray-600">
              {financialReport && financialReport.invoices_pending > 0 
                ? `Vous avez ${financialReport.invoices_pending} factures en attente. Considérez d'envoyer des relances pour améliorer votre cashflow.`
                : "Excellent ! Toutes vos factures sont payées."
              }
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="font-medium text-gray-900 mb-2">📈 Croissance</h4>
            <p className="text-sm text-gray-600">
              {financialReport && financialReport.quotes_pending > 0
                ? `Vous avez ${financialReport.quotes_pending} devis en attente. Suivez-les pour maximiser vos conversions.`
                : "Pensez à créer plus de devis pour développer votre activité."
              }
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="font-medium text-gray-900 mb-2">💰 Rentabilité</h4>
            <p className="text-sm text-gray-600">
              {financialReport && financialReport.profit > 0
                ? `Votre marge est positive : ${((financialReport.profit / financialReport.total_revenue) * 100).toFixed(1)}%. Continuez ainsi !`
                : "Analysez vos dépenses pour améliorer votre rentabilité."
              }
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="font-medium text-gray-900 mb-2">🎯 Objectifs</h4>
            <p className="text-sm text-gray-600">
              Définissez des objectifs de chiffre d'affaires pour le prochain trimestre pour maintenir votre croissance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;