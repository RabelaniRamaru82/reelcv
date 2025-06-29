# ReelCV - AI-Powered Video CV Platform

Part of the ReelApps ecosystem - AI-powered talent acquisition platform with AWS Bedrock integration.

## About
ReelCV is the dynamic candidate profiles application, providing clean, professional candidate showcases optimized for recruiter viewing with comprehensive AI-powered skills analysis, projects showcase, and persona insights.

## 🚀 Features

### Core Functionality
- **Video CV Showcase**: Professional video portfolio management
- **AI-Powered Analysis**: AWS Bedrock Claude integration for deep skill assessment
- **Real-time Analytics**: Performance tracking and insights
- **Public Sharing**: Direct URL access for easy sharing with employers
- **Responsive Design**: Optimized viewing across all devices

### AI Analysis Capabilities
- **Technical Skills Assessment**: Automated detection and proficiency scoring
- **Soft Skills Evaluation**: Communication, leadership, and problem-solving analysis
- **Personality Insights**: Big Five personality traits assessment
- **Industry Benchmarking**: Performance comparison against industry standards
- **Personalized Recommendations**: AI-generated improvement suggestions

### AWS Integration
- **S3 Storage**: Secure video storage in `reelcv-website-bucket` (us-west-2)
- **Transcribe**: High-accuracy speech-to-text conversion
- **Bedrock**: Claude AI for advanced content analysis
- **Real-time Processing**: Live progress tracking during analysis

## 🛠 Development

### Prerequisites
- Node.js 18+
- AWS Account with Bedrock access
- Supabase project

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Configure your environment variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AWS Configuration
VITE_AWS_REGION=us-west-2
VITE_AWS_ACCESS_KEY_ID=your_aws_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_aws_secret_key
VITE_AWS_S3_BUCKET=reelcv-website-bucket
```

### Installation & Running
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```

## 🏗 Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for development and building
- **Zustand** for state management

### Backend Services
- **Supabase** for database and authentication
- **AWS S3** for video storage
- **AWS Transcribe** for speech-to-text
- **AWS Bedrock** for AI analysis

### Database Schema
- `videos` - Video metadata and URLs
- `video_analyses` - AI analysis results
- `skill_competency_frameworks` - Skill assessment criteria
- `analysis_benchmarks` - Industry comparison data
- `public_cv_links` - Shareable portfolio links

## 🤖 AI Analysis Pipeline

1. **Video Upload**: Secure upload to AWS S3
2. **Transcription**: AWS Transcribe converts speech to text
3. **Content Analysis**: Claude AI analyzes transcript for:
   - Technical skills and proficiency levels
   - Communication effectiveness
   - Personality traits and work style
   - Industry-specific insights
4. **Scoring & Benchmarking**: Comparative analysis against industry standards
5. **Recommendations**: Personalized improvement suggestions

## 🔒 Security & Privacy

- **Row Level Security (RLS)** on all database tables
- **AWS IAM** for secure service access
- **HTTPS** for all data transmission
- **User consent** for AI analysis
- **Data retention** policies for analysis results

## 📊 Analytics & Insights

### Video Performance Metrics
- View counts and engagement rates
- AI analysis scores and trends
- Skill verification status
- Industry benchmark comparisons

### AI-Generated Insights
- Technical skill proficiency mapping
- Communication style analysis
- Career development recommendations
- Interview preparation suggestions

## 🌐 Integration with ReelApps Ecosystem

### Cross-Platform Navigation
- **ReelHunter**: Job matching and recruitment
- **ReelSkills**: Skills assessment and verification
- **Unified Authentication**: Single sign-on across platforms

### Data Sharing
- Skills data synchronization
- Profile completion tracking
- Cross-platform analytics

## 🚀 Deployment

This repository is configured for deployment to `reelcv.reelapp.co.za`

### Production Environment
- **CDN**: Global content delivery
- **Auto-scaling**: Dynamic resource allocation
- **Monitoring**: Real-time performance tracking
- **Backup**: Automated data protection

## 📈 Performance Optimization

- **Lazy Loading**: Component and route-based code splitting
- **Image Optimization**: Automatic thumbnail generation
- **Caching**: Strategic data and asset caching
- **CDN Integration**: Global content delivery

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT - Part of ReelApps ecosystem

## 🆘 Support

For technical support or integration questions:
- Check the [ReelApps Documentation](https://docs.reelapp.co.za)
- Contact: support@reelapp.co.za
- GitHub Issues for bug reports

---

**ReelCV** - Showcase your talents through AI-powered video analysis