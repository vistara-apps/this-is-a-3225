/**
 * TikTok API Service
 * Handles TikTok posting and analytics integration
 */

import { apiRequest, RateLimiter, getEnvVar, validateRequiredFields } from '../utils/api.js'

class TikTokService {
  constructor() {
    this.clientKey = getEnvVar('VITE_TIKTOK_CLIENT_KEY')
    this.clientSecret = getEnvVar('VITE_TIKTOK_CLIENT_SECRET')
    this.baseURL = 'https://open-api.tiktok.com'
    this.rateLimiter = new RateLimiter(100, 60000) // 100 requests per minute
    this.redirectUri = getEnvVar('VITE_TIKTOK_REDIRECT_URI', `${window.location.origin}/auth/tiktok/callback`)
  }

  // ============ Authentication ============

  /**
   * Get TikTok OAuth authorization URL
   */
  getAuthorizationURL(state = null) {
    const params = new URLSearchParams({
      client_key: this.clientKey,
      scope: 'user.info.basic,video.list,video.upload',
      response_type: 'code',
      redirect_uri: this.redirectUri,
      state: state || Math.random().toString(36).substring(7)
    })

    return `${this.baseURL}/platform/oauth/authorize/?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code) {
    validateRequiredFields({ code }, ['code'])

    await this.rateLimiter.checkLimit()

    const response = await apiRequest(`${this.baseURL}/v2/oauth/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri
      }).toString()
    })

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      scope: response.data.scope,
      openId: response.data.open_id
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    validateRequiredFields({ refreshToken }, ['refreshToken'])

    await this.rateLimiter.checkLimit()

    const response = await apiRequest(`${this.baseURL}/v2/oauth/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }).toString()
    })

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in
    }
  }

  // ============ User Information ============

  /**
   * Get user profile information
   */
  async getUserInfo(accessToken) {
    await this.rateLimiter.checkLimit()

    const response = await apiRequest(`${this.baseURL}/v2/user/info/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: ['open_id', 'union_id', 'avatar_url', 'display_name', 'username']
      })
    })

    return response.data.user
  }

  // ============ Video Upload ============

  /**
   * Initialize video upload
   */
  async initializeUpload(accessToken, videoData) {
    validateRequiredFields(videoData, ['title'])

    await this.rateLimiter.checkLimit()

    const response = await apiRequest(`${this.baseURL}/v2/post/publish/inbox/video/init/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        post_info: {
          title: videoData.title,
          description: videoData.description || '',
          privacy_level: videoData.privacyLevel || 'SELF_ONLY', // For testing
          disable_duet: videoData.disableDuet || false,
          disable_comment: videoData.disableComment || false,
          disable_stitch: videoData.disableStitch || false,
          video_cover_timestamp_ms: videoData.coverTimestamp || 1000
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: videoData.videoUrl
        }
      })
    })

    return {
      publishId: response.data.publish_id,
      uploadUrl: response.data.upload_url
    }
  }

  /**
   * Upload video file
   */
  async uploadVideo(uploadUrl, videoFile) {
    const formData = new FormData()
    formData.append('video', videoFile)

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Video upload failed: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Publish video post
   */
  async publishVideo(accessToken, publishId) {
    await this.rateLimiter.checkLimit()

    const response = await apiRequest(`${this.baseURL}/v2/post/publish/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        publish_id: publishId
      })
    })

    return response.data
  }

  /**
   * Complete video upload workflow
   */
  async postVideo(accessToken, videoData, videoFile) {
    try {
      // Step 1: Initialize upload
      const { publishId, uploadUrl } = await this.initializeUpload(accessToken, videoData)

      // Step 2: Upload video file
      await this.uploadVideo(uploadUrl, videoFile)

      // Step 3: Publish video
      const result = await this.publishVideo(accessToken, publishId)

      return {
        success: true,
        publishId,
        shareId: result.share_id,
        status: result.status
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
   * Get user's video list
   */
  async getUserVideos(accessToken, cursor = 0, maxCount = 20) {
    await this.rateLimiter.checkLimit()

    const response = await apiRequest(`${this.baseURL}/v2/video/list/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: [
          'id',
          'title',
          'video_description',
          'duration',
          'cover_image_url',
          'share_url',
          'view_count',
          'like_count',
          'comment_count',
          'share_count',
          'create_time'
        ],
        cursor,
        max_count: maxCount
      })
    })

    return {
      videos: response.data.videos,
      cursor: response.data.cursor,
      hasMore: response.data.has_more
    }
  }

  /**
   * Get video analytics
   */
  async getVideoAnalytics(accessToken, videoIds, fields = []) {
    await this.rateLimiter.checkLimit()

    const defaultFields = [
      'video_id',
      'view_count',
      'like_count',
      'comment_count',
      'share_count',
      'profile_view_count',
      'reach_count'
    ]

    const response = await apiRequest(`${this.baseURL}/v2/research/video/query/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filters: {
          video_ids: videoIds
        },
        fields: fields.length > 0 ? fields : defaultFields,
        max_count: videoIds.length
      })
    })

    return response.data.videos
  }

  // ============ Content Creation Helpers ============

  /**
   * Generate video from image and caption (mock implementation)
   * In production, this would integrate with video generation services
   */
  async generateVideoFromImage(imageUrl, caption, options = {}) {
    // This is a mock implementation
    // In production, you would integrate with services like:
    // - Runway ML
    // - Stable Video Diffusion
    // - Custom video generation pipeline
    
    return {
      videoUrl: `https://example.com/generated-video-${Date.now()}.mp4`,
      duration: options.duration || 15,
      format: 'mp4',
      resolution: options.resolution || '1080x1920'
    }
  }

  /**
   * Create TikTok post from ad data
   */
  async createPostFromAd(accessToken, adData) {
    validateRequiredFields(adData, ['productImageURL', 'caption'])

    try {
      // Generate video from image (mock)
      const videoData = await this.generateVideoFromImage(
        adData.productImageURL,
        adData.caption,
        {
          duration: 15,
          resolution: '1080x1920'
        }
      )

      // Create video file object (in production, this would be the actual generated video)
      const videoBlob = new Blob(['mock video data'], { type: 'video/mp4' })
      const videoFile = new File([videoBlob], 'ad-video.mp4', { type: 'video/mp4' })

      // Post to TikTok
      const result = await this.postVideo(accessToken, {
        title: adData.caption.substring(0, 150), // TikTok title limit
        description: adData.caption,
        privacyLevel: 'SELF_ONLY', // For testing
        videoUrl: videoData.videoUrl
      }, videoFile)

      return result
    } catch (error) {
      throw new Error(`Failed to create TikTok post: ${error.message}`)
    }
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
      'gen-z': {
        bestTimes: ['6-9 PM', '9-11 PM'],
        hashtags: ['#fyp', '#viral', '#trending', '#genz'],
        contentStyle: 'authentic, trendy, fast-paced'
      },
      'millennials': {
        bestTimes: ['7-9 PM', '12-1 PM'],
        hashtags: ['#millennial', '#lifestyle', '#relatable'],
        contentStyle: 'nostalgic, informative, lifestyle-focused'
      },
      'general': {
        bestTimes: ['6-10 PM', '12-3 PM'],
        hashtags: ['#fyp', '#viral', '#trending'],
        contentStyle: 'engaging, entertaining, accessible'
      }
    }

    return recommendations[targetAudience] || recommendations.general
  }

  /**
   * Format metrics for display
   */
  formatMetrics(metrics) {
    return {
      views: this.formatNumber(metrics.view_count || 0),
      likes: this.formatNumber(metrics.like_count || 0),
      comments: this.formatNumber(metrics.comment_count || 0),
      shares: this.formatNumber(metrics.share_count || 0),
      engagement: this.calculateEngagementRate(metrics)
    }
  }

  /**
   * Calculate engagement rate
   */
  calculateEngagementRate(metrics) {
    const { view_count, like_count, comment_count, share_count } = metrics
    if (!view_count || view_count === 0) return 0

    const totalEngagement = (like_count || 0) + (comment_count || 0) + (share_count || 0)
    return ((totalEngagement / view_count) * 100).toFixed(2)
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
}

export default new TikTokService()
