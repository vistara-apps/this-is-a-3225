/**
 * Database Types
 * TypeScript interfaces for database entities
 */

export interface User {
  user_id: string
  email: string
  password_hash?: string
  subscription_tier: 'free' | 'pro' | 'enterprise'
  subscription_status: 'active' | 'cancelled' | 'expired' | 'trial'
  subscription_expires_at?: string
  subscription_updated_at?: string
  tiktok_test_page?: string
  instagram_test_page?: string
  tiktok_access_token?: string
  instagram_access_token?: string
  tiktok_token_expires_at?: string
  instagram_token_expires_at?: string
  profile_data: Record<string, any>
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Ad {
  ad_id: string
  user_id: string
  product_image_url: string
  caption: string
  targeting_options: TargetingOptions
  performance_metrics: PerformanceMetrics
  remix_history: RemixHistoryItem[]
  status: 'draft' | 'active' | 'paused' | 'testing' | 'completed' | 'failed'
  platform: 'tiktok' | 'instagram' | 'both'
  post_id_tiktok?: string
  post_id_instagram?: string
  scheduled_at?: string
  posted_at?: string
  last_metrics_update?: string
  ai_generated: boolean
  generation_prompt?: string
  variation_group_id?: string
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface TargetingOptions {
  ageRange?: string
  interests?: string[]
  demographics?: string
  location?: string
  gender?: 'male' | 'female' | 'all'
  languages?: string[]
  deviceTypes?: string[]
  customAudiences?: string[]
}

export interface PerformanceMetrics {
  views: number
  likes: number
  shares: number
  comments: number
  ctr: number
  engagement_rate: number
  reach: number
  impressions: number
  saves?: number
  profile_visits?: number
  website_clicks?: number
  cost_per_click?: number
  cost_per_impression?: number
  conversion_rate?: number
}

export interface RemixHistoryItem {
  id: string
  timestamp: string
  changes: {
    caption?: string
    targeting_options?: Partial<TargetingOptions>
    metadata?: Record<string, any>
  }
  reason?: string
  performance_before?: Partial<PerformanceMetrics>
  performance_after?: Partial<PerformanceMetrics>
}

export interface AdVariation {
  variation_id: string
  parent_ad_id: string
  variation_type: 'caption' | 'targeting' | 'timing' | 'creative' | 'remix'
  variation_data: Record<string, any>
  performance_comparison: Record<string, any>
  is_winner: boolean
  confidence_score: number
  test_duration_hours: number
  created_at: string
  updated_at: string
}

export interface SubscriptionUsage {
  usage_id: string
  user_id: string
  month_year: string
  ads_created: number
  variations_generated: number
  remixes_created: number
  ai_requests: number
  posts_published: number
  usage_data: Record<string, any>
  created_at: string
  updated_at: string
}

export interface AnalyticsSnapshot {
  snapshot_id: string
  ad_id: string
  platform: string
  metrics: PerformanceMetrics
  snapshot_date: string
  created_at: string
}

export interface Campaign {
  campaign_id: string
  user_id: string
  name: string
  description?: string
  objective: 'awareness' | 'engagement' | 'conversions' | 'traffic'
  budget_total?: number
  budget_daily?: number
  start_date?: string
  end_date?: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  target_audience: TargetingOptions
  performance_goals: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CampaignAd {
  campaign_id: string
  ad_id: string
  added_at: string
}

export interface AIGenerationLog {
  log_id: string
  user_id: string
  request_type: 'variation_generation' | 'remix_suggestion' | 'hashtag_generation' | 'image_analysis'
  input_data: Record<string, any>
  output_data?: Record<string, any>
  tokens_used: number
  processing_time_ms?: number
  success: boolean
  error_message?: string
  model_used?: string
  created_at: string
}

export interface PlatformConnection {
  connection_id: string
  user_id: string
  platform: 'tiktok' | 'instagram'
  platform_user_id: string
  platform_username?: string
  access_token: string
  refresh_token?: string
  token_expires_at?: string
  scope?: string
  connection_status: 'active' | 'expired' | 'revoked' | 'error'
  last_used_at?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface PostingQueue {
  queue_id: string
  ad_id: string
  platform: string
  scheduled_for: string
  status: 'pending' | 'processing' | 'posted' | 'failed' | 'cancelled'
  retry_count: number
  max_retries: number
  error_message?: string
  posted_at?: string
  post_url?: string
  platform_post_id?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

// Utility types
export interface SubscriptionLimits {
  ads_per_month: number
  variations_per_ad: number
  remixes_per_month: number
  ai_requests_per_month: number
}

export interface DatabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface SortParams {
  column: string
  direction: 'asc' | 'desc'
}

export interface FilterParams {
  [key: string]: any
}

export interface DatabaseResponse<T> {
  data: T[]
  count?: number
  error?: DatabaseError
}

// API Response types
export interface CreateAdRequest {
  product_image_url: string
  caption: string
  targeting_options?: TargetingOptions
  platform: 'tiktok' | 'instagram' | 'both'
  scheduled_at?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface UpdateAdRequest {
  caption?: string
  targeting_options?: TargetingOptions
  status?: Ad['status']
  scheduled_at?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface GenerateVariationsRequest {
  product_name: string
  description?: string
  target_audience?: string
  platform?: string
  image_url: string
}

export interface RemixAdRequest {
  ad_id: string
  remix_type: 'caption' | 'targeting' | 'timing' | 'creative'
  suggestions?: string[]
  performance_data?: PerformanceMetrics
}

export interface AnalyticsQuery {
  user_id: string
  date_range?: {
    start: string
    end: string
  }
  platform?: 'tiktok' | 'instagram'
  ad_ids?: string[]
  metrics?: string[]
}

// Supabase specific types
export interface SupabaseUser {
  id: string
  email?: string
  user_metadata?: Record<string, any>
  app_metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export interface SupabaseSession {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: SupabaseUser
}

export interface SupabaseAuthResponse {
  user: SupabaseUser | null
  session: SupabaseSession | null
  error?: {
    message: string
    status?: number
  }
}

// Export all types as a namespace for easier imports
export namespace Database {
  export type User = User
  export type Ad = Ad
  export type AdVariation = AdVariation
  export type Campaign = Campaign
  export type PerformanceMetrics = PerformanceMetrics
  export type TargetingOptions = TargetingOptions
  export type RemixHistoryItem = RemixHistoryItem
  export type SubscriptionUsage = SubscriptionUsage
  export type PlatformConnection = PlatformConnection
  export type PostingQueue = PostingQueue
  export type AIGenerationLog = AIGenerationLog
  export type AnalyticsSnapshot = AnalyticsSnapshot
}
