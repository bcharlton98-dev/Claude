export interface UserProfile {
  name: string
  username: string
  avatar: string
  level: number
  xp: number
  xpToNextLevel: number
  gems: number
  streak: number
  longestStreak: number
  league: string
  leagueRank: number
  totalSteps: number
  joinDate: string
  connectedDevice: string
  badges: Badge[]
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedDate?: string
}

export interface DailyStats {
  steps: number
  goal: number
  calories: number
  distance: number // miles
  activeMinutes: number
  xpEarned: number
  questsCompleted: number
}

export interface DailyQuest {
  id: string
  title: string
  description: string
  target: number
  current: number
  xpReward: number
  gemReward: number
  type: 'steps' | 'distance' | 'active_minutes' | 'social'
  completed: boolean
}

export interface Challenge {
  id: string
  name: string
  description: string
  type: 'leaderboard' | 'collective' | 'streak' | 'target' | 'teams'
  mode: 'public' | 'private'
  participants: Participant[]
  collectiveGoal?: number
  collectiveProgress?: number
  startDate: string
  endDate: string
  isActive: boolean
  createdBy: string
}

export interface Participant {
  name: string
  avatar: string
  steps: number
  streak: number
  isYou?: boolean
}

export interface WeeklyLeague {
  name: string
  color: string
  minXP: number
}

export interface Notification {
  id: string
  message: string
  type: 'competitive' | 'achievement' | 'reminder' | 'social'
  time: string
  read: boolean
}

// --- Mock Data ---

export const userProfile: UserProfile = {
  name: 'Alex Chen',
  username: '@alexwalks',
  avatar: 'AC',
  level: 14,
  xp: 2340,
  xpToNextLevel: 3000,
  gems: 285,
  streak: 12,
  longestStreak: 31,
  league: 'Gold',
  leagueRank: 3,
  totalSteps: 1_847_230,
  joinDate: '2026-01-15',
  connectedDevice: 'Apple Watch',
  badges: [
    { id: '1', name: 'First Steps', description: 'Complete your first day', icon: '👟', earned: true, earnedDate: '2026-01-15' },
    { id: '2', name: 'Week Warrior', description: '7-day streak', icon: '🔥', earned: true, earnedDate: '2026-01-22' },
    { id: '3', name: 'Marathon Month', description: '30-day streak', icon: '🏃', earned: false },
    { id: '4', name: '100K Club', description: 'Walk 100,000 steps total', icon: '💯', earned: true, earnedDate: '2026-02-01' },
    { id: '5', name: 'Social Butterfly', description: 'Join 5 challenges', icon: '🦋', earned: true, earnedDate: '2026-02-10' },
    { id: '6', name: 'Team Player', description: 'Complete a collective goal', icon: '🤝', earned: true, earnedDate: '2026-02-20' },
    { id: '7', name: 'Million Steps', description: 'Walk 1,000,000 steps total', icon: '⭐', earned: true, earnedDate: '2026-03-10' },
    { id: '8', name: 'Champion', description: 'Reach Champion league', icon: '👑', earned: false },
    { id: '9', name: 'Weight Crusher', description: 'Hit weight loss goal for 30 days', icon: '💪', earned: false },
  ],
}

export const todayStats: DailyStats = {
  steps: 7_842,
  goal: 10_000,
  calories: 312,
  distance: 3.7,
  activeMinutes: 48,
  xpEarned: 65,
  questsCompleted: 1,
}

export const dailyQuests: DailyQuest[] = [
  { id: '1', title: 'Daily Walker', description: 'Walk 10,000 steps today', target: 10000, current: 7842, xpReward: 50, gemReward: 5, type: 'steps', completed: false },
  { id: '2', title: 'Morning Move', description: 'Log 15 active minutes before noon', target: 15, current: 15, xpReward: 25, gemReward: 2, type: 'active_minutes', completed: true },
  { id: '3', title: 'Distance Tracker', description: 'Walk 5 miles today', target: 5, current: 3.7, xpReward: 40, gemReward: 3, type: 'distance', completed: false },
  { id: '4', title: 'Team Spirit', description: 'Cheer a teammate in a challenge', target: 1, current: 0, xpReward: 15, gemReward: 1, type: 'social', completed: false },
]

