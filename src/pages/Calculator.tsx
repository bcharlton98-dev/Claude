import { useState } from 'react'
import { Calculator as CalcIcon, TrendingDown, Info } from 'lucide-react'

type Intensity = 'soft' | 'medium' | 'hard'

const intensityConfig: Record<Intensity, { label: string; lbsPerWeek: number; color: string; bg: string }> = {
  soft: { label: 'Soft', lbsPerWeek: 0.5, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  medium: { label: 'Medium', lbsPerWeek: 1.0, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  hard: { label: 'Hard', lbsPerWeek: 1.5, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
}

function calculateSteps(weight: number, height: number, goalWeight: number, intensity: Intensity): {
  dailySteps: number
  dailyCalorieBurn: number
  weeksToGoal: number
  calorieDeficit: number
} {
  // BMR using Mifflin-St Jeor (simplified, assuming average age 30, male-ish baseline)
  const bmr = 10 * (weight * 0.453592) + 6.25 * (height * 2.54) - 5 * 30 + 5
  const tdee = bmr * 1.4 // lightly active baseline

  const lbsToLose = weight - goalWeight
  const { lbsPerWeek } = intensityConfig[intensity]
  const weeksToGoal = Math.ceil(lbsToLose / lbsPerWeek)

  // 1 lb = ~3500 calories, so daily deficit needed:
  const dailyDeficit = (lbsPerWeek * 3500) / 7
  // Assume ~0.04 cal per step per lb of body weight
  const calsPerStep = 0.04 * (weight / 150)
  const stepsForDeficit = Math.round(dailyDeficit / calsPerStep)
  const dailySteps = Math.max(stepsForDeficit, 5000) // minimum 5000

  return {
    dailySteps,
    dailyCalorieBurn: Math.round(dailySteps * calsPerStep),
    weeksToGoal,
    calorieDeficit: Math.round(dailyDeficit),
  }
}

export default function CalculatorPage() {
  const [weight, setWeight] = useState(185)
  const [height, setHeight] = useState(70) // inches
  const [goalWeight, setGoalWeight] = useState(170)
  const [intensity, setIntensity] = useState<Intensity>('medium')
  const [showResults, setShowResults] = useState(false)

  const results = calculateSteps(weight, height, goalWeight, intensity)

  const heightFeet = Math.floor(height / 12)
  const heightInches = height % 12

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <CalcIcon size={22} className="text-emerald-500" /> Step Calculator
        </h1>
        <p className="text-sm text-slate-500 mt-1">Get your personalized daily step goal for weight loss</p>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 space-y-5">
        {/* Current Weight */}
        <div>
          <label className="text-sm font-medium text-slate-700">Current Weight (lbs)</label>
          <input
            type="range"
            min={100}
            max={400}
            value={weight}
            onChange={e => setWeight(Number(e.target.value))}
            className="w-full mt-2 accent-emerald-500"
          />
          <div className="text-center text-2xl font-bold text-slate-800 mt-1">{weight} lbs</div>
        </div>

        {/* Height */}
        <div>
          <label className="text-sm font-medium text-slate-700">Height</label>
          <input
            type="range"
            min={54}
            max={84}
            value={height}
            onChange={e => setHeight(Number(e.target.value))}
            className="w-full mt-2 accent-emerald-500"
          />
          <div className="text-center text-2xl font-bold text-slate-800 mt-1">{heightFeet}'{heightInches}"</div>
        </div>

        {/* Goal Weight */}
        <div>
          <label className="text-sm font-medium text-slate-700">Goal Weight (lbs)</label>
          <input
            type="range"
            min={90}
            max={weight - 1}
            value={Math.min(goalWeight, weight - 1)}
            onChange={e => setGoalWeight(Number(e.target.value))}
            className="w-full mt-2 accent-emerald-500"
          />
          <div className="text-center text-2xl font-bold text-slate-800 mt-1">{goalWeight} lbs</div>
          <p className="text-center text-xs text-slate-400">Lose {weight - goalWeight} lbs</p>
        </div>

        {/* Intensity */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Intensity</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(intensityConfig) as Intensity[]).map(key => {
              const cfg = intensityConfig[key]
              return (
                <button
                  key={key}
                  onClick={() => setIntensity(key)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    intensity === key ? cfg.bg + ' border-2' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className={`font-semibold text-sm ${intensity === key ? cfg.color : 'text-slate-700'}`}>{cfg.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{cfg.lbsPerWeek} lb/wk</p>
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => setShowResults(true)}
          className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-md"
        >
          Calculate My Steps
        </button>
      </div>

      {/* Results */}
      {showResults && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-200 space-y-4">
          <div className="text-center">
            <TrendingDown size={28} className="text-emerald-500 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Your personalized daily goal</p>
            <p className="text-5xl font-bold text-emerald-600 mt-1">{results.dailySteps.toLocaleString()}</p>
            <p className="text-sm text-slate-500">steps per day</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-slate-800">{results.dailyCalorieBurn}</p>
              <p className="text-xs text-slate-500">cals burned/day</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-slate-800">{results.calorieDeficit}</p>
              <p className="text-xs text-slate-500">cal deficit/day</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center col-span-2">
              <p className="text-lg font-bold text-slate-800">{results.weeksToGoal} weeks</p>
              <p className="text-xs text-slate-500">to reach {goalWeight} lbs ({intensityConfig[intensity].label} mode)</p>
            </div>
          </div>

          <button className="w-full py-2.5 bg-emerald-50 text-emerald-700 font-semibold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors">
            Set as My Daily Goal
          </button>

          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <Info size={14} className="shrink-0 mt-0.5" />
            <p>This is an estimate. Actual results depend on diet, metabolism, and consistency. Consult a healthcare provider before starting any weight loss program.</p>
          </div>
        </div>
      )}
    </div>
  )
}
