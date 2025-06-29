import React, { useState, useEffect } from 'react';
import { useAuthStore } from './hooks/useAuth';
import { Card, Button } from './components/ui';
import { 
  Video, 
  Star, 
  TrendingUp, 
  Eye, 
  Award, 
  Target, 
  Users, 
  Calendar, 
  Briefcase, 
  ChevronRight,
  Play,
  Upload,
  Edit3,
  Share2,
  Download,
  BarChart3,
  Brain,
  Sparkles,
  Camera,
  Film,
  Mic,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Copy,
  Zap,
  ExternalLink
} from 'lucide-react';
import { apps } from './config/apps';
import { getSupabaseClient } from './hooks/useAuth';
import { AnalysisModal } from './components/VideoAnalysis/AnalysisModal';
import styles from './CandidateDashboard.module.css';

interface VideoShowcase {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  category: 'introduction' | 'skills' | 'project' | 'testimonial';
  status: 'draft' | 'published' | 'processing';
  uploadedAt: string;
  skills?: string[];
  hasAIAnalysis?: boolean;
  aiScore?: number;
  url?: string;
}

interface ProfileStats {
  totalViews: number;
  profileScore: number;
  completionRate: number;
  skillsVerified: number;
  videosUploaded: number;
  jobMatches: number;
  responseRate: number;
  avgRating: number;
  aiAnalysesCompleted: number;
}

