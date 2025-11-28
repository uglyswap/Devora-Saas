# 🤖 Système Agentique de Devora

Devora intègre un système multi-agents autonome pour une génération de code intelligente et itérative.

## 🏗️ Architecture

### Agents Spécialisés

**1. Orchestrator Agent** 🎯
- Coordonne tous les agents
- Gère le flux de travail global
- Contrôle les itérations
- Émet les événements de progression

**2. Planner Agent** 📋
- Analyse les exigences utilisateur
- Décompose la tâche en étapes logiques
- Identifie les fichiers nécessaires
- Crée un plan d'exécution détaillé
- Considère les cas limites

**3. Coder Agent** 💻
- Génère du code selon le plan
- Produit du HTML, CSS et JavaScript
- Suit les meilleures pratiques
- Code moderne et maintenable
- Parse automatiquement les fichiers

**4. Tester Agent** 🧪
- Effectue une analyse statique du code
- Valide la structure HTML
- Vérifie la syntaxe JavaScript
- Détecte les erreurs potentielles
- Utilise l'IA pour la revue de qualité

**5. Reviewer Agent** 🔍
- Analyse les résultats des tests
- Décide de la prochaine action
- Génère des instructions de correction
- Gère les critères d'acceptation
- Contrôle les itérations maximales

## 🔄 Workflow Agentique

```
Requête Utilisateur
        ↓
┌───────────────────┐
│   Orchestrator    │
└────────┬──────────┘
         ↓
┌────────────────────┐
│ 1. PLANNING        │ ← Planner Agent
│ • Analyse          │
│ • Décomposition    │
│ • Plan d'action    │
└────────┬───────────┘
         ↓
    ┌────────────────────┐
    │ ITERATION LOOP     │
    │ (Max 3 fois)       │
    │                    │
    │ ┌────────────────┐ │
    │ │ 2. CODING      │ │ ← Coder Agent
    │ │ • Génération   │ │
    │ │ • Parsing      │ │
    │ └───────┬────────┘ │
    │         ↓          │
    │ ┌────────────────┐ │
    │ │ 3. TESTING     │ │ ← Tester Agent
    │ │ • Analyse      │ │
    │ │ • Validation   │ │
    │ │ • Détection    │ │
    │ └───────┬────────┘ │
    │         ↓          │
    │ ┌────────────────┐ │
    │ │ 4. REVIEW      │ │ ← Reviewer Agent
    │ │ • Évaluation   │ │
    │ │ • Décision     │ │
    │ └───────┬────────┘ │
    │         ↓          │
    │   Critique ?       │
    │    Issues?         │
    │         │          │
    │    ┌────┴────┐     │
    │    │         │     │
    │   OUI       NON    │
    │    │         │     │
    │  FIX      APPROVE  │
    │    │         │     │
    │    └────┬────┘     │
    │         │          │
    └─────────┼──────────┘
              ↓
         Code Final
```

## ✨ Fonctionnalités

### Planification Intelligente
- Analyse approfondie des besoins
- Décomposition en étapes logiques
- Identification des fichiers requis
- Approches techniques adaptées

### Génération Itérative
- Génération initiale du code
- Tests automatiques
- Correction des erreurs détectées
- Amélioration continue
- Maximum 3 itérations

### Tests Automatiques
- **Analyse statique** :
  - Validation HTML (DOCTYPE, structure)
  - Syntaxe JavaScript (accolades, parenthèses)
  - Détection de fichiers vides
  
- **Revue IA** :
  - Bugs potentiels
  - Qualité du code
  - Conformité au plan
  - Problèmes de sécurité
  - Issues de performance

### Amélioration Continue
- Auto-correction des erreurs critiques
- Instructions de fix détaillées
- Itérations jusqu'à qualité acceptable
- Limite de 3 itérations max

## 🎮 Utilisation

### Dans l'Interface

1. **Activer le Mode Agentique**
   - Toggle "Mode Agentique" dans le panneau chat (activé par défaut)
   - Le bouton d'envoi affiche une icône de robot 🤖

