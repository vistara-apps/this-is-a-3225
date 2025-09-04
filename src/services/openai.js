/**
 * OpenAI API Service
 * Handles AI-powered ad generation and remixing
 */

import { apiRequest, RateLimiter, ResponseCache, getEnvVar, validateRequiredFields } from '../utils/api.js'

class OpenAIService {
  constructor() {
    this.apiKey = getEnvVar('VITE_OPENAI_API_KEY')
    this.baseURL = 'https://api.openai.com/v1'
    this.rateLimiter = new RateLimiter(50, 60000) // 50 requests per minute
    this.cache = new ResponseCache(600000) // 10 minutes cache
  }

  /**
   * Generate ad variations from product image and description
   */
  async generateAdVariations(productData) {
    validateRequiredFields(productData, ['imageURL', 'productName'])
    
    await this.rateLimiter.checkLimit()

    const cacheKey = `variations_${JSON.stringify(productData)}`
    const cached = this.cache.get(cacheKey)
    if (cached) return cached

    const prompt = this.buildVariationPrompt(productData)
    
    const response = await apiRequest(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert social media marketer specializing in TikTok and Instagram ads. Generate engaging, conversion-focused ad variations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    })

    const variations = this.parseVariationsResponse(response)
    this.cache.set(cacheKey, variations)
    
    return variations
  }

  /**
   * Generate remix suggestions for existing ad
   */
  async generateRemixSuggestions(adData, performanceData) {
    validateRequiredFields(adData, ['caption', 'targetingOptions'])
    
    await this.rateLimiter.checkLimit()

    const prompt = this.buildRemixPrompt(adData, performanceData)
    
    const response = await apiRequest(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an AI optimization expert. Analyze ad performance and suggest data-driven improvements.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })
    })

    return this.parseRemixResponse(response)
  }

  /**
   * Analyze image for ad generation context
   */
  async analyzeImage(imageURL) {
    await this.rateLimiter.checkLimit()

    const response = await apiRequest(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this product image and describe: 1) Product type and features, 2) Target audience, 3) Key selling points, 4) Visual style and mood. Return as JSON.'
              },
              {
                type: 'image_url',
                image_url: { url: imageURL }
              }
            ]
          }
        ],
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    })

    return JSON.parse(response.choices[0].message.content)
  }

  /**
   * Generate hashtags for social media posts
   */
  async generateHashtags(content, platform, targetAudience) {
    await this.rateLimiter.checkLimit()

    const prompt = `Generate 15-20 relevant hashtags for a ${platform} post about: "${content}". Target audience: ${targetAudience}. Mix popular and niche hashtags. Return as JSON array.`
    
    const response = await apiRequest(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      })
    })

    return JSON.parse(response.choices[0].message.content).hashtags
  }

  /**
   * Build prompt for ad variations
   */
  buildVariationPrompt(productData) {
    return `Generate 5 different ad variations for this product:

Product: ${productData.productName}
Description: ${productData.description || 'Not provided'}
Target Audience: ${productData.targetAudience || 'General audience'}
Platform: ${productData.platform || 'TikTok and Instagram'}

For each variation, provide:
1. A compelling caption (max 150 characters)
2. Targeting options (age range, interests, demographics)
3. Call-to-action
4. Tone/style (e.g., playful, urgent, educational)
5. Best posting time recommendation

Return as JSON with this structure:
{
  "variations": [
    {
      "id": 1,
      "caption": "...",
      "targeting": {
        "ageRange": "18-35",
        "interests": ["fashion", "lifestyle"],
        "demographics": "urban millennials"
      },
      "callToAction": "Shop Now",
      "tone": "playful",
      "bestPostingTime": "7-9 PM",
      "expectedPerformance": {
        "estimatedCTR": 3.2,
        "estimatedEngagement": "high"
      }
    }
  ]
}`
  }

  /**
   * Build prompt for remix suggestions
   */
  buildRemixPrompt(adData, performanceData) {
    return `Analyze this ad's performance and suggest improvements:

Current Ad:
- Caption: "${adData.caption}"
- Targeting: ${JSON.stringify(adData.targetingOptions)}
- Platform: ${adData.platform}

Performance Data:
- Views: ${performanceData.views}
- Likes: ${performanceData.likes}
- Shares: ${performanceData.shares}
- CTR: ${performanceData.ctr}%

Suggest 3 remix variations that could improve performance. Consider:
1. Caption optimization
2. Targeting refinements
3. Timing adjustments
4. Creative modifications

Return as JSON with specific, actionable suggestions.`
  }

  /**
   * Parse variations response from OpenAI
   */
  parseVariationsResponse(response) {
    try {
      const content = response.choices[0].message.content
      const parsed = JSON.parse(content)
      
      return parsed.variations.map(variation => ({
        ...variation,
        id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        source: 'ai_generated'
      }))
    } catch (error) {
      throw new Error(`Failed to parse OpenAI response: ${error.message}`)
    }
  }

  /**
   * Parse remix response from OpenAI
   */
  parseRemixResponse(response) {
    try {
      const content = response.choices[0].message.content
      return JSON.parse(content)
    } catch (error) {
      throw new Error(`Failed to parse remix response: ${error.message}`)
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats() {
    // This would typically call OpenAI's usage endpoint
    // For now, return mock data
    return {
      tokensUsed: 0,
      requestsToday: 0,
      remainingQuota: 1000000
    }
  }
}

export default new OpenAIService()
