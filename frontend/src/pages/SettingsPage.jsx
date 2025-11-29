import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Key, Github, Globe, Save, Eye, EyeOff, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState({
    openrouter: false,
    github: false,
    vercel: false
  });
  
  const [settings, setSettings] = useState({
    openrouter_api_key: '',
    github_token: '',
    vercel_token: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings({
        openrouter_api_key: response.data.openrouter_api_key || '',
        github_token: response.data.github_token || '',
        vercel_token: response.data.vercel_token || ''
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/settings`, settings);
      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const toggleShowKey = (key) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const maskKey = (key) => {
    if (!key) return '';
    if (key.length <= 8) return '•'.repeat(key.length);
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#111113] to-[#0a0a0b]">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Paramètres</h1>
        <div className="space-y-6">
          {/* OpenRouter API Key */}
          <Card data-testid="openrouter-settings-card" className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Key className="w-6 h-6 text-emerald-400" />
                    OpenRouter API Key
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    Clé API OpenRouter pour accéder à tous les modèles d'IA disponibles
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="openrouter-key" className="text-base">Clé API</Label>
                <div className="flex gap-2 mt-2">
                  <div className="relative flex-1">
                    <Input
                      id="openrouter-key"
                      data-testid="openrouter-api-key-input"
                      type={showKeys.openrouter ? 'text' : 'password'}
                      value={settings.openrouter_api_key}
                      onChange={(e) => setSettings({ ...settings, openrouter_api_key: e.target.value })}
                      placeholder="sk-or-v1-..."
                      className="bg-white/5 border-white/10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('openrouter')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showKeys.openrouter ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  <strong>Comment obtenir votre clé :</strong>
                </p>
                <ol className="text-sm text-blue-200 mt-2 space-y-1 list-decimal list-inside">
                  <li>Visitez <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-100">openrouter.ai/keys</a></li>
                  <li>Créez un compte ou connectez-vous</li>
                  <li>Générez une nouvelle clé API</li>
                  <li>Ajoutez des crédits à votre compte</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* GitHub Token */}
          <Card data-testid="github-settings-card" className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Github className="w-6 h-6 text-purple-400" />
                GitHub Token
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                Token d'accès GitHub pour exporter vos projets vers des repositories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="github-token" className="text-base">Token d'accès personnel</Label>
                <div className="flex gap-2 mt-2">
                  <div className="relative flex-1">
                    <Input
                      id="github-token"
                      data-testid="github-token-input"
                      type={showKeys.github ? 'text' : 'password'}
                      value={settings.github_token}
                      onChange={(e) => setSettings({ ...settings, github_token: e.target.value })}
                      placeholder="ghp_..."
                      className="bg-white/5 border-white/10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('github')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showKeys.github ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <p className="text-sm text-purple-300">
                  <strong>Comment obtenir votre token :</strong>
                </p>
                <ol className="text-sm text-purple-200 mt-2 space-y-1 list-decimal list-inside">
                  <li>Allez dans <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-100">GitHub Settings → Developer settings → Tokens</a></li>
                  <li>Générez un nouveau token (classic)</li>
                  <li>Sélectionnez les permissions : <code className="bg-purple-900/30 px-1 rounded">repo</code></li>
                  <li>Copiez le token généré</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Vercel Token */}
          <Card data-testid="vercel-settings-card" className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Globe className="w-6 h-6 text-blue-400" />
                Vercel Token
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                Token Vercel pour déployer vos projets en production
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="vercel-token" className="text-base">Token d'accès</Label>
                <div className="flex gap-2 mt-2">
                  <div className="relative flex-1">
                    <Input
                      id="vercel-token"
                      data-testid="vercel-token-input"
                      type={showKeys.vercel ? 'text' : 'password'}
                      value={settings.vercel_token}
                      onChange={(e) => setSettings({ ...settings, vercel_token: e.target.value })}
                      placeholder="..."
                      className="bg-white/5 border-white/10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('vercel')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showKeys.vercel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  <strong>Comment obtenir votre token :</strong>
                </p>
                <ol className="text-sm text-blue-200 mt-2 space-y-1 list-decimal list-inside">
                  <li>Visitez <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-100">vercel.com/account/tokens</a></li>
                  <li>Créez un compte ou connectez-vous</li>
                  <li>Créez un nouveau token</li>
                  <li>Copiez le token généré</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              data-testid="save-settings-button"
              onClick={saveSettings}
              disabled={saving}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-6 text-lg"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
            </Button>
          </div>

          {/* RGPD Section */}
          <Card className="mt-8 border-red-500/20 bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-red-400">⚠️ Zone de Danger</CardTitle>
              <CardDescription className="text-red-200">
                Actions irréversibles sur votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Export Data */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">📥 Exporter mes données (RGPD)</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Téléchargez toutes vos données personnelles au format JSON
                </p>
                <Button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      const response = await fetch(`${API}/auth/export-data`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      if (response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `devora-data-export-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        toast.success('✅ Données exportées !');
                      } else {
                        toast.error('❌ Erreur lors de l\\'export');
                      }
                    } catch (error) {
                      toast.error('❌ Erreur lors de l\\'export');
                    }
                  }}
                  className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                >
                  Exporter mes données
                </Button>
              </div>

              {/* Delete Account */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h3 className="text-red-400 font-semibold mb-2">🗑️ Supprimer mon compte</h3>
                <p className="text-sm text-red-200 mb-3">
                  Cette action est définitive et supprimera toutes vos données
                </p>
                <Button
                  onClick={async () => {
                    if (!window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
                      return;
                    }
                    try {
                      const token = localStorage.getItem('token');
                      const response = await fetch(`${API}/auth/delete-account`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      if (response.ok) {
                        toast.success('✅ Compte supprimé');
                        localStorage.removeItem('token');
                        navigate('/');
                      } else {
                        toast.error('❌ Erreur lors de la suppression');
                      }
                    } catch (error) {
                      toast.error('❌ Erreur lors de la suppression');
                    }
                  }}
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  Supprimer mon compte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;