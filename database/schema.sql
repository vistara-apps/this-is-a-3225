-- AdApe Database Schema
-- Supabase PostgreSQL Schema for AdApe Platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trial')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    subscription_updated_at TIMESTAMP WITH TIME ZONE,
    tiktok_test_page VARCHAR(255),
    instagram_test_page VARCHAR(255),
    tiktok_access_token TEXT,
    instagram_access_token TEXT,
    tiktok_token_expires_at TIMESTAMP WITH TIME ZONE,
    instagram_token_expires_at TIMESTAMP WITH TIME ZONE,
    profile_data JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ads table
CREATE TABLE ads (
    ad_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    product_image_url TEXT NOT NULL,
    caption TEXT NOT NULL,
    targeting_options JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{
        "views": 0,
        "likes": 0,
        "shares": 0,
        "comments": 0,
        "ctr": 0,
        "engagement_rate": 0,
        "reach": 0,
        "impressions": 0
    }',
    remix_history JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'testing', 'completed', 'failed')),
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'both')),
    post_id_tiktok VARCHAR(255),
    post_id_instagram VARCHAR(255),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    posted_at TIMESTAMP WITH TIME ZONE,
    last_metrics_update TIMESTAMP WITH TIME ZONE,
    ai_generated BOOLEAN DEFAULT false,
    generation_prompt TEXT,
    variation_group_id UUID,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad variations table (for A/B testing)
CREATE TABLE ad_variations (
    variation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_ad_id UUID NOT NULL REFERENCES ads(ad_id) ON DELETE CASCADE,
    variation_type VARCHAR(50) NOT NULL CHECK (variation_type IN ('caption', 'targeting', 'timing', 'creative', 'remix')),
    variation_data JSONB NOT NULL,
    performance_comparison JSONB DEFAULT '{}',
    is_winner BOOLEAN DEFAULT false,
    confidence_score DECIMAL(5,2) DEFAULT 0.00,
    test_duration_hours INTEGER DEFAULT 24,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription usage tracking
CREATE TABLE subscription_usage (
    usage_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    ads_created INTEGER DEFAULT 0,
    variations_generated INTEGER DEFAULT 0,
    remixes_created INTEGER DEFAULT 0,
    ai_requests INTEGER DEFAULT 0,
    posts_published INTEGER DEFAULT 0,
    usage_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month_year)
);

-- Analytics snapshots (for historical data)
CREATE TABLE analytics_snapshots (
    snapshot_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID NOT NULL REFERENCES ads(ad_id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    metrics JSONB NOT NULL,
    snapshot_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign management
CREATE TABLE campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    objective VARCHAR(100) NOT NULL CHECK (objective IN ('awareness', 'engagement', 'conversions', 'traffic')),
    budget_total DECIMAL(10,2),
    budget_daily DECIMAL(10,2),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    target_audience JSONB DEFAULT '{}',
    performance_goals JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign ads relationship
CREATE TABLE campaign_ads (
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    ad_id UUID NOT NULL REFERENCES ads(ad_id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (campaign_id, ad_id)
);

-- AI generation logs
CREATE TABLE ai_generation_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('variation_generation', 'remix_suggestion', 'hashtag_generation', 'image_analysis')),
    input_data JSONB NOT NULL,
    output_data JSONB,
    tokens_used INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    model_used VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform connections
CREATE TABLE platform_connections (
    connection_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('tiktok', 'instagram')),
    platform_user_id VARCHAR(255) NOT NULL,
    platform_username VARCHAR(255),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    connection_status VARCHAR(50) DEFAULT 'active' CHECK (connection_status IN ('active', 'expired', 'revoked', 'error')),
    last_used_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- Posting queue for scheduled posts
CREATE TABLE posting_queue (
    queue_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID NOT NULL REFERENCES ads(ad_id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'posted', 'failed', 'cancelled')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    posted_at TIMESTAMP WITH TIME ZONE,
    post_url TEXT,
    platform_post_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ads_user_id ON ads(user_id);
CREATE INDEX idx_ads_status ON ads(status);
CREATE INDEX idx_ads_platform ON ads(platform);
CREATE INDEX idx_ads_created_at ON ads(created_at);
CREATE INDEX idx_ads_variation_group ON ads(variation_group_id);

CREATE INDEX idx_ad_variations_parent_ad ON ad_variations(parent_ad_id);
CREATE INDEX idx_ad_variations_type ON ad_variations(variation_type);

CREATE INDEX idx_subscription_usage_user_month ON subscription_usage(user_id, month_year);

CREATE INDEX idx_analytics_snapshots_ad_date ON analytics_snapshots(ad_id, snapshot_date);
CREATE INDEX idx_analytics_snapshots_platform ON analytics_snapshots(platform);

CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

CREATE INDEX idx_ai_logs_user_id ON ai_generation_logs(user_id);
CREATE INDEX idx_ai_logs_type ON ai_generation_logs(request_type);
CREATE INDEX idx_ai_logs_created_at ON ai_generation_logs(created_at);

CREATE INDEX idx_platform_connections_user ON platform_connections(user_id);
CREATE INDEX idx_platform_connections_platform ON platform_connections(platform);

CREATE INDEX idx_posting_queue_scheduled ON posting_queue(scheduled_for);
CREATE INDEX idx_posting_queue_status ON posting_queue(status);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE posting_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = user_id);

-- Ads policies
CREATE POLICY "Users can view own ads" ON ads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ads" ON ads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ads" ON ads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ads" ON ads FOR DELETE USING (auth.uid() = user_id);

-- Ad variations policies
CREATE POLICY "Users can view own ad variations" ON ad_variations FOR SELECT 
USING (EXISTS (SELECT 1 FROM ads WHERE ads.ad_id = ad_variations.parent_ad_id AND ads.user_id = auth.uid()));

CREATE POLICY "Users can insert own ad variations" ON ad_variations FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM ads WHERE ads.ad_id = ad_variations.parent_ad_id AND ads.user_id = auth.uid()));

