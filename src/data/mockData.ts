export interface UserProfile {
  name: string
  username: string
  avatar: string
  qp: number
  gems: number
  streak: number
  longestStreak: number
  streakFreezes: number
  streakFreezesMax: number
  league: string
  leagueRank: number
  totalSteps: number
  lifetimeMiles: number
  joinDate: string
  connectedDevice: string
  badges: Badge[]
  adaptiveGoal: AdaptiveGoal
}

export interface AdaptiveGoal {
  baseline: number
  currentGoal: number
  weekNumber: number
  history: { week: number; goal: number; avgSteps: number }[]
}

export interface HabitStack {
  id: string
  anchor: string
  habit: string
  icon: string
  active: boolean
}

export interface StreakMilestone {
  days: number
  label: string
  icon: string
  reward: string
  reached: boolean
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
  distance: number
  activeMinutes: number
  qpEarned: number
}

export interface DailyQuest {
  id: string
  title: string
  description: string
  target: number
  current: number
  qpReward: number
  gemReward: number
  type: 'steps' | 'distance' | 'active_minutes' | 'social'
  completed: boolean
}

export interface Challenge {
  id: string
  name: string
  description: string
  type: 'leaderboard' | 'team_leaderboard' | 'virtual_race' | 'group_target' | 'streak'
  mode: 'public' | 'private'
  participants: Participant[]
  collectiveGoal?: number
  collectiveProgress?: number
  // Virtual race fields
  raceName?: string
  raceDistance?: number // total miles
  raceProgress?: number // miles completed
  mapEmoji?: string
  waypoints?: Waypoint[]
  startDate: string
  endDate: string
  isActive: boolean
  createdBy: string
}

export interface Waypoint {
  name: string
  mile: number
  reached: boolean
  terrain: 'city' | 'plains' | 'mountains' | 'desert' | 'forest' | 'coast' | 'hills' | 'river'
  landmark?: string
}

export interface Participant {
  name: string
  avatar: string
  steps: number
  streak: number
  team?: string
  isYou?: boolean
  kudos: number
  kudosFromYou?: boolean
}

export interface WeeklyLeague {
  name: string
  icon: string
  color: string
  minQP: number
}

export interface Notification {
  id: string
  message: string
  type: 'competitive' | 'achievement' | 'reminder' | 'social'
  time: string
  read: boolean
}

// --- Title Tiers (by lifetime miles) ---

export interface TitleTier {
  miles: number
  title: string
}

export const titleTiers: TitleTier[] = [
  { miles: 0, title: 'First Steps' },
  { miles: 26, title: 'Marathoner' },
  { miles: 100, title: 'Trail Walker' },
  { miles: 250, title: 'Pathfinder' },
  { miles: 500, title: 'Explorer' },
  { miles: 1_000, title: 'Wayfinder' },
  { miles: 1_600, title: 'Reef Runner' },
  { miles: 2_500, title: 'Trailblazer' },
  { miles: 4_000, title: 'Continental' },
  { miles: 5_500, title: 'Wall Walker' },
  { miles: 8_000, title: 'Summit Seeker' },
  { miles: 12_430, title: 'Pole to Pole' },
  { miles: 20_000, title: 'Globe Trotter' },
  { miles: 25_000, title: 'World Walker' },
  { miles: 40_000, title: 'Orbit Runner' },
  { miles: 60_000, title: 'Moonbound' },
  { miles: 100_000, title: 'Legend' },
  { miles: 150_000, title: 'Mythic' },
  { miles: 238_900, title: 'Lunar' },
]

export function getCurrentTitle(lifetimeMiles: number): { current: TitleTier; next: TitleTier | null; milesToNext: number; progress: number } {
  let currentIdx = 0
  for (let i = titleTiers.length - 1; i >= 0; i--) {
    if (lifetimeMiles >= titleTiers[i].miles) {
      currentIdx = i
      break
    }
  }
  const current = titleTiers[currentIdx]
  const next = currentIdx < titleTiers.length - 1 ? titleTiers[currentIdx + 1] : null
  const milesToNext = next ? next.miles - lifetimeMiles : 0
  const progress = next ? (lifetimeMiles - current.miles) / (next.miles - current.miles) : 1
  return { current, next, milesToNext, progress }
}

// --- Mock Data ---

