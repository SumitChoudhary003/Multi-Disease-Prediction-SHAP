import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Heart, Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 px-16 text-white">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-8 shadow-2xl">
          <Heart className="w-10 h-10 text-white" fill="white" />
        </div>
        <h1 className="text-4xl font-extrabold mb-4">Join MedPredict <span className="text-blue-400">AI</span></h1>
        <p className="text-blue-200 text-center max-w-sm text-lg">
          Get personalized, explainable disease risk assessments powered by advanced machine learning.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="mb-7">
              <div className="lg:hidden flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" fill="white" />
                </div>
                <span className="text-xl font-bold text-slate-800">MedPredict AI</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Create your account</h2>
              <p className="text-slate-500 text-sm mt-1">Start your health risk assessment journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" required placeholder="John Doe" className="input-field pl-10"
                    value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
                </div>
              </div>

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
                  <input type={showPwd ? 'text' : 'password'} required placeholder="Min. 6 characters" className="input-field pl-10 pr-10"
                    value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPwd ? 'text' : 'password'} required placeholder="Repeat password" className="input-field pl-10"
                    value={form.confirm} onChange={e => setForm(p => ({...p, confirm: e.target.value}))} />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-3 text-base mt-2">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account…</>
                  : <><UserPlus className="w-4 h-4" /> Create Account</>}
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
