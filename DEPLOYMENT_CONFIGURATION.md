# Deployment Configuration Guide

## Content Security Policy (CSP)

### For Vercel/Netlify Deployment

Add these headers in your hosting platform's configuration:

**Vercel (`vercel.json`):**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co; frame-src https://js.stripe.com https://hooks.stripe.com;"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

**Netlify (`netlify.toml`):**
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co; frame-src https://js.stripe.com https://hooks.stripe.com;"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## HTTPS Redirect

### Vercel
HTTPS is automatically enforced. No configuration needed.

### Netlify
HTTPS is automatically enforced. No configuration needed.

### Other Platforms
Configure redirect in your web server (nginx, Apache, etc.) or hosting platform settings.

## Rate Limiting

### Backend API (server.js)

Add rate limiting middleware:

```javascript
// Install: npm install express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply to all requests
app.use('/api/', limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});

app.use('/api/auth/', authLimiter);
```

## Database Backup Strategy

### Supabase Automated Backups

1. **Go to Supabase Dashboard** → Your Project → Settings → Database
2. **Enable Point-in-Time Recovery (PITR)** if available
3. **Set up daily automated backups**:
   - Go to Settings → Database → Backups
   - Configure backup schedule (daily recommended)
   - Set retention period (30 days minimum)

### Manual Backup Script

Create a backup script for manual backups:

```bash
#!/bin/bash
# backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# Export database schema
pg_dump $DATABASE_URL --schema-only > "$BACKUP_DIR/schema_$DATE.sql"

# Export database data
pg_dump $DATABASE_URL --data-only > "$BACKUP_DIR/data_$DATE.sql"

# Full backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/full_$DATE.sql"

echo "Backup completed: $BACKUP_DIR/full_$DATE.sql"
```

## Analytics Integration

### Google Analytics 4

1. **Create GA4 property** at https://analytics.google.com
2. **Get Measurement ID** (format: G-XXXXXXXXXX)
3. **Add to `.env`:**
   ```
   VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   ```
4. **Add to `public/index.html`:**
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

## Error Tracking (Sentry)

### Setup

1. **Create Sentry account** at https://sentry.io
2. **Create new project** (React)
3. **Install Sentry:**
   ```bash
   npm install @sentry/react
   ```
4. **Add to `src/index.js`:**
   ```javascript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: process.env.REACT_APP_SENTRY_DSN,
     environment: process.env.NODE_ENV,
     integrations: [
       new Sentry.BrowserTracing(),
       new Sentry.Replay(),
     ],
     tracesSampleRate: 1.0,
     replaysSessionSampleRate: 0.1,
     replaysOnErrorSampleRate: 1.0,
   });
   ```
5. **Wrap App in `src/index.js`:**
   ```javascript
   import { createRoot } from 'react-dom/client';
   import App from './App';
   
   const container = document.getElementById('root');
   const root = createRoot(container);
   root.render(<Sentry.ErrorBoundary fallback={<ErrorFallback />}><App /></Sentry.ErrorBoundary>);
   ```

## Environment Variables for Production

### Frontend (Vercel/Netlify)

Set these in your hosting platform's environment variables:

```
VITE_SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_API_URL=https://api.yourdomain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STRIPE_STUDENT_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_STUDENT_YEARLY_PRICE_ID=price_...
VITE_STRIPE_TEACHER_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_TEACHER_YEARLY_PRICE_ID=price_...
VITE_SITE_NAME=The Human Catalyst University
VITE_SITE_URL=https://yourdomain.com
NODE_ENV=production
```

### Backend (Railway/Render/Heroku)

```
PORT=3001
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://mbffycgrqfeesfnhhcdm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Build Optimization

### Vite Configuration (if migrating from CRA)

Create `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          stripe: ['@stripe/stripe-js']
        }
      }
    }
  }
})
```

## Monitoring & Alerts

### Set up monitoring for:

1. **Uptime monitoring** (UptimeRobot, Pingdom)
2. **Error tracking** (Sentry)
3. **Performance monitoring** (Google Analytics, Web Vitals)
4. **Database monitoring** (Supabase Dashboard)
5. **API monitoring** (Backend logs, error tracking)

## Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test authentication flow
- [ ] Test payment flow end-to-end
- [ ] Verify all API endpoints work
- [ ] Check error tracking is working
- [ ] Verify analytics is tracking
- [ ] Test on mobile devices
- [ ] Verify HTTPS is enforced
- [ ] Check CSP headers are working
- [ ] Verify database backups are running
- [ ] Test error boundaries
- [ ] Verify loading states work
- [ ] Check form validation works
- [ ] Test SEO meta tags