export const userProfile: UserProfile = {
  name: 'Alex Chen',
  username: '@alexwalks',
  avatar: 'AC',
  qp: 2340,
  gems: 285,
  streak: 12,
  longestStreak: 31,
  streakFreezes: 2,
  streakFreezesMax: 2,
  league: 'Gold',
  leagueRank: 3,
  totalSteps: 1_847_230,
  lifetimeMiles: 873,
  joinDate: '2026-01-15',
  connectedDevice: 'Apple Watch',
  adaptiveGoal: {
    baseline: 4_200,
    currentGoal: 7_500,
    weekNumber: 10,
    history: [
      { week: 1, goal: 4_700, avgSteps: 5_100 },
      { week: 2, goal: 5_200, avgSteps: 5_800 },
      { week: 3, goal: 5_700, avgSteps: 6_200 },
      { week: 4, goal: 6_200, avgSteps: 6_900 },
      { week: 5, goal: 6_500, avgSteps: 7_100 },
      { week: 6, goal: 7_000, avgSteps: 7_400 },
      { week: 7, goal: 7_500, avgSteps: 7_800 },
      { week: 8, goal: 7_500, avgSteps: 8_200 },
      { week: 9, goal: 7_500, avgSteps: 8_600 },
      { week: 10, goal: 7_500, avgSteps: 7_842 },
    ],
  },
  badges: [
    { id: '1', name: 'First Steps', description: 'Complete your first day', icon: 'shoe', earned: true, earnedDate: '2026-01-15' },
    { id: '2', name: 'Week Warrior', description: '7-day streak', icon: 'flame', earned: true, earnedDate: '2026-01-22' },
    { id: '3', name: 'Marathon Month', description: '30-day streak', icon: 'runner', earned: false },
    { id: '4', name: '100K Club', description: 'Walk 100,000 steps total', icon: 'target', earned: true, earnedDate: '2026-02-01' },
    { id: '5', name: 'Social Butterfly', description: 'Join 5 challenges', icon: 'wave', earned: true, earnedDate: '2026-02-10' },
    { id: '6', name: 'Team Player', description: 'Complete a collective goal', icon: 'link', earned: true, earnedDate: '2026-02-20' },
    { id: '7', name: 'Million Steps', description: 'Walk 1,000,000 steps total', icon: 'star', earned: true, earnedDate: '2026-03-10' },
    { id: '8', name: 'Champion', description: 'Reach Champion league', icon: 'trophy', earned: false },
    { id: '9', name: 'Weight Crusher', description: 'Hit weight loss goal for 30 days', icon: 'mountain', earned: false },
  ],
}

export const todayStats: DailyStats = {
  steps: 7_842,
  goal: 10_000,
  calories: 312,
  distance: 3.7,
  activeMinutes: 48,
  qpEarned: 65,
}

export const dailyQuests: DailyQuest[] = [
  { id: '1', title: 'Daily Walker', description: 'Walk 10,000 steps today', target: 10000, current: 7842, qpReward: 50, gemReward: 5, type: 'steps', completed: false },
  { id: '2', title: 'Morning Move', description: 'Log 15 active minutes before noon', target: 15, current: 15, qpReward: 25, gemReward: 2, type: 'active_minutes', completed: true },
  { id: '3', title: 'Distance Tracker', description: 'Walk 5 miles today', target: 5, current: 3.7, qpReward: 40, gemReward: 3, type: 'distance', completed: false },
  { id: '4', title: 'Team Spirit', description: 'Cheer a teammate in a challenge', target: 1, current: 0, qpReward: 15, gemReward: 1, type: 'social', completed: false },
]

