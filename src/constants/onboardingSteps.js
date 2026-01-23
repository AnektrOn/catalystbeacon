export const ONBOARDING_STEPS = [
  {
    id: 'WELCOME',
    route: '/dashboard',
    targetId: null, // Center modal
    position: 'center',
    title: "Welcome, Initiate",
    content: "We are pleased to have you online. Are you prepared to begin the sequence? This is a gamified ecosystem. Every action you take yields XP and data."
  },
  {
    id: 'DASHBOARD_XP',
    route: '/dashboard',
    targetId: 'dashboard-xp-circle', 
    position: 'right',
    title: "Energy Source",
    content: "This represents your current resonance level. Every completed lesson and forged habit feeds this circle."
  },
  {
    id: 'MASTERY_INTRO',
    route: '/mastery',
    targetId: 'habit-tracker-container',
    position: 'right',
    title: "The Forge of Mastery",
    content: "Here is where you temper your discipline. Use the calendar to visualize your consistency and track your evolution."
  },
  {
    id: 'ROADMAP_SORTER',
    route: '/roadmap/ignition',
    targetId: 'roadmap-container',
    position: 'center',
    title: "Vector Definition",
    content: "The core work begins here. Select your Institute of choice to calibrate your learning path.",
    specialAction: 'OPEN_SORTER'
  },
  {
    id: 'ROADMAP_NODE',
    route: '/roadmap/ignition',
    targetId: 'active-roadmap-node', // This ID is dynamically set in NeuralNode.jsx
    position: 'top',
    title: "First Step",
    content: "Your journey starts at this coordinate. Click the active node to initiate your first mission."
  },
  {
    id: 'PROFILE_STATS',
    route: '/profile',
    targetId: 'profile-stats-card',
    position: 'bottom',
    title: "Digital Identity",
    content: "Your public statistics and reputation. Your identity evolves alongside your clearance level."
  },
  {
    id: 'PROFILE_CORE',
    route: '/profile',
    targetId: 'profile-core-stats',
    position: 'right',
    title: "Core Competencies",
    content: "Visualize the equilibrium of your strengths. This radar shifts dynamically with every action taken within the system."
  },
  {
    id: 'FINAL',
    route: '/dashboard',
    targetId: null,
    position: 'center',
    title: "Initialization Complete",
    content: "The system is fully calibrated. You are free to navigate. May your ascension begin."
  }
];

export default ONBOARDING_STEPS;
