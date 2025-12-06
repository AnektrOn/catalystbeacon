# 🎓 HC University - Gamified Learning Platform

[![Status](https://img.shields.io/badge/status-development-yellow)]()
[![React](https://img.shields.io/badge/react-19.2.0-blue)]()
[![Supabase](https://img.shields.io/badge/supabase-2.75.0-green)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

> A psychology-based, gamified learning platform with XP progression, skills tracking, and mastery tools. Built with React, Supabase, and modern web technologies.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

HC University is a comprehensive online learning platform that combines gamification with psychology-based habit formation to create an engaging educational experience. Users progress through 51 levels across 4 schools (Ignition, Insight, Transformation, God Mode), earning XP through courses, habits, and mastery tools.

### Key Highlights

- **Gamified Progression**: 51-level system with XP rewards
- **Mastery Tools**: Habit tracking, toolbox items, and calendar integration
- **Skills System**: Track progress across cognitive, creative, discipline, and social skills
- **Beautiful UI**: Glassmorphism design with full mobile responsiveness
- **Role-Based Access**: Free, Student, Teacher, and Admin tiers

---

## ✨ Features

### Core Features

#### 🔐 Authentication & User Management
- Email/password authentication via Supabase Auth
- User profiles with avatars and custom backgrounds
- Role-based access control (Free, Student, Teacher, Admin)
- Subscription management via Stripe

#### 📊 XP & Leveling System
- **51 Levels** of progression from "Uninitiated" to mastery
- **XP Sources**: Courses, habits, toolbox usage, challenges
- **Real-time progress tracking** with visual indicators
- **Level-based unlocks** for advanced content

#### 🎯 Skills & Stats System
- **6 Master Stats Categories**:
  - Cognitive & Theoretical
  - Creative & Reflective
  - Discipline & Ritual
  - Inner Awareness
  - Physical Mastery
  - Social & Influence
- **Individual skill tracking** with progress bars
- **Radar chart visualization** of skill distribution

#### 🛠️ Mastery Tools (Always Free)
- **Habits**: Create and track daily/weekly habits with streak counting
- **Toolbox**: Access learning tools and exercises
- **Calendar**: Visual habit completion tracking

#### 💳 Subscription System
- **Stripe Integration**: Secure payment processing
- **Subscription Tiers**: Student and Teacher plans
- **Webhook Handling**: Automatic role updates on payment
- **Customer Portal**: Manage subscriptions

#### 👥 Community Features
- **Social Wall**: Share progress and insights
- **Leaderboards**: Compete with other learners
- **Challenges**: Group learning activities
- **User Profiles**: Showcase achievements and skills

#### 📱 Mobile-First Design
- **Responsive Breakpoints**: Optimized for all screen sizes
- **Touch-Optimized**: 44px minimum touch targets
- **Bottom Navigation**: Easy thumb access on mobile
- **iOS Safe Areas**: Notch and home indicator support
- **Glassmorphism UI**: Beautiful blur effects across devices

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **React Router** | 6.30.1 | Client-side routing |
| **Tailwind CSS** | 3.4.18 | Utility-first styling |
| **Radix UI** | Latest | Accessible UI components |
| **Lucide React** | 0.545.0 | Icon library |
| **React Hot Toast** | 2.6.0 | Notifications |

### Backend & Services
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Supabase** | 2.75.0 | Backend-as-a-Service |
| **PostgreSQL** | - | Database (via Supabase) |
| **Express** | 5.1.0 | Stripe webhook server |
| **Stripe** | 19.1.0 | Payment processing |

### Development Tools
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Create React App** | 5.0.1 | Build tooling |
| **Jest** | - | Testing framework |
| **React Testing Library** | 16.3.0 | Component testing |

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  React Frontend                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Pages (Dashboard, Profile, Mastery, etc.)   │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  Components (UI, Auth, Mastery, Social)      │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  Services (Skills, Levels, Mastery, Social)  │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  Context (AuthContext - Global State)        │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────┐
│             Supabase Backend (BaaS)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │ PostgreSQL   │  │  Auth API    │  │  Storage │  │
│  │   Database   │  │  (JWT-based) │  │  (S3)    │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  Row Level Security (RLS) Policies           │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────┐
│              External Services                       │
│  ┌──────────────┐         ┌──────────────────────┐  │
│  │    Stripe    │         │  Express Webhook     │  │
│  │   Checkout   │◄────────│  Server (Port 3001)  │  │
│  └──────────────┘         └──────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action (UI)
    ↓
React Component
    ↓
Service Layer (skillsService, masteryService, etc.)
    ↓
Supabase Client
    ↓
Supabase API
    ↓
PostgreSQL Database
    ↓
RLS Policies (Security Check)
    ↓
Return Data
    ↓
Update React State
    ↓
Re-render UI
```

### Database Schema

**Core Tables:**
- `profiles` - User profile data
- `levels` - 51 level definitions
- `skills` - Individual skill definitions
- `master_stats` - 6 master stat categories
- `user_skills` - User skill progress
- `user_master_stats` - User master stat progress
- `habits_library` - Global habit templates
- `user_habits` - User's personal habits
- `user_habit_completions` - Habit completion tracking
- `toolbox_library` - Global toolbox items
- `user_toolbox_items` - User's toolbox collection
- `xp_transactions` - XP earning history
- `subscriptions` - Stripe subscription data

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16.x or higher
- **npm** or **yarn**
- **Supabase Account** (free tier works)
- **Stripe Account** (for payment processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/hcuniversity.git
   cd hcuniversity
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `.env` in the project root:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

   Create `server.env` in the project root:
   ```env
   STRIPE_SECRET_KEY=your_stripe_secret_key
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

4. **Set up Supabase database**

   Run the SQL scripts in order:
   ```bash
   # 1. Create core schema
   # Run: CREATE_NEXUS_DATABASE_SCHEMA.sql
   
   # 2. Create skills and mastery tables
   # Run: SKILLS_AND_MASTERY_SCHEMA.sql
   
   # 3. Create level system
   # Run: LEVEL_SYSTEM_SCHEMA_FIXED.sql
   
   # 4. Import sample data
   # Run: INSERT_SAMPLE_DATA.sql
   ```

   See `SUPABASE_SETUP_GUIDE.md` for detailed instructions.

5. **Start the development server**
   ```bash
   # Terminal 1: Start React app
   npm start
   
   # Terminal 2: Start Express server for Stripe webhooks
   node server.js
   ```

6. **Open the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

---

## 📁 Project Structure

```
hcuniversity/
├── public/                    # Static assets
│   ├── index.html
│   ├── manifest.json
│   └── favicon.ico
│
├── src/
│   ├── components/           # React components
│   │   ├── auth/            # Authentication components
│   │   │   ├── LoginForm.jsx
│   │   │   └── SignupForm.jsx
│   │   ├── common/          # Shared components
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ErrorDisplay.jsx
│   │   │   └── SkeletonLoader.jsx
│   │   ├── mastery/         # Mastery tool components
│   │   │   ├── CalendarTab.jsx
│   │   │   ├── HabitsTabCompact.jsx
│   │   │   └── ToolboxTabCompact.jsx
│   │   ├── profile/         # Profile components
│   │   │   ├── ProgressBar.jsx
│   │   │   └── RadarChart.jsx
│   │   ├── social/          # Community components
│   │   │   └── CreatePostModal.jsx
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   └── ...
│   │   └── AppShellMobile.jsx
│   │
│   ├── contexts/            # React Context providers
│   │   └── AuthContext.jsx # Global auth state
│   │
│   ├── lib/                 # Core libraries
│   │   ├── supabaseClient.js  # Supabase connection
│   │   ├── stripe.js          # Stripe client
│   │   ├── permissions.js     # Role-based access control
│   │   └── utils.js           # Utility functions
│   │
│   ├── pages/               # Page components (routes)
│   │   ├── Dashboard.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── Mastery.jsx
│   │   ├── CommunityPage.jsx
│   │   ├── PricingPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── SignupPage.jsx
│   │
│   ├── services/            # Business logic layer
│   │   ├── masteryService.js   # Habits, toolbox, calendar
│   │   ├── skillsService.js    # Skills and stats
│   │   ├── levelsService.js    # XP and leveling
│   │   └── socialService.js    # Community features
│   │
│   ├── styles/              # Global styles
│   │   ├── glassmorphism.css       # Glass design system
│   │   ├── mobile-responsive.css   # Mobile optimizations
│   │   └── index.css               # Base styles
│   │
│   ├── utils/               # Utility helpers
│   │   ├── errorHandler.js
│   │   └── memoization.js
│   │
│   ├── App.js               # Main app component
│   └── index.js             # Application entry point
│
├── server.js                # Express server for Stripe
├── package.json
├── tailwind.config.js
└── [Documentation Files]
    ├── README.md
    ├── PLATFORM_SPECS.md
    ├── MOBILE_DESIGN_COMPLETE.md
    ├── SUPABASE_SETUP_GUIDE.md
    ├── STRIPE_INTEGRATION_COMPLETE.md
    └── ...
```

---

## 📚 Documentation

### Core Documentation
- **[Platform Specifications](PLATFORM_SPECS.md)** - Complete platform specifications and ADRs
- **[Mobile Design Guide](MOBILE_DESIGN_COMPLETE.md)** - Mobile optimization documentation
- **[Supabase Setup](SUPABASE_SETUP_GUIDE.md)** - Database setup instructions
- **[Stripe Integration](STRIPE_INTEGRATION_COMPLETE.md)** - Payment system guide
- **[Design System](DESIGN_SYSTEM_GUIDE.md)** - UI/UX design guidelines
- **[Coding Standards](CODING_STANDARDS.md)** - Development best practices

### API Documentation

#### Services Layer

##### SkillsService
```javascript
import skillsService from './services/skillsService';

// Get all skills
const { data: skills, error } = await skillsService.getAllSkills();

// Award skill points
await skillsService.awardSkillPoints(userId, ['skill-id'], 0.1);

// Get user's skill progress
const { data: userSkills } = await skillsService.getUserSkills(userId);
```

##### MasteryService
```javascript
import masteryService from './services/masteryService';

// Get user habits
const { data: habits } = await masteryService.getUserHabits(userId);

// Complete a habit
await masteryService.completeHabit(userId, habitId);

// Use toolbox item
await masteryService.useToolboxItem(userId, toolboxItemId);
```

##### LevelsService
```javascript
import levelsService from './services/levelsService';

// Get current and next level
const { data } = await levelsService.getCurrentAndNextLevel(userXP);
const { currentLevel, nextLevel } = data;
```

---

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Run linter
npm run lint
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Follow coding standards in `CODING_STANDARDS.md`
   - Add JSDoc comments to new functions
   - Write tests for new features

3. **Test your changes**
   ```bash
   npm test
   ```

4. **Commit with descriptive messages**
   ```bash
   git commit -m "feat: add XP transaction logging"
   ```

5. **Push and create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Coding Guidelines

#### Component Structure
```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// 2. PropTypes/Types (if using)
import PropTypes from 'prop-types';

// 3. Component function
const MyComponent = ({ prop1, prop2 }) => {
  // 4. State declarations
  const [state, setState] = useState(null);
  
  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 6. Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 7. Render
  return (
    <div>{/* JSX */}</div>
  );
};

// 8. PropTypes
MyComponent.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

// 9. Export
export default MyComponent;
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    render(<MyComponent />);
    fireEvent.click(screen.getByRole('button'));
    // Assertions...
  });
});
```

### Test Coverage Goals
- **Services**: 80% coverage
- **Components**: 70% coverage
- **Utilities**: 90% coverage

---

## 🚀 Deployment

### Production Build

```bash
# Build optimized production bundle
npm run build

# Output in /build directory
```

### Environment Variables (Production)

Set these in your hosting platform:
```env
REACT_APP_SUPABASE_URL=your_production_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_production_anon_key
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_production_stripe_key
```

### Deployment Platforms

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Build command
npm run build

# Publish directory
build
```

#### Custom Server
```bash
# Build the app
npm run build

# Serve with a static file server
npx serve -s build
```

### Post-Deployment Checklist

- [ ] Verify Supabase connection
- [ ] Test authentication flow
- [ ] Verify Stripe webhook endpoint
- [ ] Check mobile responsiveness
- [ ] Run lighthouse audit
- [ ] Test all user flows
- [ ] Monitor error logs

---

## 🐛 Troubleshooting

### Common Issues

#### **Issue: "Database error saving new user"**

**Cause:** Missing database function or trigger

**Solution:**
```sql
-- Run this in Supabase SQL Editor
-- See: DATABASE_ERRORS_FIX_GUIDE.md
```

#### **Issue: Stripe webhooks not updating roles**

**Cause:** Webhook secret mismatch or incorrect endpoint

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` in `server.env`
2. Check Stripe dashboard webhook endpoint
3. Review logs in `server.js`

See `WEBHOOK_TESTING_GUIDE.md` for details.

#### **Issue: Mobile layout broken**

**Cause:** Missing mobile-responsive.css import

**Solution:**
```javascript
// In App.js
import './styles/mobile-responsive.css';
```

#### **Issue: iOS inputs causing zoom**

**Cause:** Input font size < 16px

**Solution:**
```css
/* Ensure all inputs have text-base (16px) on mobile */
input {
  font-size: 16px !important;
}
```

### Debug Tools

```bash
# Check Supabase connection
node test-database-reading.js

# Test mastery system
node test-complete-mastery-system.js

# Verify auth flow
node test-auth.js
```

### Getting Help

1. Check existing documentation in `/docs`
2. Search closed issues on GitHub
3. Review `TROUBLESHOOTING_GUIDE.md`
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Contribution Process

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests**
5. **Update documentation**
6. **Submit a pull request**

### Code Review Process

All PRs require:
- ✅ Passing tests
- ✅ No linting errors
- ✅ Documentation updates
- ✅ Approval from 1 maintainer

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new XP calculation method
fix: resolve calendar date bug
docs: update API documentation
style: format code with prettier
refactor: simplify skills service
test: add tests for habit completion
chore: update dependencies
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure
- **Stripe** - Payment processing
- **Radix UI** - Accessible components
- **Tailwind CSS** - Styling framework
- **shadcn/ui** - Component library
- **Lucide** - Icon library

---

## 📞 Support

- **Documentation**: See `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/your-org/hcuniversity/issues)
- **Email**: support@hcuniversity.com

---

**Built with ❤️ by the HC University Team**

