import React, { useState } from 'react'
import { useUser } from '../contexts/UserContext'
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  Share, 
  Target,
  Calendar,
  Filter,
  Download
} from 'lucide-react'

export const Analytics = () => {
  const { ads } = useUser()
  const [timeRange, setTimeRange] = useState('7d')
  const [platform, setPlatform] = useState('all')

  const filteredAds = ads.filter(ad => {
    if (platform === 'all') return true
    return ad.platform === platform
  })

  const totalViews = filteredAds.reduce((sum, ad) => sum + ad.performanceMetrics.views, 0)
  const totalLikes = filteredAds.reduce((sum, ad) => sum + ad.performanceMetrics.likes, 0)
  const totalShares = filteredAds.reduce((sum, ad) => sum + ad.performanceMetrics.shares, 0)
  const averageCTR = filteredAds.reduce((sum, ad) => sum + ad.performanceMetrics.ctr, 0) / filteredAds.length

  const performanceData = [
    {
      metric: 'Total Views',
      value: totalViews.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: Eye,
      color: 'primary'
    },
    {
      metric: 'Total Likes',
      value: totalLikes.toLocaleString(),
      change: '+8.2%',
      trend: 'up',
      icon: Heart,
      color: 'error'
    },
    {
      metric: 'Total Shares',
      value: totalShares.toLocaleString(),
      change: '+15.1%',
      trend: 'up',
      icon: Share,
      color: 'secondary'
    },
    {
      metric: 'Average CTR',
      value: `${averageCTR.toFixed(1)}%`,
      change: '+2.1%',
      trend: 'up',
      icon: Target,
      color: 'accent'
    }
  ]

  // Mock chart data
  const chartData = [
    { day: 'Mon', views: 2400, likes: 180, shares: 12 },
    { day: 'Tue', views: 1398, likes: 120, shares: 8 },
    { day: 'Wed', views: 9800, likes: 450, shares: 28 },
    { day: 'Thu', views: 3908, likes: 280, shares: 18 },
    { day: 'Fri', views: 4800, likes: 320, shares: 22 },
    { day: 'Sat', views: 3800, likes: 250, shares: 15 },
    { day: 'Sun', views: 4300, likes: 290, shares: 19 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Analytics</h2>
          <p className="text-gray-600 mt-1">Track your ad performance and optimize for better results</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            >
              <option value="all">All Platforms</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceData.map((item, index) => {
          const Icon = item.icon
          const TrendIcon = item.trend === 'up' ? TrendingUp : TrendingDown
          
          return (
            <div key={index} className="bg-white rounded-lg shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${item.color}/10`}>
                  <Icon className={`w-6 h-6 text-${item.color}`} />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  item.trend === 'up' ? 'text-success' : 'text-error'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  <span>{item.change}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{item.metric}</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{item.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-gray-600">Views</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-error rounded-full"></div>
              <span className="text-gray-600">Likes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-secondary rounded-full"></div>
              <span className="text-gray-600">Shares</span>
            </div>
          </div>
        </div>
        
        {/* Simple Chart Visualization */}
        <div className="space-y-4">
          {chartData.map((day, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-10 text-sm text-gray-600 font-medium">{day.day}</div>
              <div className="flex-1 flex space-x-2">
                <div className="flex-1 bg-gray-100 rounded-full h-3 relative overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(day.views / 10000) * 100}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                    {day.views.toLocaleString()}
                  </div>
                </div>
                <div className="w-20 bg-gray-100 rounded-full h-3 relative overflow-hidden">
                  <div 
                    className="h-full bg-error rounded-full transition-all duration-500"
                    style={{ width: `${(day.likes / 500) * 100}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                    {day.likes}
                  </div>
                </div>
                <div className="w-16 bg-gray-100 rounded-full h-3 relative overflow-hidden">
                  <div 
                    className="h-full bg-secondary rounded-full transition-all duration-500"
                    style={{ width: `${(day.shares / 30) * 100}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                    {day.shares}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Ads */}
      <div className="bg-white rounded-lg shadow-card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Ads</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {filteredAds
              .sort((a, b) => b.performanceMetrics.views - a.performanceMetrics.views)
              .slice(0, 5)
              .map((ad, index) => (
                <div key={ad.adID} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <img
                      src={ad.productImageURL}
                      alt="Ad preview"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {ad.caption}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                      <span className="uppercase">{ad.platform}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        ad.status === 'active' 
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {ad.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {ad.performanceMetrics.views.toLocaleString()} views
                    </div>
                    <div className="text-sm text-gray-600">
                      {ad.performanceMetrics.ctr}% CTR
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-2xl font-bold text-gray-400">
                    #{index + 1}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Best Performance Day</p>
                <p className="text-sm text-gray-600">Wednesday shows 40% higher engagement rates</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Platform Performance</p>
                <p className="text-sm text-gray-600">TikTok generates 60% more shares than Instagram</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Audience Behavior</p>
                <p className="text-sm text-gray-600">Fashion content peaks between 2-4 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-1">Optimize Caption Length</p>
              <p className="text-sm text-gray-600">Try shorter captions (under 100 characters) for better engagement</p>
            </div>
            <div className="p-4 bg-secondary/5 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-1">Increase Posting Frequency</p>
              <p className="text-sm text-gray-600">Post 2-3 times per day for maximum reach</p>
            </div>
            <div className="p-4 bg-accent/5 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-1">Test New Hashtags</p>
              <p className="text-sm text-gray-600">Add trending hashtags #StyleTransformation #OOTD</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}