# 🚨 HC Beacon - Authentication & Subscription System

> **⚠️ WARNING: This project has known issues and is NOT ready for production use.**

## 🔴 **Current Status: BROKEN**

### **Critical Issues:**
- ❌ **Sign-up/Registration flow is broken** - Users cannot create accounts
- ❌ **Stripe payment confirmation is untested** - Subscription updates may not work
- ❌ **Database triggers are missing** - Profile creation fails on signup

## 🏗️ **What This Project Contains**

A complete React application with:
- **Authentication system** (Supabase Auth)
- **Subscription management** (Stripe integration)
- **User dashboard** with profile management
- **Modern UI** (Tailwind CSS + shadcn/ui)
- **Server-side API** for payment processing

## 🚀 **Quick Start (For Development Only)**

```bash
# Clone the repository
git clone https://github.com/AnektrOn/new-beginning.git
cd new-beginning

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase and Stripe keys to .env

# Start the development server
npm start

# Start the API server (in another terminal)
node server.js
```

## ⚠️ **Known Issues**

### 1. **Sign-up Flow Broken**
- Error: "Database error saving new user"
- Missing database function: `initialize_user_skills_and_stats(uuid)`
- **Fix needed:** Run SQL scripts in `DATABASE_ERRORS_FIX_GUIDE.md`

### 2. **Stripe Integration Untested**
- Checkout redirects work
- Webhook handling is **NOT VERIFIED**
- Payment success may not update user roles

## 📁 **Project Structure**

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts (AuthContext)
├── lib/               # Utilities and clients
├── pages/             # Page components
└── App.js             # Main app component

server.js              # Express server for Stripe API
```

## 🔧 **Setup Requirements**

### **Environment Variables (.env)**
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### **Server Environment (server.env)**
```env
STRIPE_SECRET_KEY=your_stripe_secret_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 📚 **Documentation**

- `CURRENT_STATUS.md` - Detailed status of all components
- `DATABASE_ERRORS_FIX_GUIDE.md` - How to fix signup issues
- `STRIPE_INTEGRATION_COMPLETE.md` - Stripe setup guide
- `SUPABASE_SETUP_GUIDE.md` - Database configuration

## 🛠️ **Fixing the Issues**

### **Step 1: Fix Database**
Run the SQL scripts in `DATABASE_ERRORS_FIX_GUIDE.md` to fix the signup flow.

### **Step 2: Test Stripe**
1. Set up webhook endpoints
2. Test payment flow end-to-end
3. Verify subscription updates

### **Step 3: Verify Authentication**
1. Test signup flow
2. Test signin flow
3. Test profile creation

## 🚨 **Important Notes**

- **This is a development project** - not production ready
- **Core authentication is broken** - needs immediate attention
- **Stripe integration is incomplete** - payment flow untested
- **Use at your own risk** - may not work as expected

## 📞 **Support**

If you encounter issues:
1. Check `CURRENT_STATUS.md` for known problems
2. Review the troubleshooting guides
3. Fix database issues first before testing other features

---

**⚠️ Remember: This project has critical issues that prevent normal operation. Fix the database triggers before attempting to use the authentication system.**