CREATE POLICY "Users can update own ad variations" ON ad_variations FOR UPDATE 
USING (EXISTS (SELECT 1 FROM ads WHERE ads.ad_id = ad_variations.parent_ad_id AND ads.user_id = auth.uid()));

-- Similar policies for other tables...
CREATE POLICY "Users can view own subscription usage" ON subscription_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own analytics" ON analytics_snapshots FOR SELECT 
USING (EXISTS (SELECT 1 FROM ads WHERE ads.ad_id = analytics_snapshots.ad_id AND ads.user_id = auth.uid()));

CREATE POLICY "Users can view own campaigns" ON campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own campaigns" ON campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own campaigns" ON campaigns FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own AI logs" ON ai_generation_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own platform connections" ON platform_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own posting queue" ON posting_queue FOR SELECT 
USING (EXISTS (SELECT 1 FROM ads WHERE ads.ad_id = posting_queue.ad_id AND ads.user_id = auth.uid()));

-- Functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ad_variations_updated_at BEFORE UPDATE ON ad_variations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_usage_updated_at BEFORE UPDATE ON subscription_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_connections_updated_at BEFORE UPDATE ON platform_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posting_queue_updated_at BEFORE UPDATE ON posting_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get user subscription limits
CREATE OR REPLACE FUNCTION get_subscription_limits(user_subscription_tier TEXT)
RETURNS JSONB AS $$
BEGIN
    CASE user_subscription_tier
        WHEN 'free' THEN
            RETURN '{"ads_per_month": 5, "variations_per_ad": 3, "remixes_per_month": 10, "ai_requests_per_month": 50}';
        WHEN 'pro' THEN
            RETURN '{"ads_per_month": 50, "variations_per_ad": 10, "remixes_per_month": 100, "ai_requests_per_month": 500}';
        WHEN 'enterprise' THEN
            RETURN '{"ads_per_month": -1, "variations_per_ad": -1, "remixes_per_month": -1, "ai_requests_per_month": -1}';
        ELSE
            RETURN '{"ads_per_month": 0, "variations_per_ad": 0, "remixes_per_month": 0, "ai_requests_per_month": 0}';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has reached subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limit(
    p_user_id UUID,
    p_limit_type TEXT,
    p_current_month TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM')
)
RETURNS BOOLEAN AS $$
DECLARE
    user_tier TEXT;
    limits JSONB;
    current_usage INTEGER;
    limit_value INTEGER;
BEGIN
    -- Get user's subscription tier
    SELECT subscription_tier INTO user_tier FROM users WHERE user_id = p_user_id;
    
    -- Get limits for this tier
    SELECT get_subscription_limits(user_tier) INTO limits;
    
    -- Get limit value (-1 means unlimited)
    limit_value := (limits ->> p_limit_type)::INTEGER;
    
    IF limit_value = -1 THEN
        RETURN TRUE; -- Unlimited
    END IF;
    
    -- Get current usage
    SELECT COALESCE(
        CASE p_limit_type
            WHEN 'ads_per_month' THEN ads_created
            WHEN 'variations_per_month' THEN variations_generated
            WHEN 'remixes_per_month' THEN remixes_created
            WHEN 'ai_requests_per_month' THEN ai_requests
            ELSE 0
        END, 0
    ) INTO current_usage
    FROM subscription_usage 
    WHERE user_id = p_user_id AND month_year = p_current_month;
    
    RETURN current_usage < limit_value;
END;
$$ LANGUAGE plpgsql;

-- Insert default subscription tiers data
INSERT INTO users (user_id, email, subscription_tier) VALUES 
('00000000-0000-0000-0000-000000000001', 'demo@adape.com', 'pro')
ON CONFLICT (email) DO NOTHING;
