import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(() => localStorage.getItem('medpredict_token'))
  const [loading, setLoading] = useState(true)

  // Attach token to every request
  useEffect(() => {
    if (token) {
  axios.defaults.baseURL = 'https://multi-disease-prediction-shap.onrender.com'
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Verify token still valid
      axios.get('/api/auth/me')
        .then(r => setUser(r.data))
        .catch(() => { logout() })
        .finally(() => setLoading(false))
    }else {

  axios.defaults.baseURL = 'https://multi-disease-prediction-shap.onrender.com'

  delete axios.defaults.headers.common['Authorization']
  setLoading(false)
}
  }, [token])

  const login = async (email, password) => {
  const { data } = await axios.post('/api/auth/login', { email, password })

  localStorage.setItem('medpredict_token', data.token)

  axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

  const userRes = await axios.get('/api/auth/me')

  setToken(data.token)
  setUser(userRes.data)

  return data
 }

  const register = async (name, email, password) => {
  const { data } = await axios.post('/api/auth/register', { name, email, password })

  localStorage.setItem('medpredict_token', data.token)

  axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

  const userRes = await axios.get('/api/auth/me')

  setToken(data.token)
  setUser(userRes.data)

  return data
 }

  const logout = () => {
    localStorage.removeItem('medpredict_token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