export const challenges: Challenge[] = [
  {
    id: '1',
    name: 'March Madness Steps',
    description: 'Who can walk the most in March? Our annual team battle!',
    type: 'leaderboard',
    mode: 'private',
    participants: [
      { name: 'Sarah K.', avatar: 'SK', steps: 289_400, streak: 22 },
      { name: 'Mike R.', avatar: 'MR', steps: 276_100, streak: 18 },
      { name: 'Alex Chen', avatar: 'AC', steps: 268_500, streak: 12, isYou: true },
      { name: 'Jordan P.', avatar: 'JP', steps: 245_000, streak: 15 },
      { name: 'Casey L.', avatar: 'CL', steps: 231_200, streak: 9 },
      { name: 'Taylor M.', avatar: 'TM', steps: 198_700, streak: 6 },
    ],
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    isActive: true,
    createdBy: 'Sarah K.',
  },
  {
    id: '2',
    name: 'Walk to the Moon!',
    description: 'Together we\'re walking 2,000,000 steps. Can we make it?',
    type: 'collective',
    mode: 'private',
    collectiveGoal: 2_000_000,
    collectiveProgress: 1_508_900,
    participants: [
      { name: 'Alex Chen', avatar: 'AC', steps: 268_500, streak: 12, isYou: true },
      { name: 'Sarah K.', avatar: 'SK', steps: 289_400, streak: 22 },
      { name: 'Mike R.', avatar: 'MR', steps: 276_100, streak: 18 },
      { name: 'Jordan P.', avatar: 'JP', steps: 245_000, streak: 15 },
      { name: 'Casey L.', avatar: 'CL', steps: 231_200, streak: 9 },
      { name: 'Taylor M.', avatar: 'TM', steps: 198_700, streak: 6 },
    ],
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    isActive: true,
    createdBy: 'Alex Chen',
  },
  {
    id: '3',
    name: 'Streak Survivors',
    description: 'Don\'t break the chain! Last person standing wins.',
    type: 'streak',
    mode: 'public',
    participants: [
      { name: 'Sarah K.', avatar: 'SK', steps: 289_400, streak: 22 },
      { name: 'Mike R.', avatar: 'MR', steps: 276_100, streak: 18 },
      { name: 'Jordan P.', avatar: 'JP', steps: 245_000, streak: 15 },
      { name: 'Alex Chen', avatar: 'AC', steps: 268_500, streak: 12, isYou: true },
      { name: 'Casey L.', avatar: 'CL', steps: 231_200, streak: 9 },
    ],
    startDate: '2026-03-10',
    endDate: '2026-04-10',
    isActive: true,
    createdBy: 'Mike R.',
  },
  {
    id: '4',
    name: 'Corporate Wellness Q1',
    description: 'Company-wide walking challenge. Hit 10K daily!',
    type: 'target',
    mode: 'private',
    participants: [
      { name: 'Team Alpha', avatar: 'TA', steps: 1_200_000, streak: 0 },
      { name: 'Team Beta', avatar: 'TB', steps: 1_150_000, streak: 0 },
      { name: 'Team Gamma', avatar: 'TG', steps: 980_000, streak: 0 },
    ],
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    isActive: true,
    createdBy: 'HR Admin',
  },
]

export const weeklyLeagues: WeeklyLeague[] = [
  { name: 'Bronze', color: '#CD7F32', minXP: 0 },
  { name: 'Silver', color: '#C0C0C0', minXP: 500 },
  { name: 'Gold', color: '#FFD700', minXP: 1500 },
  { name: 'Platinum', color: '#E5E4E2', minXP: 3000 },
  { name: 'Diamond', color: '#B9F2FF', minXP: 5000 },
  { name: 'Champion', color: '#FF6B35', minXP: 10000 },
]

export const notifications: Notification[] = [
  { id: '1', message: '🔥 Sarah K. just passed you in March Madness Steps! You\'re now #3.', type: 'competitive', time: '2 min ago', read: false },
  { id: '2', message: '🎉 You earned the "Morning Move" quest reward! +25 XP, +2 gems', type: 'achievement', time: '1 hour ago', read: false },
  { id: '3', message: '👣 You\'re 2,158 steps away from your daily goal. Time for an evening walk?', type: 'reminder', time: '3 hours ago', read: true },
  { id: '4', message: '🤝 Walk to the Moon is 75.4% complete! Only 491,100 steps to go!', type: 'social', time: '5 hours ago', read: true },
  { id: '5', message: '🏆 You advanced to Gold league this week! Keep it up!', type: 'achievement', time: '1 day ago', read: true },
]

export const weeklyStepData = [
  { day: 'Mon', steps: 11200 },
  { day: 'Tue', steps: 8900 },
  { day: 'Wed', steps: 12400 },
  { day: 'Thu', steps: 9800 },
  { day: 'Fri', steps: 10500 },
  { day: 'Sat', steps: 14200 },
  { day: 'Sun', steps: 7842 },
]
