import React, { useState, useEffect } from 'react';
import { useAuthStore } from './hooks/useAuth';
import { Card, Button } from './components/ui';
import { 
  Share2,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Calendar,
  Settings,
  Sparkles,
  Zap,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { getSupabaseClient } from './hooks/useAuth';
import styles from './CandidateDashboard.module.css';

interface PublicLink {
  url: string;
  slug: string;
  expires_at: string;
  views: number;
  created_at: string;
}

interface ProfileStats {
  totalViews: number;
  profileScore: number;
  skillsFromReelSkills: number;
  projectsFromReelProjects: number;
  linkShares: number;
  profileCompleteness: number;
}

interface PortfolioSettings {
  linkExpiration: string;
  trackAnalytics: boolean;
  allowPublicIndexing: boolean;
  includeReelSkills: boolean;
  includeReelProjects: boolean;
  showVerificationBadges: boolean;
}

const CandidateDashboard: React.FC = () => {
  const { user, profile, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [publicLink, setPublicLink] = useState<PublicLink | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [stats, setStats] = useState<ProfileStats>({
    totalViews: 0,
    profileScore: 0,
    skillsFromReelSkills: 0,
    projectsFromReelProjects: 0,
    linkShares: 0,
    profileCompleteness: 0
  });

  const [portfolioSettings, setPortfolioSettings] = useState<PortfolioSettings>({
    linkExpiration: '1-year',
    trackAnalytics: true,
    allowPublicIndexing: false,
    includeReelSkills: true,
    includeReelProjects: true,
    showVerificationBadges: true
  });

  // Load data from external sources (ReelSkills, ReelProjects)
  useEffect(() => {
    if (!user) return;
    
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Load public link
        await fetchPublicLink();
        
        // Load aggregated stats from ReelSkills and ReelProjects
        await loadExternalStats();
        
        // Load portfolio settings
        await loadPortfolioSettings();
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const loadExternalStats = async () => {
    // This would fetch data from ReelSkills and ReelProjects APIs
    // For now, we'll simulate the data structure
    try {
      // In real implementation, these would be API calls to:
      // - ReelSkills API for verified skills count
      // - ReelProjects API for completed projects count
      // - Analytics for profile views and engagement
      
      setStats({
        totalViews: 1247, // From public CV link analytics
        profileScore: 87, // Calculated from ReelSkills + ReelProjects data
        skillsFromReelSkills: 12, // From ReelSkills API
        projectsFromReelProjects: 8, // From ReelProjects API
        linkShares: 24, // From link sharing analytics
        profileCompleteness: 92 // Based on data completeness across platforms
      });
    } catch (error) {
      console.error('Failed to load external stats:', error);
    }
  };

  const loadPortfolioSettings = async () => {
    if (!user) return;
    
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('portfolio_settings')
        .select('*')
        .eq('candidate_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setPortfolioSettings({
          linkExpiration: data.link_expiration || '1-year',
          trackAnalytics: data.track_analytics ?? true,
          allowPublicIndexing: data.allow_public_indexing ?? false,
          includeReelSkills: data.include_reel_skills ?? true,
          includeReelProjects: data.include_reel_projects ?? true,
          showVerificationBadges: data.show_verification_badges ?? true
        });
      }
    } catch (error) {
      console.error('Failed to load portfolio settings:', error);
    }
  };

  const savePortfolioSettings = async (newSettings: Partial<PortfolioSettings>) => {
    if (!user) return;
    
    setSettingsLoading(true);
    try {
      const updatedSettings = { ...portfolioSettings, ...newSettings };
      setPortfolioSettings(updatedSettings);

      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('portfolio_settings')
        .upsert({
          candidate_id: user.id,
          link_expiration: updatedSettings.linkExpiration,
          track_analytics: updatedSettings.trackAnalytics,
          allow_public_indexing: updatedSettings.allowPublicIndexing,
          include_reel_skills: updatedSettings.includeReelSkills,
          include_reel_projects: updatedSettings.includeReelProjects,
          show_verification_badges: updatedSettings.showVerificationBadges,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to save settings:', error);
        // Revert on error
        setPortfolioSettings(portfolioSettings);
      }
    } catch (error) {
      console.error('Failed to save portfolio settings:', error);
      // Revert on error
      setPortfolioSettings(portfolioSettings);
    } finally {
      setSettingsLoading(false);
    }
  };

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
        
        setPublicLink({
          url: `${base}/${data.slug}`,
          slug: data.slug,
          expires_at: data.expires_at,
          views: data.view_count || 0,
          created_at: data.created_at
        });
      }
    } catch (error) {
      console.error('Failed to fetch public link:', error);
    }
  };

  const generateLink = async () => {
    setLinkLoading(true);
    try {
      const supabase = getSupabaseClient();
      
      // Calculate expiration based on settings
      const expirationDays = portfolioSettings.linkExpiration === '1-year' ? 365 :
                           portfolioSettings.linkExpiration === '6-months' ? 180 :
                           portfolioSettings.linkExpiration === '3-months' ? 90 : 
                           null; // Never expire
      
      const { data, error } = await supabase.functions.invoke('generate-cv-link', {
        body: { 
          expiresInDays: expirationDays,
          settings: portfolioSettings
        },
      });
      
      if (!error && data) {
        const base = window.location.origin.includes('localhost')
          ? 'http://localhost:5174/public'
          : `${window.location.origin}/public`;
        
        setPublicLink({
          url: `${base}/${data.slug}`,
          slug: data.slug,
          expires_at: data.expires_at,
          views: 0,
          created_at: new Date().toISOString()
        });
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

  const handleShareLink = async () => {
    if (!publicLink) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.first_name || 'Professional'}'s Skills Portfolio`,
          text: 'Check out my proven skills and projects portfolio',
          url: publicLink.url,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(publicLink.url);
      alert('Portfolio link copied to clipboard!');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Toggle component for settings
  const ToggleSwitch: React.FC<{
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
  }> = ({ enabled, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled || settingsLoading}
      className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
        enabled ? 'bg-blue-600' : 'bg-slate-600'
      } ${disabled || settingsLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      />
    </button>
  );

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <div className="max-w-7xl mx-auto p-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading your portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={styles.title}>
                Skills Portfolio Hub
              </h1>
              <p className={styles.subtitle}>
                Welcome back, {profile?.first_name || user?.email?.split('@')[0]}! 
                Your proven skills and projects, redefined beyond traditional resumes.
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Stats Grid - Data from ReelSkills & ReelProjects */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className="flex items-center justify-between mb-2">
                <Eye size={20} className="text-blue-400" />
                <TrendingUp size={16} className="text-green-400" />
              </div>
              <div className={styles.statValue}>{stats.totalViews.toLocaleString()}</div>
              <div className={styles.statLabel}>Portfolio Views</div>
            </div>

            <div className={styles.statCard}>
              <div className="flex items-center justify-between mb-2">
                <Share2 size={20} className="text-blue-400" />
                <Zap size={16} className="text-blue-400" />
              </div>
              <div className={styles.statValue}>{stats.linkShares}</div>
              <div className={styles.statLabel}>Link Shares</div>
            </div>

            <div className={styles.statCard}>
              <div className="flex items-center justify-between mb-2">
                <Globe size={20} className="text-blue-400" />
                <Sparkles size={16} className="text-green-400" />
              </div>
              <div className={styles.statValue}>{stats.profileScore}</div>
              <div className={styles.statLabel}>Portfolio Score</div>
            </div>

            <div className={styles.statCard}>
              <div className="flex items-center justify-between mb-2">
                <BarChart3 size={20} className="text-blue-400" />
                <Zap size={16} className="text-green-400" />
              </div>
              <div className={styles.statValue}>{stats.profileCompleteness}%</div>
              <div className={styles.statLabel}>Completeness</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          {[
            { key: 'overview', label: 'Portfolio Overview', icon: Globe },
            { key: 'settings', label: 'Link Settings', icon: Settings }
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
            {/* Public CV Link - Main Feature */}
            <Card className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/30">
              <div className="text-center py-8">
                <Globe size={48} className="mx-auto text-blue-400 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Your Public Skills Portfolio</h2>
                <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                  Share your proven skills and projects with employers. No traditional resume needed - 
                  just pure, verified talent showcase powered by ReelSkills and ReelProjects.
                </p>
                
                {publicLink ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 max-w-2xl mx-auto">
                      <input
                        value={publicLink.url}
                        readOnly
                        className="flex-1 bg-transparent text-slate-300 truncate focus:outline-none text-center"
                      />
                      <Button 
                        variant="outline" 
                        size="small" 
                        onClick={() => navigator.clipboard.writeText(publicLink.url)}
                      >
                        <Copy size={14} className="mr-1" />
                        Copy
                      </Button>
                    </div>
                    
                    <div className="flex gap-3 justify-center">
                      <Button onClick={handleShareLink} className="bg-gradient-to-r from-green-600 to-blue-600">
                        <Share2 size={16} className="mr-2" />
                        Share Portfolio
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => window.open(publicLink.url, '_blank')}
                        className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                      >
                        <ExternalLink size={16} className="mr-2" />
                        Preview
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={revokeLink} 
                        disabled={linkLoading} 
                        className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                      >
                        {linkLoading ? 'Revoking...' : 'Revoke'}
                      </Button>
                    </div>
                    
                    <div className="text-sm text-slate-400 space-y-1">
                      <p>Views: {publicLink.views} | Created: {new Date(publicLink.created_at).toLocaleDateString()}</p>
                      <p>Expires: {new Date(publicLink.expires_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={generateLink} 
                    disabled={linkLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {linkLoading ? 'Generating...' : 'Generate Public Portfolio Link'}
                  </Button>
                )}
              </div>
            </Card>

            {/* Portfolio Analytics */}
            <Card className={styles.analyticsCard}>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-400" />
                Portfolio Performance
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-300">{stats.totalViews}</div>
                  <div className="text-sm text-slate-400">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-300">{stats.linkShares}</div>
                  <div className="text-sm text-slate-400">Shares</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-300">{stats.profileScore}</div>
                  <div className="text-sm text-slate-400">Portfolio Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-300">{stats.profileCompleteness}%</div>
                  <div className="text-sm text-slate-400">Complete</div>
                </div>
              </div>
            </Card>

            {/* Data Sources Info */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles size={20} className="text-blue-400" />
                  Automatic Data Integration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Zap size={16} className="text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">ReelSkills Integration</h4>
                        <p className="text-sm text-slate-400">Verified skills automatically displayed</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-300 mb-1">{stats.skillsFromReelSkills}</div>
                    <p className="text-sm text-slate-400">Skills verified and showcased</p>
                  </div>

                  <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Sparkles size={16} className="text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">ReelProjects Integration</h4>
                        <p className="text-sm text-slate-400">Proven projects automatically included</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-300 mb-1">{stats.projectsFromReelProjects}</div>
                    <p className="text-sm text-slate-400">Projects completed and documented</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-300">
                    <strong>No manual entry required!</strong> Your portfolio automatically syncs with verified skills from ReelSkills 
                    and proven projects from ReelProjects. Focus on building your expertise - we'll handle the showcase.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white">Portfolio Link Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className={styles.settingsCard}>
                <h3 className="text-lg font-bold text-white mb-4">Link Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Link Expiration</label>
                    <select 
                      value={portfolioSettings.linkExpiration}
                      onChange={(e) => savePortfolioSettings({ linkExpiration: e.target.value })}
                      disabled={settingsLoading}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white disabled:opacity-50"
                    >
                      <option value="1-year">1 Year (Recommended)</option>
                      <option value="6-months">6 Months</option>
                      <option value="3-months">3 Months</option>
                      <option value="never">Never Expire</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Track link analytics</span>
                    <ToggleSwitch
                      enabled={portfolioSettings.trackAnalytics}
                      onChange={(enabled) => savePortfolioSettings({ trackAnalytics: enabled })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Allow public indexing</span>
                    <ToggleSwitch
                      enabled={portfolioSettings.allowPublicIndexing}
                      onChange={(enabled) => savePortfolioSettings({ allowPublicIndexing: enabled })}
                    />
                  </div>
                </div>
              </Card>

              <Card className={styles.settingsCard}>
                <h3 className="text-lg font-bold text-white mb-4">Data Sources</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Include ReelSkills data</span>
                    <ToggleSwitch
                      enabled={portfolioSettings.includeReelSkills}
                      onChange={(enabled) => savePortfolioSettings({ includeReelSkills: enabled })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Include ReelProjects data</span>
                    <ToggleSwitch
                      enabled={portfolioSettings.includeReelProjects}
                      onChange={(enabled) => savePortfolioSettings({ includeReelProjects: enabled })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Show skill verification badges</span>
                    <ToggleSwitch
                      enabled={portfolioSettings.showVerificationBadges}
                      onChange={(enabled) => savePortfolioSettings({ showVerificationBadges: enabled })}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Settings Info */}
            <Card className="bg-blue-500/10 border-blue-500/30">
              <div className="p-6">
                <h3 className="text-lg font-bold text-blue-300 mb-3">Settings Information</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p><strong>Link Analytics:</strong> Track views, shares, and engagement metrics for your portfolio</p>
                  <p><strong>Public Indexing:</strong> Allow search engines to discover your portfolio (improves visibility)</p>
                  <p><strong>Data Sources:</strong> Control which platforms contribute to your portfolio showcase</p>
                  <p><strong>Verification Badges:</strong> Display skill verification status from ReelSkills assessments</p>
                </div>
              </div>
            </Card>

            {/* Current Link Management */}
            {publicLink && (
              <Card className={styles.settingsCard}>
                <h3 className="text-lg font-bold text-white mb-4">Current Portfolio Link</h3>
                <div className="space-y-4">
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Created:</span>
                      <div className="text-white">{new Date(publicLink.created_at).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Expires:</span>
                      <div className="text-white">{new Date(publicLink.expires_at).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Total Views:</span>
                      <div className="text-white">{publicLink.views}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Status:</span>
                      <div className="text-green-400">Active</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => window.open(publicLink.url, '_blank')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      Preview Portfolio
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleShareLink}
                      className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                    >
                      <Share2 size={16} className="mr-2" />
                      Share Link
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;