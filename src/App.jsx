import React, { useState } from 'react'
import { AppShell } from './components/AppShell'
import { Dashboard } from './components/Dashboard'
import { AdVariations } from './components/AdVariations'
import { Analytics } from './components/Analytics'
import { AuthEntry } from './components/AuthEntry'
import { UserProvider } from './contexts/UserContext'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <AuthEntry onAuthenticated={() => setIsAuthenticated(true)} />
  }

  return (
    <UserProvider>
      <AppShell currentView={currentView} onViewChange={setCurrentView}>
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'variations' && <AdVariations />}
        {currentView === 'analytics' && <Analytics />}
      </AppShell>
    </UserProvider>
  )
}

export default App