# AdApe API Documentation

## Overview

AdApe is an AI-powered ad remixing and growth hacking platform for TikTok and Instagram. This documentation covers all API endpoints, services, and integration patterns.

## Table of Contents

1. [Authentication](#authentication)
2. [OpenAI Service](#openai-service)
3. [Supabase Service](#supabase-service)
4. [TikTok Service](#tiktok-service)
5. [Instagram Service](#instagram-service)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Webhooks](#webhooks)

## Authentication

### Supabase Authentication

AdApe uses Supabase for user authentication and session management.

```javascript
import { supabaseService } from '../services'

// Sign up new user
const { user, session, error } = await supabaseService.signUp(email, password, {
  subscription_tier: 'free'
})

// Sign in user
const { user, session, error } = await supabaseService.signIn(email, password)

// Get current user
const user = await supabaseService.getUser(token)

// Sign out
await supabaseService.signOut(token)
```

### Platform Authentication

#### TikTok OAuth Flow

```javascript
import { tiktokService } from '../services'

// Step 1: Get authorization URL
const authUrl = tiktokService.getAuthorizationURL(state)
window.location.href = authUrl

// Step 2: Exchange code for token (in callback)
const tokenData = await tiktokService.getAccessToken(code)

// Step 3: Get user info
const userInfo = await tiktokService.getUserInfo(tokenData.accessToken)
```

#### Instagram OAuth Flow

```javascript
import { instagramService } from '../services'

// Step 1: Get authorization URL
const authUrl = instagramService.getAuthorizationURL(state)
window.location.href = authUrl

// Step 2: Exchange code for token
const tokenData = await instagramService.getAccessToken(code)

// Step 3: Get long-lived token
const longLivedToken = await instagramService.getLongLivedToken(tokenData.accessToken)
```

## OpenAI Service

### Generate Ad Variations

Generate multiple ad variations from product data using AI.

```javascript
import { openaiService } from '../services'

const variations = await openaiService.generateAdVariations({
  productName: 'Premium Wireless Headphones',
  description: 'High-quality audio with noise cancellation',
  targetAudience: 'Tech-savvy millennials',
  platform: 'tiktok',
  imageURL: 'https://example.com/product.jpg'
})

// Response format:
[
  {
    id: 'var_123',
    caption: 'Experience crystal-clear audio...',
    targeting: {
      ageRange: '18-35',
      interests: ['technology', 'music'],
      demographics: 'urban millennials'
    },
    callToAction: 'Shop Now',
    tone: 'playful',
    bestPostingTime: '7-9 PM',
    expectedPerformance: {
      estimatedCTR: 3.2,
      estimatedEngagement: 'high'
    }
  }
]
```

### Generate Remix Suggestions

Get AI-powered suggestions for improving existing ads based on performance data.

```javascript
const suggestions = await openaiService.generateRemixSuggestions(
  {
    caption: 'Current ad caption',
    targetingOptions: { ageRange: '18-35' },
    platform: 'tiktok'
  },
  {
    views: 10000,
    likes: 500,
    shares: 50,
    ctr: 2.1
  }
)
```

### Analyze Image

Analyze product images to extract insights for ad generation.

```javascript
const analysis = await openaiService.analyzeImage('https://example.com/product.jpg')

// Response format:
{
  productType: 'Electronics - Headphones',
  targetAudience: 'Tech enthusiasts, music lovers',
  keySellingPoints: ['Noise cancellation', 'Premium build quality'],
  visualStyle: 'Modern, sleek design',
  mood: 'Professional, premium'
}
```

### Generate Hashtags

Generate relevant hashtags for social media posts.

```javascript
const hashtags = await openaiService.generateHashtags(
  'Premium wireless headphones with noise cancellation',
  'tiktok',
  'tech enthusiasts'
)

// Response: ['#headphones', '#tech', '#audio', '#wireless', ...]
```

## Supabase Service

### User Management

```javascript
// Create user profile
const profile = await supabaseService.createUserProfile({
  userID: 'user-uuid',
  email: 'user@example.com',
  subscriptionTier: 'pro'
}, token)

// Get user profile
const profile = await supabaseService.getUserProfile(userID, token)

// Update user profile
const updated = await supabaseService.updateUserProfile(userID, {
  subscription_tier: 'enterprise'
}, token)
```

### Ad Management

```javascript
// Create new ad
const ad = await supabaseService.createAd({
  userID: 'user-uuid',
  productImageURL: 'https://example.com/image.jpg',
  caption: 'Amazing product!',
  targetingOptions: { ageRange: '18-35' },
  platform: 'tiktok'
}, token)

// Get user's ads
const ads = await supabaseService.getUserAds(userID, token, {
  status: 'active',
  platform: 'tiktok'
})

// Update ad
const updated = await supabaseService.updateAd(adID, {
  status: 'paused'
}, token)

// Delete ad
await supabaseService.deleteAd(adID, token)
```

### Analytics

```javascript
// Get analytics data
const analytics = await supabaseService.getAnalytics(userID, token, {
  start: '2024-01-01',
  end: '2024-01-31'
})

// Update performance metrics
await supabaseService.updatePerformanceMetrics(adID, {
  views: 15000,
  likes: 750,
  shares: 100,
  ctr: 3.5
}, token)
```

### Subscription Management

```javascript
// Update subscription
await supabaseService.updateSubscription(userID, {
  tier: 'pro',
  status: 'active',
  expiresAt: '2024-12-31T23:59:59Z'
}, token)

// Get subscription usage
const usage = await supabaseService.getSubscriptionUsage(userID, token)

// Update usage
await supabaseService.updateSubscriptionUsage(userID, {
  ads_created_this_month: 15,
  variations_generated_this_month: 45
}, token)
```

## TikTok Service

### Video Upload and Publishing

```javascript
// Post video from ad data
const result = await tiktokService.createPostFromAd(accessToken, {
  productImageURL: 'https://example.com/image.jpg',
  caption: 'Check out this amazing product! #viral #fyp'
})

// Manual video upload workflow
const { publishId, uploadUrl } = await tiktokService.initializeUpload(accessToken, {
  title: 'My Video',
  description: 'Video description',
  privacyLevel: 'SELF_ONLY'
})

await tiktokService.uploadVideo(uploadUrl, videoFile)
const result = await tiktokService.publishVideo(accessToken, publishId)
```

### Analytics

```javascript
// Get user's videos
const { videos, cursor, hasMore } = await tiktokService.getUserVideos(
  accessToken, 
  0, // cursor
  20 // max count
)

// Get video analytics
const analytics = await tiktokService.getVideoAnalytics(
  accessToken,
  ['video_id_1', 'video_id_2'],
  ['view_count', 'like_count', 'share_count']
)
```

### Utility Methods

```javascript
// Get posting recommendations
const recommendations = tiktokService.getPostingRecommendations('gen-z')

// Format metrics for display
const formatted = tiktokService.formatMetrics({
  view_count: 15000,
  like_count: 750,
  comment_count: 50
})

// Calculate engagement rate
const engagementRate = tiktokService.calculateEngagementRate({
  view_count: 10000,
  like_count: 500,
  comment_count: 50,
  share_count: 25
})
```

## Instagram Service

### Media Publishing

```javascript
// Create image post
const result = await instagramService.createPost(userId, accessToken, {
  type: 'IMAGE',
  imageUrl: 'https://example.com/image.jpg',
  caption: 'Amazing product! #instagram #product'
})

// Create video post
const result = await instagramService.createPost(userId, accessToken, {
  type: 'VIDEO',
  videoUrl: 'https://example.com/video.mp4',
  caption: 'Check out this video!'
})

// Create carousel post
const result = await instagramService.createPost(userId, accessToken, {
  type: 'CAROUSEL',
  children: [
    { type: 'IMAGE', imageUrl: 'https://example.com/image1.jpg' },
    { type: 'IMAGE', imageUrl: 'https://example.com/image2.jpg' }
  ],
  caption: 'Swipe to see more!'
})
```

### Analytics

```javascript
// Get user's media
const { data, paging } = await instagramService.getUserMedia(
  userId, 
  accessToken, 
  25, // limit
  'cursor' // after
)

// Get media insights
const insights = await instagramService.getMediaInsights(
  mediaId,
  accessToken,
  ['impressions', 'reach', 'likes', 'comments']
)

// Get account insights
const accountInsights = await instagramService.getAccountInsights(
  userId,
  accessToken,
  'day', // period
  ['impressions', 'reach', 'profile_views']
)
```

### Utility Methods

```javascript
// Get posting recommendations
const recommendations = instagramService.getPostingRecommendations('fashion')

// Format caption with hashtags
const caption = instagramService.formatCaption(
  'Amazing product!',
  ['fashion', 'style', 'trendy']
)

// Get optimal hashtags
const hashtags = instagramService.getOptimalHashtags('fashion', 'millennials')
```

## Error Handling

All services use consistent error handling with custom error classes:

```javascript
import { APIError, RateLimitError } from '../utils/api'

try {
  const result = await openaiService.generateAdVariations(data)
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`)
  } else if (error instanceof APIError) {
    console.log(`API Error: ${error.message} (Status: ${error.status})`)
  } else {
    console.log(`Unexpected error: ${error.message}`)
  }
}
```

### Error Response Format

```javascript
{
  message: 'Error description',
  status: 400,
  code: 'ERROR_CODE',
  details: 'Additional error details'
}
```

## Rate Limiting

All services implement rate limiting to prevent API abuse:

- **OpenAI**: 50 requests per minute
- **TikTok**: 100 requests per minute  
- **Instagram**: 200 requests per hour
- **Supabase**: No built-in limits (depends on plan)

Rate limit errors include retry information:

```javascript
{
  message: 'Rate limit exceeded',
  status: 429,
  code: 'RATE_LIMIT_EXCEEDED',
  retryAfter: 60 // seconds
}
```

## Webhooks

AdApe supports webhooks for real-time updates from platforms:

### TikTok Webhooks

```javascript
// Handle TikTok webhook
app.post('/webhooks/tiktok', (req, res) => {
  const { event_type, data } = req.body
  
  switch (event_type) {
    case 'video.publish':
      // Handle video publish event
      break
    case 'video.update':
      // Handle video update event
      break
  }
  
  res.status(200).send('OK')
})
```

### Instagram Webhooks

```javascript
// Handle Instagram webhook
app.post('/webhooks/instagram', (req, res) => {
  const { object, entry } = req.body
  
  if (object === 'instagram') {
    entry.forEach(item => {
      item.changes.forEach(change => {
        // Handle media updates
      })
    })
  }
  
  res.status(200).send('OK')
})
```

## SDK Usage Examples

### Complete Ad Generation Workflow

```javascript
import { useAdGeneration, useAutoPosting } from '../hooks'

const AdCreationFlow = () => {
  const { generateAdVariations, saveVariations } = useAdGeneration()
  const { postAd, connectTikTok } = useAutoPosting()
  
  const handleCreateAndPost = async () => {
    // 1. Generate variations
    const variations = await generateAdVariations({
      productName: 'Wireless Headphones',
      imageURL: 'https://example.com/product.jpg',
      targetAudience: 'tech enthusiasts',
      platform: 'tiktok'
    })
    
    // 2. Save selected variations
    const savedAds = await saveVariations(variations, [0, 1, 2])
    
    // 3. Connect platform if needed
    if (!platformConnections.tiktok) {
      await connectTikTok()
    }
    
    // 4. Post ads
    for (const ad of savedAds) {
      await postAd(ad, ['tiktok'])
    }
  }
}
```

### Analytics Dashboard

```javascript
import { supabaseService } from '../services'

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null)
  
  useEffect(() => {
    const loadAnalytics = async () => {
      const data = await supabaseService.getAnalytics(user.userID, user.token, {
        start: '2024-01-01',
        end: '2024-01-31'
      })
      setAnalytics(data)
    }
    
    loadAnalytics()
  }, [])
  
  return (
    <div>
      {analytics?.map(ad => (
        <div key={ad.ad_id}>
          <h3>Ad Performance</h3>
          <p>Views: {ad.performance_metrics.views}</p>
          <p>Likes: {ad.performance_metrics.likes}</p>
          <p>CTR: {ad.performance_metrics.ctr}%</p>
        </div>
      ))}
    </div>
  )
}
```

## Best Practices

1. **Always handle errors gracefully** with try-catch blocks
2. **Respect rate limits** and implement exponential backoff
3. **Cache responses** when appropriate to reduce API calls
4. **Validate input data** before making API calls
5. **Use environment variables** for sensitive configuration
6. **Implement proper logging** for debugging and monitoring
7. **Test with mock data** during development
8. **Monitor API usage** to stay within quotas

## Support

For additional support or questions about the API:

- Check the [GitHub Issues](https://github.com/your-org/adape/issues)
- Review the [FAQ](./FAQ.md)
- Contact support at support@adape.com
