import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import {
  LayoutDashboard, Droplets, Heart, Activity, Layers,
  TrendingUp, AlertTriangle, CheckCircle, Clock, ArrowRight
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'

const DISEASE_CONFIG = {
  diabetes: { color: '#3b82f6', icon: Droplets,  label: 'Diabetes',       path: '/predict/diabetes' },
  heart:    { color: '#e63946', icon: Heart,      label: 'Heart Disease',  path: '/predict/heart'   },
  kidney:   { color: '#2ec4b6', icon: Activity,   label: 'Kidney Disease', path: '/predict/kidney'  },
  combined: { color: '#7c3aed', icon: Layers,     label: 'Combined',       path: '/predict/combined'},
}

const RISK_COLORS = { low: '#06d6a0', medium: '#f59e0b', high: '#e63946' }

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '20' }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats,   setStats]   = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/dashboard/stats'),
      axios.get('/api/dashboard/history?limit=5')
    ]).then(([s, h]) => {
      setStats(s.data || {})
      setHistory(Array.isArray(h.data) ? h.data : [])
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const pieData = stats ?.by_risk?Object.entries(stats.by_risk).map(([k, v]) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1), value: v, color: RISK_COLORS[k]
  })).filter(d => d.value > 0) : []

  const trendData = stats?.recent_trend?.map(t => ({
    date: t.date, risk: +t.risk.toFixed(1), disease: t.disease
  })) || []

  const quickActions = [
    { ...DISEASE_CONFIG.diabetes, bg: 'from-blue-50 to-blue-100',   border: 'border-blue-200'   },
    { ...DISEASE_CONFIG.heart,    bg: 'from-red-50 to-red-100',     border: 'border-red-200'    },
    { ...DISEASE_CONFIG.kidney,   bg: 'from-teal-50 to-teal-100',   border: 'border-teal-200'   },
    { ...DISEASE_CONFIG.combined, bg: 'from-purple-50 to-purple-100',border: 'border-purple-200' },
  ]

  if (loading) return (
    <div className="page-container">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-24" />)}
      </div>
    </div>
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'User'} 👋
        </h1>
        <p className="section-subtitle">Here's your health prediction overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Predictions" value={stats?.total || 0} icon={LayoutDashboard} color="#3b82f6" />
        <StatCard label="High Risk" value={stats?.by_risk?.high || 0} icon={AlertTriangle} color="#e63946" />
        <StatCard label="Medium Risk" value={stats?.by_risk?.medium || 0} icon={Clock} color="#f59e0b" />
        <StatCard label="Low Risk" value={stats?.by_risk?.low || 0} icon={CheckCircle} color="#06d6a0" />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-700 mb-4">Quick Predict</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ color, icon: Icon, label, path, bg, border }) => (
            <Link key={path} to={path}
              className={`card-hover bg-gradient-to-br ${bg} border ${border} group`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: color + '20' }}>
                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color }} />
              </div>
              <p className="font-semibold text-slate-700 text-sm">{label}</p>
              <div className="flex items-center gap-1 text-xs mt-1" style={{ color }}>
                <span>Predict now</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Risk Distribution Pie */}
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Risk Distribution
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                     paddingAngle={4} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '12px' }} />
                <Legend formatter={(v, e) => <span className="text-xs text-slate-600">{v}: {e.payload.value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              No predictions yet. Start predicting!
            </div>
          )}
        </div>

        {/* Risk Trend Line */}
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-500" /> Recent Risk Trend
          </h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                <Tooltip formatter={v => [`${v}%`, 'Risk']}
                         contentStyle={{ borderRadius: '10px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="risk" stroke="#3b82f6" strokeWidth={2}
                      dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              No trend data available yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Predictions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700">Recent Predictions</h3>
          <Link to="/history" className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {history.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <LayoutDashboard className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No predictions yet</p>
            <p className="text-sm mt-1">Start with one of the quick predict options above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(p => {
              const cfg  = DISEASE_CONFIG[p.disease] || DISEASE_CONFIG.diabetes
              const Icon = cfg.icon
              const rClr = RISK_COLORS[p.risk_level] || '#94a3b8'
              return (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                       style={{ background: cfg.color + '20' }}>
                    <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 capitalize">{p.disease} Disease</p>
                    <p className="text-xs text-slate-500">{p.result?.label || '—'} · {p.model_used}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="badge text-xs font-semibold px-2 py-1 rounded-full"
                          style={{ background: rClr + '20', color: rClr }}>
                      {p.risk_level}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