export const challenges: Challenge[] = [
  {
    id: '1',
    name: 'March Madness Steps',
    description: 'Who can walk the most this month?',
    type: 'leaderboard',
    mode: 'private',
    participants: [
      { name: 'Sarah K.', avatar: 'SK', steps: 289_400, streak: 22, kudos: 14 },
      { name: 'Mike R.', avatar: 'MR', steps: 276_100, streak: 18, kudos: 11, kudosFromYou: true },
      { name: 'Alex Chen', avatar: 'AC', steps: 268_500, streak: 12, isYou: true, kudos: 9 },
      { name: 'Jordan P.', avatar: 'JP', steps: 245_000, streak: 15, kudos: 7 },
      { name: 'Casey L.', avatar: 'CL', steps: 231_200, streak: 9, kudos: 5 },
      { name: 'Taylor M.', avatar: 'TM', steps: 198_700, streak: 6, kudos: 3 },
    ],
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    isActive: true,
    createdBy: 'Sarah K.',
  },
  {
    id: '2',
    name: 'NYC to LA Virtual Race',
    description: 'Walk 2,775 miles together across America!',
    type: 'virtual_race',
    mode: 'private',
    collectiveGoal: 5_550_000, // ~2775 miles in steps
    collectiveProgress: 3_108_900,
    raceName: 'Cross-Country USA',
    raceDistance: 2775,
    raceProgress: 1554,
    mapEmoji: 'route',
    waypoints: [
      { name: 'New York, NY', mile: 0, reached: true, terrain: 'city', landmark: 'Statue of Liberty' },
      { name: 'Philadelphia, PA', mile: 97, reached: true, terrain: 'city', landmark: 'Liberty Bell' },
      { name: 'Pittsburgh, PA', mile: 370, reached: true, terrain: 'hills', landmark: 'Steel City Bridges' },
      { name: 'Indianapolis, IN', mile: 713, reached: true, terrain: 'plains', landmark: 'Motor Speedway' },
      { name: 'St. Louis, MO', mile: 953, reached: true, terrain: 'river', landmark: 'Gateway Arch' },
      { name: 'Oklahoma City, OK', mile: 1424, reached: true, terrain: 'plains', landmark: 'Bricktown' },
      { name: 'Amarillo, TX', mile: 1700, reached: false, terrain: 'desert', landmark: 'Cadillac Ranch' },
      { name: 'Albuquerque, NM', mile: 1987, reached: false, terrain: 'desert', landmark: 'Hot Air Balloons' },
      { name: 'Flagstaff, AZ', mile: 2300, reached: false, terrain: 'mountains', landmark: 'Grand Canyon' },
      { name: 'Los Angeles, CA', mile: 2775, reached: false, terrain: 'coast', landmark: 'Hollywood Sign' },
    ],
    participants: [
      { name: 'Alex Chen', avatar: 'AC', steps: 568_500, streak: 12, isYou: true, kudos: 12 },
      { name: 'Sarah K.', avatar: 'SK', steps: 589_400, streak: 22, kudos: 18, kudosFromYou: true },
      { name: 'Mike R.', avatar: 'MR', steps: 476_100, streak: 18, kudos: 8 },
      { name: 'Jordan P.', avatar: 'JP', steps: 445_000, streak: 15, kudos: 6 },
      { name: 'Casey L.', avatar: 'CL', steps: 531_200, streak: 9, kudos: 10 },
      { name: 'Taylor M.', avatar: 'TM', steps: 498_700, streak: 6, kudos: 4 },
    ],
    startDate: '2026-02-01',
    endDate: '2026-05-31',
    isActive: true,
    createdBy: 'Alex Chen',
  },
  {
    id: '3',
    name: 'Streak Survivors',
    description: "Don't break the chain! Last one standing wins.",
    type: 'streak',
    mode: 'public',
    participants: [
      { name: 'Sarah K.', avatar: 'SK', steps: 289_400, streak: 22, kudos: 16 },
      { name: 'Mike R.', avatar: 'MR', steps: 276_100, streak: 18, kudos: 13 },
      { name: 'Jordan P.', avatar: 'JP', steps: 245_000, streak: 15, kudos: 9 },
      { name: 'Alex Chen', avatar: 'AC', steps: 268_500, streak: 12, isYou: true, kudos: 7 },
      { name: 'Casey L.', avatar: 'CL', steps: 231_200, streak: 9, kudos: 4 },
    ],
    startDate: '2026-03-10',
    endDate: '2026-04-10',
    isActive: true,
    createdBy: 'Mike R.',
  },
  {
    id: '4',
    name: 'Sales vs Engineering',
    description: 'Which team walks more? Bragging rights on the line!',
    type: 'team_leaderboard',
    mode: 'private',
    participants: [
      { name: 'Sarah K.', avatar: 'SK', steps: 289_400, streak: 22, team: 'Engineering', kudos: 11 },
      { name: 'Alex Chen', avatar: 'AC', steps: 268_500, streak: 12, isYou: true, team: 'Engineering', kudos: 8 },
      { name: 'Casey L.', avatar: 'CL', steps: 231_200, streak: 9, team: 'Engineering', kudos: 5 },
      { name: 'Mike R.', avatar: 'MR', steps: 276_100, streak: 18, team: 'Sales', kudos: 10, kudosFromYou: true },
      { name: 'Jordan P.', avatar: 'JP', steps: 245_000, streak: 15, team: 'Sales', kudos: 7 },
      { name: 'Taylor M.', avatar: 'TM', steps: 198_700, streak: 6, team: 'Sales', kudos: 2 },
    ],
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    isActive: true,
    createdBy: 'HR Admin',
  },
  {
    id: '5',
    name: '10K Every Day',
    description: 'Hit 10,000 steps every single day this month.',
    type: 'group_target',
    mode: 'private',
    collectiveGoal: 310_000, // 10K * 31 days
    collectiveProgress: 218_420,
    participants: [
      { name: 'Alex Chen', avatar: 'AC', steps: 78_420, streak: 12, isYou: true, kudos: 6 },
      { name: 'Sarah K.', avatar: 'SK', steps: 82_000, streak: 22, kudos: 9, kudosFromYou: true },
      { name: 'Mike R.', avatar: 'MR', steps: 58_000, streak: 18, kudos: 4 },
    ],
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    isActive: true,
    createdBy: 'Alex Chen',
  },
]

