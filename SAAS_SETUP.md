# 🚀 Guide de Configuration SaaS - Devora

## 📋 État Actuel de l'Implémentation

### ✅ Backend Complété (90%)

**1. Authentification & Utilisateurs**
- ✅ Système JWT complet (`/app/backend/auth.py`)
- ✅ Modèles utilisateur avec abonnements (`/app/backend/models.py`)
- ✅ Routes d'inscription et connexion (`/app/backend/routes_auth.py`)
  - `POST /api/auth/register` - Créer un compte
  - `POST /api/auth/login` - Se connecter
  - `GET /api/auth/me` - Infos utilisateur actuel

**2. Système de Facturation Stripe**
- ✅ Service Stripe complet (`/app/backend/stripe_service.py`)
- ✅ Routes de facturation (`/app/backend/routes_billing.py`)
  - `GET /api/billing/plans` - Plans disponibles
  - `POST /api/billing/create-checkout-session` - Créer session de paiement
  - `POST /api/billing/create-portal-session` - Portail client Stripe
  - `GET /api/billing/invoices` - Liste des factures
  - `POST /api/billing/webhook` - Webhooks Stripe

**3. Dashboard Admin**
- ✅ Routes admin avec KPIs (`/app/backend/routes_admin.py`)
  - `GET /api/admin/stats` - Statistiques (users, revenue, churn...)
  - `GET /api/admin/users` - Liste tous les utilisateurs
  - `PUT /api/admin/users/{id}/status` - Activer/désactiver un user

**4. Intégration**
- ✅ Routes intégrées dans `server.py`
- ✅ Protection des endpoints par authentification
- ⏳ Projets pas encore liés aux utilisateurs (à faire)

### ⏳ Frontend À Créer (0%)

Les pages suivantes doivent être créées :

1. **Page de Connexion** (`/app/frontend/src/pages/Login.jsx`)
2. **Page d'Inscription** (`/app/frontend/src/pages/Register.jsx`)
3. **Page de Facturation** (`/app/frontend/src/pages/Billing.jsx`)
4. **Dashboard Admin** (`/app/frontend/src/pages/AdminDashboard.jsx`)
5. **Composant ProtectedRoute** pour les routes authentifiées
6. **Context Provider** pour gérer l'état auth globalement

---

## 🔧 Configuration Stripe

### Étape 1 : Créer un Compte Stripe

1. Allez sur [stripe.com](https://stripe.com)
2. Créez un compte (ou connectez-vous)
3. Activez le mode test

### Étape 2 : Créer un Produit et Prix

1. Dans le dashboard Stripe, allez dans **Products**
2. Cliquez sur **Add product**
3. Créez un produit "Devora Pro" :
   - **Name**: Devora Pro
   - **Description**: Accès complet à Devora avec système agentique
   - **Pricing**: 9,90€ / mois
   - **Billing period**: Monthly
4. Copiez le **Price ID** (commence par `price_...`)

### Étape 3 : Récupérer les Clés API

1. Allez dans **Developers** → **API keys**
2. Copiez :
   - **Secret key** (commence par `sk_test_...`)
   - **Publishable key** (commence par `pk_test_...`)

### Étape 4 : Configurer le Webhook

1. Allez dans **Developers** → **Webhooks**
2. Cliquez sur **Add endpoint**
3. URL du webhook : `https://votre-domaine.com/api/billing/webhook`
4. Sélectionnez ces événements :
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copiez le **Signing secret** (commence par `whsec_...`)

### Étape 5 : Mettre à Jour .env

Éditez `/app/backend/.env` :

```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_VOTRE_CLE"
STRIPE_PRICE_ID="price_VOTRE_PRICE_ID"
STRIPE_WEBHOOK_SECRET="whsec_VOTRE_WEBHOOK_SECRET"

# JWT Secret (générez une clé aléatoire longue)
JWT_SECRET_KEY="votre-secret-jwt-tres-long-et-aleatoire"
```

**⚠️ IMPORTANT** : En production, utilisez les clés LIVE (`sk_live_...`, `pk_live_...`)

---

## 🎨 Frontend Pages À Créer

### 1. Page de Connexion

```jsx
// /app/frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email,
        password
      });

      localStorage.setItem('token', response.data.access_token);
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#111113] to-[#0a0a0b] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Connexion à Devora</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Mot de passe</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-400">
          Pas encore de compte ?{' '}
          <a href="/register" className="text-emerald-400 hover:underline">
            S'inscrire
          </a>
        </p>
      </div>
    </div>
  );
}
```

### 2. Page d'Inscription

Similaire à Login mais appelle `/api/auth/register`

### 3. Page de Facturation

```jsx
// /app/frontend/src/pages/Billing.jsx
- Affiche le plan actuel de l'utilisateur
- Bouton "S'abonner" si pas d'abonnement
- Bouton "Gérer l'abonnement" (ouvre Stripe Portal)
- Liste des factures avec liens PDF
```

### 4. Dashboard Admin

```jsx
// /app/frontend/src/pages/AdminDashboard.jsx
- KPIs : Total users, Active subs, Revenue, Projects
- Graphiques avec recharts
- Liste des utilisateurs avec actions
```

---

## 🔐 Protection des Routes

### AuthContext Provider

```jsx
// /app/frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`);
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### ProtectedRoute Component