2. **Envoyer une Requête**
   - Décrivez ce que vous voulez créer
   - Soyez aussi détaillé que possible
   - Exemple : "Crée une page de landing pour un café avec menu et formulaire de contact"

3. **Suivre la Progression**
   - Messages en temps réel affichés dans le chat
   - Phases visibles : Planning → Coding → Testing → Review
   - Itérations affichées si nécessaire

4. **Résultat**
   - Code généré automatiquement appliqué
   - Fichiers créés/mis à jour
   - Qualité garantie par les tests

### Via l'API

```python
POST /api/generate/agentic

{
  "message": "Crée une todo list interactive",
  "model": "openai/gpt-4o",
  "api_key": "sk-or-v1-...",
  "current_files": [
    {
      "name": "index.html",
      "content": "...",
      "language": "html"
    }
  ]
}
```

**Réponse :**
```json
{
  "success": true,
  "files": [...],
  "plan": {...},
  "iterations": 2,
  "message": "Completed in 2 iteration(s)",
  "progress_events": [
    {
      "event": "planning",
      "data": {"message": "..."},
      "timestamp": "..."
    },
    ...
  ]
}
```

## 📊 Événements de Progression

| Événement | Description |
|-----------|-------------|
| `planning` | Analyse en cours |
| `plan_complete` | Plan créé ✅ |
| `iteration_start` | Début d'une itération |
| `coding` | Génération de code |
| `code_complete` | Code généré ✅ |
| `testing` | Tests en cours |
| `test_complete` | Tests terminés ✅ |
| `reviewing` | Revue en cours |
| `review_complete` | Revue terminée ✅ |
| `fixing` | Correction des bugs |
| `complete` | Workflow terminé 🎉 |
| `error` | Erreur rencontrée ❌ |

## 🔧 Configuration

### Paramètres du Système

```python
# Dans OrchestratorAgent
max_iterations = 3  # Nombre max d'itérations de correction
```

### Modèles Supportés

Tous les modèles disponibles sur OpenRouter :
- GPT-4o (recommandé)
- Claude 3.5 Sonnet
- Gemini 2.0 Flash
- Et plus...

## 🎯 Avantages vs Mode Standard

| Aspect | Mode Standard | Mode Agentique |
|--------|--------------|----------------|
| Planification | ❌ Non | ✅ Détaillée |
| Tests | ❌ Non | ✅ Automatiques |
| Correction | ❌ Manuelle | ✅ Auto-correction |
| Itérations | ❌ Non | ✅ Jusqu'à 3 fois |
| Qualité | Variable | Garantie |
| Temps | Rapide | Plus long |
| Fiabilité | Moyenne | Élevée |

## 🚀 Cas d'Usage Idéaux

**Mode Agentique :**
- Projets complets
- Applications complexes
- Besoin de qualité élevée
- Corrections automatiques requises
- Apprentissage du processus

**Mode Standard :**
- Modifications rapides
- Petites corrections
- Prototypage rapide
- Tests manuels préférés

## 📝 Limites Actuelles

1. **Itérations** : Maximum 3 itérations pour éviter les boucles infinies
2. **Tests** : Analyse statique basique (peut être améliorée)
3. **Sandbox** : Pas d'exécution JavaScript réelle (prévue)
4. **Langages** : HTML, CSS, JavaScript uniquement

## 🔮 Améliorations Futures

- [ ] Sandbox d'exécution JavaScript
- [ ] Tests de rendu visuel
- [ ] Support TypeScript/React
- [ ] Tests unitaires automatiques
- [ ] Déploiement automatique
- [ ] Intégration continue
- [ ] Métriques de performance
- [ ] Agent de documentation

## 🤝 Contribution

Le système agentique est modulaire et extensible :

1. **Ajouter un Agent** : Hériter de `BaseAgent`
2. **Nouvelle Phase** : Ajouter dans `OrchestratorAgent.execute()`
3. **Nouveaux Outils** : Créer dans `agents/tools/`

---

**Devora Agentic System - Code Intelligemment Généré** 🚀