const CandidateDashboard: React.FC = () => {
  const { user, profile, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'analytics' | 'profile'>('overview');
  const [selectedVideo, setSelectedVideo] = useState<VideoShowcase | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videos, setVideos] = useState<VideoShowcase[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    totalViews: 0,
    profileScore: 0,
    completionRate: 0,
    skillsVerified: 0,
    videosUploaded: 0,
    jobMatches: 0,
    responseRate: 0,
    avgRating: 0,
    aiAnalysesCompleted: 0
  });

  const [publicLink, setPublicLink] = useState<{ url: string; slug: string; expires_at: string } | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load real data from Supabase
  useEffect(() => {
    if (!user) return;
    
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const supabase = getSupabaseClient();
        
        // Load videos
        const { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select(`
            *,
            video_analyses(
              id,
              analysis_data,
              processing_status
            )
          `)
          .eq('candidate_id', user.id)
          .order('created_at', { ascending: false });

        if (!videosError && videosData) {
          const formattedVideos: VideoShowcase[] = videosData.map(video => ({
            id: video.id,
            title: video.title || 'Untitled Video',
            description: video.description || '',
            thumbnail: video.thumbnail_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=225&fit=crop',
            duration: video.duration || '0:00',
            views: video.view_count || 0,
            likes: video.like_count || 0,
            category: video.category || 'introduction',
            status: video.status || 'draft',
            uploadedAt: new Date(video.created_at).toLocaleDateString(),
            skills: video.skills || [],
            hasAIAnalysis: video.video_analyses && video.video_analyses.length > 0,
            aiScore: video.video_analyses?.[0]?.analysis_data?.overallScore || null,
            url: video.video_url
          }));
          setVideos(formattedVideos);
        }

        // Calculate stats from real data
        const totalViews = videosData?.reduce((sum, video) => sum + (video.view_count || 0), 0) || 0;
        const aiAnalysesCount = videosData?.filter(video => video.video_analyses && video.video_analyses.length > 0).length || 0;
        
        setStats({
          totalViews,
          profileScore: profile?.profile_score || 0,
          completionRate: profile?.completion_rate || 0,
          skillsVerified: profile?.skills_verified || 0,
          videosUploaded: videosData?.length || 0,
          jobMatches: 0, // This would come from job matching service
          responseRate: 0, // This would come from application tracking
          avgRating: 0, // This would come from peer reviews
          aiAnalysesCompleted: aiAnalysesCount
        });

        // Load public link
        await fetchPublicLink();
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user, profile]);

  const fetchPublicLink = async () => {
    if (!user) return;
    
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('public_cv_links')
        .select('*')
        .eq('candidate_id', user.id)
        .eq('revoked', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const base = window.location.origin.includes('localhost')
          ? 'http://localhost:5174/public'
          : `${window.location.origin}/public`;
        setPublicLink({ url: `${base}/${data.slug}`, slug: data.slug, expires_at: data.expires_at });
      }
    } catch (error) {
      console.error('Failed to fetch public link:', error);
    }
  };

  const generateLink = async () => {
    setLinkLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.functions.invoke('generate-cv-link', {
        body: { expiresInDays: 30 },
      });
      if (!error) {
        setPublicLink(data as any);
      }
    } catch (error) {
      console.error('Failed to generate link:', error);
    }
    setLinkLoading(false);
  };

  const revokeLink = async () => {
    if (!publicLink) return;
    setLinkLoading(true);
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('public_cv_links')
        .update({ revoked: true })
        .eq('slug', publicLink.slug);
      setPublicLink(null);
    } catch (error) {
      console.error('Failed to revoke link:', error);
    }
    setLinkLoading(false);
  };

  const handleNavigation = (path: string) => {
    if (!path) return;

    // Normalize path
    if (!path.startsWith('/')) {
      // Absolute/relative URL – just navigate
      window.open(path, '_self');
      return;
    }

    const parts = path.split('/').filter(Boolean);
    const first = parts[0];

    // 1. In-app tab navigation
    if (['overview', 'videos', 'analytics', 'profile'].includes(first)) {
      setActiveTab(first as typeof activeTab);
      return;
    }

    // 2. Quick mapping for well-known aliases
    if (first === 'jobs') {
      const hunter = apps.find(a => a.id === 'reel-hunter');
      if (hunter) {
        window.open(`${hunter.url}/jobs`, '_blank');
      }
      return;
    }

    // 3. Micro-frontend detection using apps config
    const matchedApp = apps.find(appConf => {
      const cleanedId = appConf.id.replace(/-/g, '').toLowerCase();
      return cleanedId === first.toLowerCase();
    });

    if (matchedApp) {
      const subPath = parts.slice(1).join('/');
      const target = subPath ? `${matchedApp.url}/${subPath}` : matchedApp.url;
      window.open(target, '_blank');
      return;
    }

    // 4. Fallback – navigate within current origin
    window.location.href = path;
  };

  const handleVideoUpload = () => {
    // This would open a video upload modal or redirect to upload page
    setShowUploadModal(true);
    console.log('Opening video upload modal...');
  };

  const handleVideoRecord = () => {
    // This would open a video recording interface
    console.log('Opening video recording interface...');
    // For now, just show upload modal
    setShowUploadModal(true);
  };

  const handleWatchVideo = (video: VideoShowcase) => {
    if (video.url) {
      window.open(video.url, '_blank');
    } else {
      console.log(`Playing video: ${video.title}`);
      // This would open a video player modal or navigate to video page
    }
  };

  const handleShareVideo = async (video: VideoShowcase) => {
    const shareUrl = `${window.location.origin}/video/${video.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareUrl);
      alert('Video link copied to clipboard!');
    }
  };

  const handleVideoAnalysis = (video: VideoShowcase) => {
    setSelectedVideo(video);
    setShowAnalysisModal(true);
  };

  const handleDownloadVideos = async () => {
    try {
      // This would create a zip file of all videos
      console.log('Downloading all videos...');
      alert('Video download will start shortly. This feature is coming soon!');
    } catch (error) {
      console.error('Failed to download videos:', error);
    }
  };

  const handleExportAIReports = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('video_analyses')
        .select('*')
        .eq('candidate_id', user?.id);

      if (!error && data) {
        const reportData = JSON.stringify(data, null, 2);
        const blob = new Blob([reportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-analysis-reports-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export AI reports:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'draft': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 border-green-500/30';
      case 'processing': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'draft': return 'bg-gray-500/20 border-gray-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'introduction': return Users;
      case 'skills': return Target;
      case 'project': return Briefcase;
      case 'testimonial': return Star;
      default: return Video;
    }
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  const renderVideoCard = (video: VideoShowcase) => {
    const CategoryIcon = getCategoryIcon(video.category);
    
    return (
      <div
        key={video.id}
        className={`${styles.videoCard} group relative`}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-slate-700/50">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
          
          {/* AI Analysis Badge */}
          {video.hasAIAnalysis && video.aiScore && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-purple-600/80 backdrop-blur-sm rounded text-xs text-white">
              <Brain size={10} />
              AI: {video.aiScore}
            </div>
          )}

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Play size={24} className="text-white ml-1" />
            </div>
          </div>

          {/* Status Badge */}
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBg(video.status)}`}>
            {video.status === 'processing' && <Clock size={10} className={`inline mr-1 ${getStatusColor(video.status)}`} />}
            {video.status === 'published' && <CheckCircle size={10} className={`inline mr-1 ${getStatusColor(video.status)}`} />}
            {video.status === 'draft' && <Edit3 size={10} className={`inline mr-1 ${getStatusColor(video.status)}`} />}
            {video.status}
          </div>

          {/* Duration */}
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white">
            {video.duration}
          </div>

          {/* Category */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white">
            <CategoryIcon size={10} />
            {video.category}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-2">
            {video.title}
          </h3>
          <p className="text-sm text-slate-400 mb-3 line-clamp-2">
            {video.description}
          </p>

          {/* AI Analysis Summary */}
          {video.hasAIAnalysis && video.aiScore && (
            <div className="mb-3 p-2 bg-purple-500/10 border border-purple-500/20 rounded">
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-300">AI Analysis Complete</span>
                <span className={`font-bold ${getAIScoreColor(video.aiScore)}`}>
                  Score: {video.aiScore}/100
                </span>
              </div>
            </div>
          )}

          {/* Skills Tags */}
          {video.skills && video.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {video.skills.slice(0, 3).map((skill) => (
                <span key={skill} className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300">
                  {skill}
                </span>
              ))}
              {video.skills.length > 3 && (
                <span className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400">
                  +{video.skills.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye size={12} />
                {video.views}
              </span>
              <span className="flex items-center gap-1">
                <Star size={12} />
                {video.likes}
              </span>
            </div>
            <span>{video.uploadedAt}</span>
          </div>
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <div className="flex gap-2">
            <Button 
              size="small" 
              variant="outline" 
              className="bg-slate-800/80 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleWatchVideo(video);
              }}
            >
              <Play size={14} className="mr-1" />
              Watch
            </Button>
            {!video.hasAIAnalysis && video.status === 'published' && (
              <Button 
                size="small" 
                variant="outline" 
                className="bg-purple-600/80 backdrop-blur-sm border-purple-500/50 text-purple-200 hover:bg-purple-500/80"
                onClick={(e) => {
                  e.stopPropagation();
                  handleVideoAnalysis(video);
                }}
              >
                <Brain size={14} className="mr-1" />
                AI Analyze
              </Button>
            )}
            <Button 
              size="small" 
              variant="outline" 
              className="bg-slate-800/80 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleShareVideo(video);
              }}
            >
              <Share2 size={14} className="mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <div className="max-w-7xl mx-auto p-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={styles.title}>
                Video CV Showcase
              </h1>
              <p className={styles.subtitle}>
                Welcome back, {profile?.first_name || user?.email?.split('@')[0]}! Showcase your talents through AI-powered video analysis.
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleVideoRecord}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-blue-500/25"
              >
                <Camera size={16} className="mr-2" />
                Record New Video
              </Button>
              <Button 
                variant="outline"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                onClick={() => setActiveTab('analytics')}
              >
                <Brain size={16} className="mr-2" />
                AI Insights
              </Button>
              <Button 
                variant="outline"
                className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className="flex items-center justify-between mb-2">
                <Eye size={20} className="text-blue-400" />
                <TrendingUp size={16} className="text-green-400" />
              </div>
              <div className={styles.statValue}>{stats.totalViews.toLocaleString()}</div>
              <div className={styles.statLabel}>Total Views</div>
            </div>

            <div className={styles.statCard}>
              <div className="flex items-center justify-between mb-2">
                <Star size={20} className="text-blue-400" />
                <Sparkles size={16} className="text-blue-400" />
              </div>
              <div className={styles.statValue}>{stats.profileScore}</div>
              <div className={styles.statLabel}>Profile Score</div>
            </div>

            <div className={styles.statCard}>
              <div className="flex items-center justify-between mb-2">
                <CheckCircle size={20} className="text-blue-400" />
                <TrendingUp size={16} className="text-green-400" />
              </div>
              <div className={styles.statValue}>{stats.completionRate}%</div>
              <div className={styles.statLabel}>Complete</div>
            </div>

            <div className={styles.statCard}>
              <div className="flex items-center justify-between mb-2">
                <Award size={20} className="text-blue-400" />
                <Target size={16} className="text-blue-400" />
              </div>
              <div className={styles.statValue}>{stats.skillsVerified}</div>
              <div className={styles.statLabel}>Skills Verified</div>
            </div>

            <div className={styles.statCard}>
              <div className="flex items-center justify-between mb-2">
                <Video size={20} className="text-blue-400" />
                <Film size={16} className="text-blue-400" />
              </div>
              <div className={styles.statValue}>{stats.videosUploaded}</div>
              <div className={styles.statLabel}>Videos</div>
            </div>

            <div className={styles.statCard}>
              <div className="flex items-center justify-between mb-2">
                <Briefcase size={20} className="text-blue-400" />
                <Users size={16} className="text-blue-400" />
              </div>
              <div className={styles.statValue}>{stats.jobMatches}</div>
              <div className={styles.statLabel}>Job Matches</div>
            </div>

            <div className={styles.statCard}>
              <div className="flex items-center justify-between mb-2">
                <BarChart3 size={20} className="text-blue-400" />
                <ChevronRight size={16} className="text-blue-400" />
              </div>
              <div className={styles.statValue}>{stats.responseRate}%</div>
              <div className={styles.statLabel}>Response Rate</div>
            </div>

            <div className={styles.statCard}>
              <div className="flex items-center justify-between mb-2">
                <Brain size={20} className="text-purple-400" />
                <Zap size={16} className="text-purple-400" />
              </div>
              <div className={styles.statValue}>{stats.aiAnalysesCompleted}</div>
              <div className={styles.statLabel}>AI Analyses</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'videos', label: 'Video Showcase', icon: Video },
            { key: 'analytics', label: 'AI Analytics', icon: Brain },
            { key: 'profile', label: 'Profile Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* AI-Powered Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card
                interactive
                onClick={() => setActiveTab('videos')}
                className={styles.actionCard}
              >
                <Card.Header>
                  <div className="flex items-center gap-3 mb-3">
                    <Video size={24} className="text-blue-400" />
                    <div>
                      <h3 className="text-lg font-bold text-white">Video Showcase</h3>
                      <p className="text-sm text-slate-400">AI-enhanced video portfolio</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-700/50">
                    <ChevronRight size={14} className="ml-auto" />
                    View All Videos
                  </Button>
                </Card.Header>
              </Card>

              <Card
                interactive
                onClick={() => setActiveTab('analytics')}
                className={styles.actionCard}
              >
                <Card.Header>
                  <div className="flex items-center gap-3 mb-3">
                    <Brain size={24} className="text-purple-400" />
                    <div>
                      <h3 className="text-lg font-bold text-white">AI Analytics</h3>
                      <p className="text-sm text-slate-400">Deep skill analysis & insights</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-700/50">
                    <ChevronRight size={14} className="ml-auto" />
                    View AI Insights
                  </Button>
                </Card.Header>
              </Card>

              <Card
                interactive
                onClick={() => handleNavigation('/reelskills')}
                className={styles.actionCard}
              >
                <Card.Header>
                  <div className="flex items-center gap-3 mb-3">
                    <Target size={24} className="text-blue-400" />
                    <div>
                      <h3 className="text-lg font-bold text-white">Skills Portfolio</h3>
                      <p className="text-sm text-slate-400">Showcase your abilities</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-700/50">
                    <ExternalLink size={14} className="ml-auto" />
                    Manage Skills
                  </Button>
                </Card.Header>
              </Card>

              <Card
                interactive
                onClick={() => handleNavigation('/jobs')}
                className={styles.actionCard}
              >
                <Card.Header>
                  <div className="flex items-center gap-3 mb-3">
                    <Briefcase size={24} className="text-blue-400" />
                    <div>
                      <h3 className="text-lg font-bold text-white">Job Opportunities</h3>
                      <p className="text-sm text-slate-400">AI-matched positions</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-700/50">
                    <ExternalLink size={14} className="ml-auto" />
                    View Matches
                  </Button>
                </Card.Header>
              </Card>
            </div>

            {/* Recent Videos with AI Analysis */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Videos</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('videos')}
                  className="border-slate-700/50 text-slate-300 hover:bg-slate-700/50"
                >
                  View All
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
              {videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.slice(0, 3).map(renderVideoCard)}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <Video size={48} className="mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No videos yet</h3>
                  <p className="text-slate-400 mb-6">Start building your video portfolio to showcase your skills</p>
                  <Button onClick={handleVideoRecord} className="bg-gradient-to-r from-blue-600 to-cyan-600">
                    <Camera size={16} className="mr-2" />
                    Record Your First Video
                  </Button>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Video Showcase</h2>
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  className="border-slate-700/50 text-slate-300 hover:bg-slate-700/50"
                  onClick={handleVideoUpload}
                >
                  <Upload size={16} className="mr-2" />
                  Upload Video
                </Button>
                <Button 
                  onClick={handleVideoRecord}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                >
                  <Camera size={16} className="mr-2" />
                  Record Live
                </Button>
              </div>
            </div>

            {/* Video Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['all', 'introduction', 'skills', 'project', 'testimonial'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all capitalize ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'
                  }`}
                >
                  {category === 'all' ? 'All Videos' : category}
                </button>
              ))}
            </div>

            {/* Videos Grid */}
            {filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map(renderVideoCard)}
              </div>
            ) : (
              <Card className="text-center py-12">
                <Video size={48} className="mx-auto text-slate-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {selectedCategory === 'all' ? 'No videos yet' : `No ${selectedCategory} videos`}
                </h3>
                <p className="text-slate-400 mb-6">
                  {selectedCategory === 'all' 
                    ? 'Start building your video portfolio to showcase your skills'
                    : `Create your first ${selectedCategory} video to get started`
                  }
                </p>
                <Button onClick={handleVideoRecord} className="bg-gradient-to-r from-blue-600 to-cyan-600">
                  <Camera size={16} className="mr-2" />
                  Record Video
                </Button>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white">AI Analytics Dashboard</h2>
            
            {stats.aiAnalysesCompleted > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className={styles.analyticsCard}>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Brain size={20} className="text-purple-400" />
                    AI Video Performance
                  </h3>
                  <div className="space-y-4">
                    {videos.filter(v => v.hasAIAnalysis).map((video) => (
                      <div key={video.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{video.title}</p>
                          <p className="text-sm text-slate-400">{video.views} views • AI Score: {video.aiScore}/100</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getAIScoreColor(video.aiScore!)}`}>
                            {video.aiScore}%
                          </div>
                          <div className="text-xs text-slate-400">AI Rating</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className={styles.analyticsCard}>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Target size={20} className="text-blue-400" />
                    Skill Analysis Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Videos Analyzed</span>
                      <span className="text-blue-300 font-bold">{stats.aiAnalysesCompleted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Skills Verified</span>
                      <span className="text-blue-300 font-bold">{stats.skillsVerified}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Profile Completion</span>
                      <span className="text-blue-300 font-bold">{stats.completionRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Total Views</span>
                      <span className="text-blue-300 font-bold">{stats.totalViews}</span>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="text-center py-12">
                <Brain size={48} className="mx-auto text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No AI Analysis Yet</h3>
                <p className="text-slate-400 mb-6">Upload and publish videos to get AI-powered insights</p>
                <Button onClick={() => setActiveTab('videos')} className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <Video size={16} className="mr-2" />
                  View Videos
                </Button>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className={styles.settingsCard}>
                  <h3 className="text-lg font-bold text-white mb-4">Video Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Auto-generate thumbnails</span>
                      <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Enable AI analysis</span>
                      <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Public profile visibility</span>
                      <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </button>
                    </div>
                  </div>
                </Card>

                <Card className={styles.settingsCard}>
                  <h3 className="text-lg font-bold text-white mb-4">AI Analysis Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Default Analysis Depth</label>
                      <select className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white">
                        <option>Comprehensive (Recommended)</option>
                        <option>Standard</option>
                        <option>Quick</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Industry Context</label>
                      <select className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white">
                        <option>Software Development</option>
                        <option>Data Science</option>
                        <option>Product Management</option>
                        <option>Design</option>
                      </select>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className={styles.settingsCard}>
                  <h3 className="text-lg font-bold text-white mb-4">Privacy & Sharing</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Default video visibility</label>
                      <select className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white">
                        <option>Public</option>
                        <option>Unlisted</option>
                        <option>Private</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Share AI insights publicly</span>
                      <button className="w-12 h-6 bg-slate-600 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Enable skill benchmarking</span>
                      <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </button>
                    </div>
                  </div>
                </Card>

                <Card className={styles.settingsCard}>
                  <h3 className="text-lg font-bold text-white mb-4">Export & Backup</h3>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                      onClick={handleDownloadVideos}
                    >
                      <Download size={16} className="mr-2" />
                      Download All Videos
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-purple-600/50 text-purple-300 hover:bg-purple-500/10"
                      onClick={handleExportAIReports}
                    >
                      <Brain size={16} className="mr-2" />
                      Export AI Analysis Reports
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                      onClick={() => {
                        if (publicLink) {
                          navigator.clipboard.writeText(publicLink.url);
                          alert('Portfolio link copied to clipboard!');
                        }
                      }}
                    >
                      <Share2 size={16} className="mr-2" />
                      Share Portfolio Link
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-bold text-white">Public CV Link</h3>
              {publicLink ? (
                <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <input
                    value={publicLink.url}
                    readOnly
                    className="flex-1 bg-transparent text-slate-300 truncate focus:outline-none"
                  />
                  <Button 
                    variant="outline" 
                    size="small" 
                    onClick={() => navigator.clipboard.writeText(publicLink.url)}
                  >
                    <Copy size={14} className="mr-1" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="small" 
                    onClick={revokeLink} 
                    disabled={linkLoading} 
                    className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                  >
                    {linkLoading ? 'Revoking...' : 'Revoke'}
                  </Button>
                </div>
              ) : (
                <Button onClick={generateLink} disabled={linkLoading}>
                  {linkLoading ? 'Generating...' : 'Generate Public CV Link'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Analysis Modal */}
      {showAnalysisModal && selectedVideo && user && (
        <AnalysisModal
          isOpen={showAnalysisModal}
          onClose={() => {
            setShowAnalysisModal(false);
            setSelectedVideo(null);
          }}
          video={selectedVideo}
          candidateId={user.id}
        />
      )}

      {/* Upload Modal Placeholder */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Upload Video</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <p className="text-slate-400 mb-6">Video upload functionality coming soon!</p>
            <Button 
              onClick={() => setShowUploadModal(false)}
              className="w-full"
            >
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;