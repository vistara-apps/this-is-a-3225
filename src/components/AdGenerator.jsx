/**
 * Ad Generator Component
 * Main interface for AI-powered ad generation
 */

import React, { useState, useRef } from 'react'
import { useAdGeneration } from '../hooks/useAdGeneration'
import { 
  Upload, 
  Wand2, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Image as ImageIcon,
  Target,
  Zap,
  Save,
  Eye,
  TrendingUp
} from 'lucide-react'

export const AdGenerator = ({ onClose, onVariationsGenerated }) => {
  const {
    isGenerating,
    generationProgress,
    generationStatus,
    error,
    generatedVariations,
    generateAdVariations,
    saveVariations,
    clearGeneration,
    canGenerateAds,
    getSubscriptionLimits
  } = useAdGeneration()

  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    targetAudience: '',
    platform: 'tiktok',
    imageURL: '',
    imageFile: null
  })
  
  const [selectedVariations, setSelectedVariations] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef(null)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Create preview URL
      const imageURL = URL.createObjectURL(file)
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imageURL
      }))
    }
  }

  const handleGenerate = async () => {
    if (!formData.productName || !formData.imageURL) {
      return
    }

    const canGenerate = await canGenerateAds()
    if (!canGenerate) {
      alert('You have reached your monthly ad generation limit. Please upgrade your subscription.')
      return
    }

    const result = await generateAdVariations({
      productName: formData.productName,
      description: formData.description,
      targetAudience: formData.targetAudience,
      platform: formData.platform,
      imageURL: formData.imageURL
    })

    if (result && onVariationsGenerated) {
      onVariationsGenerated(result)
    }
  }

  const handleVariationSelect = (index) => {
    setSelectedVariations(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index)
      } else {
        return [...prev, index]
      }
    })
  }

  const handleSaveSelected = async () => {
    if (selectedVariations.length === 0) {
      alert('Please select at least one variation to save')
      return
    }

    const savedAds = await saveVariations(generatedVariations, selectedVariations)
    if (savedAds.length > 0) {
      alert(`Successfully saved ${savedAds.length} ad variations!`)
      onClose?.()
    }
  }

  const handleSaveAll = async () => {
    const savedAds = await saveVariations(generatedVariations)
    if (savedAds.length > 0) {
      alert(`Successfully saved all ${savedAds.length} ad variations!`)
      onClose?.()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">AI Ad Generator</h2>
                <p className="text-gray-600">Create multiple ad variations with AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {!generatedVariations.length ? (
            /* Generation Form */
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image *
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.imageURL ? (
                    <div className="space-y-4">
                      <img 
                        src={formData.imageURL} 
                        alt="Product preview" 
                        className="max-w-xs max-h-48 mx-auto rounded-lg object-cover"
                      />
                      <p className="text-sm text-gray-600">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">Upload Product Image</p>
                        <p className="text-sm text-gray-600">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    placeholder="e.g., Premium Wireless Headphones"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Platform
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => handleInputChange('platform', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="both">Both Platforms</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your product's key features and benefits..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  placeholder="e.g., Tech-savvy millennials, fitness enthusiasts"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Generation Progress */}
              {isGenerating && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <span className="font-medium text-gray-900">{generationStatus}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 mt-2">{generationProgress}% complete</div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Generation Failed</h4>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={clearGeneration}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !formData.productName || !formData.imageURL}
                  className="px-6 py-3 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Generate Variations</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Generated Variations */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Generated {generatedVariations.length} Variations
                    </h3>
                    <p className="text-gray-600">Select the variations you want to save</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
                  </button>
                  <button
                    onClick={handleSaveSelected}
                    disabled={selectedVariations.length === 0}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Selected ({selectedVariations.length})</span>
                  </button>
                  <button
                    onClick={handleSaveAll}
                    className="px-4 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save All</span>
                  </button>
                </div>
              </div>

              {/* Variations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedVariations.map((variation, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedVariations.includes(index)
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleVariationSelect(index)}
                  >
                    {showPreview && (
                      <img 
                        src={variation.productImageURL} 
                        alt="Product" 
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-gray-900">Variation {index + 1}</h4>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <TrendingUp className="w-3 h-3" />
                          <span>{variation.expectedPerformance?.estimatedCTR}% CTR</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {variation.caption}
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          {variation.targeting?.ageRange} • {variation.targeting?.demographics}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {variation.hashtags?.slice(0, 3).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {variation.hashtags?.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{variation.hashtags.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Tone:</span> {variation.tone} • 
                        <span className="font-medium"> Best time:</span> {variation.bestPostingTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Back Button */}
              <div className="flex justify-start">
                <button
                  onClick={() => {
                    clearGeneration()
                    setSelectedVariations([])
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Generate New Variations
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
