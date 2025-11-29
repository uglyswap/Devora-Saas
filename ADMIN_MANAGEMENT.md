# 👨‍💼 Guide de Gestion des Administrateurs - Devora

## 🔐 Compte Admin par Défaut

Un compte administrateur a déjà été créé lors de l'installation :

```
Email    : admin@devora.fun
Password : Admin123!
```

**⚠️ SÉCURITÉ CRITIQUE :**
- Changez ce mot de passe immédiatement après la première connexion
- Utilisez un mot de passe fort (min 12 caractères, majuscules, minuscules, chiffres, symboles)
- Activez l'authentification 2FA si disponible (feature future)

---

## 📝 Créer un Nouveau Compte Admin

### Méthode 1 : Script Python (Recommandé)

**Pour créer un admin avec email/password personnalisé :**

1. Éditez le fichier `/app/backend/create_admin.py`
2. Modifiez les lignes suivantes :

```python
admin_email = "votre.admin@devora.fun"      # Votre email
admin_password = "VotreMotDePasseSecurise"  # Votre mot de passe
```

3. Exécutez le script :

```bash
cd /app/backend
python create_admin.py
```

**Sortie attendue :**
```
🔐 Creating admin user...
✅ Admin user created successfully!
   Email: votre.admin@devora.fun
   Password: VotreMotDePasseSecurise
   ⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!

✅ Done!
```

---

### Méthode 2 : Promouvoir un Utilisateur Existant via API

Si un utilisateur s'est déjà inscrit sur Devora, vous pouvez le promouvoir en admin :

**Étape 1 : Se connecter en tant qu'admin**

```bash
# Login admin
curl -X POST "https://devora.fun/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@devora.fun","password":"Admin123!"}' \
  | jq -r '.access_token'
```

Copiez le token JWT retourné.

**Étape 2 : Récupérer l'ID de l'utilisateur à promouvoir**

```bash
# Liste des utilisateurs
curl -X GET "https://devora.fun/api/admin/users" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  | jq '.users[] | {id, email, is_admin}'
```

**Étape 3 : Promouvoir l'utilisateur**

```bash
curl -X POST "https://devora.fun/api/admin/users/{USER_ID}/promote-admin" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

**Réponse attendue :**
```json
{
  "message": "User utilisateur@example.com successfully promoted to admin",
  "user_id": "abc123...",
  "email": "utilisateur@example.com"
}
```

---

### Méthode 3 : Directement dans MongoDB

**⚠️ Méthode avancée - Nécessite accès direct à la base de données**

```bash
# Se connecter à MongoDB
mongo

# Utiliser la base Devora
use devora_projects_db

# Promouvoir un utilisateur par email
db.users.updateOne(
  { email: "utilisateur@example.com" },
  { 
    $set: { 
      is_admin: true,
      updated_at: new Date().toISOString()
    } 
  }
)

# Vérifier la promotion
db.users.findOne(
  { email: "utilisateur@example.com" },
  { email: 1, is_admin: 1, _id: 0 }
)
```

**Sortie attendue :**
```json
{
  "email": "utilisateur@example.com",
  "is_admin": true
}
```

---

## 🚫 Révoquer le Statut Admin

### Via API

**⚠️ Note : Un admin ne peut pas révoquer son propre statut**

```bash
curl -X DELETE "https://devora.fun/api/admin/users/{USER_ID}/revoke-admin" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

**Réponse attendue :**
```json
{
  "message": "Admin status revoked from utilisateur@example.com",
  "user_id": "abc123...",
  "email": "utilisateur@example.com"
}
```

### Via MongoDB

```javascript
db.users.updateOne(
  { email: "utilisateur@example.com" },
  { 
    $set: { 
      is_admin: false,
      updated_at: new Date().toISOString()
    } 
  }
)
```

---

## 🔍 Lister les Administrateurs

### Via API

```bash
curl -X GET "https://devora.fun/api/admin/users?limit=100" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  | jq '.users[] | select(.is_admin == true) | {email, id, is_admin}'
```

### Via MongoDB

```javascript
db.users.find(
  { is_admin: true },
  { email: 1, full_name: 1, created_at: 1, _id: 0 }
).pretty()
```

