# 🛠️ Guide d'Administration - Devora

## Accès au Panel Admin

Pour accéder au panel administrateur :
1. Connectez-vous avec un compte admin (champ `is_admin: true` dans MongoDB)
2. Accédez à l'URL `/admin`

## Configuration Système

Le panel admin permet de configurer entièrement Stripe et Resend sans toucher au code ou aux variables d'environnement.

### 💳 Configuration Stripe

**Mode Test vs Mode Live**
- Activez le mode test pour utiliser les clés de test Stripe
- Désactivez pour passer en mode production (live)

**API Key**
- Mode test: `sk_test_...`
- Mode live: `sk_live_...`
- Obtenir sur: https://dashboard.stripe.com/apikeys

**Webhook Secret**
- Format: `whsec_...`
- Obtenir sur: https://dashboard.stripe.com/webhooks
- URL du webhook: `https://devora.fun/api/billing/webhook`

### 📧 Configuration Resend

**API Key**
- Format: `re_...`
- Obtenir sur: https://resend.com/api-keys

**Email From**
- Format: `noreply@devora.fun`
- Doit être un domaine vérifié dans Resend

### 💰 Paramètres de Facturation

**Prix de l'abonnement**
- Montant en euros TTC
- Par défaut: 9.90€

**Durée de l'essai gratuit**
- En jours
- Par défaut: 7 jours

**Échecs de paiement max**
- Nombre d'échecs avant blocage du compte
- Par défaut: 3 tentatives

## KPIs Disponibles

Le dashboard affiche :
- Nombre total d'utilisateurs
- Abonnements actifs
- Revenue total
- Nombre de projets
- Nouveaux utilisateurs ce mois
- Taux de churn

## Création d'un Compte Admin

Pour créer un admin, modifiez directement dans MongoDB :

```javascript
db.users.updateOne(
  { email: "admin@devora.fun" },
  { $set: { is_admin: true } }
)
```

## API Endpoints Admin

- `GET /api/admin/stats` - KPIs dashboard
- `GET /api/admin/config` - Configuration système
- `PUT /api/admin/config` - Mise à jour de la config
- `GET /api/admin/users` - Liste des utilisateurs
- `PUT /api/admin/users/{user_id}/status` - Activer/désactiver un utilisateur

## Sécurité

- Toutes les routes admin nécessitent un JWT token valide
- Le middleware `get_current_admin_user` vérifie `is_admin: true`
- Les clés API sont stockées de manière sécurisée dans MongoDB
- Les clés ne sont jamais exposées dans les logs

## Notes Importantes

1. **Stripe Price ID**: Le prix est créé dynamiquement à chaque checkout selon la config
2. **Essai gratuit**: Appliqué automatiquement à tous les nouveaux abonnements
3. **Mode test**: Permet de tester les paiements sans frais réels
4. **Webhooks**: Stripe doit être configuré pour envoyer les webhooks à votre backend

## Workflow de Configuration Initial

1. Créer un compte Stripe (test d'abord)
2. Récupérer les clés API test
3. Configurer un webhook dans Stripe
4. Se connecter au panel admin
5. Entrer les clés Stripe en mode test
6. Tester un abonnement
7. Une fois validé, passer en mode live avec les vraies clés

## Support

Pour toute question, contactez l'équipe de développement.
