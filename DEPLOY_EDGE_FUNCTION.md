# How to Deploy Supabase Edge Function

## Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

## Step 2: Login to Supabase

```bash
supabase login
```

## Step 3: Link Your Project

```bash
# From your project root
supabase link --project-ref mbffycgrqfeesfnhhcdm
```

## Step 4: Deploy the Function

```bash
supabase functions deploy create-checkout-session
```

## Step 5: Set Environment Variables in Supabase

Go to Supabase Dashboard → Edge Functions → Settings → Secrets

Add these secrets:
- `STRIPE_SECRET_KEY` = your Stripe secret key
- `SITE_URL` = https://app.humancatalystbeacon.com
- `SUPABASE_URL` = https://mbffycgrqfeesfnhhcdm.supabase.co
- `SUPABASE_ANON_KEY` = your anon key

## Step 6: Test

The function should now be available at:
`https://mbffycgrqfeesfnhhcdm.supabase.co/functions/v1/create-checkout-session`

