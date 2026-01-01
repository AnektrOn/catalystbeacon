# Simple Deployment Guide

## 🤔 What hosting do you use?

Choose your method:

---

## 1️⃣ Vercel (Easiest - Auto Deploy)

**Nothing to do!** Vercel automatically deploys from GitHub.

1. Go to: https://vercel.com/dashboard
2. Find your project
3. Wait for deploy to finish (auto-triggered by git push)
4. Done! ✅

**Optional:** Force redeploy
```bash
vercel --prod
```

---

## 2️⃣ Netlify (Easy - Auto Deploy)

**Nothing to do!** Netlify automatically deploys from GitHub.

1. Go to: https://app.netlify.com
2. Find your site
3. Deploy will trigger automatically
4. Done! ✅

---

## 3️⃣ Your Own VPS/Server

**You need to tell me:**
- Where is your server? (IP address)
- Where is the code? (path on server)
- How do you run it? (PM2? systemd? docker?)

**Once I know, I'll give you exact commands.**

Example if you're using PM2:
```bash
ssh user@your-server-ip
cd /var/www/hcuniversity
git pull
npm install
npm run build
pm2 restart all
```

---

## 4️⃣ Heroku

```bash
git push heroku main
```

That's it! Heroku builds and deploys automatically.

---

## 5️⃣ Docker

```bash
# On your server
docker-compose down
docker-compose pull
docker-compose up -d --build
```

---

## ⚠️ Don't Forget Database!

**Regardless of hosting, you MUST update Supabase:**

1. Go to: https://supabase.com/dashboard
2. SQL Editor
3. Run:
```sql
UPDATE course_metadata
SET masterschool = 'Ignition'
WHERE course_id IN (SELECT course_id FROM course_metadata LIMIT 20);
```

---

## 🎯 Tell me your hosting and I'll give exact commands!

**Which one are you using?**
- Vercel
- Netlify  
- VPS (Digital Ocean, AWS, etc.)
- Heroku
- Docker
- Other?

