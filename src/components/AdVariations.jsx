import React, { useState } from 'react'
import { useUser } from '../contexts/UserContext'
import { 
  Plus, 
  Upload, 
  Wand2, 
  Eye, 
  Heart, 
  Share, 
  TrendingUp,
  Edit3,
  Copy,
  Play,
  Pause,
  Settings,
  Shuffle
} from 'lucide-react'

export const AdVariations = () => {
  const { ads, addAd, updateAd, remixAd } = useUser()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRemixModal, setShowRemixModal] = useState(false)
  const [selectedAd, setSelectedAd] = useState(null)
  const [filter, setFilter] = useState('all')

  const filteredAds = ads.filter(ad => {
    if (filter === 'all') return true
    return ad.status === filter
  })

  const handleRemix = (ad) => {
    setSelectedAd(ad)
    setShowRemixModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Ad Variations</h2>
          <p className="text-gray-600 mt-1">Create, manage and optimize your ad variations</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center space-x-2 w-fit"
        >
          <Plus className="w-5 h-5" />
          <span>Create Variations</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          {['all', 'active', 'testing', 'paused'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Ad Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAds.map((ad) => (
          <AdVariationCard
            key={ad.adID}
            ad={ad}
            onRemix={() => handleRemix(ad)}
            onStatusToggle={() => {
              const newStatus = ad.status === 'active' ? 'paused' : 'active'
              updateAd(ad.adID, { status: newStatus })
            }}
          />
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateAdModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(newAd) => {
            addAd(newAd)
            setShowCreateModal(false)
          }}
        />
      )}

      {/* Remix Modal */}
      {showRemixModal && selectedAd && (
        <RemixAdModal
          ad={selectedAd}
          onClose={() => setShowRemixModal(false)}
          onRemix={(remixData) => {
            remixAd(selectedAd.adID, remixData)
            setShowRemixModal(false)
          }}
        />
      )}
    </div>
  )
}

