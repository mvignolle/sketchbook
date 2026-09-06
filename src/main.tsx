import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { getOrCreateSession } from './services/supabase/sessionManager'
import { migrateLocalStorageToSupabase } from './services/storage/migrationService'

async function initializeApp() {
  try {
    // Initialize session (Supabase or localStorage)
    const sessionId = await getOrCreateSession()
    console.log('Session initialized:', sessionId)

    // Run migration if using Supabase
    if (import.meta.env.VITE_USE_SUPABASE === 'true') {
      const migration = await migrateLocalStorageToSupabase()
      console.log('Migration result:', migration)
    }
  } catch (err) {
    console.error('Failed to initialize app:', err)
    // Continue anyway - app will work with localStorage fallback
  }

  // Render app
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

initializeApp()
