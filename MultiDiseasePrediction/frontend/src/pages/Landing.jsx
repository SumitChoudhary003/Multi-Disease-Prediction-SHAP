import { Link } from 'react-router-dom'
import { Heart, Droplets, Activity, Layers, Shield, Brain, BarChart3,ArrowRight, CheckCircle } from 'lucide-react'

const features = [
  { icon: Brain,   color: 'from-purple-500 to-purple-700', title: 'Explainable AI',       desc: 'SHAP-powered explanations show exactly why a prediction was made.' },
  { icon: Shield,  color: 'from-blue-500 to-blue-700',     title: 'Multi-Model Ensemble', desc: 'Logistic Regression, Random Forest, XGBoost & Decision Tree compared.' },
  { icon: BarChart3,color: 'from-teal-500 to-teal-700',     title: 'Visual Analytics',     desc: 'Rich charts, risk gauges and model performance dashboards.' },
]

const diseases = [
  { icon: Droplets, color: 'from-blue-500 to-cyan-600',   title: 'Diabetes',       desc: 'Pima Indians Dataset · 11 features · 768 samples',        path: '/predict/diabetes' },
  { icon: Heart,    color: 'from-red-500 to-rose-600',    title: 'Heart Disease',  desc: 'UCI Multi-center Dataset · 14 features · 920 samples',    path: '/predict/heart'    },
  { icon: Activity, color: 'from-teal-500 to-emerald-600',title: 'Kidney Disease', desc: 'UCI CKD Dataset · 24 features · 400 samples',             path: '/predict/kidney'   },
  { icon: Layers,   color: 'from-purple-500 to-indigo-600',title: 'Combined',      desc: 'Simultaneous 3-disease risk assessment',                   path: '/predict/combined' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold">MedPredict <span className="text-blue-400">AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login"    className="px-5 py-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-colors font-medium text-sm">Sign In</Link>
          <Link to="/register" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors font-semibold text-sm shadow-lg">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium mb-8">
          <Brain className="w-4 h-4" /> Final Year Major Project · Explainable AI Healthcare
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          Multi-Disease Risk
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Prediction System
          </span>
        </h1>
        <p className="text-lg text-blue-200 max-w-2xl mx-auto mb-10 leading-relaxed">
          AI-powered early detection for Diabetes, Heart Disease & Kidney Disease
          with transparent SHAP explanations and clinical decision support.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/register" className="btn-primary bg-blue-600 hover:bg-blue-500 text-base px-8 py-3 rounded-xl shadow-xl">
            Start Prediction <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/login" className="px-8 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-colors text-base font-medium">
            Sign In
          </Link>
        </div>
      </section>

      {/* Disease Cards */}
      <section className="max-w-6xl mx-auto px-8 py-12">
        <h2 className="text-2xl font-bold text-center mb-8 text-blue-100">Supported Predictions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {diseases.map(({ icon: Icon, color, title, desc, path }) => (
            <Link to="/register" key={title}
              className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-200 hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-white mb-1">{title}</h3>
              <p className="text-xs text-blue-300">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-blue-300">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-8 py-16 text-center">
        <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-white/10 rounded-3xl p-10">
          <h2 className="text-3xl font-bold mb-4">Ready to assess your health risk?</h2>
          <p className="text-blue-200 mb-8">Create a free account to start your personalized disease risk assessment.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-900 rounded-xl font-bold hover:bg-blue-50 transition-colors text-base shadow-xl">
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-blue-400/60 text-sm border-t border-white/5">
        <p>MedPredict AI · Final Year Major Project · Built with React, Flask, XGBoost & SHAP</p>
        <p className="mt-1 text-xs">⚠️ For educational purposes only. Not a substitute for professional medical advice.</p>
      </footer>
    </div>
  )
}
