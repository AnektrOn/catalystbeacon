# 🏗️ Architecture : Webhook Unique vs Multiples Webhooks

## ❌ Approche Initiale (Multiples Webhooks)

```
profiles table
  ├─→ trigger_level_up → webhook 1
  ├─→ trigger_xp_milestone → webhook 2
  ├─→ trigger_streak_milestone → webhook 3
  ├─→ trigger_role_change → webhook 4
  └─→ trigger_subscription → webhook 5
```

**Problèmes** :
- ❌ Beaucoup de triggers à maintenir
- ❌ Même URL webhook répétée partout
- ❌ Difficile à modifier (changer l'URL = modifier tous les triggers)
- ❌ Logique dispersée entre Supabase et N8N

---

## ✅ Approche Recommandée (Webhook Unique)

```
profiles table
  └─→ trigger_profiles_update → UN SEUL webhook
                                    ↓
                              N8N Function Node
                              (détecte le type d'événement)
                                    ↓
                              Switch Node
                              (route vers le bon template)
```

**Avantages** :
- ✅ Un seul trigger à maintenir
- ✅ Logique centralisée dans N8N
- ✅ Facile à modifier (changer l'URL = 1 seul trigger)
- ✅ Facile à étendre (ajouter une détection = modifier le Function Node)
- ✅ Plus flexible

---

## 📊 Comparaison

| Aspect | Multiples Webhooks | Webhook Unique |
|--------|-------------------|----------------|
| **Nombre de triggers** | 5-10 triggers | 1 trigger |
| **Maintenance** | Difficile | Facile |
| **Modification URL** | Modifier tous les triggers | Modifier 1 trigger |
| **Logique** | Dispersée | Centralisée |
| **Performance** | Même (triggers = même coût) | Même |
| **Flexibilité** | Limitée | Élevée |

---

## 🎯 Quand Utiliser Chaque Approche

### Webhook Unique (Recommandé)

✅ **Utilisez quand** :
- Tous les événements sont sur la même table
- Vous voulez une logique centralisée
- Vous voulez faciliter la maintenance
- Vous voulez être flexible

**Exemple** : Tous les événements sur `profiles`

---

### Multiples Webhooks

✅ **Utilisez quand** :
- Les événements sont sur des tables différentes
- Vous avez besoin de conditions très spécifiques au niveau SQL
- Vous voulez séparer complètement les workflows

**Exemple** :
- `profiles` → webhook 1
- `user_badges` → webhook 2
- `user_lesson_progress` → webhook 3

---

## 🔧 Migration : Multiples → Unique

### Étape 1 : Créer le Trigger Unique

```sql
-- Supprimer tous les anciens
DROP TRIGGER IF EXISTS trigger_level_up ON profiles;
DROP TRIGGER IF EXISTS trigger_xp_milestone ON profiles;
-- etc.

-- Créer le trigger unique
CREATE TRIGGER "profiles-update-webhook"
AFTER UPDATE ON "public"."profiles"
FOR EACH ROW
EXECUTE FUNCTION supabase_functions.http_request(
  'https://votre-webhook-n8n',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '10000'
);
```

### Étape 2 : Modifier N8N

1. **Function Node** : Détecte tous les types d'événements
2. **Switch Node** : Route selon `emailType`
3. **Templates** : Un par type d'événement

---

## 📝 Code Function Node (Détection Multiple)

Voir `N8N_FUNCTION_DETECT_ALL_EVENTS.md` pour le code complet.

---

## ✅ Conclusion

**Pour votre cas** : **Webhook Unique** est la meilleure approche car :
- Tous les événements sont sur `profiles`
- Vous voulez une logique centralisée
- Vous voulez faciliter la maintenance
- Vous voulez être flexible pour ajouter de nouveaux événements

**Action** : Exécutez `create-single-webhook-profiles.sql` et utilisez le Function Node de `N8N_FUNCTION_DETECT_ALL_EVENTS.md`.