const AdVariationCard = ({ ad, onRemix, onStatusToggle }) => {
  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="aspect-w-16 aspect-h-20 bg-gray-100 relative">
        <img
          src={ad.productImageURL}
          alt="Ad preview"
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            ad.status === 'active' 
              ? 'bg-success/90 text-white'
              : ad.status === 'testing'
              ? 'bg-warning/90 text-white'
              : 'bg-gray-500/90 text-white'
          }`}>
            {ad.status}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 px-2 py-1 rounded-full text-xs font-medium text-gray-700 uppercase">
            {ad.platform}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Caption */}
        <p className="text-sm text-gray-900 font-medium line-clamp-2">
          {ad.caption}
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-600 mb-1">
              <Eye className="w-4 h-4 mr-1" />
              <span className="text-xs">Views</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {ad.performanceMetrics.views.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-600 mb-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-xs">CTR</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {ad.performanceMetrics.ctr}%
            </p>
          </div>
        </div>

        {/* Engagement */}
        <div className="flex justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Heart className="w-4 h-4 mr-1" />
            {ad.performanceMetrics.likes.toLocaleString()}
          </div>
          <div className="flex items-center">
            <Share className="w-4 h-4 mr-1" />
            {ad.performanceMetrics.shares.toLocaleString()}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={onRemix}
            className="flex-1 bg-primary/10 text-primary px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center space-x-1"
          >
            <Shuffle className="w-4 h-4" />
            <span>Remix</span>
          </button>
          <button
            onClick={onStatusToggle}
            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
          >
            {ad.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{ad.status === 'active' ? 'Pause' : 'Resume'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const CreateAdModal = ({ onClose, onCreate }) => {
  const [productImage, setProductImage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVariations, setGeneratedVariations] = useState([])

  const handleGenerate = async () => {
    if (!productImage) return
    
    setIsGenerating(true)
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockVariations = [
      {
        caption: 'Transform your style with our premium collection ✨ #fashion #style',
        platform: 'tiktok',
        targetingOptions: { age: '18-35', interests: ['fashion', 'lifestyle'] }
      },
      {
        caption: 'Discover the perfect look for every occasion 🌟',
        platform: 'instagram',
        targetingOptions: { age: '20-40', interests: ['fashion', 'shopping'] }
      },
      {
        caption: 'Elevate your wardrobe game! Premium quality, unbeatable style 💫',
        platform: 'tiktok',
        targetingOptions: { age: '18-28', interests: ['fashion', 'trends'] }
      }
    ]
    
    setGeneratedVariations(mockVariations)
    setIsGenerating(false)
  }

  const handleCreateVariation = (variation) => {
    onCreate({
      productImageURL: productImage,
      caption: variation.caption,
      platform: variation.platform,
      targetingOptions: variation.targetingOptions,
      performanceMetrics: { views: 0, likes: 0, shares: 0, ctr: 0 },
      remixHistory: [],
      status: 'testing'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-popover max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create Ad Variations</h3>
          <p className="text-sm text-gray-600 mt-1">Upload a product image and let AI generate variations</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image URL
            </label>
            <input
              type="url"
              value={productImage}
              onChange={(e) => setProductImage(e.target.value)}
              placeholder="https://example.com/product-image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!productImage || isGenerating}
            className="w-full bg-gradient-primary text-white px-4 py-3 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Wand2 className="w-5 h-5" />
            <span>{isGenerating ? 'Generating...' : 'Generate Variations'}</span>
          </button>

          {/* Generated Variations */}
          {generatedVariations.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Generated Variations</h4>
              {generatedVariations.map((variation, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-medium text-gray-600 uppercase">
                      {variation.platform}
                    </span>
                    <button
                      onClick={() => handleCreateVariation(variation)}
                      className="bg-primary text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Create
                    </button>
                  </div>
                  <p className="text-sm text-gray-900 mb-2">{variation.caption}</p>
                  <div className="text-xs text-gray-600">
                    Target: {variation.targetingOptions.age}, {variation.targetingOptions.interests.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

const RemixAdModal = ({ ad, onClose, onRemix }) => {
  const [remixType, setRemixType] = useState('caption')
  const [newCaption, setNewCaption] = useState(ad.caption)
  const [isRemixing, setIsRemixing] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  const handleGetSuggestions = async () => {
    setIsRemixing(true)
    
    // Simulate AI suggestions
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const mockSuggestions = [
      'Add emotional hook: "The moment I discovered this..."',
      'Include urgency: "Limited time - transform your style today!"',
      'Use question format: "Ready to level up your wardrobe?"',
      'Add social proof: "Join thousands who already transformed their style"'
    ]
    
    setSuggestions(mockSuggestions)
    setIsRemixing(false)
  }

  const handleRemix = () => {
    onRemix({
      caption: newCaption,
      remixType,
      timestamp: new Date().toISOString()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-popover max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Remix Ad</h3>
          <p className="text-sm text-gray-600 mt-1">Use AI to optimize your ad variation</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Remix Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remix Type
            </label>
            <select
              value={remixType}
              onChange={(e) => setRemixType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="caption">Caption Optimization</option>
              <option value="targeting">Targeting Adjustment</option>
              <option value="timing">Posting Time</option>
            </select>
          </div>

          {/* Current Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Caption
            </label>
            <textarea
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* AI Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                AI Suggestions
              </label>
              <button
                onClick={handleGetSuggestions}
                disabled={isRemixing}
                className="text-primary hover:text-primary/80 text-sm font-medium disabled:opacity-50"
              >
                {isRemixing ? 'Generating...' : 'Get Suggestions'}
              </button>
            </div>
            
            {suggestions.length > 0 && (
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setNewCaption(suggestion.replace(/^[^:]+:\s*/, ''))}
                    className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRemix}
            className="px-4 py-2 bg-gradient-primary text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Apply Remix
          </button>
        </div>
      </div>
    </div>
  )
}