import { useState, useEffect } from 'react'
import axios from 'axios'
import { History as HistoryIcon, Droplets, Heart, Activity, Layers, Search, Filter } from 'lucide-react'

const DISEASE_CONFIG = {
  diabetes: { color: '#3b82f6', icon: Droplets,  label: 'Diabetes'       },
  heart:    { color: '#e63946', icon: Heart,      label: 'Heart Disease'  },
  kidney:   { color: '#2ec4b6', icon: Activity,   label: 'Kidney Disease' },
  combined: { color: '#7c3aed', icon: Layers,     label: 'Combined'       },
}
const RISK_COLOR = { low: '#06d6a0', medium: '#f59e0b', high: '#e63946' }

export default function History() {
  const [history,  setHistory]  = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')   // all | diabetes | heart | kidney | combined
  const [riskFilt, setRiskFilt] = useState('all')   // all | low | medium | high
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    axios.get('/api/dashboard/history?limit=100')
      .then(r => {const safeData = Array.isArray(r.data) ? r.data : [] 
        setHistory(safeData) 
        setFiltered(safeData) 
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let data = history
    if (filter !== 'all')   data = data.filter(p => p.disease === filter)
    if (riskFilt !== 'all') data = data.filter(p => p.risk_level === riskFilt)
    if (search.trim())      data = data.filter(p =>
      p.disease.includes(search.toLowerCase()) ||
      p.result?.label?.toLowerCase().includes(search.toLowerCase()) ||
      p.model_used?.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(data)
  }, [search, filter, riskFilt, history])

  const fmtDate = iso => new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  if (loading) return (
    <div className="page-container space-y-3">
      {[1,2,3,4].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
    </div>
  )

  return (
    <div className="page-container">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-md">
          <HistoryIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="section-title mb-0">Prediction History</h1>
          <p className="text-slate-500 text-sm">{history.length} total predictions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search predictions…" className="input-field pl-10"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Disease Filter */}
          <select className="input-field w-auto"
            value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Diseases</option>
            <option value="diabetes">Diabetes</option>
            <option value="heart">Heart Disease</option>
            <option value="kidney">Kidney Disease</option>
            <option value="combined">Combined</option>
          </select>

          {/* Risk Filter */}
          <select className="input-field w-auto"
            value={riskFilt} onChange={e => setRiskFilt(e.target.value)}>
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Showing {filtered.length} of {history.length} predictions
        </p>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <HistoryIcon className="w-16 h-16 mx-auto mb-4 text-slate-200" />
          <p className="font-semibold text-slate-500">No predictions found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or make some predictions first.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => {
            const cfg  = DISEASE_CONFIG[p.disease] || DISEASE_CONFIG.diabetes
            const Icon = cfg.icon
            const rClr = RISK_COLOR[p.risk_level] || '#94a3b8'
            const isExp = expanded === p.id

            return (
              <div key={p.id} className="card hover:shadow-md transition-shadow">
                <button type="button" className="w-full text-left"
                  onClick={() => setExpanded(isExp ? null : p.id)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background: cfg.color + '20' }}>
                      <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 capitalize">{cfg.label}</span>
                        <span className="badge capitalize text-xs"
                              style={{ background: rClr + '20', color: rClr }}>
                          {p.risk_level} risk
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {p.result?.label || '—'} &nbsp;·&nbsp; {p.model_used} &nbsp;·&nbsp; {fmtDate(p.created_at)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold" style={{ color: rClr }}>
                        {(p.probability * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-slate-400">risk score</p>
                    </div>
                  </div>
                </button>

                {/* Expanded Detail */}
                {isExp && p.input_data && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Input Parameters</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                      {Object.entries(JSON.parse(p.input_data || "{}")).map(([k, v]) => (
                        <div key={k} className="bg-slate-50 rounded-xl px-3 py-2">
                          <p className="text-xs text-slate-400 truncate">{k}</p>
                          <p className="text-sm font-semibold text-slate-700">{typeof v === 'number' ? v.toFixed ? v.toFixed(2) : v : v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
