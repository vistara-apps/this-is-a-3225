/**
 * Auto-Posting Hook
 * Custom hook for automated posting to TikTok and Instagram
 */

import { useState, useCallback, useEffect } from 'react'
import { tiktokService, instagramService, supabaseService } from '../services'
import { useUser } from '../contexts/UserContext'

export const useAutoPosting = () => {
  const { user, updateAd } = useUser()
  const [isPosting, setIsPosting] = useState(false)
  const [postingQueue, setPostingQueue] = useState([])
  const [postingProgress, setPostingProgress] = useState({})
  const [postingErrors, setPostingErrors] = useState({})
  const [platformConnections, setPlatformConnections] = useState({
    tiktok: null,
    instagram: null
  })

  /**
   * Load platform connections on mount
   */
  useEffect(() => {
    if (user) {
      loadPlatformConnections()
    }
  }, [user])

  /**
   * Load user's platform connections
   */
  const loadPlatformConnections = useCallback(async () => {
    if (!user) return

    try {
      // Load TikTok connection
      const tiktokConnection = await supabaseService.getUserProfile(user.userID, user.token)
      if (tiktokConnection?.tiktok_access_token) {
        setPlatformConnections(prev => ({
          ...prev,
          tiktok: {
            accessToken: tiktokConnection.tiktok_access_token,
            expiresAt: tiktokConnection.tiktok_token_expires_at,
            testPage: tiktokConnection.tiktok_test_page
          }
        }))
      }

      // Load Instagram connection
      if (tiktokConnection?.instagram_access_token) {
        setPlatformConnections(prev => ({
          ...prev,
          instagram: {
            accessToken: tiktokConnection.instagram_access_token,
            expiresAt: tiktokConnection.instagram_token_expires_at,
            testPage: tiktokConnection.instagram_test_page
          }
        }))
      }
    } catch (error) {
      console.error('Failed to load platform connections:', error)
    }
  }, [user])

  /**
   * Connect to TikTok
   */
  const connectTikTok = useCallback(() => {
    const authUrl = tiktokService.getAuthorizationURL()
    window.open(authUrl, 'tiktok-auth', 'width=600,height=700')
    
    // Listen for auth completion
    const handleMessage = (event) => {
      if (event.data.type === 'TIKTOK_AUTH_SUCCESS') {
        handleTikTokAuthSuccess(event.data.code)
        window.removeEventListener('message', handleMessage)
      }
    }
    window.addEventListener('message', handleMessage)
  }, [])

  /**
   * Handle TikTok auth success
   */
  const handleTikTokAuthSuccess = useCallback(async (code) => {
    try {
      const tokenData = await tiktokService.getAccessToken(code)
      const userInfo = await tiktokService.getUserInfo(tokenData.accessToken)
      
      // Save to database
      await supabaseService.updateUserProfile(user.userID, {
        tiktok_access_token: tokenData.accessToken,
        tiktok_token_expires_at: new Date(Date.now() + tokenData.expiresIn * 1000).toISOString(),
        tiktok_test_page: userInfo.username
      }, user.token)

      // Update local state
      setPlatformConnections(prev => ({
        ...prev,
        tiktok: {
          accessToken: tokenData.accessToken,
          expiresAt: new Date(Date.now() + tokenData.expiresIn * 1000).toISOString(),
          testPage: userInfo.username
        }
      }))

      alert('TikTok connected successfully!')
    } catch (error) {
      console.error('TikTok auth failed:', error)
      alert('Failed to connect TikTok. Please try again.')
    }
  }, [user])

  /**
   * Connect to Instagram
   */
  const connectInstagram = useCallback(() => {
    const authUrl = instagramService.getAuthorizationURL()
    window.open(authUrl, 'instagram-auth', 'width=600,height=700')
    
    // Listen for auth completion
    const handleMessage = (event) => {
      if (event.data.type === 'INSTAGRAM_AUTH_SUCCESS') {
        handleInstagramAuthSuccess(event.data.code)
        window.removeEventListener('message', handleMessage)
      }
    }
    window.addEventListener('message', handleMessage)
  }, [])

  /**
   * Handle Instagram auth success
   */
  const handleInstagramAuthSuccess = useCallback(async (code) => {
    try {
      const tokenData = await instagramService.getAccessToken(code)
      const longLivedToken = await instagramService.getLongLivedToken(tokenData.accessToken)
      const userInfo = await instagramService.getUserInfo(longLivedToken.accessToken)
      
      // Save to database
      await supabaseService.updateUserProfile(user.userID, {
        instagram_access_token: longLivedToken.accessToken,
        instagram_token_expires_at: new Date(Date.now() + longLivedToken.expiresIn * 1000).toISOString(),
        instagram_test_page: userInfo.username
      }, user.token)

      // Update local state
      setPlatformConnections(prev => ({
        ...prev,
        instagram: {
          accessToken: longLivedToken.accessToken,
          expiresAt: new Date(Date.now() + longLivedToken.expiresIn * 1000).toISOString(),
          testPage: userInfo.username
        }
      }))

      alert('Instagram connected successfully!')
    } catch (error) {
      console.error('Instagram auth failed:', error)
      alert('Failed to connect Instagram. Please try again.')
    }
  }, [user])

  /**
   * Post ad to single platform
   */
  const postToSinglePlatform = useCallback(async (ad, platform) => {
    if (!platformConnections[platform]) {
      throw new Error(`${platform} not connected`)
    }

    const connection = platformConnections[platform]
    
    // Check if token is expired
    if (connection.expiresAt && new Date(connection.expiresAt) < new Date()) {
      throw new Error(`${platform} token expired. Please reconnect.`)
    }

    try {
      let result
      
      if (platform === 'tiktok') {
        result = await tiktokService.createPostFromAd(connection.accessToken, ad)
      } else if (platform === 'instagram') {
        // For Instagram, we need the user ID
        const userInfo = await instagramService.getUserInfo(connection.accessToken)
        result = await instagramService.createPostFromAd(userInfo.id, connection.accessToken, ad)
      }

      if (result.success) {
        // Update ad with post ID
        const updateData = {}
        updateData[`post_id_${platform}`] = result.mediaId || result.shareId
        updateData.posted_at = new Date().toISOString()
        updateData.status = 'active'

        await supabaseService.updateAd(ad.adID, updateData, user.token)
        updateAd(ad.adID, updateData)

        return {
          success: true,
          postId: result.mediaId || result.shareId,
          postUrl: result.postUrl
        }
      } else {
        throw new Error(result.error || 'Posting failed')
      }
    } catch (error) {
      console.error(`Failed to post to ${platform}:`, error)
      throw error
    }
  }, [platformConnections, user, updateAd])

  /**
   * Post ad to multiple platforms
   */
  const postAd = useCallback(async (ad, platforms = null) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Determine which platforms to post to
    const targetPlatforms = platforms || (ad.platform === 'both' ? ['tiktok', 'instagram'] : [ad.platform])
    
    setIsPosting(true)
    setPostingProgress(prev => ({ ...prev, [ad.adID]: { total: targetPlatforms.length, completed: 0 } }))
    setPostingErrors(prev => ({ ...prev, [ad.adID]: [] }))

    const results = {}
    const errors = []

    for (const platform of targetPlatforms) {
      try {
        const result = await postToSinglePlatform(ad, platform)
        results[platform] = result
        
        setPostingProgress(prev => ({
          ...prev,
          [ad.adID]: {
            ...prev[ad.adID],
            completed: prev[ad.adID].completed + 1
          }
        }))
      } catch (error) {
        errors.push({ platform, error: error.message })
        setPostingErrors(prev => ({
          ...prev,
          [ad.adID]: [...(prev[ad.adID] || []), { platform, error: error.message }]
        }))
      }
    }

    setIsPosting(false)

    if (errors.length === targetPlatforms.length) {
      throw new Error('Failed to post to all platforms')
    }

    return {
      success: true,
      results,
      errors: errors.length > 0 ? errors : null
    }
  }, [user, postToSinglePlatform])

  /**
   * Schedule ad for posting
   */
  const scheduleAd = useCallback(async (ad, scheduledTime, platforms = null) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const targetPlatforms = platforms || (ad.platform === 'both' ? ['tiktok', 'instagram'] : [ad.platform])
      
      // Add to posting queue for each platform
      for (const platform of targetPlatforms) {
        const queueItem = {
          ad_id: ad.adID,
          platform,
          scheduled_for: scheduledTime,
          status: 'pending'
        }

        // This would be saved to the database posting queue
        console.log('Scheduling ad for posting:', queueItem)
      }

      // Update ad status
      await supabaseService.updateAd(ad.adID, {
        scheduled_at: scheduledTime,
        status: 'scheduled'
      }, user.token)

      updateAd(ad.adID, {
        scheduled_at: scheduledTime,
        status: 'scheduled'
      })

      return { success: true }
    } catch (error) {
      console.error('Failed to schedule ad:', error)
      throw error
    }
  }, [user, updateAd])

  /**
   * Cancel scheduled post
   */
  const cancelScheduledPost = useCallback(async (ad) => {
    if (!user) return

    try {
      await supabaseService.updateAd(ad.adID, {
        scheduled_at: null,
        status: 'draft'
      }, user.token)

      updateAd(ad.adID, {
        scheduled_at: null,
        status: 'draft'
      })

      return { success: true }
    } catch (error) {
      console.error('Failed to cancel scheduled post:', error)
      throw error
    }
  }, [user, updateAd])

  /**
   * Batch post multiple ads
   */
  const batchPost = useCallback(async (ads, platforms = null) => {
    if (!user || !ads.length) return

    setIsPosting(true)
    const results = []
    const errors = []

    for (const ad of ads) {
      try {
        const result = await postAd(ad, platforms)
        results.push({ ad: ad.adID, ...result })
      } catch (error) {
        errors.push({ ad: ad.adID, error: error.message })
      }
    }

    setIsPosting(false)

    return {
      success: results.length > 0,
      results,
      errors: errors.length > 0 ? errors : null
    }
  }, [user, postAd])

  /**
   * Get posting recommendations
   */
  const getPostingRecommendations = useCallback((ad) => {
    const recommendations = {
      tiktok: tiktokService.getPostingRecommendations(ad.targetingOptions?.demographics || 'general'),
      instagram: instagramService.getPostingRecommendations(ad.targetingOptions?.demographics || 'general')
    }

    return recommendations
  }, [])

  /**
   * Check platform connection status
   */
  const checkConnectionStatus = useCallback(async (platform) => {
    const connection = platformConnections[platform]
    if (!connection) return { connected: false, reason: 'Not connected' }

    // Check if token is expired
    if (connection.expiresAt && new Date(connection.expiresAt) < new Date()) {
      return { connected: false, reason: 'Token expired' }
    }

    try {
      // Validate token by making a test API call
      if (platform === 'tiktok') {
        await tiktokService.validateToken(connection.accessToken)
      } else if (platform === 'instagram') {
        await instagramService.validateToken(connection.accessToken)
      }

      return { connected: true }
    } catch (error) {
      return { connected: false, reason: 'Token invalid' }
    }
  }, [platformConnections])

  /**
   * Disconnect platform
   */
  const disconnectPlatform = useCallback(async (platform) => {
    if (!user) return

    try {
      const updateData = {}
      updateData[`${platform}_access_token`] = null
      updateData[`${platform}_token_expires_at`] = null
      updateData[`${platform}_test_page`] = null

      await supabaseService.updateUserProfile(user.userID, updateData, user.token)

      setPlatformConnections(prev => ({
        ...prev,
        [platform]: null
      }))

      return { success: true }
    } catch (error) {
      console.error(`Failed to disconnect ${platform}:`, error)
      throw error
    }
  }, [user])

  return {
    // State
    isPosting,
    postingQueue,
    postingProgress,
    postingErrors,
    platformConnections,

    // Actions
    postAd,
    scheduleAd,
    cancelScheduledPost,
    batchPost,
    
    // Platform connections
    connectTikTok,
    connectInstagram,
    disconnectPlatform,
    checkConnectionStatus,
    
    // Utils
    getPostingRecommendations,
    loadPlatformConnections
  }
}
