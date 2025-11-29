import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Settings, CreditCard, Shield, LogOut, Code2 } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-lg">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Devora
            </span>
          </button>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {/* Billing */}
            <Button
              variant="ghost"
              onClick={() => navigate('/billing')}
              className="text-gray-300 hover:text-white hover:bg-white/5"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Facturation
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              onClick={() => navigate('/settings')}
              className="text-gray-300 hover:text-white hover:bg-white/5"
            >
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </Button>

            {/* Admin Panel - Only for admins */}
            {user?.is_admin && (
              <Button
                variant="ghost"
                onClick={() => navigate('/admin')}
                className="text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500/10 border border-yellow-500/20"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}

            {/* Logout */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-red-300 hover:text-red-200 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