export const weeklyLeagues: WeeklyLeague[] = [
  { name: 'Bronze', icon: 'B', color: '#CD7F32', minQP: 0 },
  { name: 'Silver', icon: 'S', color: '#C0C0C0', minQP: 500 },
  { name: 'Gold', icon: 'G', color: '#FFD700', minQP: 1500 },
  { name: 'Platinum', icon: 'P', color: '#E5E4E2', minQP: 3000 },
  { name: 'Diamond', icon: 'D', color: '#B9F2FF', minQP: 5000 },
  { name: 'Champion', icon: 'C', color: '#FF6B35', minQP: 10000 },
]

export const notifications: Notification[] = [
  { id: '1', message: 'Sarah K. just passed you in March Madness Steps! You\'re now #3.', type: 'competitive', time: '2 min ago', read: false },
  { id: '2', message: 'You earned the "Morning Move" quest reward! +25 QP, +2 gems', type: 'achievement', time: '1 hour ago', read: false },
  { id: '3', message: 'You\'re 2,158 steps away from your daily goal. Evening walk?', type: 'reminder', time: '3 hours ago', read: true },
  { id: '4', message: 'NYC to LA race: You just passed Oklahoma City! 1,554 mi down.', type: 'social', time: '5 hours ago', read: true },
  { id: '5', message: 'You advanced to Gold league! Keep it up!', type: 'achievement', time: '1 day ago', read: true },
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

export const streakMilestones: StreakMilestone[] = [
  { days: 3, label: 'Getting Started', icon: 'leaf', reward: '+10 gems', reached: true },
  { days: 7, label: 'Week Warrior', icon: 'flame', reward: '+25 gems', reached: true },
  { days: 14, label: 'Committed', icon: 'mountain', reward: '+50 gems', reached: false },
  { days: 30, label: 'Habit Formed', icon: 'star', reward: '+100 gems', reached: false },
  { days: 60, label: 'Dedicated Walker', icon: 'summit', reward: '+200 gems', reached: false },
  { days: 100, label: 'Unstoppable', icon: 'trophy', reward: '+500 gems', reached: false },
]

// Heatmap data — last 28 days of step counts
export const heatmapData: { date: string; steps: number }[] = (() => {
  const data: { date: string; steps: number }[] = []
  const today = new Date()
  const stepPatterns = [
    11200, 8900, 12400, 9800, 10500, 14200, 7842,
    6300, 10100, 11800, 4200, 9500, 13200, 8100,
    7500, 11400, 10200, 0, 8800, 12600, 9200,
    10800, 7200, 11500, 13800, 6900, 9400, 7842,
  ]
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    data.push({
      date: d.toISOString().split('T')[0],
      steps: stepPatterns[27 - i],
    })
  }
  return data
})()

export interface Friend {
  id: string
  name: string
  avatar: string
  stepsToday: number
  streak: number
  isYou?: boolean
}

export const friends: Friend[] = [
  { id: 'f1', name: 'Sarah M.', avatar: 'SM', stepsToday: 12_480, streak: 31 },
  { id: 'f2', name: 'Jake R.', avatar: 'JR', stepsToday: 10_200, streak: 8 },
  { id: 'you', name: 'You', avatar: 'YO', stepsToday: 7_842, streak: 12, isYou: true },
  { id: 'f3', name: 'Mia K.', avatar: 'MK', stepsToday: 7_100, streak: 5 },
  { id: 'f4', name: 'Carlos D.', avatar: 'CD', stepsToday: 6_320, streak: 19 },
  { id: 'f5', name: 'Priya S.', avatar: 'PS', stepsToday: 4_800, streak: 3 },
]

export const habitStacks: HabitStack[] = [
  { id: '1', anchor: 'After my morning coffee', habit: 'take a 10-minute walk', icon: 'coffee', active: true },
  { id: '2', anchor: 'After parking at work', habit: 'walk one extra lap around the lot', icon: 'car', active: true },
  { id: '3', anchor: 'After lunch', habit: 'do a 15-minute walk break', icon: 'lunch', active: false },
  { id: '4', anchor: 'Before watching TV', habit: 'walk around the block', icon: 'tv', active: false },
]
