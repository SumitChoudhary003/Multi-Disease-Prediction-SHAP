import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Activity, Send, RotateCcw, Info } from 'lucide-react'
import ResultCard from '../components/ui/ResultCard'

const FIELDS = [
  { key: 'age',   label: 'Age',                        unit: 'years',   min: 1,   max: 120,  step: 1,   default: 48,   info: 'Age of the patient' },
  { key: 'bp',    label: 'Blood Pressure',              unit: 'mm/Hg',   min: 40,  max: 200,  step: 1,   default: 80,   info: 'Diastolic blood pressure' },
  { key: 'sg',    label: 'Specific Gravity',            unit: '1.00x',   min: 1.005,max:1.030, step:0.001,default:1.02,  info: 'Urine specific gravity' },
  { key: 'al',    label: 'Albumin',                     unit: '0-5',     min: 0,   max: 5,    step: 1,   default: 1,    info: 'Albumin in urine (0-5 scale)' },
  { key: 'su',    label: 'Sugar',                       unit: '0-5',     min: 0,   max: 5,    step: 1,   default: 0,    info: 'Sugar in urine (0-5 scale)' },
  { key: 'rbc',   label: 'Red Blood Cells',             unit: '0/1',     min: 0,   max: 1,    step: 1,   default: 0,    info: '0=Normal, 1=Abnormal' },
  { key: 'pc',    label: 'Pus Cell',                    unit: '0/1',     min: 0,   max: 1,    step: 1,   default: 0,    info: '0=Normal, 1=Abnormal' },
  { key: 'pcc',   label: 'Pus Cell Clumps',             unit: '0/1',     min: 0,   max: 1,    step: 1,   default: 0,    info: '0=Not Present, 1=Present' },
  { key: 'ba',    label: 'Bacteria',                    unit: '0/1',     min: 0,   max: 1,    step: 1,   default: 0,    info: '0=Not Present, 1=Present' },
  { key: 'bgr',   label: 'Blood Glucose Random',        unit: 'mgs/dL',  min: 50,  max: 500,  step: 1,   default: 121,  info: 'Random blood glucose level' },
  { key: 'bu',    label: 'Blood Urea',                  unit: 'mgs/dL',  min: 1,   max: 400,  step: 1,   default: 36,   info: 'Blood urea level' },
  { key: 'sc',    label: 'Serum Creatinine',            unit: 'mgs/dL',  min: 0.4, max: 80,   step: 0.1, default: 1.2,  info: 'Serum creatinine level' },
  { key: 'sod',   label: 'Sodium',                      unit: 'mEq/L',   min: 100, max: 165,  step: 1,   default: 137,  info: 'Serum sodium level' },
  { key: 'pot',   label: 'Potassium',                   unit: 'mEq/L',   min: 2,   max: 50,   step: 0.1, default: 4.6,  info: 'Serum potassium level' },
  { key: 'hemo',  label: 'Hemoglobin',                  unit: 'gms',     min: 3,   max: 18,   step: 0.1, default: 13.8, info: 'Hemoglobin level' },
  { key: 'pcv',   label: 'Packed Cell Volume',          unit: '%',       min: 10,  max: 60,   step: 1,   default: 41,   info: 'Packed cell volume percentage' },
  { key: 'wc',    label: 'White Blood Cell Count',      unit: 'cells/cumm',min:2000,max:26400,step:100,  default:8000,  info: 'White blood cell count' },
  { key: 'rc',    label: 'Red Blood Cell Count',        unit: 'millions/cmm',min:2, max:8,    step: 0.1, default: 4.7,  info: 'Red blood cell count' },
  { key: 'htn',   label: 'Hypertension',                unit: '0/1',     min: 0,   max: 1,    step: 1,   default: 0,    info: '0=No, 1=Yes' },
  { key: 'dm',    label: 'Diabetes Mellitus',           unit: '0/1',     min: 0,   max: 1,    step: 1,   default: 0,    info: '0=No, 1=Yes' },
  { key: 'cad',   label: 'Coronary Artery Disease',     unit: '0/1',     min: 0,   max: 1,    step: 1,   default: 0,    info: '0=No, 1=Yes' },
  { key: 'appet', label: 'Appetite',                    unit: '0/1',     min: 0,   max: 1,    step: 1,   default: 1,    info: '0=Poor, 1=Good' },
  { key: 'pe',    label: 'Pedal Edema',                 unit: '0/1',     min: 0,   max: 1,    step: 1,   default: 0,    info: '0=No, 1=Yes' },
  { key: 'ane',   label: 'Anemia',                      unit: '0/1',     min: 0,   max: 1,    step: 1,   default: 0,    info: '0=No, 1=Yes' },
]

const DEFAULT_FORM = Object.fromEntries(FIELDS.map(f => [f.key, f.default]))

export default function Kidney() {
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
      const { data } = await axios.post('/api/predict/kidney', payload)
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
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="section-title mb-0">Kidney Disease Risk Prediction</h1>
          <p className="text-slate-500 text-sm">UCI CKD Dataset · 24 Features · XGBoost + SHAP</p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-2xl border border-teal-100 mb-6">
        <Info className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-teal-800">
          Enter renal function parameters. The model predicts Chronic Kidney Disease (CKD).
          For binary fields: 0 = No/Normal, 1 = Yes/Abnormal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card mb-6">
        <h2 className="text-base font-bold text-slate-700 mb-5">Renal Health Parameters</h2>
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
              <p className="text-xs text-slate-400 mt-1 leading-tight">{info}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button type="submit" disabled={loading}
            className="btn-primary bg-teal-600 hover:bg-teal-700">
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
          <ResultCard result={result} diseaseName="Kidney Disease" />
        </div>
      )}
    </div>
  )
}
