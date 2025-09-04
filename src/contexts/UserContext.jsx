import React, { createContext, useContext, useState } from 'react'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    userID: 'user_123',
    email: 'user@example.com',
    subscriptionTier: 'pro',
    tiktokTestPage: '@testpage_tiktok',
    instagramTestPage: '@testpage_ig'
  })

  const [ads, setAds] = useState([
    {
      adID: 'ad_1',
      productImageURL: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop',
      caption: 'Transform your style with our premium collection ✨',
      targetingOptions: { age: '18-35', interests: ['fashion', 'lifestyle'] },
      performanceMetrics: { views: 12500, likes: 890, shares: 45, ctr: 3.2 },
      remixHistory: [],
      status: 'active',
      platform: 'tiktok'
    },
    {
      adID: 'ad_2',
      productImageURL: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=600&fit=crop',
      caption: 'Step into comfort. Step into style. 👟',
      targetingOptions: { age: '20-40', interests: ['sports', 'fashion'] },
      performanceMetrics: { views: 8900, likes: 567, shares: 23, ctr: 2.8 },
      remixHistory: [],
      status: 'active',
      platform: 'instagram'
    },
    {
      adID: 'ad_3',
      productImageURL: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=600&fit=crop',
      caption: 'Elevate your everyday look 🌟',
      targetingOptions: { age: '25-45', interests: ['beauty', 'lifestyle'] },
      performanceMetrics: { views: 15600, likes: 1200, shares: 78, ctr: 4.1 },
      remixHistory: [],
      status: 'testing',
      platform: 'tiktok'
    }
  ])

  const addAd = (newAd) => {
    setAds(prev => [...prev, { ...newAd, adID: `ad_${Date.now()}` }])
  }

  const updateAd = (adID, updates) => {
    setAds(prev => prev.map(ad => 
      ad.adID === adID ? { ...ad, ...updates } : ad
    ))
  }

  const remixAd = (adID, remixData) => {
    setAds(prev => prev.map(ad => {
      if (ad.adID === adID) {
        return {
          ...ad,
          ...remixData,
          remixHistory: [...ad.remixHistory, {
            timestamp: new Date().toISOString(),
            changes: remixData
          }]
        }
      }
      return ad
    }))
  }

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      ads,
      setAds,
      addAd,
      updateAd,
      remixAd
    }}>
      {children}
    </UserContext.Provider>
  )
}