import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Code2, Loader2, Mail, Lock, User, Sparkles } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, fullName);
      toast.success('Compte créé ! Bienvenue sur Devora !');
      navigate('/dashboard');
    } catch (error) {
      console.error('Register error:', error);
      const errorMsg = error.response?.data?.detail || 'Erreur lors de l\'inscription';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#111113] to-[#0a0a0b] flex items-center justify-center p-6">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-xl">
              <Code2 className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Devora
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Commencez gratuitement</h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            7 jours d'essai gratuit
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="fullName" className="text-gray-300 mb-2 block">
                Nom complet
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-300 mb-2 block">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="vous@exemple.com"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300 mb-2 block">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 caractères"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-300">
              Essai gratuit de 7 jours - Annulation possible à tout moment
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                'Commencer l\'essai gratuit'
              )}
            </Button>
          </form>

          <p className="mt-6 text-xs text-center text-gray-500">
            En créant un compte, vous acceptez nos{' '}
            <Link to="/terms" className="text-emerald-400 hover:underline">
              CGU
            </Link>{' '}
            et notre{' '}
            <Link to="/privacy" className="text-emerald-400 hover:underline">
              politique de confidentialité
            </Link>
          </p>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-400">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
