# AdApe 🐒⚡

> AI-powered ad remixing & growth hacking for TikTok & Instagram

AdApe is a comprehensive platform that automates the creation and A/B testing of ad variations to optimize ad performance and growth on TikTok and Instagram. Built with React, powered by OpenAI, and integrated with social media APIs.

## ✨ Features

### 🤖 AI-Powered Ad Generation
- **Smart Variation Generation**: Create 3-5 unique ad variations from a single product image
- **Image Analysis**: AI analyzes product images to extract key insights and targeting recommendations
- **Caption Optimization**: Generate compelling captions tailored to your target audience
- **Hashtag Generation**: Automatically generate relevant hashtags for maximum reach

### 🎯 Advanced Targeting
- **Audience Segmentation**: Target specific demographics, interests, and behaviors
- **Platform Optimization**: Tailored content for TikTok and Instagram algorithms
- **Performance Prediction**: AI estimates CTR and engagement rates for each variation

### 🚀 Auto-Posting Pipeline
- **Multi-Platform Publishing**: Post to TikTok and Instagram simultaneously
- **Scheduled Posting**: Schedule ads for optimal posting times
- **Batch Operations**: Post multiple ads at once with progress tracking
- **Platform Integration**: Seamless OAuth integration with TikTok and Instagram APIs

### 📊 Performance Analytics
- **Real-Time Metrics**: Track views, likes, shares, comments, and engagement rates
- **A/B Testing**: Compare performance across ad variations
- **Historical Data**: Analyze trends and performance over time
- **ROI Tracking**: Monitor cost-per-click and conversion metrics

### 🎨 AI Remixing System
- **Performance-Based Suggestions**: AI analyzes underperforming ads and suggests improvements
- **Smart Optimization**: Automatically adjust captions, targeting, and timing
- **Remix History**: Track all changes and their impact on performance
- **Continuous Learning**: AI improves suggestions based on your ad performance

### 💎 Subscription Management
- **Freemium Model**: Start free with basic features
- **Tiered Pricing**: Pro and Enterprise plans with advanced features
- **Usage Tracking**: Monitor API usage and subscription limits
- **Flexible Billing**: Monthly and annual subscription options

## 🏗️ Architecture

### Frontend Stack
- **React 18** with modern hooks and context
- **Tailwind CSS** for responsive, utility-first styling
- **Lucide React** for consistent iconography
- **Vite** for fast development and building

### Backend Services
- **Supabase** for authentication, database, and real-time features
- **OpenAI GPT-4** for AI-powered content generation
- **TikTok API** for video posting and analytics
- **Instagram Graph API** for image/video publishing and insights

### Database
- **PostgreSQL** with comprehensive schema
- **Row Level Security (RLS)** for data protection
- **Real-time subscriptions** for live updates
- **Automated backups** and point-in-time recovery

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account and project
- OpenAI API key
- TikTok Developer account
- Instagram/Facebook Developer account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/adape.git
   cd adape
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your API keys and configuration:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_TIKTOK_CLIENT_KEY=your_tiktok_client_key
   VITE_INSTAGRAM_APP_ID=your_instagram_app_id
   ```

4. **Set up the database**
   ```bash
   # Run the SQL schema in your Supabase project
   psql -h your-db-host -U postgres -d postgres -f database/schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📖 Usage

### 1. Generate Ad Variations

```javascript
import { useAdGeneration } from './hooks/useAdGeneration'

const { generateAdVariations, saveVariations } = useAdGeneration()

// Generate variations from product data
const variations = await generateAdVariations({
  productName: 'Premium Wireless Headphones',
  imageURL: 'https://example.com/product.jpg',
  targetAudience: 'Tech-savvy millennials',
  platform: 'tiktok'
})

// Save selected variations
const savedAds = await saveVariations(variations, [0, 1, 2])
```

### 2. Auto-Post to Platforms

