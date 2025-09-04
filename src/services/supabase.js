/**
 * Supabase Service
 * Handles database operations and user authentication
 */

import { apiRequest, getEnvVar, validateRequiredFields } from '../utils/api.js'

class SupabaseService {
  constructor() {
    this.supabaseUrl = getEnvVar('VITE_SUPABASE_URL')
    this.supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY')
    this.baseURL = `${this.supabaseUrl}/rest/v1`
    this.authURL = `${this.supabaseUrl}/auth/v1`
  }

  /**
   * Get common headers for Supabase requests
   */
  getHeaders(token = null) {
    return {
      'apikey': this.supabaseKey,
      'Authorization': token ? `Bearer ${token}` : `Bearer ${this.supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  }

  // ============ Authentication ============

  /**
   * Sign up new user
   */
  async signUp(email, password, metadata = {}) {
    validateRequiredFields({ email, password }, ['email', 'password'])

    const response = await apiRequest(`${this.authURL}/signup`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        email,
        password,
        data: metadata
      })
    })

    return response
  }

  /**
   * Sign in user
   */
  async signIn(email, password) {
    validateRequiredFields({ email, password }, ['email', 'password'])

    const response = await apiRequest(`${this.authURL}/token?grant_type=password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        email,
        password
      })
    })

    return response
  }

  /**
   * Sign out user
   */
  async signOut(token) {
    await apiRequest(`${this.authURL}/logout`, {
      method: 'POST',
      headers: this.getHeaders(token)
    })
  }

  /**
   * Get current user
   */
  async getUser(token) {
    const response = await apiRequest(`${this.authURL}/user`, {
      method: 'GET',
      headers: this.getHeaders(token)
    })

    return response
  }

  // ============ User Management ============

  /**
   * Create user profile
   */
  async createUserProfile(userData, token) {
    validateRequiredFields(userData, ['userID', 'email'])

    const response = await apiRequest(`${this.baseURL}/users`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        user_id: userData.userID,
        email: userData.email,
        subscription_tier: userData.subscriptionTier || 'free',
        tiktok_test_page: userData.tiktokTestPage || null,
        instagram_test_page: userData.instagramTestPage || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    })

    return response[0]
  }

  /**
   * Get user profile
   */
  async getUserProfile(userID, token) {
    const response = await apiRequest(
      `${this.baseURL}/users?user_id=eq.${userID}&select=*`,
      {
        method: 'GET',
        headers: this.getHeaders(token)
      }
    )

    return response[0]
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userID, updates, token) {
    const response = await apiRequest(
      `${this.baseURL}/users?user_id=eq.${userID}`,
      {
        method: 'PATCH',
        headers: this.getHeaders(token),
        body: JSON.stringify({
          ...updates,
          updated_at: new Date().toISOString()
        })
      }
    )

    return response[0]
  }

  // ============ Ad Management ============

  /**
   * Create new ad
   */
  async createAd(adData, token) {
    validateRequiredFields(adData, ['userID', 'productImageURL', 'caption'])

    const response = await apiRequest(`${this.baseURL}/ads`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        user_id: adData.userID,
        product_image_url: adData.productImageURL,
        caption: adData.caption,
        targeting_options: adData.targetingOptions || {},
        performance_metrics: adData.performanceMetrics || {
          views: 0,
          likes: 0,
          shares: 0,
          ctr: 0
        },
        remix_history: adData.remixHistory || [],
        status: adData.status || 'draft',
        platform: adData.platform || 'tiktok',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    })

    return response[0]
  }

  /**
   * Get user's ads
   */
  async getUserAds(userID, token, filters = {}) {
    let query = `${this.baseURL}/ads?user_id=eq.${userID}&select=*`
    
    if (filters.status) {
      query += `&status=eq.${filters.status}`
    }
    
    if (filters.platform) {
      query += `&platform=eq.${filters.platform}`
    }

    query += '&order=created_at.desc'

    const response = await apiRequest(query, {
      method: 'GET',
      headers: this.getHeaders(token)
    })

    return response
  }

  /**
   * Update ad
   */
  async updateAd(adID, updates, token) {
    const response = await apiRequest(
      `${this.baseURL}/ads?ad_id=eq.${adID}`,
      {
        method: 'PATCH',
        headers: this.getHeaders(token),
        body: JSON.stringify({
          ...updates,
          updated_at: new Date().toISOString()
        })
      }
    )

    return response[0]
  }

  /**
   * Delete ad
   */
  async deleteAd(adID, token) {
    await apiRequest(`${this.baseURL}/ads?ad_id=eq.${adID}`, {
      method: 'DELETE',
      headers: this.getHeaders(token)
    })
  }

  /**
   * Add remix to ad history
   */
  async addRemixHistory(adID, remixData, token) {
    // First get current ad to append to remix history
    const currentAd = await apiRequest(
      `${this.baseURL}/ads?ad_id=eq.${adID}&select=remix_history`,
      {
        method: 'GET',
        headers: this.getHeaders(token)
      }
    )

    const currentHistory = currentAd[0]?.remix_history || []
    const newHistory = [...currentHistory, {
      timestamp: new Date().toISOString(),
      changes: remixData,
      id: `remix_${Date.now()}`
    }]

    return await this.updateAd(adID, { remix_history: newHistory }, token)
  }

  // ============ Analytics ============

  /**
   * Update ad performance metrics
   */
  async updatePerformanceMetrics(adID, metrics, token) {
    return await this.updateAd(adID, { 
      performance_metrics: metrics,
      last_metrics_update: new Date().toISOString()
    }, token)
  }

  /**
   * Get analytics data for user
   */
  async getAnalytics(userID, token, dateRange = {}) {
    let query = `${this.baseURL}/ads?user_id=eq.${userID}&select=ad_id,performance_metrics,created_at,platform,status`
    
    if (dateRange.start) {
      query += `&created_at=gte.${dateRange.start}`
    }
    
    if (dateRange.end) {
      query += `&created_at=lte.${dateRange.end}`
    }

    const response = await apiRequest(query, {
      method: 'GET',
      headers: this.getHeaders(token)
    })

    return response
  }

  // ============ Subscription Management ============

  /**
   * Update user subscription
   */
  async updateSubscription(userID, subscriptionData, token) {
    return await this.updateUserProfile(userID, {
      subscription_tier: subscriptionData.tier,
      subscription_status: subscriptionData.status,
      subscription_expires_at: subscriptionData.expiresAt,
      subscription_updated_at: new Date().toISOString()
    }, token)
  }

  /**
   * Get subscription usage
   */
  async getSubscriptionUsage(userID, token) {
    const response = await apiRequest(
      `${this.baseURL}/subscription_usage?user_id=eq.${userID}&select=*`,
      {
        method: 'GET',
        headers: this.getHeaders(token)
      }
    )

    return response[0] || {
      ads_created_this_month: 0,
      variations_generated_this_month: 0,
      remixes_created_this_month: 0
    }
  }

  /**
   * Update subscription usage
   */
  async updateSubscriptionUsage(userID, usageData, token) {
    const response = await apiRequest(`${this.baseURL}/subscription_usage`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        user_id: userID,
        ...usageData,
        updated_at: new Date().toISOString()
      })
    }, {
      upsert: true
    })

    return response[0]
  }

  // ============ Utility Methods ============

  /**
   * Execute raw SQL query (for complex analytics)
   */
  async executeQuery(query, token) {
    const response = await apiRequest(`${this.supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ query })
    })

    return response
  }

  /**
   * Upload file to Supabase Storage
   */
  async uploadFile(bucket, path, file, token) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': this.supabaseKey
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Get public URL for uploaded file
   */
  getPublicURL(bucket, path) {
    return `${this.supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
  }
}

export default new SupabaseService()
