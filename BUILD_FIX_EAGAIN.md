# 🔧 Fix Build Error EAGAIN

## Problème
Le build échoue avec `EAGAIN` (Resource temporarily unavailable) lors de la minification. C'est généralement dû à un manque de mémoire ou d'espace disque.

## Solutions (essayez dans l'ordre)

### Solution 1 : Build sans minification (RECOMMANDÉ)

```bash
npm run build:no-minify
```

Cela désactive la minification et réduit la consommation mémoire. Le build sera plus volumineux mais fonctionnera.

### Solution 2 : Augmenter la mémoire et nettoyer

```bash
# Nettoyer le cache
rm -rf node_modules/.cache
rm -rf build

# Build avec plus de mémoire
NODE_OPTIONS='--max-old-space-size=6144' npm run build
```

### Solution 3 : Vérifier l'espace disque

```bash
# Vérifier l'espace disponible
df -h

# Si moins de 2GB disponibles, nettoyer :
rm -rf node_modules/.cache
rm -rf build
npm cache clean --force
```

### Solution 4 : Build progressif (si les autres échouent)

```bash
# Désactiver source maps et réduire la mémoire
GENERATE_SOURCEMAP=false NODE_OPTIONS='--max-old-space-size=2048' npm run build
```

## Après le build réussi

1. **Copier les fichiers** :
   ```bash
   cp -r build/* /path/to/production/
   ```

2. **Vider le cache du navigateur** (Ctrl+Shift+R ou Cmd+Shift+R)

3. **Tester** que les logs `🔍 Payment success check:` apparaissent dans la console

## Note importante

Si vous utilisez `build:no-minify`, les fichiers seront plus volumineux mais fonctionnels. Vous pouvez minifier plus tard avec un outil externe si nécessaire.
