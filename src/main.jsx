import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { bootstrapDb } from './lib/dbsync'

// Load accounts.json into the local store (dev only) before mounting, so the
// file is authoritative on startup. Always renders, even if the bridge is off.
bootstrapDb().finally(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
