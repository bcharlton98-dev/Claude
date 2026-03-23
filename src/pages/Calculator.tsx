import { useState } from 'react'
import { TrendingDown, Info } from 'lucide-react'

type Sex = 'male' | 'female'
type Intensity = 'soft' | 'medium' | 'hard'
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

const activityConfig: Record<ActivityLevel, { label: string; desc: string; multiplier: number }> = {
  sedentary: { label: 'Sedentary', desc: 'Office job, little exercise', multiplier: 1.2 },
  light: { label: 'Lightly Active', desc: 'Light exercise 1-3 days/week', multiplier: 1.375 },
  moderate: { label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week', multiplier: 1.55 },
  active: { label: 'Active', desc: 'Hard exercise 6-7 days/week', multiplier: 1.725 },
  very_active: { label: 'Very Active', desc: 'Athlete / physical job', multiplier: 1.9 },
}

const intensityConfig: Record<Intensity, { label: string; lbsPerWeek: number; emoji: string }> = {
  soft: { label: 'Easy', lbsPerWeek: 0.5, emoji: '🚶' },
  medium: { label: 'Steady', lbsPerWeek: 1.0, emoji: '🏃' },
  hard: { label: 'Intense', lbsPerWeek: 1.5, emoji: '⚡' },
}

function calculateSteps(
  weight: number, height: number, age: number, sex: Sex,
  goalWeight: number, intensity: Intensity, activity: ActivityLevel
) {
  // Mifflin-St Jeor BMR
  const weightKg = weight * 0.453592
  const heightCm = height * 2.54
  const bmr = sex === 'male'
    ? (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5
    : (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161

  const tdee = bmr * activityConfig[activity].multiplier

  const { lbsPerWeek } = intensityConfig[intensity]
  const lbsToLose = weight - goalWeight
  const weeksToGoal = Math.ceil(lbsToLose / lbsPerWeek)

  // Daily calorie deficit needed: 1 lb = 3,500 cal
  const dailyDeficit = (lbsPerWeek * 3500) / 7

  // Calories burned per step (~0.04 cal per step, scaled by weight)
  const calsPerStep = 0.04 * (weight / 150)
  const stepsForDeficit = Math.round(dailyDeficit / calsPerStep)
  const dailySteps = Math.max(stepsForDeficit, 5000)

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    dailySteps,
    dailyCalorieBurn: Math.round(dailySteps * calsPerStep),
    weeksToGoal: Math.max(weeksToGoal, 1),
    calorieDeficit: Math.round(dailyDeficit),
  }
}

export default function CalculatorPage() {
  const [weight, setWeight] = useState(185)
  const [height, setHeight] = useState(70)
  const [age, setAge] = useState(30)
  const [sex, setSex] = useState<Sex>('male')
  const [goalWeight, setGoalWeight] = useState(170)
  const [intensity, setIntensity] = useState<Intensity>('medium')
  const [activity, setActivity] = useState<ActivityLevel>('sedentary')
  const [showResults, setShowResults] = useState(false)

  const results = calculateSteps(weight, height, age, sex, goalWeight, intensity, activity)
  const heightFeet = Math.floor(height / 12)
  const heightInches = height % 12

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
          🧮 Step Calculator
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Science-backed daily step goal for weight loss</p>
      </div>

      <div className="bg-white rounded-xl p-4 space-y-5">
        {/* Sex */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sex</label>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            {(['male', 'female'] as Sex[]).map(s => (
              <button
                key={s}
                onClick={() => setSex(s)}
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                  sex === s ? 'bg-brand-500 text-white shadow-sm' : 'bg-slate-50 text-slate-400'
                }`}
              >
                {s === 'male' ? '♂ Male' : '♀ Female'}
              </button>
            ))}
          </div>
        </div>

        {/* Age */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Age</label>
          <input type="range" min={16} max={80} value={age} onChange={e => setAge(Number(e.target.value))}
            className="w-full mt-1.5 accent-brand-500" />
          <p className="text-center text-xl font-bold text-slate-800">{age}</p>
        </div>

        {/* Height */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Height</label>
          <input type="range" min={54} max={84} value={height} onChange={e => setHeight(Number(e.target.value))}
            className="w-full mt-1.5 accent-brand-500" />
          <p className="text-center text-xl font-bold text-slate-800">{heightFeet}'{heightInches}"</p>
        </div>

        {/* Current Weight */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Current Weight (lbs)</label>
          <input type="range" min={100} max={400} value={weight} onChange={e => setWeight(Number(e.target.value))}
            className="w-full mt-1.5 accent-brand-500" />
          <p className="text-center text-xl font-bold text-slate-800">{weight} lbs</p>
        </div>

        {/* Goal Weight */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Goal Weight (lbs)</label>
          <input type="range" min={90} max={weight - 1} value={Math.min(goalWeight, weight - 1)}
            onChange={e => setGoalWeight(Number(e.target.value))}
            className="w-full mt-1.5 accent-brand-500" />
          <p className="text-center text-xl font-bold text-slate-800">{goalWeight} lbs</p>
          <p className="text-center text-[11px] text-slate-400">Lose {weight - goalWeight} lbs</p>
        </div>

        {/* Activity Level */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Activity Level</label>
          <div className="space-y-1.5 mt-1.5">
            {(Object.keys(activityConfig) as ActivityLevel[]).map(key => {
              const cfg = activityConfig[key]
              return (
                <button
                  key={key}
                  onClick={() => setActivity(key)}
                  className={`w-full p-2.5 rounded-lg text-left transition-all ${
                    activity === key
                      ? 'bg-brand-50 border-2 border-brand-400'
                      : 'bg-slate-50 border-2 border-transparent'
                  }`}
                >
                  <p className={`text-sm font-semibold ${activity === key ? 'text-brand-700' : 'text-slate-600'}`}>{cfg.label}</p>
                  <p className="text-[11px] text-slate-400">{cfg.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Intensity */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Weight Loss Pace</label>
          <div className="grid grid-cols-3 gap-2 mt-1.5">
            {(Object.keys(intensityConfig) as Intensity[]).map(key => {
              const cfg = intensityConfig[key]
              return (
                <button
                  key={key}
                  onClick={() => setIntensity(key)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    intensity === key
                      ? 'bg-brand-50 border-2 border-brand-400'
                      : 'bg-slate-50 border-2 border-transparent'
                  }`}
                >
                  <span className="text-xl">{cfg.emoji}</span>
                  <p className={`text-xs font-semibold mt-1 ${intensity === key ? 'text-brand-700' : 'text-slate-600'}`}>{cfg.label}</p>
                  <p className="text-[10px] text-slate-400">{cfg.lbsPerWeek} lb/wk</p>
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => setShowResults(true)}
          className="w-full py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-colors shadow-md text-sm"
        >
          Calculate My Steps
        </button>
      </div>

      {/* Results */}
      {showResults && (
        <div className="bg-white rounded-xl p-5 border-2 border-brand-200 space-y-4">
          <div className="text-center">
            <TrendingDown size={24} className="text-brand-500 mx-auto mb-1" />
            <p className="text-xs text-slate-400">Your daily step goal</p>
            <p className="text-4xl font-extrabold text-brand-600 mt-1 tracking-tight">{results.dailySteps.toLocaleString()}</p>
            <p className="text-xs text-slate-400">steps per day</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-slate-800">{results.bmr}</p>
              <p className="text-[10px] text-slate-400">BMR (cal/day)</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-slate-800">{results.tdee}</p>
              <p className="text-[10px] text-slate-400">TDEE (cal/day)</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-slate-800">{results.calorieDeficit}</p>
              <p className="text-[10px] text-slate-400">deficit needed</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-slate-800">{results.weeksToGoal} wks</p>
              <p className="text-[10px] text-slate-400">to {goalWeight} lbs</p>
            </div>
          </div>

          <button className="w-full py-2.5 bg-brand-50 text-brand-700 font-semibold rounded-xl border border-brand-200 text-sm hover:bg-brand-100 transition-colors">
            🎯 Set as My Daily Goal
          </button>

          <div className="flex items-start gap-2 p-2.5 bg-sky-50 rounded-lg text-[11px] text-sky-700">
            <Info size={12} className="shrink-0 mt-0.5" />
            <p>Uses the Mifflin-St Jeor equation for BMR with activity multipliers for TDEE. This is an estimate — consult a healthcare provider before starting any weight loss program.</p>
          </div>
        </div>
      )}
    </div>
  )
}
