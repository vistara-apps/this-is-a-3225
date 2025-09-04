import React from 'react'
import { useUser } from '../contexts/UserContext'
import { 
  TrendingUp, 
  Zap, 
  Target, 
  BarChart3,
  Plus,
  Play,
  Pause,
  Eye,
  Heart,
  Share
} from 'lucide-react'

export const Dashboard = () => {
  const { user, ads } = useUser()

  const totalViews = ads.reduce((sum, ad) => sum + ad.performanceMetrics.views, 0)
  const totalLikes = ads.reduce((sum, ad) => sum + ad.performanceMetrics.likes, 0)
  const averageCTR = ads.reduce((sum, ad) => sum + ad.performanceMetrics.ctr, 0) / ads.length

  const stats = [
    {
      name: 'Total Views',
      value: totalViews.toLocaleString(),
      change: '+12.5%',
      changeType: 'positive',
      icon: Eye
    },
    {
      name: 'Total Likes',
      value: totalLikes.toLocaleString(),
      change: '+8.2%',
      changeType: 'positive',
      icon: Heart
    },
    {
      name: 'Avg. CTR',
      value: `${averageCTR.toFixed(1)}%`,
      change: '+2.1%',
      changeType: 'positive',
      icon: Target
    },
    {
      name: 'Active Ads',
      value: ads.filter(ad => ad.status === 'active').length.toString(),
      change: '+1',
      changeType: 'positive',
      icon: BarChart3
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Welcome back! 👋
            </h2>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your ads today.
            </p>
          </div>
          <button className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create New Ad</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-success' : 'text-error'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-600 ml-2">from last week</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Ads */}
      <div className="bg-white rounded-lg shadow-card">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Ad Variations</h3>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">
              View All
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {ads.slice(0, 3).map((ad) => (
              <div key={ad.adID} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Ad Image */}
                <div className="aspect-w-16 aspect-h-20 bg-gray-100">
                  <img
                    src={ad.productImageURL}
                    alt="Ad preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
                
                {/* Ad Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ad.status === 'active' 
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {ad.status}
                    </span>
                    <span className="text-xs text-gray-500 uppercase">
                      {ad.platform}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-900 font-medium mb-3 line-clamp-2">
                    {ad.caption}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                    <div className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {ad.performanceMetrics.views.toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      <Heart className="w-3 h-3 mr-1" />
                      {ad.performanceMetrics.likes.toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {ad.performanceMetrics.ctr}%
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                    <button className="text-primary hover:text-primary/80 text-xs font-medium">
                      Remix
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-xs font-medium">
                      {ad.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center mb-4">
            <Zap className="w-6 h-6 text-primary mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">AI Suggestions</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-primary/5 rounded-md">
              <p className="text-sm font-medium text-gray-900">Try a new caption style</p>
              <p className="text-xs text-gray-600 mt-1">Your current emotional tone could be more engaging</p>
            </div>
            <div className="p-3 bg-secondary/5 rounded-md">
              <p className="text-sm font-medium text-gray-900">Optimize posting time</p>
              <p className="text-xs text-gray-600 mt-1">Post between 2-4 PM for 23% higher engagement</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-center mb-4">
            <Target className="w-6 h-6 text-accent mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Performance Insights</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Best performing platform</span>
              <span className="text-sm font-medium text-gray-900">TikTok</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Top audience age</span>
              <span className="text-sm font-medium text-gray-900">18-25</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Best posting day</span>
              <span className="text-sm font-medium text-gray-900">Tuesday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}