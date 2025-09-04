import React from 'react'
import { 
  Home, 
  Shuffle, 
  BarChart3, 
  Settings, 
  User,
  Zap,
  Crown
} from 'lucide-react'

export const AppShell = ({ children, currentView, onViewChange }) => {
  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'variations', label: 'Ad Variations', icon: Shuffle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white shadow-card">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold gradient-text">AdApe</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                      currentView === item.id
                        ? 'bg-primary/10 text-primary border-r-2 border-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        currentView === item.id ? 'text-primary' : 'text-gray-400'
                      }`}
                    />
                    {item.label}
                  </button>
                )
              })}
            </nav>

            {/* Upgrade Banner */}
            <div className="p-4">
              <div className="bg-gradient-primary rounded-lg p-4 text-white text-sm">
                <div className="flex items-center mb-2">
                  <Crown className="w-4 h-4 mr-2" />
                  <span className="font-medium">Pro Plan</span>
                </div>
                <p className="text-white/90 mb-3">Unlimited variations & remixes</p>
                <button className="w-full bg-white text-primary px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-semibold text-gray-900 capitalize">
                  {currentView.replace('-', ' ')}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {navigation.slice(0, 4).map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                  currentView === item.id ? 'text-primary' : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}