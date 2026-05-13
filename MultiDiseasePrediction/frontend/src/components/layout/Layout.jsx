import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Heart, Activity, Droplets, Layers,
  History, LogOut, Menu, X, ChevronRight, Bell, User
} from 'lucide-react'

const navItems = [
  { path: '/dashboard',          label: 'Dashboard',       icon: LayoutDashboard },
  { path: '/predict/diabetes',   label: 'Diabetes',        icon: Droplets        },
  { path: '/predict/heart',      label: 'Heart Disease',   icon: Heart           },
  { path: '/predict/kidney',     label: 'Kidney Disease',  icon: Activity        },
  { path: '/predict/combined',   label: 'Combined Analysis', icon: Layers        },
  { path: '/history',            label: 'Prediction History', icon: History      },
]

const diseaseColors = {
  '/predict/diabetes': 'text-blue-600',
  '/predict/heart':    'text-red-500',
  '/predict/kidney':   'text-teal-500',
  '/predict/combined': 'text-purple-600',
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden"
             onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100
        flex flex-col transition-transform duration-300 shadow-lg lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-tight">MedPredict AI</h1>
            <p className="text-xs text-slate-500">Disease Risk System</p>
          </div>
          <button className="ml-auto lg:hidden text-slate-400 hover:text-slate-600"
                  onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group
                ${isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
              `}>
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : (diseaseColors[path] || 'text-slate-400')} group-hover:scale-110 transition-transform`} />
                  <span>{label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-blue-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
            </div>
            <button onClick={handleLogout} title="Logout"
              className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <button className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600"
                  onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
