# CodeGen AI - Clone Lovable Gratuit

Une application complète de génération de code assistée par IA, similaire à Lovable, mais **100% gratuite et open source**. 

## 🌟 Fonctionnalités

### Génération de Code IA
- **Support de tous les modèles OpenRouter** : GPT-4o, Claude, Gemini, et bien plus
- Génération de code HTML, CSS et JavaScript en temps réel
- Chat conversationnel avec contexte maintenu
- Parsing intelligent du code généré

### Éditeur de Code
- **Monaco Editor** intégré (le même que VS Code)
- Coloration syntaxique pour HTML, CSS, JavaScript
- Gestion de fichiers multiples
- Ajout/suppression de fichiers à la volée
- Copie rapide du code

### Prévisualisation en Direct
- Aperçu instantané du code dans une iframe
- Mise à jour automatique lors des modifications
- Rendu HTML/CSS/JS en temps réel

### Gestion des Projets
- Sauvegarde automatique dans MongoDB
- Dashboard pour gérer tous vos projets
- Historique des conversations
- Export et téléchargement

### Intégrations
- **Export GitHub** : Créez des repositories directement depuis l'app
- **Déploiement Vercel** : Déployez en production en un clic
- Gestion sécurisée des tokens API

## 🚀 Utilisation

### 1. Configuration Initiale

1. Allez dans **Paramètres** depuis la page d'accueil
2. Ajoutez votre **clé API OpenRouter** :
   - Visitez [openrouter.ai/keys](https://openrouter.ai/keys)
   - Créez un compte et générez une clé
   - Ajoutez des crédits à votre compte OpenRouter

3. **(Optionnel)** Configurez vos tokens pour l'export :
   - **GitHub Token** : [github.com/settings/tokens](https://github.com/settings/tokens)
     - Permissions requises : `repo`
   - **Vercel Token** : [vercel.com/account/tokens](https://vercel.com/account/tokens)

### 2. Créer un Projet

1. Cliquez sur **"Commencer gratuitement"** ou **"Nouveau Projet"**
2. L'éditeur s'ouvre avec 3 fichiers par défaut : `index.html`, `styles.css`, `script.js`

### 3. Générer du Code avec l'IA

1. Dans le panneau **Assistant IA** (gauche) :
   - Sélectionnez un modèle (GPT-4o, Claude, etc.)
   - Décrivez ce que vous voulez créer
   - Cliquez sur le bouton d'envoi

2. L'IA génère le code et met à jour automatiquement vos fichiers
3. La preview s'affiche instantanément à droite

### 4. Gérer les Fichiers

- **Ajouter un fichier** : Cliquez sur le bouton `+` dans la barre d'onglets
- **Supprimer un fichier** : Cliquez sur le `×` dans l'onglet du fichier
- **Éditer** : Cliquez sur l'éditeur Monaco au centre

### 5. Sauvegarder et Exporter

- **Sauvegarder** : Cliquez sur le bouton vert "Sauvegarder"
- **Télécharger** : Icône de téléchargement pour obtenir tous les fichiers
- **Export GitHub** : Bouton violet "GitHub" pour créer un repo
- **Déployer Vercel** : Bouton bleu "Vercel" pour mettre en production

## 🏗️ Architecture Technique

### Backend (FastAPI + MongoDB)
```
/app/backend/
├── server.py          # API principale
├── requirements.txt   # Dépendances Python
└── .env              # Variables d'environnement
```

**APIs disponibles :**
- `GET /api/` - Health check
- `GET/PUT /api/settings` - Configuration utilisateur
- `GET/POST/DELETE /api/projects` - Gestion des projets
- `GET/POST/DELETE /api/conversations` - Gestion des conversations
- `GET /api/openrouter/models` - Liste des modèles disponibles
- `POST /api/generate/openrouter` - Génération de code via OpenRouter
- `POST /api/github/export` - Export vers GitHub
- `POST /api/vercel/deploy` - Déploiement sur Vercel

### Frontend (React)
```
/app/frontend/src/
├── App.js                    # Application principale
├── pages/
│   ├── HomePage.jsx         # Page d'accueil
│   ├── Dashboard.jsx        # Liste des projets
│   ├── EditorPage.jsx       # Éditeur principal
│   └── SettingsPage.jsx     # Configuration
└── components/ui/           # Composants Shadcn UI
```

### Technologies Utilisées

**Backend :**
- FastAPI - Framework API moderne
- MongoDB - Base de données NoSQL
- Motor - Driver MongoDB async
- httpx - Client HTTP pour OpenRouter
- PyGithub - Intégration GitHub
- emergentintegrations - Bibliothèque LLM

**Frontend :**
- React 19 - Framework UI
- Monaco Editor - Éditeur de code
- Shadcn UI - Composants UI modernes
- Tailwind CSS - Styling
- Axios - Client HTTP
- React Router - Navigation
- Lucide React - Icônes

## 🎨 Design

L'interface utilise une palette de couleurs moderne :
- Couleur primaire : Émeraude (#10b981)
- Fond sombre : #0a0a0b
- Design inspiré des outils de développement modernes
- Police : Space Grotesk (titres) + Inter (texte)

## 📝 Modèles OpenRouter Supportés

L'application supporte **tous les modèles disponibles sur OpenRouter**, incluant :

### OpenAI
- GPT-4o, GPT-4o-mini
- GPT-5, GPT-5-mini, GPT-5-nano
- O1, O3, O4-mini

### Anthropic
- Claude 3.5 Haiku
- Claude 4 Sonnet
- Claude 4 Opus

### Google
- Gemini 2.0 Flash
- Gemini 2.5 Flash
- Gemini 2.5 Pro
- Gemini 3 Pro Preview

Et bien d'autres modèles disponibles sur OpenRouter !

## 🔒 Sécurité

- Les clés API sont stockées de manière sécurisée dans MongoDB
- Les tokens ne sont jamais exposés dans le frontend
- Toutes les requêtes API passent par le backend
- CORS configuré correctement

## 🌐 Variables d'Environnement

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=lovable_clone_db
CORS_ORIGINS=*
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=<URL_BACKEND>
```

## 📦 Installation et Démarrage

Les services sont gérés par Supervisor :

```bash
# Redémarrer le backend
sudo supervisorctl restart backend

# Redémarrer le frontend
sudo supervisorctl restart frontend

# Vérifier le statut
sudo supervisorctl status
```

## 🎯 Différences avec Lovable

| Fonctionnalité | CodeGen AI (Ce projet) | Lovable |
|---------------|------------------------|---------|
| Prix | **100% Gratuit** | Payant (abonnement) |
| Modèles IA | Tous les modèles OpenRouter | Limité |
| Clé API | Votre propre clé | Incluse |
| Code Source | Open Source | Propriétaire |
| Déploiement | GitHub + Vercel | Intégré |
| Base de données | MongoDB (locale) | Cloud propriétaire |

## 🤝 Contribution

Ce projet est open source. N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Contribuer au code
- Partager vos projets créés avec l'app

## 📄 Licence

MIT License - Utilisez librement pour vos projets personnels et commerciaux.

## 🙏 Remerciements

Créé avec ❤️ en utilisant :
- OpenRouter pour l'accès aux modèles IA
- Emergent.sh pour l'infrastructure
- La communauté open source

---

**Bon code ! 🚀**
