#!/bin/bash

# Test du webhook N8N avec sortie détaillée

WEBHOOK_URL="https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b"

echo "🧪 Test du webhook avec sortie détaillée"
echo "========================================"
echo ""

# Test avec -v (verbose) pour voir les headers et le code HTTP
curl -v -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"test": true, "emailType": "test"}'

echo ""
echo ""
echo "========================================"
echo "✅ Test terminé"
echo ""
echo "Vérifiez :"
echo "1. Le code HTTP (devrait être 200)"
echo "2. Dans N8N → Executions (une nouvelle exécution devrait apparaître)"
