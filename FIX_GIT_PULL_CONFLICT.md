# Fix Git Pull Conflict on Production Server

## Problem
When running `git pull origin main`, you get:
```
error: Your local changes to the following files would be overwritten by merge:
	package-lock.json
	package.json
Please commit your changes or stash them before you merge.
```

## Solution

You have 3 options:

### Option 1: Stash Changes (Recommended - Keeps your changes safe)
```bash
# Save your local changes temporarily
git stash

# Pull the latest code
git pull origin main

# If you need your local changes back, restore them:
git stash pop
```

### Option 2: Discard Local Changes (If you don't need them)
```bash
# Discard local changes to package files
git checkout -- package.json package-lock.json

# Pull the latest code
git pull origin main
```

### Option 3: Commit Local Changes First
```bash
# Commit your local changes
git add package.json package-lock.json
git commit -m "Local package changes"

# Pull (may create merge conflict)
git pull origin main

# If there's a conflict, resolve it, then:
git add .
git commit -m "Merge conflicts resolved"
```

## Recommended: Use Option 1 (Stash)

This is safest because:
- ✅ Your local changes are saved
- ✅ You can restore them if needed
- ✅ No risk of losing anything


