import React, { useState } from 'react';

const Settings = ({ onUpdateProfile, user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company_name: user?.company_name || '',
    siret: user?.siret || '',
    address: user?.address || '',
    phone: user?.phone || ''
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await onUpdateProfile(profileData);
      if (result.success) {
        setMessage('Profil mis à jour avec succès !');
      } else {
        setError(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
    
    setLoading(false);
  };

  const tabs = [
    { id: 'profile', name: 'Profil', icon: '👤' },
    { id: 'company', name: 'Entreprise', icon: '🏢' },
    { id: 'preferences', name: 'Préférences', icon: '⚙️' },
    { id: 'security', name: 'Sécurité', icon: '🔒' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600">Gérer votre profil et vos préférences</p>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">L'email ne peut pas être modifié</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Adresse</label>
                    <textarea
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Mise à jour...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'company' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations entreprise</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
                    <input
                      type="text"
                      value={profileData.company_name}
                      onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SIRET</label>
                    <input
                      type="text"
                      value={profileData.siret}
                      onChange={(e) => setProfileData({ ...profileData, siret: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="12345678901234"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Mise à jour...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Préférences de l'application</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Notifications par email</h4>
                      <p className="text-sm text-gray-500">Recevoir des notifications pour les nouvelles factures et paiements</p>
                    </div>
                    <button
                      type="button"
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Thème sombre</h4>
                      <p className="text-sm text-gray-500">Utiliser le thème sombre pour l'interface</p>
                    </div>
                    <button
                      type="button"
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Sauvegarde automatique</h4>
                      <p className="text-sm text-gray-500">Sauvegarder automatiquement les brouillons</p>
                    </div>
                    <button
                      type="button"
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sécurité du compte</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Changer le mot de passe</h4>
                    <p className="text-sm text-gray-500 mb-4">Mettre à jour votre mot de passe pour sécuriser votre compte</p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                      Changer le mot de passe
                    </button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Authentification à deux facteurs</h4>
                    <p className="text-sm text-gray-500 mb-4">Ajouter une couche de sécurité supplémentaire</p>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm">
                      Activer 2FA
                    </button>
                  </div>
                  
                  <div className="border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-red-900 mb-2">Zone dangereuse</h4>
                    <p className="text-sm text-red-500 mb-4">Supprimer définitivement votre compte et toutes vos données</p>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm">
                      Supprimer le compte
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;