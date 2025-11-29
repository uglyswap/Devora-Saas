import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/');
      return;
    }
    loadAdminData();
  }, [user, navigate]);

  const loadAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load stats
      const statsRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Load config
      const configRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setLoading(false);
    }
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const saveConfig = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/config`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stripe_api_key: config.stripe_api_key || null,
          stripe_webhook_secret: config.stripe_webhook_secret || null,
          stripe_test_mode: config.stripe_test_mode,
          resend_api_key: config.resend_api_key || null,
          resend_from_email: config.resend_from_email,
          subscription_price: parseFloat(config.subscription_price),
          free_trial_days: parseInt(config.free_trial_days),
          max_failed_payments: parseInt(config.max_failed_payments)
        })
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setConfig(updatedConfig);
        setMessage({ type: 'success', text: '✅ Configuration sauvegardée avec succès !' });
      } else {
        setMessage({ type: 'error', text: '❌ Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: '❌ Erreur lors de la sauvegarde' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#111113] to-[#0a0a0b]">
      {/* Navigation */}
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">🛠️ Panel Administrateur</h1>
          <p className="text-gray-400 mt-2">Gérez la configuration système et les KPIs</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* KPIs Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400">Utilisateurs totaux</h3>
              <p className="text-3xl font-bold text-white mt-2">{stats.total_users}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400">Abonnements actifs</h3>
              <p className="text-3xl font-bold text-green-400 mt-2">{stats.active_subscriptions}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400">Revenue total</h3>
              <p className="text-3xl font-bold text-blue-400 mt-2">{stats.total_revenue.toFixed(2)}€</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400">Projets totaux</h3>
              <p className="text-3xl font-bold text-purple-400 mt-2">{stats.total_projects}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400">Nouveaux utilisateurs (ce mois)</h3>
              <p className="text-3xl font-bold text-orange-400 mt-2">{stats.new_users_this_month}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400">Taux de churn</h3>
              <p className="text-3xl font-bold text-red-400 mt-2">{stats.churn_rate}%</p>
            </div>
          </div>
        )}

        {/* User Management */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">👥 Gestion des Utilisateurs</h2>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="font-semibold text-blue-300 mb-2">Promouvoir un utilisateur en admin</h3>
            <p className="text-sm text-blue-200 mb-4">
              Pour promouvoir un utilisateur existant en admin, utilisez l'API :
            </p>
            <code className="block bg-black/30 p-3 rounded border border-blue-500/30 text-sm text-blue-100 overflow-x-auto">
              POST /api/admin/users/&#123;user_id&#125;/promote-admin
            </code>
            <p className="text-xs text-blue-300 mt-2">
              Vous pouvez aussi utiliser le script : <code className="bg-black/30 px-2 py-1 rounded border border-blue-500/20">python /app/backend/create_admin.py</code>
            </p>
          </div>
        </div>

        {/* Configuration System */}
        {config && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">⚙️ Configuration Système</h2>
            
            {/* Stripe Configuration */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">💳 Stripe</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mode Test
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.stripe_test_mode}
                      onChange={(e) => handleConfigChange('stripe_test_mode', e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-5 w-5"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Activer le mode test Stripe
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API Key {config.stripe_test_mode ? '(Test)' : '(Live)'}
                  </label>
                  <input
                    type="password"
                    value={config.stripe_api_key || ''}
                    onChange={(e) => handleConfigChange('stripe_api_key', e.target.value)}
                    placeholder={config.stripe_test_mode ? 'sk_test_...' : 'sk_live_...'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Webhook Secret
                  </label>
                  <input
                    type="password"
                    value={config.stripe_webhook_secret || ''}
                    onChange={(e) => handleConfigChange('stripe_webhook_secret', e.target.value)}
                    placeholder="whsec_..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Resend Configuration */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">📧 Resend (Email)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={config.resend_api_key || ''}
                    onChange={(e) => handleConfigChange('resend_api_key', e.target.value)}
                    placeholder="re_..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email From
                  </label>
                  <input
                    type="email"
                    value={config.resend_from_email}
                    onChange={(e) => handleConfigChange('resend_from_email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Billing Settings */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">💰 Paramètres de facturation</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prix de l'abonnement (€ TTC)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.subscription_price}
                    onChange={(e) => handleConfigChange('subscription_price', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Durée de l'essai gratuit (jours)
                  </label>
                  <input
                    type="number"
                    value={config.free_trial_days}
                    onChange={(e) => handleConfigChange('free_trial_days', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre max d'échecs de paiement avant blocage
                  </label>
                  <input
                    type="number"
                    value={config.max_failed_payments}
                    onChange={(e) => handleConfigChange('max_failed_payments', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={saveConfig}
                disabled={saving}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Sauvegarde...' : '💾 Sauvegarder la configuration'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