---

## 🎯 Bonnes Pratiques de Sécurité

### 1. **Limitation du Nombre d'Admins**
- Accordez le statut admin uniquement aux personnes de confiance
- Recommandation : 2-3 admins maximum pour une startup
- Utilisez des comptes nominatifs (pas de admin@, root@, etc.)

### 2. **Rotation des Mots de Passe**
- Changez les mots de passe admin tous les 90 jours
- Utilisez un gestionnaire de mots de passe (1Password, Bitwarden)
- Ne partagez jamais les mots de passe par email/chat

### 3. **Audit Trail**
- Tous les actions admin sont loggées dans `/var/log/supervisor/backend.err.log`
- Vérifiez régulièrement les logs pour détecter les activités suspectes

```bash
# Voir les actions admin récentes
tail -f /var/log/supervisor/backend.err.log | grep "admin"
```

### 4. **Principe du Moindre Privilège**
- N'accordez le statut admin que si absolument nécessaire
- Pour les tâches courantes, utilisez un compte utilisateur standard
- Révoquez immédiatement l'accès admin des employés qui quittent l'entreprise

### 5. **Authentification 2FA** (Futur)
- Activez l'authentification à deux facteurs dès qu'elle sera disponible
- Utilisez une app authenticator (Google Authenticator, Authy)

---

## 📊 Droits et Permissions Admin

### Ce qu'un Admin peut faire :

✅ **Gestion Configuration**
- Modifier les clés Stripe (test/live)
- Modifier les clés Resend
- Ajuster les paramètres de facturation (prix, essai gratuit)

✅ **Gestion Utilisateurs**
- Voir tous les utilisateurs
- Activer/désactiver des comptes
- Promouvoir/révoquer des admins
- Voir les KPIs et statistiques

✅ **Gestion Facturation**
- Voir tous les abonnements
- Voir le revenue total
- Accéder aux webhooks Stripe

### Ce qu'un Admin ne peut PAS faire :

❌ Accéder aux projets privés des utilisateurs (respect RGPD)
❌ Voir les mots de passe (ils sont hachés)
❌ Modifier les données de facturation Stripe (géré par Stripe)

---

## 🆘 Problèmes Courants

### Problème 1 : "Je ne peux pas me connecter en tant qu'admin"

**Solutions :**
1. Vérifiez que l'email/password sont corrects
2. Vérifiez que `is_admin: true` dans MongoDB :
   ```javascript
   db.users.findOne({ email: "admin@devora.fun" }, { is_admin: 1 })
   ```
3. Si `is_admin: false`, exécutez :
   ```javascript
   db.users.updateOne(
     { email: "admin@devora.fun" },
     { $set: { is_admin: true } }
   )
   ```

### Problème 2 : "L'accès au panel admin est refusé"

**Solutions :**
1. Vérifiez que vous êtes bien connecté (token JWT valide)
2. Rechargez la page après login
3. Vérifiez dans la console du navigateur (F12) si des erreurs apparaissent
4. Videz le cache et réessayez

### Problème 3 : "J'ai oublié le mot de passe admin"

**Solutions :**
1. Réinitialisez via MongoDB :
   ```python
   # Dans /app/backend, créez reset_admin_password.py
   from auth import get_password_hash
   new_password = "NouveauMotDePasse123!"
   hashed = get_password_hash(new_password)
   print(f"Nouveau hash: {hashed}")
   ```
2. Mettez à jour dans MongoDB :
   ```javascript
   db.users.updateOne(
     { email: "admin@devora.fun" },
     { $set: { hashed_password: "HASH_GENERE" } }
   )
   ```

### Problème 4 : "Tous les admins ont été supprimés par erreur"

**Solutions :**
1. Exécutez le script `create_admin.py` pour recréer un admin
2. Ou promouvez un utilisateur existant via MongoDB

---

## 📞 Support

Pour toute question sur la gestion des admins :
- Email : support@devora.fun
- Documentation : `/app/ADMIN_SETUP.md`

---

**Date de création** : 28 Novembre 2025  
**Dernière mise à jour** : 28 Novembre 2025
