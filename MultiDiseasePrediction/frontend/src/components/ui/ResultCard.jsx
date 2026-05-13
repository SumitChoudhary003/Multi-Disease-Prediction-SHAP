import { AlertTriangle, CheckCircle, AlertCircle, Info, TrendingUp, Brain } from 'lucide-react'
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
         BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const RISK_CONFIG = {
  low:    { color: '#06d6a0', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'Low Risk', icon: CheckCircle },
  medium: { color: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Medium Risk', icon: AlertCircle },
  high:   { color: '#e63946', bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-700',   label: 'High Risk',  icon: AlertTriangle },
}

const MODEL_COLORS = ['#3b82f6', '#06d6a0', '#f59e0b', '#e63946']

function RiskGauge({ probability, risk_level }) {
  const cfg = RISK_CONFIG[risk_level] || RISK_CONFIG.low
  const data = [{ value: probability, fill: cfg.color }]
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="85%" innerRadius="60%" outerRadius="100%"
                          startAngle={180} endAngle={0} data={data}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background dataKey="value" angleAxisId={0} cornerRadius={6} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <p className="text-3xl font-bold" style={{ color: cfg.color }}> {Number(probability || 0).toFixed(1)}%</p>
        </div>
      </div>
      <div className={`mt-2 px-4 py-1.5 rounded-full ${cfg.bg} ${cfg.text} font-semibold text-sm flex items-center gap-1.5`}>
        <cfg.icon className="w-4 h-4" />
        {cfg.label}
      </div>
    </div>
  )
}

function ModelComparison({ modelResults }) {
  if (!modelResults || modelResults.length === 0) return null
  const data = modelResults.map(r => ({
    name:  r.Model?.split(' ').map(w => w[0]).join('') || 'M',
    full:  r.Model,
    acc:   +(r['Test Accuracy'] * 100).toFixed(1),
    auc:   +(r['AUC-ROC'] * 100).toFixed(1),
    f1:    +(r['F1 Score'] * 100).toFixed(1),
  }))

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-blue-500" /> Model Performance Comparison
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} unit="%" />
          <Tooltip
            formatter={(v, n) => [`${v}%`, n]}
            contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}
          />
          <Bar dataKey="acc" name="Accuracy" fill="#3b82f6" radius={[4,4,0,0]} />
          <Bar dataKey="auc" name="AUC-ROC"  fill="#06d6a0" radius={[4,4,0,0]} />
          <Bar dataKey="f1"  name="F1 Score" fill="#f59e0b" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-xs text-slate-600">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-1.5 font-semibold">Model</th>
              <th className="text-center py-1.5 font-semibold">Accuracy</th>
              <th className="text-center py-1.5 font-semibold">AUC-ROC</th>
              <th className="text-center py-1.5 font-semibold">F1</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i} className={`border-b border-slate-50 ${i === 0 ? 'bg-blue-50 font-semibold' : ''}`}>
                <td className="py-1.5">{r.full} {i === 0 ? '🏆' : ''}</td>
                <td className="text-center py-1.5">{r.acc}%</td>
                <td className="text-center py-1.5">{r.auc}%</td>
                <td className="text-center py-1.5">{r.f1}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ShapChart({ shapData }) {
  if (!shapData || shapData.error) return null

  // Use chart_base64 if available, else render from sorted_shap
  if (shapData.chart_base64) {
    return (
      <div>
        <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-500" /> SHAP Explainability
          <span className="text-xs font-normal text-slate-400">(Why this prediction?)</span>
        </h3>
        <img src={`data:image/png;base64,${shapData.chart_base64}`}
             alt="SHAP Chart" className="w-full rounded-xl border border-slate-100" />
        <p className="text-xs text-slate-400 mt-2 text-center">
          🔴 Red = increases risk &nbsp;|&nbsp; 🔵 Blue = decreases risk
        </p>
        {shapData.explanations && (
  <div className="mt-4 space-y-2">
    {shapData.explanations.map((exp, i) => (
      <div
        key={i}
        className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700"
      >
        • {exp}
      </div>
    ))}
  </div>
)}
      </div>
    )
  }

  if (!shapData.sorted_shap || shapData.sorted_shap.length === 0) return null
  const data = shapData.sorted_shap.slice(0, 8).map(([name, val]) => ({
    name: name.length > 14 ? name.slice(0, 12) + '…' : name,
    value: +val.toFixed(4),
    abs: Math.abs(val)
  })).reverse()

  return (
    <div>
      <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <Brain className="w-4 h-4 text-purple-500" /> SHAP Explainability
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 80, right: 20, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
          <Tooltip formatter={(v) => [v.toFixed(4), 'SHAP Value']}
                   contentStyle={{ borderRadius: '10px', fontSize: '12px' }} />
          <Bar dataKey="value" radius={[0,4,4,0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.value >= 0 ? '#e63946' : '#00b4d8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-400 mt-1 text-center">
        🔴 Red = increases risk &nbsp;|&nbsp; 🔵 Blue = decreases risk
      </p>
    </div>
  )
}

export default function ResultCard({ result, diseaseName }) {
  if (!result) return null
  const { probability, risk_level, label, model_used, shap, model_results } = result
  const cfg = RISK_CONFIG[risk_level] || RISK_CONFIG.low

  const downloadReport = async () => {
  const input = document.getElementById('report-section')

  if (!input) return

  const canvas = await html2canvas(input, {
    scale: 2
  })

  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF('p', 'mm', 'a4')

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

  pdf.save(`${diseaseName}_report.pdf`)
}

  const recommendations = {
    low:    ['Maintain healthy lifestyle', 'Regular check-ups every year', 'Continue current healthy habits'],
    medium: ['Consult your doctor soon', 'Improve diet and exercise', 'Monitor key health indicators', 'Reduce risk factors'],
    high:   ['Seek immediate medical consultation', 'Urgent lifestyle changes required', 'Follow prescribed medications', 'Regular monitoring needed', 'Reduce stress and improve sleep'],
  }

  return (
    <div
  id="report-section"
  className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-6 animate-slide-up`}
>
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Gauge */}
        <div className="flex flex-col items-center md:items-start">
          <RiskGauge probability={probability} risk_level={risk_level} />
          <div className="mt-4 text-center md:text-left">
            <p className="text-xs text-slate-500 font-medium">Best Model Used</p>
            <p className="text-sm font-bold text-slate-700">{model_used}</p>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <cfg.icon className={`w-5 h-5 ${cfg.text}`} />
            <h2 className={`text-lg font-bold ${cfg.text}`}>{label}</h2>
          </div>

          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Recommendations
            </h4>
            <ul className="space-y-1.5">
              {recommendations[risk_level].map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.text.replace('text','bg')}`} />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-white/70 border border-white">
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              This prediction is for informational purposes only. Always consult a qualified healthcare professional.
            </p>
          </div>
        </div>
      </div>

      {/* SHAP */}
      {shap && !shap.error && (
        <div className="mt-6 pt-6 border-t border-white/60">
          <ShapChart shapData={shap} />
        </div>
      )}

      <div className="mt-4 flex justify-center">
  <button
    onClick={downloadReport}
    className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
  >
    Download Report
  </button>
</div>

      {/* Model Comparison */}
      {model_results && model_results.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/60">
          <ModelComparison modelResults={model_results} />
        </div>
      )}
    </div>
  )
}
