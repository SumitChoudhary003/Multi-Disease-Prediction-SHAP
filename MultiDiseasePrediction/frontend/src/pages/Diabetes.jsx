import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Droplets, Send, RotateCcw, Info } from 'lucide-react'
import ResultCard from '../components/ui/ResultCard'

const FIELDS = [
  { key: 'Pregnancies',             label: 'Pregnancies',                unit: 'count',   min: 0,  max: 20,   step: 1,    default: 2,    info: 'Number of times pregnant' },
  { key: 'Glucose',                 label: 'Glucose',                    unit: 'mg/dL',   min: 50, max: 300,  step: 1,    default: 110,  info: 'Plasma glucose concentration (2hr oral glucose tolerance)' },
  { key: 'BloodPressure',           label: 'Blood Pressure',             unit: 'mmHg',    min: 30, max: 180,  step: 1,    default: 72,   info: 'Diastolic blood pressure' },
  { key: 'SkinThickness',           label: 'Skin Thickness',             unit: 'mm',      min: 0,  max: 100,  step: 1,    default: 23,   info: 'Triceps skin fold thickness' },
  { key: 'Insulin',                 label: 'Insulin',                    unit: 'µU/mL',   min: 0,  max: 900,  step: 1,    default: 79,   info: '2-Hour serum insulin' },
  { key: 'BMI',                     label: 'BMI',                        unit: 'kg/m²',   min: 10, max: 70,   step: 0.1,  default: 26.6, info: 'Body Mass Index' },
  { key: 'DiabetesPedigreeFunction',label: 'Diabetes Pedigree Function', unit: 'score',   min: 0,  max: 2.5,  step: 0.001,default: 0.47, info: 'Diabetes hereditary function score' },
  { key: 'Age',                     label: 'Age',                        unit: 'years',   min: 10, max: 100,  step: 1,    default: 33,   info: 'Age of patient' },
]

const DEFAULT_FORM = Object.fromEntries(FIELDS.map(f => [f.key, f.default]))

export default function Diabetes() {
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
      const { data } = await axios.post('/api/predict/diabetes', payload)
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
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
          <Droplets className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="section-title mb-0">Diabetes Risk Prediction</h1>
          <p className="text-slate-500 text-sm">Pima Indians Diabetes Dataset · XGBoost + SHAP</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-6">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Fill in your health parameters below. Default values are population medians.
          The system will predict your diabetes risk using the best-performing trained model.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card mb-6">
        <h2 className="text-base font-bold text-slate-700 mb-5">Patient Health Parameters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FIELDS.map(({ key, label, unit, min, max, step, info }) => (
            <div key={key}>
              <label className="label" title={info}>{label}
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
          <button type="submit" disabled={loading} className="btn-primary">
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

      {/* Result */}
      {result && (
        <div id="result-section">
          <h2 className="text-lg font-bold text-slate-700 mb-4">Prediction Result</h2>
          <ResultCard result={result} diseaseName="Diabetes" />
        </div>
      )}
    </div>
  )
}
