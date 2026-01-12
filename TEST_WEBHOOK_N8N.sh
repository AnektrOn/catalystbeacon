#!/bin/bash

# Script de test pour vérifier que le webhook N8N fonctionne

WEBHOOK_URL="https://noteautomation.app.n8n.cloud/webhook/48997b66-68a2-49a3-ac02-3bd42b9bba5b"

echo "🧪 Test 1: Webhook N8N basique"
echo "================================"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"test": "hello from curl"}' \
  -v

echo ""
echo ""
echo "🧪 Test 2: Format Supabase UPDATE (Level Up)"
echo "================================"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "UPDATE",
    "table": "profiles",
    "schema": "public",
    "record": {
      "id": "test-user-id",
      "level": 5,
      "current_xp": 5000,
      "full_name": "Test User",
      "email": "test@example.com"
    },
    "old_record": {
      "id": "test-user-id",
      "level": 4,
      "current_xp": 4500
    }
  }' \
  -v

echo ""
echo ""
echo "🧪 Test 3: Format Supabase INSERT (Achievement)"
echo "================================"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INSERT",
    "table": "user_badges",
    "schema": "public",
    "record": {
      "id": "test-badge-id",
      "user_id": "test-user-id",
      "badge_id": "test-badge-uuid",
      "awarded_at": "2024-01-15T10:00:00Z"
    },
    "old_record": null
  }' \
  -v

echo ""
echo ""
echo "✅ Tests terminés. Vérifiez dans N8N (Executions) que les requêtes sont arrivées."
