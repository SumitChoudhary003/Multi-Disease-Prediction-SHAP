import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Layers, Send, RotateCcw, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import ResultCard from '../components/ui/ResultCard'

// ── default inputs per disease ──────────────────────────────────────────────
const DIABETES_DEFAULTS = { Pregnancies:2, Glucose:110, BloodPressure:72, SkinThickness:23, Insulin:79, BMI:26.6, DiabetesPedigreeFunction:0.47, Age:33 }
const HEART_DEFAULTS    = { age:54, sex:1, cp:0, trestbps:132, chol:246, fbs:0, restecg:1, thalch:150, exang:0, oldpeak:1.0, slope:1, ca:0, thal:2 }
const KIDNEY_DEFAULTS   = { age:48, bp:80, sg:1.02, al:1, su:0, rbc:0, pc:0, pcc:0, ba:0, bgr:121, bu:36, sc:1.2, sod:137, pot:4.6, hemo:13.8, pcv:41, wc:8000, rc:4.7, htn:0, dm:0, cad:0, appet:1, pe:0, ane:0 }

const RISK_COLOR = { low: '#06d6a0', medium: '#f59e0b', high: '#e63946' }

function CollapsibleSection({ title, color, icon, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden mb-4">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: color + '20' }}>
            <span className="text-lg">{icon}</span>
          </div>
          <span className="font-semibold text-slate-700">{title}</span>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 bg-white border-t border-slate-100">{children}</div>}
    </div>
  )
}

function FieldGrid({ fields, values, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {fields.map(({ key, label, unit, min, max, step }) => (
        <div key={key}>
          <label className="label text-xs">{label} <span className="text-slate-400 font-normal">({unit})</span></label>
          <input type="number" min={min} max={max} step={step || 1} required
            className="input-field text-sm"
            value={values[key] ?? 0}
            onChange={e => onChange(key, e.target.value)} />
        </div>
      ))}
    </div>
  )
}

const DIABETES_FIELDS = [
  { key:'Pregnancies', label:'Pregnancies', unit:'count', min:0, max:20, step:1 },
  { key:'Glucose', label:'Glucose', unit:'mg/dL', min:50, max:300, step:1 },
  { key:'BloodPressure', label:'Blood Pressure', unit:'mmHg', min:30, max:180, step:1 },
  { key:'SkinThickness', label:'Skin Thickness', unit:'mm', min:0, max:100, step:1 },
  { key:'Insulin', label:'Insulin', unit:'µU/mL', min:0, max:900, step:1 },
  { key:'BMI', label:'BMI', unit:'kg/m²', min:10, max:70, step:0.1 },
  { key:'DiabetesPedigreeFunction', label:'Pedigree Fn', unit:'score', min:0, max:2.5, step:0.001 },
  { key:'Age', label:'Age', unit:'years', min:10, max:100, step:1 },
]

const HEART_FIELDS = [
  { key:'age', label:'Age', unit:'years', min:1, max:120, step:1 },
  { key:'sex', label:'Sex (0=F,1=M)', unit:'0/1', min:0, max:1, step:1 },
  { key:'cp', label:'Chest Pain', unit:'0-3', min:0, max:3, step:1 },
  { key:'trestbps', label:'Resting BP', unit:'mmHg', min:60, max:250, step:1 },
  { key:'chol', label:'Cholesterol', unit:'mg/dL', min:100, max:600, step:1 },
  { key:'fbs', label:'Fasting BS>120', unit:'0/1', min:0, max:1, step:1 },
  { key:'restecg', label:'Rest ECG', unit:'0-2', min:0, max:2, step:1 },
  { key:'thalch', label:'Max HR', unit:'bpm', min:60, max:250, step:1 },
  { key:'exang', label:'Exer. Angina', unit:'0/1', min:0, max:1, step:1 },
  { key:'oldpeak', label:'ST Depression', unit:'mm', min:0, max:8, step:0.1 },
  { key:'slope', label:'Slope ST', unit:'0-2', min:0, max:2, step:1 },
  { key:'ca', label:'Major Vessels', unit:'0-3', min:0, max:3, step:1 },
  { key:'thal', label:'Thalassemia', unit:'0-3', min:0, max:3, step:1 },
]

