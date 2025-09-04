import React, { useState } from 'react'
import { Zap, Mail, Lock } from 'lucide-react'

export const AuthEntry = ({ onAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulate authentication
    setTimeout(() => {
      onAuthenticated()
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-card p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold gradient-text">AdApe</h1>
          <p className="text-gray-600 mt-2">AI-powered ad remixing & growth hacking</p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-primary text-white py-3 px-4 rounded-md font-medium hover:opacity-90 transition-opacity"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
              Generate 3-5 ad variations instantly
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
              AI-powered remixing & optimization
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
              Auto-post to TikTok & Instagram
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}