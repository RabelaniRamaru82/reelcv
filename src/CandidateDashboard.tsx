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
  Copy
} from 'lucide-react';
import { apps } from './config/apps';
import { getSupabaseClient } from './hooks/useAuth';
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
}

const CandidateDashboard: React.FC = () => {
  const { user, profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'analytics' | 'profile'>('overview');
  const [selectedVideo, setSelectedVideo] = useState<VideoShowcase | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [stats] = useState<ProfileStats>({
    totalViews: 1247,
    profileScore: 87,
    completionRate: 92,
    skillsVerified: 12,
    videosUploaded: 8,
    jobMatches: 24,
    responseRate: 78,
    avgRating: 4.6
  });

  const [videos] = useState<VideoShowcase[]>([
    {
      id: '1',
      title: 'Professional Introduction',
      description: 'A brief overview of my background, experience, and career goals in software development.',
      thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=225&fit=crop',
      duration: '2:34',
      views: 342,
      likes: 28,
      category: 'introduction',
      status: 'published',
      uploadedAt: '2024-01-15',
      skills: ['Communication', 'Leadership']
    },
    {
      id: '2',
      title: 'React Development Skills Demo',
      description: 'Live coding session demonstrating React hooks, state management, and component architecture.',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop',
      duration: '8:42',
      views: 189,
      likes: 15,
      category: 'skills',
      status: 'published',
      uploadedAt: '2024-01-12',
      skills: ['React', 'JavaScript', 'Frontend Development']
    },
    {
      id: '3',
      title: 'E-commerce Platform Project',
      description: 'Walkthrough of a full-stack e-commerce application I built using React, Node.js, and MongoDB.',
      thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=225&fit=crop',
      duration: '12:18',
      views: 567,
      likes: 42,
      category: 'project',
      status: 'published',
      uploadedAt: '2024-01-08',
      skills: ['Full-stack Development', 'Node.js', 'MongoDB', 'React']
    },
    {
      id: '4',
      title: 'Team Collaboration Testimonial',
      description: 'Former colleague discussing our successful project collaboration and my technical leadership.',
      thumbnail: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=225&fit=crop',
      duration: '3:56',
      views: 234,
      likes: 19,
      category: 'testimonial',
      status: 'published',
      uploadedAt: '2024-01-05',
      skills: ['Leadership', 'Team Collaboration', 'Project Management']
    },
    {
      id: '5',
      title: 'Python Data Analysis Demo',
      description: 'Demonstrating data analysis and visualization techniques using Python, Pandas, and Matplotlib.',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
      duration: '6:23',
      views: 156,
      likes: 12,
      category: 'skills',
      status: 'processing',
      uploadedAt: '2024-01-18',
      skills: ['Python', 'Data Analysis', 'Pandas']
    }
  ]);

  const [publicLink, setPublicLink] = useState<{ url: string; slug: string; expires_at: string } | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchPublicLink = async () => {
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
    fetchPublicLink();
  }, [user]);

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

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const handleNavigation = (path: string) => {
    if (!path) return;

    // Normalize path
    if (!path.startsWith('/')) {
      // Absolute/relative URL – just navigate
      window.open(path, '_self');
      return;
    }

    const parts = path.split('/').filter(Boolean); // remove leading slash
    const first = parts[0];

    // 1. In-app tab navigation
    if (['overview', 'videos', 'analytics', 'profile'].includes(first)) {
      setActiveTab(first as typeof activeTab);
      return;
    }

    // 2. Quick mapping for well-known aliases (e.g. /jobs should open ReelHunter jobs page)
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
      // Preserve any additional sub-path (e.g. /reelskills/some/route)
      const subPath = parts.slice(1).join('/');
      const target = subPath ? `${matchedApp.url}/${subPath}` : matchedApp.url;
      window.open(target, '_blank');
      return;
    }

    // 4. Fallback – navigate within current origin
    window.location.href = path;
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

  const renderVideoCard = (video: VideoShowcase) => {
    const CategoryIcon = getCategoryIcon(video.category);
    
    return (
      <div
        key={video.id}
        className={`${styles.videoCard} group relative`}
        onClick={() => setSelectedVideo(video)}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-slate-700/50">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
          
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

          {/* Skills Tags */}
          {video.skills && (
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
            <Button size="small" variant="outline" className="bg-slate-800/80 backdrop-blur-sm">
              <Play size={14} className="mr-1" />
              Watch
            </Button>
            <Button size="small" variant="outline" className="bg-slate-800/80 backdrop-blur-sm">
              <Share2 size={14} className="mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>
    );
  };

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
                Welcome back, {profile?.first_name || user?.email?.split('@')[0]}! Showcase your talents through video.
              </p>
            </div>
            <Button 
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-blue-500/25"
            >
              <Camera size={16} className="mr-2" />
              Record New Video
            </Button>
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
                <Star size={20} className="text-blue-400" />
                <Sparkles size={16} className="text-blue-400" />
              </div>
              <div className={styles.statValue}>{stats.avgRating.toFixed(1)}</div>
              <div className={styles.statLabel}>Avg Rating</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'videos', label: 'Video Showcase', icon: Video },
            { key: 'analytics', label: 'Analytics', icon: TrendingUp },
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
            {/* Quick Actions */}
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
                      <p className="text-sm text-slate-400">Manage your video portfolio</p>
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
                    <ChevronRight size={14} className="ml-auto" />
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
                      <p className="text-sm text-slate-400">Find your next role</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-700/50">
                    <ChevronRight size={14} className="ml-auto" />
                    View Matches
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
                    <BarChart3 size={24} className="text-blue-400" />
                    <div>
                      <h3 className="text-lg font-bold text-white">Performance</h3>
                      <p className="text-sm text-slate-400">Track your progress</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-700/50">
                    <ChevronRight size={14} className="ml-auto" />
                    View Analytics
                  </Button>
                </Card.Header>
              </Card>
            </div>

            {/* Recent Videos Preview */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.slice(0, 3).map(renderVideoCard)}
              </div>
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
                >
                  <Upload size={16} className="mr-2" />
                  Upload Video
                </Button>
                <Button 
                  onClick={() => setShowUploadModal(true)}
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
                  className="px-4 py-2 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl whitespace-nowrap transition-all capitalize"
                >
                  {category === 'all' ? 'All Videos' : category}
                </button>
              ))}
            </div>

            {/* Videos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map(renderVideoCard)}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
            
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className={styles.analyticsCard}>
                <h3 className="text-lg font-bold text-white mb-4">Video Performance</h3>
                <div className="space-y-4">
                  {videos.slice(0, 3).map((video) => (
                    <div key={video.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{video.title}</p>
                        <p className="text-sm text-slate-400">{video.views} views • {video.likes} likes</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-300">{Math.round((video.likes / video.views) * 100)}%</div>
                        <div className="text-xs text-slate-400">Engagement</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className={styles.analyticsCard}>
                <h3 className="text-lg font-bold text-white mb-4">Profile Insights</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Profile Completeness</span>
                    <span className="text-blue-300 font-bold">{stats.completionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Skill Verification Rate</span>
                    <span className="text-blue-300 font-bold">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Video Quality Score</span>
                    <span className="text-blue-300 font-bold">4.2/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Recruiter Interest</span>
                    <span className="text-blue-300 font-bold">High</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* AI Recommendations */}
            <Card className={styles.aiRecommendationsCard}>
              <div className="flex items-center gap-3 mb-4">
                <Brain size={24} className="text-blue-400" />
                <h3 className="text-xl font-bold text-white">AI Recommendations</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-blue-300 mb-3">Content Suggestions</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <ChevronRight size={14} className="text-blue-400" />
                      Create a project walkthrough video to showcase full-stack skills
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight size={14} className="text-blue-400" />
                      Add testimonials from colleagues to build credibility
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight size={14} className="text-blue-400" />
                      Record a problem-solving session to demonstrate thinking process
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-300 mb-3">Optimization Tips</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <ChevronRight size={14} className="text-blue-400" />
                      Improve video thumbnails for better click-through rates
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight size={14} className="text-blue-400" />
                      Add captions to increase accessibility and engagement
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight size={14} className="text-blue-400" />
                      Keep videos under 5 minutes for optimal viewer retention
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
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
                      <span className="text-slate-300">Enable video analytics</span>
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
                  <h3 className="text-lg font-bold text-white mb-4">Recording Quality</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Video Resolution</label>
                      <select className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white">
                        <option>1080p (Recommended)</option>
                        <option>720p</option>
                        <option>480p</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Audio Quality</label>
                      <select className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white">
                        <option>High (320kbps)</option>
                        <option>Medium (192kbps)</option>
                        <option>Low (128kbps)</option>
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
                      <span className="text-slate-300">Allow video downloads</span>
                      <button className="w-12 h-6 bg-slate-600 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Enable comments</span>
                      <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </button>
                    </div>
                  </div>
                </Card>

                <Card className={styles.settingsCard}>
                  <h3 className="text-lg font-bold text-white mb-4">Export & Backup</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-700/50">
                      <Download size={16} className="mr-2" />
                      Download All Videos
                    </Button>
                    <Button variant="outline" className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-700/50">
                      <Share2 size={16} className="mr-2" />
                      Export Portfolio Link
                    </Button>
                    <Button variant="outline" className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-700/50">
                      <Upload size={16} className="mr-2" />
                      Backup to Cloud
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
                  <Button variant="outline" size="small" onClick={() => navigator.clipboard.writeText(publicLink.url)}>
                    <Copy size={14} className="mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="small" onClick={revokeLink} disabled={linkLoading} className="border-red-500/50 text-red-300 hover:bg-red-500/10">
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
    </div>
  );
};

export default CandidateDashboard;