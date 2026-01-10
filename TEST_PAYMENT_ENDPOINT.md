# 🧪 Tester l'Endpoint de Paiement

## 🎯 Test Rapide

### Test 1 : Vérifier que l'endpoint répond

```bash
curl "https://app.humancatalystbeacon.com/api/payment-success?session_id=cs_test_a1oJcT6xubBDgBx4APlwxCTksGUzRaQlZvuwcDQvyMOQVckDV3ldHkkUbx"
```

**Résultat attendu :**
- Si ça fonctionne : JSON avec `success: true`
- Si erreur : Message d'erreur

### Test 2 : Vérifier les logs du serveur

Pendant que vous testez, regardez les logs :

```bash
pm2 logs hcuniversity-app --lines 50
```

**Cherchez :**
- `=== PAYMENT SUCCESS ENDPOINT CALLED ===`
- `✅ Profile updated successfully`
- `✅ Subscription record inserted successfully`
- `❌` (erreurs)

## 🔍 Vérifier la Configuration

### Vérifier server.env

Assurez-vous que `server.env` contient :

```env
SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre_vraie_clé_ici
```

**Important :** Utilisez `SUPABASE_SERVICE_ROLE_KEY` (pas `SUPABASE_ANON_KEY`)

### Vérifier que les variables sont chargées

Au démarrage du serveur, vous devriez voir :

```
✅ Supabase client initialized: { url: 'https://...', hasServiceKey: true }
```

Si vous voyez `hasServiceKey: false`, la clé n'est pas chargée.

## 🐛 Problèmes Courants

### Problème : "Supabase configuration missing"

**Cause :** Les variables d'environnement ne sont pas chargées.

**Solution :**
1. Vérifiez que `server.env` existe
2. Vérifiez que les variables sont correctes
3. Redémarrez le serveur

### Problème : L'endpoint retourne 500

**Cause :** Erreur dans le code ou configuration manquante.

**Solution :**
1. Regardez les logs du serveur
2. Vérifiez les erreurs exactes
3. Partagez les logs pour diagnostic

### Problème : L'endpoint n'est jamais appelé

**Cause :** Le frontend ne détecte pas le paiement.

**Solution :**
1. Vérifiez l'URL dans le navigateur : `?payment=success&session_id=...`
2. Vérifiez la console du navigateur
3. Vérifiez `Dashboard.jsx` pour le code de détection

## 📋 Checklist

- [ ] `server.env` existe et contient `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Serveur redémarré après modification de `server.env`
- [ ] Logs montrent `✅ Supabase client initialized`
- [ ] Test curl de l'endpoint fonctionne
- [ ] Logs montrent `=== PAYMENT SUCCESS ENDPOINT CALLED ===`
- [ ] Pas d'erreurs dans les logs

---

**Partagez les résultats des tests et je vous aiderai à identifier le problème exact !**
