/**
 * Ad Generation Hook
 * Custom hook for AI-powered ad generation workflow
 */

import { useState, useCallback } from 'react'
import { openaiService, supabaseService } from '../services'
import { useUser } from '../contexts/UserContext'

export const useAdGeneration = () => {
  const { user, addAd } = useUser()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState('')
  const [error, setError] = useState(null)
  const [generatedVariations, setGeneratedVariations] = useState([])

  /**
   * Generate ad variations from product data
   */
  const generateAdVariations = useCallback(async (productData) => {
    if (!user) {
      setError('User not authenticated')
      return null
    }

    setIsGenerating(true)
    setGenerationProgress(0)
    setGenerationStatus('Initializing...')
    setError(null)
    setGeneratedVariations([])

    try {
      // Step 1: Validate input data
      setGenerationProgress(10)
      setGenerationStatus('Validating input data...')
      
      if (!productData.imageURL || !productData.productName) {
        throw new Error('Product image and name are required')
      }

      // Step 2: Analyze product image
      setGenerationProgress(25)
      setGenerationStatus('Analyzing product image...')
      
      const imageAnalysis = await openaiService.analyzeImage(productData.imageURL)
      
      // Step 3: Generate ad variations
      setGenerationProgress(50)
      setGenerationStatus('Generating ad variations...')
      
      const enhancedProductData = {
        ...productData,
        imageAnalysis,
        targetAudience: productData.targetAudience || imageAnalysis.targetAudience
      }

      const variations = await openaiService.generateAdVariations(enhancedProductData)
      
      // Step 4: Generate hashtags for each variation
      setGenerationProgress(75)
      setGenerationStatus('Generating hashtags...')
      
      const variationsWithHashtags = await Promise.all(
        variations.map(async (variation) => {
          const hashtags = await openaiService.generateHashtags(
            variation.caption,
            productData.platform || 'tiktok',
            variation.targeting.demographics
          )
          
          return {
            ...variation,
            hashtags,
            productImageURL: productData.imageURL,
            platform: productData.platform || 'tiktok',
            status: 'draft',
            ai_generated: true,
            generation_prompt: `Product: ${productData.productName}, Target: ${enhancedProductData.targetAudience}`
          }
        })
      )

      // Step 5: Save to database (optional - user can choose to save later)
      setGenerationProgress(90)
      setGenerationStatus('Finalizing variations...')
      
      setGeneratedVariations(variationsWithHashtags)
      setGenerationProgress(100)
      setGenerationStatus('Generation complete!')
      
      // Log the generation for analytics
      await logGeneration(productData, variationsWithHashtags, true)
      
      return variationsWithHashtags

    } catch (err) {
      console.error('Ad generation failed:', err)
      setError(err.message || 'Failed to generate ad variations')
      await logGeneration(productData, [], false, err.message)
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [user])

  /**
   * Save generated variations to database
   */
  const saveVariations = useCallback(async (variations, selectedIndices = null) => {
    if (!user || !variations.length) return []

    const variationsToSave = selectedIndices 
      ? selectedIndices.map(index => variations[index])
      : variations

    try {
      const savedAds = []
      
      for (const variation of variationsToSave) {
        const adData = {
          userID: user.userID,
          productImageURL: variation.productImageURL,
          caption: variation.caption,
          targetingOptions: variation.targeting,
          platform: variation.platform,
          status: 'draft',
          ai_generated: true,
          generation_prompt: variation.generation_prompt,
          metadata: {
            hashtags: variation.hashtags,
            tone: variation.tone,
            callToAction: variation.callToAction,
            bestPostingTime: variation.bestPostingTime,
            expectedPerformance: variation.expectedPerformance
          }
        }

        // Save to database
        const savedAd = await supabaseService.createAd(adData, user.token)
        
        // Add to local state
        addAd(savedAd)
        savedAds.push(savedAd)
      }

      return savedAds
    } catch (err) {
      console.error('Failed to save variations:', err)
      setError('Failed to save variations to database')
      return []
    }
  }, [user, addAd])

  /**
   * Generate single ad variation (for remixing)
   */
  const generateSingleVariation = useCallback(async (baseAd, remixOptions = {}) => {
    if (!user) {
      setError('User not authenticated')
      return null
    }

    setIsGenerating(true)
    setError(null)

    try {
      const productData = {
        imageURL: baseAd.productImageURL,
        productName: remixOptions.productName || 'Product',
        description: remixOptions.description || baseAd.caption,
        targetAudience: remixOptions.targetAudience || baseAd.targetingOptions.demographics,
        platform: baseAd.platform,
        existingCaption: baseAd.caption,
        performanceData: baseAd.performanceMetrics
      }

      const variations = await openaiService.generateAdVariations(productData)
      
      if (variations && variations.length > 0) {
        const newVariation = {
          ...variations[0],
          productImageURL: baseAd.productImageURL,
          platform: baseAd.platform,
          status: 'draft',
          ai_generated: true,
          generation_prompt: `Remix of ad ${baseAd.adID}`
        }

        return newVariation
      }

      return null
    } catch (err) {
      console.error('Single variation generation failed:', err)
      setError(err.message || 'Failed to generate variation')
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [user])

  /**
   * Get generation suggestions based on performance data
   */
  const getGenerationSuggestions = useCallback(async (performanceData, adData) => {
    try {
      const suggestions = await openaiService.generateRemixSuggestions(adData, performanceData)
      return suggestions
    } catch (err) {
      console.error('Failed to get suggestions:', err)
      return null
    }
  }, [])

  /**
   * Log generation attempt for analytics
   */
  const logGeneration = useCallback(async (inputData, outputData, success, errorMessage = null) => {
    if (!user) return

    try {
      const logData = {
        user_id: user.userID,
        request_type: 'variation_generation',
        input_data: inputData,
        output_data: outputData,
        success,
        error_message: errorMessage,
        tokens_used: outputData.length * 100, // Rough estimate
        model_used: 'gpt-4-turbo-preview'
      }

      // This would be logged to the database
      console.log('Generation log:', logData)
    } catch (err) {
      console.error('Failed to log generation:', err)
    }
  }, [user])

  /**
   * Clear generation state
   */
  const clearGeneration = useCallback(() => {
    setGeneratedVariations([])
    setError(null)
    setGenerationProgress(0)
    setGenerationStatus('')
  }, [])

  /**
   * Check if user can generate more ads (subscription limits)
   */
  const canGenerateAds = useCallback(async () => {
    if (!user) return false

    try {
      // This would check against subscription limits
      const usage = await supabaseService.getSubscriptionUsage(user.userID, user.token)
      const limits = getSubscriptionLimits(user.subscriptionTier)
      
      return usage.ads_created_this_month < limits.ads_per_month
    } catch (err) {
      console.error('Failed to check generation limits:', err)
      return false
    }
  }, [user])

  /**
   * Get subscription limits based on tier
   */
  const getSubscriptionLimits = (tier) => {
    const limits = {
      free: { ads_per_month: 5, variations_per_ad: 3 },
      pro: { ads_per_month: 50, variations_per_ad: 10 },
      enterprise: { ads_per_month: -1, variations_per_ad: -1 }
    }
    return limits[tier] || limits.free
  }

  return {
    // State
    isGenerating,
    generationProgress,
    generationStatus,
    error,
    generatedVariations,
    
    // Actions
    generateAdVariations,
    saveVariations,
    generateSingleVariation,
    getGenerationSuggestions,
    clearGeneration,
    canGenerateAds,
    
    // Utils
    getSubscriptionLimits
  }
}
