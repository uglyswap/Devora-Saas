import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Code2, Sparkles, Github, Zap, Rocket, Settings } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#111113] to-[#0a0a0b] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-lg">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            Devora
          </span>
        </div>
        <div className="flex gap-3">
          <Button
            data-testid="settings-nav-button"
            variant="ghost"
            onClick={() => navigate('/settings')}
            className="text-gray-300 hover:text-white hover:bg-white/5"
          >
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </Button>
          <Button
            data-testid="dashboard-nav-button"
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          >
            Dashboard
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Gratuit & Open Source
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
            Créez des applications
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              avec l'IA
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Générez du code HTML, CSS et JavaScript en temps réel avec OpenRouter.
            <br />
            Prévisualisez, exportez sur GitHub et déployez sur Vercel en un clic.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button
              data-testid="get-started-button"
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:shadow-emerald-500/30"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Essai gratuit 7 jours
            </Button>
            <Button
              data-testid="view-projects-button"
              size="lg"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="border-gray-700 text-gray-300 hover:bg-white/5 font-semibold px-8 py-6 text-lg rounded-xl transition-all hover:scale-105"
            >
              Voir mes projets
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-emerald-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/10">
            <div className="bg-emerald-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Code2 className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Génération de code IA</h3>
            <p className="text-gray-400 leading-relaxed">
              Utilisez tous les modèles disponibles sur OpenRouter pour générer du code de qualité professionnelle.
            </p>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-blue-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10">
            <div className="bg-blue-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Prévisualisation en direct</h3>
            <p className="text-gray-400 leading-relaxed">
              Voyez votre code prendre vie instantanément avec notre éditeur et aperçu en temps réel.
            </p>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-purple-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10">
            <div className="bg-purple-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Github className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Export & Déploiement</h3>
            <p className="text-gray-400 leading-relaxed">
              Exportez vers GitHub et déployez sur Vercel en quelques clics. Aucune configuration nécessaire.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-3xl p-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à créer quelque chose d'incroyable ?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Ajoutez simplement votre clé API OpenRouter et commencez à générer du code immédiatement.
          </p>
          <Button
            data-testid="start-creating-button"
            size="lg"
            onClick={() => navigate('/settings')}
            className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold px-10 py-6 text-lg rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
          >
            <Settings className="w-5 h-5 mr-2" />
            Configurer maintenant
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-32 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500">
          <p>Créé avec ❤️ • 100% Open Source</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;