const KIDNEY_FIELDS = [
  { key:'age', label:'Age', unit:'yrs', min:1, max:120, step:1 },
  { key:'bp', label:'Blood Pressure', unit:'mm/Hg', min:40, max:200, step:1 },
  { key:'sg', label:'Specific Gravity', unit:'1.0x', min:1.005, max:1.030, step:0.001 },
  { key:'al', label:'Albumin', unit:'0-5', min:0, max:5, step:1 },
  { key:'su', label:'Sugar', unit:'0-5', min:0, max:5, step:1 },
  { key:'bgr', label:'Blood Glucose', unit:'mg/dL', min:50, max:500, step:1 },
  { key:'bu', label:'Blood Urea', unit:'mg/dL', min:1, max:400, step:1 },
  { key:'sc', label:'Serum Creatinine', unit:'mg/dL', min:0.4, max:80, step:0.1 },
  { key:'hemo', label:'Hemoglobin', unit:'gms', min:3, max:18, step:0.1 },
  { key:'pcv', label:'Packed Cell Vol', unit:'%', min:10, max:60, step:1 },
  { key:'htn', label:'Hypertension', unit:'0/1', min:0, max:1, step:1 },
  { key:'dm', label:'Diabetes', unit:'0/1', min:0, max:1, step:1 },
  { key:'appet', label:'Appetite', unit:'0=Poor,1=Good', min:0, max:1, step:1 },
  { key:'ane', label:'Anemia', unit:'0/1', min:0, max:1, step:1 },
]

