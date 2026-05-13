import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
          success: { style: { background: '#06d6a0', color: '#fff' } },
          error:   { style: { background: '#e63946', color: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
