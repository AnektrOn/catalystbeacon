# N8N Guide: Inserting Stellar Map Nodes

This guide shows you how to insert/update `stellar_map_nodes` from n8N using only names (no UUIDs required).

## Your JSON Format

Your JSON should look like this:

```json
{
  "classification": {
    "core_node": "TRANSFORMATION",
    "family_name": "Energy-Body Engineering",
    "constellation_name": "Chakra Calibration",
    "difficulty_level": 8,
    "difficulty_name": "3D",
    "selected_skills": ["self_awareness", "ritual_creation", "quantum_understanding_habit"]
  },
  "analysis_details": {
    "title": "Activating Your Spiritual Potential Through Angels, Crystals, Colors and Metals | Dr. Robert Gilbert",
    "link": "https://www.youtube.com/watch?v=iaAvH7wc9CE"
  }
}
```

## Option 1: Using the JSON Function (Recommended)

### Step 1: Add Postgres Node in n8N

1. Add a **Postgres** node to your n8N workflow
2. Configure connection to your Supabase database

### Step 2: Configure the Query

**Query Type:** `Function`

**Function Name:** `upsert_stellar_node_from_json`

**Parameters:**
```sql
SELECT upsert_stellar_node_from_json($1::jsonb);
```

**Input Data:**
- In n8N, pass your JSON object as a parameter
- The function will automatically:
  - Look up the constellation by name (or alias)
  - Look up the family by name (or alias)
  - Create them if they don't exist
  - Calculate XP threshold
  - Insert/update the node

### Example n8N Expression

If your JSON is in a field called `jsonData`:

```javascript
{{ $json.jsonData }}
```

Or if you're building it from fields:

```javascript
{
  "classification": {
    "core_node": "{{ $json.core_node }}",
    "family_name": "{{ $json.family_name }}",
    "constellation_name": "{{ $json.constellation_name }}",
    "difficulty_level": {{ $json.difficulty_level }},
    "difficulty_name": "{{ $json.difficulty_name }}",
    "selected_skills": {{ $json.selected_skills }}
  },
  "analysis_details": {
    "title": "{{ $json.title }}",
    "link": "{{ $json.link }}"
  }
}
```

## Option 2: Using Individual Parameters

If you prefer to pass individual fields instead of JSON:

**Function Name:** `upsert_stellar_node`

**Query:**
```sql
SELECT upsert_stellar_node(
  $1::text,  -- core_node
  $2::text,  -- family_name
  $3::text,  -- constellation_name
  $4::text,  -- title
  $5::text,  -- link
  $6::integer, -- difficulty
  $7::text,  -- difficulty_name
  $8::jsonb  -- selected_skills (optional)
);
```

**Parameters in n8N:**
- `$1`: `{{ $json.core_node }}`
- `$2`: `{{ $json.family_name }}`
- `$3`: `{{ $json.constellation_name }}`
- `$4`: `{{ $json.title }}`
- `$5`: `{{ $json.link }}`
- `$6`: `{{ $json.difficulty_level }}`
- `$7`: `{{ $json.difficulty_name }}`
- `$8`: `{{ $json.selected_skills }}` (or `[]` if empty)

## Option 3: Update by Title

If you want to update an existing node by title:

**Function Name:** `update_stellar_node_by_title`

**Query:**
```sql
SELECT update_stellar_node_by_title(
  $1::text,  -- title (to find existing node)
  $2::jsonb  -- full JSON (same format as insert)
);
```

## Response Format

All functions return JSON:

**Success:**
```json
{
  "success": true,
  "node_id": "uuid-here",
  "message": "Node inserted successfully"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message here",
  "message": "Failed to insert node"
}
```

## How It Works

1. **Name Lookup:** The function looks up constellations and families by:
   - Full name (e.g., "Chakra Calibration")
   - Alias (e.g., "Wheel Harmonizers")
   - Both are checked automatically

2. **Auto-Creation:** If a constellation or family doesn't exist, it's created automatically with default values

3. **XP Calculation:** XP threshold is automatically calculated based on:
   - Core level (Ignition/Insight/Transformation)
   - Difficulty level (0-10)

4. **Upsert:** If a node with the same title exists, it's updated instead of creating a duplicate

## Example n8N Workflow

```
[Webhook/Trigger] 
  → [Transform JSON] 
  → [Postgres: upsert_stellar_node_from_json]
  → [Handle Response]
```

## Troubleshooting

**Error: "Constellation not found"**
- Check that the `family_name` and `constellation_name` match exactly (case-sensitive)
- Or use the alias instead (e.g., "Wheel Harmonizers" instead of "Chakra Calibration")

**Error: "Failed to insert node"**
- Check that all required fields are present in your JSON
- Verify the JSON structure matches the expected format
- Check n8N logs for the actual SQL error

**Duplicate Key Error**
- The `title` field must be unique
- Use `update_stellar_node_by_title` if you want to update an existing node

## Field Mapping Reference

| Your JSON Field | Database Column | Notes |
|----------------|-----------------|-------|
| `classification.core_node` | `core_node` | TRANSFORMATION, IGNITION, INSIGHT, GOD_MODE |
| `classification.family_name` | `family_name` | Full name or alias |
| `classification.constellation_name` | `constellation_name` | Full name or alias |
| `classification.difficulty_level` | `difficulty` | 0-10 integer |
| `classification.difficulty_name` | `difficulty_label` | e.g., "3D" |
| `classification.selected_skills` | `selected_skills` | JSONB array |
| `analysis_details.title` | `title` | Must be unique |
| `analysis_details.link` | `link` | URL |