function RadarView({ results }) {
  if (!results) return null
  const entries = Object.entries(results)
  if (entries.length === 0) return null

  const data = [
    { subject: 'Risk %', ...Object.fromEntries(entries.map(([d, r]) => [d, r.probability])) },
  ]

  const radarData = entries.map(([d, r]) => ({
    disease: d.charAt(0).toUpperCase() + d.slice(1),
    risk: r.probability,
  }))

  return (
    <div className="card mt-6">
      <h3 className="font-bold text-slate-700 mb-4">Risk Radar Overview</h3>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%"
          data={radarData.map(r => ({ subject: r.disease, value: r.risk }))}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13, fontWeight: 600 }} />
          <Radar name="Risk %" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
          <Tooltip formatter={v => [`${v.toFixed(1)}%`, 'Risk']}
                   contentStyle={{ borderRadius: '10px', fontSize: '12px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function Combined() {
  const [diabetes, setDiabetes] = useState(DIABETES_DEFAULTS)
  const [heart,    setHeart]    = useState(HEART_DEFAULTS)
  const [kidney,   setKidney]   = useState(KIDNEY_DEFAULTS)
  const [result,   setResult]   = useState(null)
  const [loading,  setLoading]  = useState(false)

  const upd = (setter) => (key, val) => setter(p => ({ ...p, [key]: parseFloat(val) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const { data } = await axios.post('/api/predict/combined', {
        diabetes, heart, kidney
      })
      setResult(data)
      toast.success('Combined analysis complete!')
      setTimeout(() => document.getElementById('combined-result')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Combined prediction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
          <Layers className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="section-title mb-0">Combined Multi-Disease Analysis</h1>
          <p className="text-slate-500 text-sm">Simultaneous 3-disease risk assessment with individual SHAP explanations</p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100 mb-6">
        <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-purple-800">
          Fill in all three disease sections below. Each disease uses its own trained model.
          Results show individual risk + an overall combined health risk score.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <CollapsibleSection title="🩸 Diabetes Parameters" color="#3b82f6" icon="💧" defaultOpen={true}>
          <FieldGrid fields={DIABETES_FIELDS} values={diabetes} onChange={upd(setDiabetes)} />
        </CollapsibleSection>

        <CollapsibleSection title="❤️ Heart Disease Parameters" color="#e63946" icon="❤️" defaultOpen={false}>
          <FieldGrid fields={HEART_FIELDS} values={heart} onChange={upd(setHeart)} />
        </CollapsibleSection>

        <CollapsibleSection title="🫘 Kidney Disease Parameters" color="#2ec4b6" icon="🫘" defaultOpen={false}>
          <FieldGrid fields={KIDNEY_FIELDS} values={kidney} onChange={upd(setKidney)} />
        </CollapsibleSection>

        <div className="flex gap-3 mt-4">
          <button type="submit" disabled={loading}
            className="btn-primary bg-purple-600 hover:bg-purple-700">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing all 3 diseases…</>
              : <><Send className="w-4 h-4" /> Run Combined Analysis</>}
          </button>
          <button type="button" className="btn-secondary"
            onClick={() => { setDiabetes(DIABETES_DEFAULTS); setHeart(HEART_DEFAULTS); setKidney(KIDNEY_DEFAULTS); setResult(null) }}>
            <RotateCcw className="w-4 h-4" /> Reset All
          </button>
        </div>
      </form>

      {/* Combined Result */}
      {result && (
        <div id="combined-result" className="mt-8 space-y-6">
          {/* Overall Summary */}
          <div className={`card border-2 ${
            result.overall_risk_level === 'high'   ? 'border-red-300 bg-red-50'   :
            result.overall_risk_level === 'medium' ? 'border-amber-300 bg-amber-50' :
                                                     'border-green-300 bg-green-50'}`}>
            <div className="flex items-center gap-3 mb-4">
              {result.overall_risk_level === 'high'
                ? <AlertTriangle className="w-6 h-6 text-red-600" />
                : <CheckCircle className="w-6 h-6 text-green-600" />}
              <h2 className="text-xl font-bold text-slate-800">
                Overall Health Risk: {result.overall_risk?.toFixed(1)}%
              </h2>
              <span className={`badge ml-auto capitalize font-bold ${
                result.overall_risk_level === 'high'   ? 'badge-high'   :
                result.overall_risk_level === 'medium' ? 'badge-medium' : 'badge-low'}`}>
                {result.overall_risk_level} risk
              </span>
            </div>

            {result.high_risk_diseases?.length > 0 && (
              <div className="p-3 bg-red-100 rounded-xl mb-3">
                <p className="text-sm font-semibold text-red-700">
                  ⚠️ High Risk Detected: {result.high_risk_diseases.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
                </p>
                <p className="text-xs text-red-600 mt-1">Please consult a healthcare professional immediately.</p>
              </div>
            )}

            {/* Summary Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 font-semibold text-slate-600">Disease</th>
                    <th className="text-center py-2 font-semibold text-slate-600">Prediction</th>
                    <th className="text-center py-2 font-semibold text-slate-600">Risk %</th>
                    <th className="text-center py-2 font-semibold text-slate-600">Risk Level</th>
                    <th className="text-left py-2 font-semibold text-slate-600">Model</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result?.combined_results || {}).map(([disease, r]) => (
                    <tr key={disease} className="border-b border-slate-100">
                      <td className="py-2 font-medium capitalize">{disease}</td>
                      <td className="py-2 text-center text-sm">{r.label}</td>
                      <td className="py-2 text-center font-bold" style={{ color: RISK_COLOR[r.risk_level] }}>
                        {r.probability?.toFixed(1)}%
                      </td>
                      <td className="py-2 text-center">
                        <span className={`badge capitalize ${
                          r.risk_level === 'high' ? 'badge-high' :
                          r.risk_level === 'medium' ? 'badge-medium' : 'badge-low'}`}>
                          {r.risk_level}
                        </span>
                      </td>
                      <td className="py-2 text-xs text-slate-500">{r.model_used}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Radar */}
          <RadarView results={result?.combined_results || {}} />

          {/* Individual Results */}
          <div>
            <h2 className="text-lg font-bold text-slate-700 mb-4">Individual Disease Details & SHAP</h2>
            <div className="space-y-6">
              {Object.entries(result?.combined_results || {}).map(([disease, r]) => (
                <div key={disease}>
                  <h3 className="text-base font-semibold text-slate-600 capitalize mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full inline-block"
                          style={{ background: RISK_COLOR[r.risk_level] }} />
                    {disease} Disease
                  </h3>
                  <ResultCard result={r} diseaseName={disease} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
