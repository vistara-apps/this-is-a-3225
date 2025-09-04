/**
 * Instagram API Service
 * Handles Instagram posting and analytics integration
 */

import { apiRequest, RateLimiter, getEnvVar, validateRequiredFields } from '../utils/api.js'

class InstagramService {
  constructor() {
    this.appId = getEnvVar('VITE_INSTAGRAM_APP_ID')
    this.appSecret = getEnvVar('VITE_INSTAGRAM_APP_SECRET')
    this.baseURL = 'https://graph.facebook.com/v18.0'
    this.rateLimiter = new RateLimiter(200, 3600000) // 200 requests per hour
    this.redirectUri = getEnvVar('VITE_INSTAGRAM_REDIRECT_URI', `${window.location.origin}/auth/instagram/callback`)
  }

  // ============ Authentication ============

  /**
   * Get Instagram OAuth authorization URL
   */
  getAuthorizationURL(state = null) {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      scope: 'instagram_basic,instagram_content_publish',
      response_type: 'code',
      state: state || Math.random().toString(36).substring(7)
    })

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code) {
    validateRequiredFields({ code }, ['code'])

    await this.rateLimiter.checkLimit()

    const response = await apiRequest('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.appId,
        client_secret: this.appSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code: code
      }).toString()
    })

    return {
      accessToken: response.access_token,
      userId: response.user_id
    }
  }

  /**
   * Get long-lived access token
   */
  async getLongLivedToken(shortLivedToken) {
    await this.rateLimiter.checkLimit()

    const params = new URLSearchParams({
      grant_type: 'ig_exchange_token',
      client_secret: this.appSecret,
      access_token: shortLivedToken
    })

    const response = await apiRequest(`${this.baseURL}/access_token?${params.toString()}`, {
      method: 'GET'
    })

    return {
      accessToken: response.access_token,
      tokenType: response.token_type,
      expiresIn: response.expires_in
    }
  }

  /**
   * Refresh long-lived access token
   */
  async refreshAccessToken(accessToken) {
    await this.rateLimiter.checkLimit()

    const params = new URLSearchParams({
      grant_type: 'ig_refresh_token',
      access_token: accessToken
    })

    const response = await apiRequest(`${this.baseURL}/refresh_access_token?${params.toString()}`, {
      method: 'GET'
    })

    return {
      accessToken: response.access_token,
      tokenType: response.token_type,
      expiresIn: response.expires_in
    }
  }

  // ============ User Information ============

  /**
   * Get user profile information
   */
  async getUserInfo(accessToken) {
    await this.rateLimiter.checkLimit()

    const params = new URLSearchParams({
      fields: 'id,username,account_type,media_count',
      access_token: accessToken
    })

    const response = await apiRequest(`${this.baseURL}/me?${params.toString()}`, {
      method: 'GET'
    })

    return response
  }

  // ============ Media Publishing ============

  /**
   * Create media container for image post
   */
  async createImageContainer(userId, accessToken, mediaData) {
    validateRequiredFields(mediaData, ['imageUrl'])

    await this.rateLimiter.checkLimit()

    const params = new URLSearchParams({
      image_url: mediaData.imageUrl,
      caption: mediaData.caption || '',
      access_token: accessToken
    })

    // Add location if provided
    if (mediaData.locationId) {
      params.append('location_id', mediaData.locationId)
    }

    // Add user tags if provided
    if (mediaData.userTags && mediaData.userTags.length > 0) {
      params.append('user_tags', JSON.stringify(mediaData.userTags))
    }

    const response = await apiRequest(`${this.baseURL}/${userId}/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    })

    return response.id
  }

  /**
   * Create media container for video post
   */
  async createVideoContainer(userId, accessToken, mediaData) {
    validateRequiredFields(mediaData, ['videoUrl'])

    await this.rateLimiter.checkLimit()

    const params = new URLSearchParams({
      media_type: 'VIDEO',
      video_url: mediaData.videoUrl,
      caption: mediaData.caption || '',
      access_token: accessToken
    })

    // Add thumbnail if provided
    if (mediaData.thumbnailUrl) {
      params.append('thumb_offset', mediaData.thumbOffset || 0)
    }

    const response = await apiRequest(`${this.baseURL}/${userId}/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    })

    return response.id
  }

  /**
   * Create carousel container
   */
  async createCarouselContainer(userId, accessToken, mediaData) {
    validateRequiredFields(mediaData, ['children'])

    await this.rateLimiter.checkLimit()

    // First create individual media containers for each item
    const childrenIds = []
    for (const child of mediaData.children) {
      let containerId
      if (child.type === 'IMAGE') {
        containerId = await this.createImageContainer(userId, accessToken, {
          imageUrl: child.imageUrl,
          isCarouselItem: true
        })
      } else if (child.type === 'VIDEO') {
        containerId = await this.createVideoContainer(userId, accessToken, {
          videoUrl: child.videoUrl,
          isCarouselItem: true
        })
      }
      childrenIds.push(containerId)
    }

    // Create carousel container
    const params = new URLSearchParams({
      media_type: 'CAROUSEL',
      children: childrenIds.join(','),
      caption: mediaData.caption || '',
      access_token: accessToken
    })

    const response = await apiRequest(`${this.baseURL}/${userId}/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    })

    return response.id
  }

  /**
   * Publish media container
   */
  async publishMedia(userId, accessToken, containerId) {
    await this.rateLimiter.checkLimit()

    const params = new URLSearchParams({
      creation_id: containerId,
      access_token: accessToken
    })

    const response = await apiRequest(`${this.baseURL}/${userId}/media_publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    })

    return response.id
  }

  /**
   * Complete post workflow
   */
  async createPost(userId, accessToken, postData) {
    try {
      let containerId

      if (postData.type === 'IMAGE') {
        containerId = await this.createImageContainer(userId, accessToken, postData)
      } else if (postData.type === 'VIDEO') {
        containerId = await this.createVideoContainer(userId, accessToken, postData)
      } else if (postData.type === 'CAROUSEL') {
        containerId = await this.createCarouselContainer(userId, accessToken, postData)
      } else {
        throw new Error('Invalid post type. Must be IMAGE, VIDEO, or CAROUSEL')
      }

      // Wait a moment for container to be ready
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mediaId = await this.publishMedia(userId, accessToken, containerId)

      return {
        success: true,
        mediaId,
        containerId
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ============ Analytics ============

  /**
   * Get user's media
   */
  async getUserMedia(userId, accessToken, limit = 25, after = null) {
    await this.rateLimiter.checkLimit()

    const params = new URLSearchParams({
      fields: 'id,media_type,media_url,permalink,thumbnail_url,timestamp,caption',
      limit: limit.toString(),
      access_token: accessToken
    })

    if (after) {
      params.append('after', after)
    }

    const response = await apiRequest(`${this.baseURL}/${userId}/media?${params.toString()}`, {
      method: 'GET'
    })

    return {
      data: response.data,
      paging: response.paging
    }
  }

  /**
   * Get media insights
   */
  async getMediaInsights(mediaId, accessToken, metrics = []) {
    await this.rateLimiter.checkLimit()

    const defaultMetrics = [
      'impressions',
      'reach',
      'likes',
      'comments',
      'shares',
      'saves',
      'profile_visits',
      'follows'
    ]

    const params = new URLSearchParams({
      metric: (metrics.length > 0 ? metrics : defaultMetrics).join(','),
      access_token: accessToken
    })

    const response = await apiRequest(`${this.baseURL}/${mediaId}/insights?${params.toString()}`, {
      method: 'GET'
    })

    return response.data
  }

  /**
   * Get account insights
   */
  async getAccountInsights(userId, accessToken, period = 'day', metrics = []) {
    await this.rateLimiter.checkLimit()

    const defaultMetrics = [
      'impressions',
      'reach',
      'profile_views',
      'website_clicks'
    ]

    const params = new URLSearchParams({
      metric: (metrics.length > 0 ? metrics : defaultMetrics).join(','),
      period: period,
      access_token: accessToken
    })

    const response = await apiRequest(`${this.baseURL}/${userId}/insights?${params.toString()}`, {
      method: 'GET'
    })

    return response.data
  }

  // ============ Content Creation Helpers ============

  /**
   * Create Instagram post from ad data
   */
  async createPostFromAd(userId, accessToken, adData) {
    validateRequiredFields(adData, ['productImageURL', 'caption'])

    try {
      const postData = {
        type: 'IMAGE',
        imageUrl: adData.productImageURL,
        caption: this.formatCaption(adData.caption, adData.hashtags),
      }

      const result = await this.createPost(userId, accessToken, postData)
      return result
    } catch (error) {
      throw new Error(`Failed to create Instagram post: ${error.message}`)
    }
  }

  /**
   * Format caption with hashtags
   */
  formatCaption(caption, hashtags = []) {
    let formattedCaption = caption

    if (hashtags && hashtags.length > 0) {
      formattedCaption += '\n\n' + hashtags.map(tag => 
        tag.startsWith('#') ? tag : `#${tag}`
      ).join(' ')
    }

    // Instagram caption limit is 2200 characters
    if (formattedCaption.length > 2200) {
      formattedCaption = formattedCaption.substring(0, 2197) + '...'
    }

    return formattedCaption
  }

  // ============ Utility Methods ============

  /**
   * Check if access token is valid
   */
  async validateToken(accessToken) {
    try {
      await this.getUserInfo(accessToken)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get posting recommendations based on audience
   */
  getPostingRecommendations(targetAudience) {
    const recommendations = {
      'fashion': {
        bestTimes: ['11 AM-1 PM', '7-9 PM'],
        hashtags: ['#fashion', '#style', '#ootd', '#instafashion', '#trendy'],
        contentStyle: 'aesthetic, high-quality visuals, lifestyle-focused'
      },
      'lifestyle': {
        bestTimes: ['8-9 AM', '5-7 PM'],
        hashtags: ['#lifestyle', '#daily', '#instagood', '#life', '#inspiration'],
        contentStyle: 'authentic, relatable, aspirational'
      },
      'business': {
        bestTimes: ['9-10 AM', '3-4 PM'],
        hashtags: ['#business', '#entrepreneur', '#success', '#motivation'],
        contentStyle: 'professional, informative, value-driven'
      },
      'general': {
        bestTimes: ['11 AM-1 PM', '7-9 PM'],
        hashtags: ['#instagood', '#photooftheday', '#love', '#beautiful'],
        contentStyle: 'engaging, visually appealing, accessible'
      }
    }

    return recommendations[targetAudience] || recommendations.general
  }

  /**
   * Format metrics for display
   */
  formatMetrics(insights) {
    const metrics = {}
    
    insights.forEach(insight => {
      switch (insight.name) {
        case 'impressions':
          metrics.impressions = this.formatNumber(insight.values[0]?.value || 0)
          break
        case 'reach':
          metrics.reach = this.formatNumber(insight.values[0]?.value || 0)
          break
        case 'likes':
          metrics.likes = this.formatNumber(insight.values[0]?.value || 0)
          break
        case 'comments':
          metrics.comments = this.formatNumber(insight.values[0]?.value || 0)
          break
        case 'shares':
          metrics.shares = this.formatNumber(insight.values[0]?.value || 0)
          break
        case 'saves':
          metrics.saves = this.formatNumber(insight.values[0]?.value || 0)
          break
      }
    })

    // Calculate engagement rate
    const impressions = insights.find(i => i.name === 'impressions')?.values[0]?.value || 0
    const likes = insights.find(i => i.name === 'likes')?.values[0]?.value || 0
    const comments = insights.find(i => i.name === 'comments')?.values[0]?.value || 0
    const shares = insights.find(i => i.name === 'shares')?.values[0]?.value || 0
    const saves = insights.find(i => i.name === 'saves')?.values[0]?.value || 0

    if (impressions > 0) {
      const totalEngagement = likes + comments + shares + saves
      metrics.engagementRate = ((totalEngagement / impressions) * 100).toFixed(2)
    } else {
      metrics.engagementRate = '0.00'
    }

    return metrics
  }

  /**
   * Format large numbers
   */
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  /**
   * Get optimal hashtags for content
   */
  getOptimalHashtags(contentType, targetAudience) {
    const hashtagSets = {
      fashion: ['#fashion', '#style', '#ootd', '#instafashion', '#trendy', '#outfit', '#fashionista', '#styleinspo'],
      beauty: ['#beauty', '#makeup', '#skincare', '#cosmetics', '#beautytips', '#glam', '#selfcare', '#beautyproducts'],
      lifestyle: ['#lifestyle', '#daily', '#instagood', '#life', '#inspiration', '#motivation', '#wellness', '#mindfulness'],
      fitness: ['#fitness', '#workout', '#health', '#gym', '#fitlife', '#exercise', '#wellness', '#strength'],
      food: ['#food', '#foodie', '#delicious', '#yummy', '#cooking', '#recipe', '#foodporn', '#instafood'],
      travel: ['#travel', '#wanderlust', '#adventure', '#explore', '#vacation', '#travelgram', '#instatravel', '#journey']
    }

    const generalHashtags = ['#instagood', '#photooftheday', '#love', '#beautiful', '#happy', '#follow', '#picoftheday']
    
    const specificHashtags = hashtagSets[contentType] || []
    return [...specificHashtags.slice(0, 15), ...generalHashtags.slice(0, 15 - specificHashtags.length)]
  }
}

export default new InstagramService()