```jsx
// /app/frontend/src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requireSubscription = false }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Chargement...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requireSubscription && user.subscription_status !== 'active') {
    return <Navigate to="/billing" />;
  }

  return children;
}
```

---

## 🔄 Modification des Routes App.js

```jsx
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Billing from './pages/Billing';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<HomePage />} />
          
          <Route path="/billing" element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute requireSubscription={true}>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/editor" element={
            <ProtectedRoute requireSubscription={true}>
              <EditorPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

## 📝 Lier les Projets aux Utilisateurs

Modifiez les routes de projets dans `server.py` :

```python
@api_router.post("/projects", response_model=Project)
async def create_project(
    project: Project,
    current_user: dict = Depends(get_current_user)
):
    # Ajouter user_id au projet
    project_dict = project.model_dump()
    project_dict['user_id'] = current_user['user_id']
    project_dict['created_at'] = project_dict['created_at'].isoformat()
    project_dict['updated_at'] = project_dict['updated_at'].isoformat()
    
    await db.projects.insert_one(project_dict)
    return project

@api_router.get("/projects", response_model=List[Project])
async def get_projects(current_user: dict = Depends(get_current_user)):
    # Filtrer par user_id
    projects = await db.projects.find(
        {'user_id': current_user['user_id']},
        {'_id': 0}
    ).to_list(1000)
    # ... conversion dates ...
    return projects
```

---

## 🧪 Tests

### Test Inscription

```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User"}'
```

### Test Connexion

```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Test Endpoint Protégé

```bash
curl -X GET http://localhost:8001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Créer le Premier Admin

```python
# Dans MongoDB
db.users.updateOne(
  {email: "votre@email.com"},
  {$set: {is_admin: true}}
)
```

---

## 🚀 Prochaines Étapes

1. ✅ Backend SaaS configuré
2. ⏳ Configurer Stripe (clés API, produit, webhook)
3. ⏳ Créer les pages frontend (Login, Register, Billing, Admin)
4. ⏳ Implémenter AuthContext
5. ⏳ Protéger les routes existantes
6. ⏳ Lier projets aux utilisateurs
7. ⏳ Tester le flow complet
8. ⏳ Mode production (clés Stripe live)

---

**Prix : 9,90€/mois par utilisateur**
**Stack : FastAPI + React + MongoDB + Stripe**
**Fonctionnalités : Auth JWT + Billing + Admin Dashboard + Multi-tenant**
