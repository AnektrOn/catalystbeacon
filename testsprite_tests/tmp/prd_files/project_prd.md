# HC University - Project Requirements Document

## Project Overview
HC University is a gamified learning platform that combines psychology-based habit formation with educational content. The platform features XP progression, skills tracking, mastery tools, and community features.

## Core Features

### 1. Authentication & User Management
- Email/password authentication via Supabase
- User profiles with avatars
- Role-based access control (Free, Student, Teacher, Admin)
- Subscription management via Stripe

### 2. Dashboard
- Main dashboard with multiple widgets
- XP progress tracking
- Daily ritual widget
- Coherence widget
- Achievements display
- Current lesson widget
- Constellation navigator
- Teacher feed
- Quick actions

### 3. Course System
- Course catalog browsing
- Course detail pages
- Video lesson player
- Course creation for teachers
- Progress tracking

### 4. Mastery System
- Habit tracking
- Toolbox items management
- Calendar integration
- Progress visualization

### 5. Community Features
- Social feed
- Post creation and interaction
- Comments and likes

### 6. Profile & Settings
- User profile management
- Settings page
- Progress visualization
- Avatar management

### 7. Achievements
- Achievement display
- Badge system
- Progress tracking

## Technical Stack
- Frontend: React 19.2.0
- Backend: Supabase (PostgreSQL)
- Styling: Tailwind CSS
- Routing: React Router
- Payments: Stripe
- UI Components: shadcn/ui, Radix UI

## User Roles
- Free: Basic access
- Student: Full course access
- Teacher: Content creation
- Admin: Administrative access
