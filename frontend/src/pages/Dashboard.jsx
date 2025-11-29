import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import Navigation from '../components/Navigation';
import { Plus, FileCode, Trash2, ExternalLink, Github, Globe, Calendar, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;

    try {
      await axios.delete(`${API}/projects/${projectId}`);
      toast.success('Projet supprimé');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#111113] to-[#0a0a0b]">
      {/* Navigation */}
      <Navigation />
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Mes Projets</h1>
          <Button
            data-testid="new-project-button"
            onClick={() => navigate('/editor')}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Projet
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div data-testid="loading-projects" className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : projects.length === 0 ? (
          <div data-testid="no-projects-message" className="text-center py-20">
            <FileCode className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Aucun projet pour le moment</h2>
            <p className="text-gray-400 mb-8 text-lg">Créez votre premier projet avec l'IA</p>
            <Button
              data-testid="create-first-project-button"
              onClick={() => navigate('/editor')}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-6 text-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer mon premier projet
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                data-testid={`project-card-${project.id}`}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-emerald-500/30 transition-all hover:scale-[1.02] cursor-pointer group overflow-hidden"
                onClick={() => navigate(`/editor/${project.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 group-hover:text-emerald-400 transition-colors">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-gray-500">
                        {project.description || 'Aucune description'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {formatDate(project.created_at)}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <FileCode className="w-4 h-4" />
                      {project.files?.length || 0} fichier(s)
                    </div>

                    {project.github_repo_url && (
                      <a
                        href={project.github_repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`github-link-${project.id}`}
                        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        Voir sur GitHub
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {project.vercel_url && (
                      <a
                        href={project.vercel_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`vercel-link-${project.id}`}
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        Voir le site
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <div className="pt-4 border-t border-white/5 flex gap-2">
                      <Button
                        data-testid={`open-project-${project.id}`}
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/editor/${project.id}`)}
                        className="flex-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                      >
                        Ouvrir
                      </Button>
                      <Button
                        data-testid={`delete-project-${project.id}`}
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project.id);
                        }}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;