```javascript
import { useAutoPosting } from './hooks/useAutoPosting'

const { postAd, connectTikTok, connectInstagram } = useAutoPosting()

// Connect platforms
await connectTikTok()
await connectInstagram()

// Post ad to both platforms
await postAd(ad, ['tiktok', 'instagram'])
```

### 3. Analyze Performance

```javascript
import { supabaseService } from './services'

// Get analytics data
const analytics = await supabaseService.getAnalytics(userID, token, {
  start: '2024-01-01',
  end: '2024-01-31'
})

// Update performance metrics
await supabaseService.updatePerformanceMetrics(adID, {
  views: 15000,
  likes: 750,
  ctr: 3.5
})
```

## 🎨 Design System

AdApe uses a comprehensive design system with:

### Color Palette
- **Primary**: `hsl(252, 78%, 62%)` - Vibrant purple
- **Secondary**: `hsl(172, 67%, 44%)` - Teal accent
- **Success**: `hsl(142, 76%, 36%)` - Green
- **Warning**: `hsl(46, 95%, 50%)` - Amber
- **Error**: `hsl(0, 84%, 50%)` - Red

### Typography
- **Display**: Large headings with semibold weight
- **Headline**: Section headers with medium weight
- **Body**: Regular text with optimal line height
- **Mono**: Code and technical content

### Components
- **AppShell**: Main application layout with sidebar
- **AdGenerator**: AI-powered ad creation interface
- **Analytics**: Performance tracking dashboard
- **AuthEntry**: Authentication forms and flows

## 🔧 API Reference

### OpenAI Service
```javascript
// Generate ad variations
const variations = await openaiService.generateAdVariations(productData)

// Get remix suggestions
const suggestions = await openaiService.generateRemixSuggestions(adData, performanceData)

// Analyze product image
const analysis = await openaiService.analyzeImage(imageURL)
```

### Platform Services
```javascript
// TikTok posting
const result = await tiktokService.createPostFromAd(accessToken, adData)

// Instagram posting
const result = await instagramService.createPostFromAd(userId, accessToken, adData)

// Get analytics
const analytics = await tiktokService.getVideoAnalytics(accessToken, videoIds)
```

For complete API documentation, see [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Environment Variables
Ensure all production environment variables are set:
- `VITE_OPENAI_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_TIKTOK_CLIENT_KEY`
- `VITE_INSTAGRAM_APP_ID`

## 📊 Subscription Tiers

### Free Tier
- 5 ads per month
- 3 variations per ad
- 10 remixes per month
- Basic analytics

### Pro Tier ($29/month)
- 50 ads per month
- 10 variations per ad
- 100 remixes per month
- Advanced analytics
- Priority support

### Enterprise Tier ($99/month)
- Unlimited ads and variations
- Custom AI training
- White-label options
- Dedicated support
- API access

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style
- Use ESLint and Prettier for code formatting
- Follow React best practices and hooks patterns
- Write comprehensive tests for new features
- Document all public APIs

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing powerful AI capabilities
- **Supabase** for the excellent backend-as-a-service platform
- **TikTok** and **Instagram** for their comprehensive APIs
- **React** and **Tailwind CSS** communities for amazing tools

## 📞 Support

- 📧 Email: support@adape.com
- 💬 Discord: [Join our community](https://discord.gg/adape)
- 📖 Documentation: [docs.adape.com](https://docs.adape.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/adape/issues)

## 🗺️ Roadmap

### Q1 2024
- [ ] YouTube Shorts integration
- [ ] Advanced A/B testing features
- [ ] Custom AI model training
- [ ] Mobile app (React Native)

### Q2 2024
- [ ] LinkedIn ads support
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] API rate limiting improvements

### Q3 2024
- [ ] White-label solutions
- [ ] Enterprise SSO integration
- [ ] Advanced targeting options
- [ ] Performance optimization

---

<div align="center">
  <strong>Built with ❤️ by the AdApe team</strong>
  <br>
  <sub>Empowering creators and marketers with AI-driven ad optimization</sub>
</div>
