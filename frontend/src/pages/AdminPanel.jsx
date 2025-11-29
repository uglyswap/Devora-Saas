import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { 
  User, Mail, Calendar, Euro, Shield, ShieldOff, 
  Trash2, Gift, CreditCard, FolderOpen, X, 
  Save, Plus, Minus, Ban, CheckCircle, Search, Settings
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [userInvoices, setUserInvoices] = useState([]);
  const [totalPaidUser, setTotalPaidUser] = useState(0);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [activeSection, setActiveSection] = useState('users'); // users, config, stats

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
        setStats(await statsRes.json());
      }

      // Load config
      const configRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (configRes.ok) {
        setConfig(await configRes.json());
      }

      // Load users
      const usersRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/users?limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
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
        setConfig(await response.json());
        toast.success('✅ Configuration sauvegardée !');
      } else {
        toast.error('❌ Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('❌ Erreur lors de la sauvegarde');
    }
    setSaving(false);
  };

  const promoteToAdmin = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/users/${userId}/promote-admin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('✅ Utilisateur promu en admin !');
        loadAdminData();
        setSelectedUser(null);
      } else {
        toast.error('❌ Erreur lors de la promotion');
      }
    } catch (error) {
      toast.error('❌ Erreur lors de la promotion');
    }
  };

  const revokeAdmin = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/users/${userId}/revoke-admin`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('✅ Statut admin révoqué !');
        loadAdminData();
        setSelectedUser(null);
      } else {
        const data = await response.json();
        toast.error(data.detail || '❌ Erreur');
      }
    } catch (error) {
      toast.error('❌ Erreur lors de la révocation');
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !isActive })
      });
      
      if (response.ok) {
        toast.success(isActive ? '✅ Utilisateur désactivé' : '✅ Utilisateur activé');
        loadAdminData();
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, is_active: !isActive });
        }
      } else {
        toast.error('❌ Erreur');
      }
    } catch (error) {
      toast.error('❌ Erreur');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTotalPaid = (user) => {
    return "0.00"; // Placeholder
  };

  const loadUserProjects = async (userId) => {
    setLoadingProjects(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/users/${userId}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserProjects(data.projects);
      } else {
        toast.error('❌ Erreur lors du chargement des projets');
        setUserProjects([]);
      }
    } catch (error) {
      console.error('Error loading user projects:', error);
      toast.error('❌ Erreur lors du chargement des projets');
      setUserProjects([]);
    }
    setLoadingProjects(false);
  };

  const openProjectInEditor = (projectId) => {
    // Open project in editor in new tab
    window.open(`/editor/${projectId}`, '_blank');
  };

  const loadUserInvoices = async (userId) => {
    setLoadingInvoices(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/users/${userId}/invoices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserInvoices(data.invoices);
        setTotalPaidUser(data.total_paid);
      } else {
        toast.error('❌ Erreur lors du chargement des factures');
        setUserInvoices([]);
        setTotalPaidUser(0);
      }
    } catch (error) {
      console.error('Error loading user invoices:', error);
      toast.error('❌ Erreur lors du chargement des factures');
      setUserInvoices([]);
      setTotalPaidUser(0);
    }
    setLoadingInvoices(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#111113] to-[#0a0a0b] flex items-center justify-center">
        <div className="text-xl text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#111113] to-[#0a0a0b]">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">🛠️ Panel Administrateur</h1>
          <p className="text-gray-400 mt-2">Gestion complète de la plateforme Devora</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveSection('users')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeSection === 'users'
                ? 'bg-emerald-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Utilisateurs
          </button>
          <button
            onClick={() => setActiveSection('config')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeSection === 'config'
                ? 'bg-emerald-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Configuration
          </button>
        </div>

        {/* KPIs Dashboard */}
        {stats && (
          <div className="space-y-6 mb-8">
            {/* Première ligne - Utilisateurs & Abonnements */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400">Utilisateurs totaux</h3>
                <p className="text-3xl font-bold text-white mt-2">{stats.total_users}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400">Abonnements actifs</h3>
                <p className="text-3xl font-bold text-green-400 mt-2">{stats.active_subscriptions}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400">Nouveaux ce mois</h3>
                <p className="text-3xl font-bold text-orange-400 mt-2">{stats.new_users_this_month}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400">Taux de churn</h3>
                <p className="text-3xl font-bold text-red-400 mt-2">{stats.churn_rate}%</p>
              </div>
            </div>

            {/* Deuxième ligne - Revenue */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-blue-300">💰 Revenue Total Cumulé</h3>
                <p className="text-3xl font-bold text-blue-400 mt-2">{stats.total_revenue.toFixed(2)}€</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-emerald-300">📈 Revenue Mois en Cours</h3>
                <p className="text-3xl font-bold text-emerald-400 mt-2">{stats.revenue_current_month.toFixed(2)}€</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-purple-300">📊 Revenue Mois Dernier</h3>
                <p className="text-3xl font-bold text-purple-400 mt-2">{stats.revenue_last_month.toFixed(2)}€</p>
              </div>
            </div>

            {/* Troisième ligne - Annulations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-red-300">🚫 Annulations Mois en Cours</h3>
                <p className="text-3xl font-bold text-red-400 mt-2">{stats.cancellations_current_month}</p>
                <p className="text-xs text-red-200 mt-2">Abonnements annulés ce mois</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-orange-300">📉 Annulations Mois Dernier</h3>
                <p className="text-3xl font-bold text-orange-400 mt-2">{stats.cancellations_last_month}</p>
                <p className="text-xs text-orange-200 mt-2">Abonnements annulés le mois dernier</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Section */}
        {activeSection === 'users' && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">👥 Gestion des Utilisateurs</h2>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Nom</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Inscription</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Total Payé</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Statut</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Rôle</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr 
                      key={u.id}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => setSelectedUser(u)}
                    >
                      <td className="py-3 px-4 text-sm text-gray-300">{u.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{u.full_name || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {new Date(u.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-sm text-emerald-400 font-semibold">
                        {getTotalPaid(u)}€
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          u.subscription_status === 'active' ? 'bg-green-500/20 text-green-400' :
                          u.subscription_status === 'trialing' ? 'bg-blue-500/20 text-blue-400' :
                          u.subscription_status === 'past_due' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {u.subscription_status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.is_admin && (
                          <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(u);
                            setActiveTab('info');
                          }}
                          className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                        >
                          Détails
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Configuration Section */}
        {activeSection === 'config' && config && (
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
                    <span className="ml-2 text-sm text-gray-300">
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
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={saveConfig}
                disabled={saving}
                className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Sauvegarde...' : '💾 Sauvegarder la configuration'}
              </button>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1d] border border-white/10 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedUser.email}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Inscrit le {new Date(selectedUser.created_at).toLocaleDateString('fr-FR', { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 px-6">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'info'
                      ? 'text-emerald-400 border-b-2 border-emerald-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Informations
                </button>
                <button
                  onClick={() => {
                    setActiveTab('projects');
                    if (selectedUser) {
                      loadUserProjects(selectedUser.id);
                    }
                  }}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'projects'
                      ? 'text-emerald-400 border-b-2 border-emerald-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FolderOpen className="w-4 h-4 inline mr-2" />
                  Projets
                </button>
                <button
                  onClick={() => {
                    setActiveTab('billing');
                    if (selectedUser) {
                      loadUserInvoices(selectedUser.id);
                    }
                  }}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'billing'
                      ? 'text-emerald-400 border-b-2 border-emerald-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  Facturation
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    {/* User Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <p className="text-white mt-1">{selectedUser.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Nom complet</label>
                        <p className="text-white mt-1">{selectedUser.full_name || 'Non renseigné'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Statut</label>
                        <p className="text-white mt-1">
                          {selectedUser.is_active ? (
                            <span className="text-green-400">✅ Actif</span>
                          ) : (
                            <span className="text-red-400">❌ Désactivé</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Abonnement</label>
                        <p className="text-white mt-1 capitalize">{selectedUser.subscription_status}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-white/10 pt-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Actions administrateur</h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedUser.is_admin ? (
                          <Button
                            onClick={() => revokeAdmin(selectedUser.id)}
                            className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                          >
                            <ShieldOff className="w-4 h-4 mr-2" />
                            Révoquer Admin
                          </Button>
                        ) : (
                          <Button
                            onClick={() => promoteToAdmin(selectedUser.id)}
                            className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Promouvoir Admin
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => toggleUserStatus(selectedUser.id, selectedUser.is_active)}
                          className={selectedUser.is_active 
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          }
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          {selectedUser.is_active ? 'Désactiver' : 'Activer'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Projets de {selectedUser.email}
                      </h3>
                      {loadingProjects && (
                        <span className="text-sm text-gray-400">Chargement...</span>
                      )}
                    </div>

                    {!loadingProjects && userProjects.length === 0 ? (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 text-center">
                        <FolderOpen className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                        <p className="text-blue-200">
                          Aucun projet créé par cet utilisateur
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userProjects.map((project) => (
                          <div
                            key={project.id}
                            className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="text-white font-semibold mb-1">
                                  {project.name || 'Projet sans nom'}
                                </h4>
                                <div className="flex gap-4 text-sm text-gray-400 mb-2">
                                  <span>
                                    📅 Créé : {new Date(project.created_at).toLocaleDateString('fr-FR')}
                                  </span>
                                  {project.updated_at && (
                                    <span>
                                      🔄 Modifié : {new Date(project.updated_at).toLocaleDateString('fr-FR')}
                                    </span>
                                  )}
                                </div>
                                {project.description && (
                                  <p className="text-sm text-gray-300 mb-2">
                                    {project.description}
                                  </p>
                                )}
                                <div className="flex gap-2 flex-wrap">
                                  {project.github_repo_url && (
                                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                      🔗 GitHub
                                    </span>
                                  )}
                                  {project.vercel_deployment_url && (
                                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                      🚀 Vercel
                                    </span>
                                  )}
                                  {project.files && (
                                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">
                                      📄 {Object.keys(project.files).length} fichier(s)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  size="sm"
                                  onClick={() => openProjectInEditor(project.id)}
                                  className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                >
                                  <FolderOpen className="w-4 h-4 mr-1" />
                                  Ouvrir
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'billing' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Gestion de facturation</h3>
                      
                      {/* Offer Free Months */}
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                        <label className="text-sm text-gray-400 mb-2 block">Offrir des mois gratuits</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            max="12"
                            defaultValue="1"
                            id="gift-months-input"
                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                          />
                          <Button 
                            onClick={async () => {
                              const months = document.getElementById('gift-months-input').value;
                              const token = localStorage.getItem('token');
                              try {
                                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/users/${selectedUser.id}/gift-months?months=${months}`, {
                                  method: 'POST',
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                if (response.ok) {
                                  toast.success(`✅ ${months} mois offerts !`);
                                  loadAdminData();
                                } else {
                                  toast.error('❌ Erreur');
                                }
                              } catch (error) {
                                toast.error('❌ Erreur');
                              }
                            }}
                            className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          >
                            <Gift className="w-4 h-4 mr-2" />
                            Offrir
                          </Button>
                        </div>
                      </div>

                      {/* Subscription Control */}
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <label className="text-sm text-gray-400 mb-2 block">Contrôle d'abonnement</label>
                        <div className="flex gap-2">
                          <Button 
                            onClick={async () => {
                              const token = localStorage.getItem('token');
                              try {
                                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/users/${selectedUser.id}/toggle-billing`, {
                                  method: 'POST',
                                  headers: { 
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({ enable: true })
                                });
                                if (response.ok) {
                                  toast.success('✅ Facturation activée');
                                } else {
                                  toast.error('❌ Erreur');
                                }
                              } catch (error) {
                                toast.error('❌ Erreur');
                              }
                            }}
                            className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Activer Facturation
                          </Button>
                          <Button 
                            onClick={async () => {
                              const token = localStorage.getItem('token');
                              try {
                                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/users/${selectedUser.id}/toggle-billing`, {
                                  method: 'POST',
                                  headers: { 
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({ enable: false })
                                });
                                if (response.ok) {
                                  toast.success('✅ Facturation suspendue');
                                } else {
                                  toast.error('❌ Erreur');
                                }
                              } catch (error) {
                                toast.error('❌ Erreur');
                              }
                            }}
                            className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          >
                            <Minus className="w-4 h-4 mr-2" />
                            Suspendre Facturation
                          </Button>
                        </div>
                      </div>

                      {/* Payment History */}
                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium text-white">Historique des paiements</h4>
                          {totalPaidUser > 0 && (
                            <span className="text-emerald-400 font-bold">
                              Total payé : {totalPaidUser.toFixed(2)}€
                            </span>
                          )}
                        </div>
                        
                        {loadingInvoices ? (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                            <span className="text-gray-400">Chargement...</span>
                          </div>
                        ) : userInvoices.length === 0 ? (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <p className="text-sm text-blue-200">
                              💳 Aucun paiement enregistré pour cet utilisateur
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {userInvoices.map((invoice, idx) => (
                              <div
                                key={idx}
                                className="bg-white/5 border border-white/10 rounded-lg p-3 flex justify-between items-center"
                              >
                                <div>
                                  <p className="text-white font-medium">
                                    {invoice.amount.toFixed(2)}€
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {new Date(invoice.created_at).toLocaleDateString('fr-FR', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    invoice.status === 'paid' 
                                      ? 'bg-green-500/20 text-green-400'
                                      : 'bg-orange-500/20 text-orange-400'
                                  }`}>
                                    {invoice.status}
                                  </span>
                                  {invoice.invoice_pdf && (
                                    <a
                                      href={invoice.invoice_pdf}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 text-xs"
                                    >
                                      📄 PDF
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
