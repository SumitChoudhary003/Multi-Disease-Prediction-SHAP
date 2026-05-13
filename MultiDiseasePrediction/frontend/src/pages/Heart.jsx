import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Heart as HeartIcon, Send, RotateCcw, Info } from 'lucide-react'
import ResultCard from '../components/ui/ResultCard'

const FIELDS = [
  { key: 'age',      label: 'Age',                  unit: 'years',  min: 1,   max: 120, step: 1,   default: 54,   info: 'Age of the patient' },
  { key: 'sex',      label: 'Sex',                  unit: '0=F,1=M',min: 0,   max: 1,   step: 1,   default: 1,    info: '0 = Female, 1 = Male' },
  { key: 'cp',       label: 'Chest Pain Type',       unit: '0-3',    min: 0,   max: 3,   step: 1,   default: 0,    info: '0=Typical Angina, 1=Atypical, 2=Non-anginal, 3=Asymptomatic' },
  { key: 'trestbps', label: 'Resting Blood Pressure',unit: 'mmHg',   min: 60,  max: 250, step: 1,   default: 132,  info: 'Resting blood pressure on admission' },
  { key: 'chol',     label: 'Cholesterol',           unit: 'mg/dL',  min: 100, max: 600, step: 1,   default: 246,  info: 'Serum cholesterol in mg/dL' },
  { key: 'fbs',      label: 'Fasting Blood Sugar',   unit: '>120?',  min: 0,   max: 1,   step: 1,   default: 0,    info: '1 = fasting blood sugar > 120 mg/dL, 0 = otherwise' },
  { key: 'restecg',  label: 'Resting ECG',           unit: '0-2',    min: 0,   max: 2,   step: 1,   default: 1,    info: '0=Normal, 1=ST-T wave abnormality, 2=LV hypertrophy' },
  { key: 'thalch',   label: 'Max Heart Rate',        unit: 'bpm',    min: 60,  max: 250, step: 1,   default: 150,  info: 'Maximum heart rate achieved' },
  { key: 'exang',    label: 'Exercise Induced Angina',unit: '0/1',   min: 0,   max: 1,   step: 1,   default: 0,    info: '1 = Yes, 0 = No' },
  { key: 'oldpeak',  label: 'ST Depression',         unit: 'mm',     min: 0,   max: 8,   step: 0.1, default: 1.0,  info: 'ST depression induced by exercise relative to rest' },
  { key: 'slope',    label: 'Slope of ST Segment',   unit: '0-2',    min: 0,   max: 2,   step: 1,   default: 1,    info: '0=Upsloping, 1=Flat, 2=Downsloping' },
  { key: 'ca',       label: 'Major Vessels (Fluoroscopy)', unit: '0-3', min: 0, max: 3,  step: 1,   default: 0,    info: 'Number of major vessels colored by fluoroscopy' },
  { key: 'thal',     label: 'Thalassemia',           unit: '0-3',    min: 0,   max: 3,   step: 1,   default: 2,    info: '0=Unknown, 1=Normal, 2=Fixed Defect, 3=Reversable Defect' },
]

const DEFAULT_FORM = Object.fromEntries(FIELDS.map(f => [f.key, f.default]))

export default function Heart() {
  const [form,    setForm]    = useState(DEFAULT_FORM)
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, parseFloat(v)])
      )
      const { data } = await axios.post('/api/predict/heart', payload)
      setResult(data)
      toast.success('Prediction complete!')
      setTimeout(() => document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md">
          <HeartIcon className="w-6 h-6 text-white" fill="white" />
        </div>
        <div>
          <h1 className="section-title mb-0">Heart Disease Risk Prediction</h1>
          <p className="text-slate-500 text-sm">UCI Multi-Center Dataset · 14 Features · XGBoost + SHAP</p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 mb-6">
        <Info className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-700">
          Enter your cardiac health indicators. The model was trained on UCI Heart Disease data from
          Cleveland, Hungary, Switzerland and VA Long Beach centers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card mb-6">
        <h2 className="text-base font-bold text-slate-700 mb-5">Cardiac Health Parameters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FIELDS.map(({ key, label, unit, min, max, step, info }) => (
            <div key={key}>
              <label className="label">{label}
                <span className="ml-1 text-slate-400 font-normal">({unit})</span>
              </label>
              <input
                type="number" min={min} max={max} step={step} required
                className="input-field"
                value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              />
              <p className="text-xs text-slate-400 mt-1">{info}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button type="submit" disabled={loading}
            className="btn-primary bg-red-600 hover:bg-red-700">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing…</>
              : <><Send className="w-4 h-4" /> Predict Risk</>}
          </button>
          <button type="button" className="btn-secondary"
            onClick={() => { setForm(DEFAULT_FORM); setResult(null) }}>
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </form>

      {result && (
        <div id="result-section">
          <h2 className="text-lg font-bold text-slate-700 mb-4">Prediction Result</h2>
          <ResultCard result={result} diseaseName="Heart Disease" />
        </div>
      )}
    </div>
  )
}
