import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  ArrowLeft, Send, Save, Download, Github, Globe, 
  Loader2, Code2, Eye, MessageSquare, FileCode,
  Play, Settings, Plus, X, Copy, Check, EyeOff, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import SplitPane from 'react-split-pane';
import './EditorPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EditorPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEditor, setShowEditor] = useState(true);
  
  // Project state
  const [project, setProject] = useState({
    name: 'Nouveau Projet',
    description: '',
    files: [
      { name: 'index.html', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Mon App</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <script src="script.js"></script>\n</body>\n</html>', language: 'html' },
      { name: 'styles.css', content: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: #f5f5f5;\n}\n\nh1 {\n  color: #333;\n}', language: 'css' },
      { name: 'script.js', content: 'console.log("Hello from JavaScript!");', language: 'javascript' }
    ]
  });
  
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o');
  const [availableModels, setAvailableModels] = useState([]);
  
  // Export dialogs
  const [showGithubDialog, setShowGithubDialog] = useState(false);
  const [showVercelDialog, setShowVercelDialog] = useState(false);
  const [githubRepoName, setGithubRepoName] = useState('');
  const [vercelProjectName, setVercelProjectName] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [vercelToken, setVercelToken] = useState('');
  const [isPrivateRepo, setIsPrivateRepo] = useState(false);
  
  const chatEndRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
    loadSettings();
  }, [projectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (apiKey) {
      fetchModels();
    }
  }, [apiKey]);

  useEffect(() => {
    updatePreview();
  }, [project.files]);

  const loadProject = async () => {
    try {
      const response = await axios.get(`${API}/projects/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Erreur lors du chargement du projet');
    }
  };

  const loadSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      if (response.data.openrouter_api_key) {
        setApiKey(response.data.openrouter_api_key);
      }
      if (response.data.github_token) {
        setGithubToken(response.data.github_token);
      }
      if (response.data.vercel_token) {
        setVercelToken(response.data.vercel_token);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await axios.get(`${API}/openrouter/models?api_key=${apiKey}`);
      const models = response.data.data || [];
      setAvailableModels(models);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const saveProject = async () => {
    setLoading(true);
    try {
      if (projectId) {
        await axios.put(`${API}/projects/${projectId}`, project);
        toast.success('Projet sauvegardé');
      } else {
        const response = await axios.post(`${API}/projects`, project);
        toast.success('Projet créé');
        navigate(`/editor/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !apiKey) {
      toast.error('Veuillez entrer un message et configurer votre clé API');
      return;
    }

    const userMessage = { role: 'user', content: inputMessage };
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setGenerating(true);

    try {
      const conversationHistory = chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await axios.post(`${API}/generate/openrouter`, {
        message: inputMessage,
        model: selectedModel,
        api_key: apiKey,
        conversation_history: conversationHistory
      });

      const assistantMessage = { role: 'assistant', content: response.data.response };
      setChatMessages(prev => [...prev, assistantMessage]);

      // Parse code from response
      parseAndApplyCode(response.data.response);
      
    } catch (error) {
      console.error('Error generating code:', error);
      toast.error('Erreur lors de la génération');
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Désolé, une erreur est survenue. Vérifiez votre clé API et réessayez.' 
      }]);
    } finally {
      setGenerating(false);
    }
  };

  const parseAndApplyCode = (response) => {
    const codeBlockRegex = /```(\w+)\n?(?:\/\/\s*filename:\s*(.+)\n)?([\s\S]*?)```/g;
    let match;
    const newFiles = [];

    while ((match = codeBlockRegex.exec(response)) !== null) {
      const [, language, filename, code] = match;
      const cleanCode = code.trim();
      
      if (filename) {
        newFiles.push({
          name: filename.trim(),
          content: cleanCode,
          language: language || 'plaintext'
        });
      } else {
        // If no filename, try to determine from language
        const ext = language === 'html' ? 'html' : language === 'css' ? 'css' : language === 'javascript' ? 'js' : 'txt';
        const name = `file.${ext}`;
        newFiles.push({
          name,
          content: cleanCode,
          language: language || 'plaintext'
        });
      }
    }

    if (newFiles.length > 0) {
      setProject(prev => {
        const updatedFiles = [...prev.files];
        
        newFiles.forEach(newFile => {
          const existingIndex = updatedFiles.findIndex(f => f.name === newFile.name);
          if (existingIndex >= 0) {
            updatedFiles[existingIndex] = newFile;
          } else {
            updatedFiles.push(newFile);
          }
        });
        
        return { ...prev, files: updatedFiles };
      });
      
      toast.success(`${newFiles.length} fichier(s) mis à jour`);
    }
  };

  const updatePreview = () => {
    if (!iframeRef.current) return;

    const htmlFile = project.files.find(f => f.name.endsWith('.html'));
    const cssFile = project.files.find(f => f.name.endsWith('.css'));
    const jsFile = project.files.find(f => f.name.endsWith('.js'));

    let html = htmlFile?.content || '<!DOCTYPE html><html><head></head><body><h1>Pas de fichier HTML</h1></body></html>';
    
    // Inject CSS
    if (cssFile && html.includes('</head>')) {
      html = html.replace('</head>', `<style>${cssFile.content}</style></head>`);
    }
    
    // Inject JS
    if (jsFile && html.includes('</body>')) {
      html = html.replace('</body>', `<script>${jsFile.content}</script></body>`);
    }

    // Use srcdoc to avoid CORS issues
    iframeRef.current.srcdoc = html;
  };

  const exportToGithub = async () => {
    if (!githubRepoName || !githubToken) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // Save project first
    await saveProject();

    setLoading(true);
    try {
      const response = await axios.post(`${API}/github/export`, {
        project_id: projectId || project.id,
        repo_name: githubRepoName,
        github_token: githubToken,
        private: isPrivateRepo
      });

      toast.success('Projet exporté sur GitHub !');
      setShowGithubDialog(false);
      window.open(response.data.repo_url, '_blank');
    } catch (error) {
      console.error('Error exporting to GitHub:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'export');
    } finally {
      setLoading(false);
    }
  };

  const deployToVercel = async () => {
    if (!vercelProjectName || !vercelToken) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // Save project first
    await saveProject();

    setLoading(true);
    try {
      const response = await axios.post(`${API}/vercel/deploy`, {
        project_id: projectId || project.id,
        vercel_token: vercelToken,
        project_name: vercelProjectName
      });

      toast.success('Projet déployé sur Vercel !');
      setShowVercelDialog(false);
      window.open(response.data.url, '_blank');
    } catch (error) {
      console.error('Error deploying to Vercel:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors du déploiement');
    } finally {
      setLoading(false);
    }
  };

  const addNewFile = () => {
    const fileName = prompt('Nom du fichier (ex: app.js, styles.css):');
    if (!fileName) return;
    
    const extension = fileName.split('.').pop();
    const languageMap = {
      'html': 'html',
      'css': 'css',
      'js': 'javascript',
      'json': 'json',
      'md': 'markdown'
    };
    
    const newFile = {
      name: fileName,
      content: '',
      language: languageMap[extension] || 'plaintext'
    };
    
    setProject(prev => ({
      ...prev,
      files: [...prev.files, newFile]
    }));
    
    setCurrentFileIndex(project.files.length);
  };

  const deleteFile = (index) => {
    if (project.files.length <= 1) {
      toast.error('Vous devez avoir au moins un fichier');
      return;
    }
    
    if (window.confirm('Supprimer ce fichier ?')) {
      setProject(prev => ({
        ...prev,
        files: prev.files.filter((_, i) => i !== index)
      }));
      
      if (currentFileIndex >= project.files.length - 1) {
        setCurrentFileIndex(Math.max(0, project.files.length - 2));
      }
    }
  };

  const downloadProject = () => {
    const zip = project.files.map(file => `
=== ${file.name} ===
${file.content}
`).join('\n\n');
    
    const blob = new Blob([zip], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Projet téléchargé');
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(project.files[currentFileIndex].content);
      setCopied(true);
      toast.success('Code copié');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0b]">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl z-50 flex-shrink-0">
        <div className="px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-to-dashboard"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Input
              data-testid="project-name-input"
              value={project.name}
              onChange={(e) => setProject({ ...project, name: e.target.value })}
              className="bg-transparent border-none text-lg font-semibold focus-visible:ring-0 w-64"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              data-testid="download-project-button"
              variant="ghost"
              size="sm"
              onClick={downloadProject}
              className="text-gray-400 hover:text-white"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Dialog open={showGithubDialog} onOpenChange={setShowGithubDialog}>
              <DialogTrigger asChild>
                <Button
                  data-testid="github-export-button"
                  variant="ghost"
                  size="sm"
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1a1c] border-white/10">
                <DialogHeader>
                  <DialogTitle>Exporter vers GitHub</DialogTitle>
                  <DialogDescription>
                    Créez un nouveau repository GitHub avec votre projet
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nom du repository</Label>
                    <Input
                      data-testid="github-repo-name-input"
                      value={githubRepoName}
                      onChange={(e) => setGithubRepoName(e.target.value)}
                      placeholder="mon-super-projet"
                      className="bg-white/5 border-white/10 mt-2"
                    />
                  </div>
                  <div>
                    <Label>GitHub Token</Label>
                    <Input
                      data-testid="github-token-dialog-input"
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="ghp_..."
                      className="bg-white/5 border-white/10 mt-2"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="private-repo"
                      checked={isPrivateRepo}
                      onChange={(e) => setIsPrivateRepo(e.target.checked)}
                    />
                    <Label htmlFor="private-repo">Repository privé</Label>
                  </div>
                  <Button
                    data-testid="confirm-github-export"
                    onClick={exportToGithub}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Github className="w-4 h-4 mr-2" />}
                    Exporter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showVercelDialog} onOpenChange={setShowVercelDialog}>
              <DialogTrigger asChild>
                <Button
                  data-testid="vercel-deploy-button"
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Vercel
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1a1c] border-white/10">
                <DialogHeader>
                  <DialogTitle>Déployer sur Vercel</DialogTitle>
                  <DialogDescription>
                    Déployez votre projet sur Vercel en production
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nom du projet</Label>
                    <Input
                      data-testid="vercel-project-name-input"
                      value={vercelProjectName}
                      onChange={(e) => setVercelProjectName(e.target.value)}
                      placeholder="mon-super-projet"
                      className="bg-white/5 border-white/10 mt-2"
                    />
                  </div>
                  <div>
                    <Label>Vercel Token</Label>
                    <Input
                      data-testid="vercel-token-dialog-input"
                      type="password"
                      value={vercelToken}
                      onChange={(e) => setVercelToken(e.target.value)}
                      placeholder="..."
                      className="bg-white/5 border-white/10 mt-2"
                    />
                  </div>
                  <Button
                    data-testid="confirm-vercel-deploy"
                    onClick={deployToVercel}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
                    Déployer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button
              data-testid="save-project-button"
              onClick={saveProject}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Sauvegarder
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <SplitPane split="vertical" minSize={250} maxSize={600} defaultSize={320}>
          {/* Chat Panel */}
          <div className="h-full border-r border-white/5 bg-black/20 flex flex-col">
          <div className="p-4 border-b border-white/5 flex-shrink-0">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              Assistant IA
            </h2>
            <div className="mt-3 space-y-2">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger data-testid="model-selector" className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Modèle" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1c] border-white/10">
                  {availableModels.length > 0 ? (
                    availableModels.slice(0, 20).map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name || model.id}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="openai/gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="google/gemini-2.0-flash-exp">Gemini 2.0 Flash</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              
              {!apiKey && (
                <Button
                  data-testid="configure-api-key-button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/settings')}
                  className="w-full border-emerald-500/30 text-emerald-400"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurer la clé API
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="chat-messages-container">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Commencez une conversation</p>
                <p className="text-xs mt-2">Décrivez ce que vous voulez créer</p>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  data-testid={`chat-message-${idx}`}
                  className={`p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 ml-4'
                      : 'bg-white/5 border border-white/10 mr-4'
                  }`}
                >
                  <p className="text-xs text-gray-400 mb-1">
                    {msg.role === 'user' ? 'Vous' : 'Assistant'}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))
            )}
            {generating && (
              <div className="bg-white/5 border border-white/10 p-3 rounded-lg mr-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <p className="text-sm text-gray-400">Génération en cours...</p>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-4 border-t border-white/5 flex-shrink-0">
            <div className="flex gap-2">
              <Textarea
                data-testid="chat-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Décrivez ce que vous voulez créer..."
                className="bg-white/5 border-white/10 resize-none"
                rows={3}
              />
              <Button
                data-testid="send-message-button"
                onClick={sendMessage}
                disabled={generating || !apiKey}
                className="bg-emerald-500 hover:bg-emerald-600 self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Code Editor & Preview */}
        <div className="h-full flex flex-col">
          {/* File Tabs */}
          <div className="border-b border-white/5 bg-black/20 flex items-center gap-2 px-4 py-2 overflow-x-auto flex-shrink-0">
            {project.files.map((file, idx) => (
              <div
                key={idx}
                data-testid={`file-tab-${idx}`}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                  currentFileIndex === idx
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
                onClick={() => setCurrentFileIndex(idx)}
              >
                <FileCode className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap">{file.name}</span>
                {project.files.length > 1 && (
                  <button
                    data-testid={`delete-file-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(idx);
                    }}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <Button
              data-testid="add-file-button"
              variant="ghost"
              size="sm"
              onClick={addNewFile}
              className="text-gray-400 hover:text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Editor & Preview Split */}
          <div className="flex-1 overflow-hidden">
            {showEditor ? (
              <SplitPane split="vertical" minSize={300} defaultSize="50%">
                {/* Code Editor */}
                <div className="h-full flex flex-col border-r border-white/5">
                <div className="p-2 border-b border-white/5 bg-black/20 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium">Éditeur</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      data-testid="toggle-editor-button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEditor(false)}
                      className="text-gray-400 hover:text-white"
                      title="Masquer l'éditeur"
                    >
                      <PanelLeftClose className="w-4 h-4" />
                    </Button>
                    <Button
                      data-testid="copy-code-button"
                      variant="ghost"
                      size="sm"
                      onClick={copyCode}
                      className="text-gray-400 hover:text-white"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={project.files[currentFileIndex]?.language || 'plaintext'}
                  value={project.files[currentFileIndex]?.content || ''}
                  onChange={(value) => {
                    const updatedFiles = [...project.files];
                    updatedFiles[currentFileIndex].content = value || '';
                    setProject({ ...project, files: updatedFiles });
                  }}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                  }}
                />
              </div>
            </div>

              {/* Preview */}
              <div className="h-full flex flex-col bg-white">
              <div className="p-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Aperçu</span>
                </div>
                <Button
                  data-testid="refresh-preview-button"
                  variant="ghost"
                  size="sm"
                  onClick={updatePreview}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <iframe
                  ref={iframeRef}
                  data-testid="preview-iframe"
                  title="Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-modals"
                />
              </div>
            </div>
              </SplitPane>
            ) : (
              /* Preview seul quand l'éditeur est masqué */
              <div className="h-full flex flex-col bg-white">
                <div className="p-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Aperçu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      data-testid="show-editor-button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEditor(true)}
                      className="text-gray-600 hover:text-gray-900"
                      title="Afficher l'éditeur"
                    >
                      <PanelLeftOpen className="w-4 h-4" />
                    </Button>
                    <Button
                      data-testid="refresh-preview-button-fullscreen"
                      variant="ghost"
                      size="sm"
                      onClick={updatePreview}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <iframe
                    ref={iframeRef}
                    data-testid="preview-iframe-fullscreen"
                    title="Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-modals"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        </SplitPane>
      </div>
    </div>
  );
};

export default EditorPage;
