import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Heart, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 px-16 text-white">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-8 shadow-2xl">
          <Heart className="w-10 h-10 text-white" fill="white" />
        </div>
        <h1 className="text-4xl font-extrabold mb-4 text-center leading-tight">
          MedPredict <span className="text-blue-400">AI</span>
        </h1>
        <p className="text-blue-200 text-center max-w-sm text-lg">
          Explainable AI-powered multi-disease risk prediction for smarter healthcare decisions.
        </p>
        <div className="mt-10 space-y-4 w-full max-w-xs">
          {['Diabetes Risk Assessment', 'Heart Disease Prediction', 'Kidney Disease Detection', 'SHAP Explanations'].map(f => (
            <div key={f} className="flex items-center gap-3 text-blue-200 text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="mb-8">
              <div className="lg:hidden flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" fill="white" />
                </div>
                <span className="text-xl font-bold text-slate-800">MedPredict AI</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
              <p className="text-slate-500 mt-1 text-sm">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" required placeholder="you@example.com" className="input-field pl-10"
                    value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPwd ? 'text' : 'password'} required placeholder="••••••••" className="input-field pl-10 pr-10"
                    value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-3 text-base">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                  : <><LogIn className="w-4 h-4" /> Sign In</>}
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
