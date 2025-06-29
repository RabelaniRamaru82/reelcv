import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Card, Button } from './components/ui';
import { 
  Globe, 
  Target, 
  Award, 
  ExternalLink, 
  Calendar,
  MapPin,
  Mail,
  Linkedin,
  Github,
  Star,
  CheckCircle,
  TrendingUp,
  Code,
  Briefcase
} from 'lucide-react';

interface PublicLinkRow {
  candidate_id: string;
  view_count: number;
}

interface SkillData {
  name: string;
  level: string;
  verified: boolean;
  category: string;
  endorsements: number;
}

interface ProjectData {
  title: string;
  description: string;
  technologies: string[];
  status: string;
  impact: string;
  link?: string;
}

interface CandidateProfile {
  first_name: string;
  last_name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const PublicCV: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!slug) return;
      
      try {
        // Get candidate ID from public link
        const { data: linkData, error: linkError } = await supabase
          .from('public_cv_links')
          .select('candidate_id, view_count')
          .eq('slug', slug)
          .eq('revoked', false)
          .maybeSingle<PublicLinkRow>();

        if (linkError || !linkData) {
          setError('This portfolio link is invalid or has expired.');
          setLoading(false);
          return;
        }

        setCandidateId(linkData.candidate_id);

        // Increment view count
        await supabase
          .from('public_cv_links')
          .update({ view_count: (linkData.view_count || 0) + 1 })
          .eq('slug', slug);

        // Fetch candidate profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', linkData.candidate_id)
          .single();

        if (!profileError && profileData) {
          setProfile(profileData);
        }

        // In a real implementation, these would be API calls to ReelSkills and ReelProjects
        // For now, we'll simulate the data
        await loadSkillsFromReelSkills(linkData.candidate_id);
        await loadProjectsFromReelProjects(linkData.candidate_id);

      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        setError('Failed to load portfolio data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [slug]);

  const loadSkillsFromReelSkills = async (candidateId: string) => {
    // This would be an API call to ReelSkills service
    // Simulating the response structure
    const mockSkills: SkillData[] = [
      {
        name: 'React',
        level: 'Expert',
        verified: true,
        category: 'Frontend',
        endorsements: 15
      },
      {
        name: 'TypeScript',
        level: 'Advanced',
        verified: true,
        category: 'Programming',
        endorsements: 12
      },
      {
        name: 'Node.js',
        level: 'Advanced',
        verified: true,
        category: 'Backend',
        endorsements: 10
      },
      {
        name: 'AWS',
        level: 'Intermediate',
        verified: true,
        category: 'Cloud',
        endorsements: 8
      },
      {
        name: 'Python',
        level: 'Advanced',
        verified: true,
        category: 'Programming',
        endorsements: 14
      }
    ];
    
    setSkills(mockSkills);
  };

  const loadProjectsFromReelProjects = async (candidateId: string) => {
    // This would be an API call to ReelProjects service
    // Simulating the response structure
    const mockProjects: ProjectData[] = [
      {
        title: 'E-commerce Platform Redesign',
        description: 'Led the complete redesign of a high-traffic e-commerce platform, improving conversion rates by 35% and reducing load times by 60%.',
        technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
        status: 'Completed',
        impact: '35% increase in conversion rate, 60% faster load times',
        link: 'https://github.com/example/ecommerce-platform'
      },
      {
        title: 'Real-time Analytics Dashboard',
        description: 'Built a real-time analytics dashboard for monitoring business KPIs with live data visualization and automated alerting.',
        technologies: ['React', 'D3.js', 'WebSocket', 'Python', 'Redis'],
        status: 'Completed',
        impact: 'Reduced decision-making time by 50%',
        link: 'https://github.com/example/analytics-dashboard'
      },
      {
        title: 'AI-Powered Content Recommendation Engine',
        description: 'Developed a machine learning-based content recommendation system that increased user engagement by 40%.',
        technologies: ['Python', 'TensorFlow', 'FastAPI', 'Docker', 'Kubernetes'],
        status: 'Completed',
        impact: '40% increase in user engagement'
      }
    ];
    
    setProjects(mockProjects);
  };

  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'advanced': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'beginner': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !candidateId || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center text-center p-4">
        <Card className="max-w-md bg-slate-800/50 border-slate-700/50">
          <div className="p-8">
            <Globe size={48} className="mx-auto text-slate-400 mb-4" />
            <h1 className="text-xl font-bold mb-3 text-white">Portfolio Not Found</h1>
            <p className="mb-6 text-slate-400">{error || 'This portfolio link is invalid or has expired.'}</p>
            <Button as="a" href="https://reelapp.co.za" variant="primary">
              Visit ReelApps
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-300 text-sm mb-4">
            <Globe size={16} />
            Skills Portfolio - Beyond Traditional Resumes
          </div>
        </div>

        {/* Profile Header */}
        <Card className="mb-8 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/50">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profile.first_name} {profile.last_name}
                </h1>
                <p className="text-xl text-blue-300 mb-3">{profile.title}</p>
                <p className="text-slate-300 mb-4 max-w-2xl">{profile.bio}</p>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-slate-400">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      {profile.location}
                    </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center gap-1">
                      <Mail size={14} />
                      {profile.email}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                {profile.linkedin_url && (
                  <Button 
                    as="a" 
                    href={profile.linkedin_url} 
                    target="_blank"
                    variant="outline"
                    size="small"
                    className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                  >
                    <Linkedin size={16} />
                  </Button>
                )}
                {profile.github_url && (
                  <Button 
                    as="a" 
                    href={profile.github_url} 
                    target="_blank"
                    variant="outline"
                    size="small"
                    className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                  >
                    <Github size={16} />
                  </Button>
                )}
                {profile.portfolio_url && (
                  <Button 
                    as="a" 
                    href={profile.portfolio_url} 
                    target="_blank"
                    variant="outline"
                    size="small"
                    className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                  >
                    <ExternalLink size={16} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Skills Section */}
          <div className="lg:col-span-2">
            <Card className="mb-8 bg-slate-800/30 border-slate-700/50">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Target size={24} className="text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">Verified Skills</h2>
                  <div className="text-sm text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                    From ReelSkills
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map((skill, index) => (
                    <div key={index} className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{skill.name}</h3>
                        {skill.verified && (
                          <CheckCircle size={16} className="text-green-400" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getSkillLevelColor(skill.level)}`}>
                          {skill.level}
                        </span>
                        <span className="text-xs text-slate-400">{skill.category}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Star size={12} />
                        {skill.endorsements} endorsements
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Projects Section */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Award size={24} className="text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">Proven Projects</h2>
                  <div className="text-sm text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                    From ReelProjects
                  </div>
                </div>
                
                <div className="space-y-6">
                  {projects.map((project, index) => (
                    <div key={index} className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                        {project.link && (
                          <Button 
                            as="a" 
                            href={project.link} 
                            target="_blank"
                            variant="outline"
                            size="small"
                            className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                          >
                            <Code size={14} className="mr-1" />
                            View Code
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-slate-300 mb-4">{project.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.map((tech, techIndex) => (
                          <span 
                            key={techIndex}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle size={14} />
                          {project.status}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <TrendingUp size={14} />
                          {project.impact}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Portfolio Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Verified Skills</span>
                    <span className="text-blue-300 font-bold">{skills.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Completed Projects</span>
                    <span className="text-blue-300 font-bold">{projects.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Endorsements</span>
                    <span className="text-blue-300 font-bold">
                      {skills.reduce((sum, skill) => sum + skill.endorsements, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Skill Categories */}
            <Card className="bg-slate-800/30 border-slate-700/50">
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Skill Categories</h3>
                <div className="space-y-2">
                  {Array.from(new Set(skills.map(skill => skill.category))).map((category, index) => {
                    const categorySkills = skills.filter(skill => skill.category === category);
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-slate-300">{category}</span>
                        <span className="text-blue-300 font-bold">{categorySkills.length}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Contact CTA */}
            <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
              <div className="p-6 text-center">
                <Briefcase size={32} className="mx-auto text-blue-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Interested in working together?</h3>
                <p className="text-slate-300 text-sm mb-4">
                  This portfolio showcases verified skills and proven project experience.
                </p>
                {profile.email && (
                  <Button 
                    as="a" 
                    href={`mailto:${profile.email}`}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 w-full"
                  >
                    <Mail size={16} className="mr-2" />
                    Get in Touch
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-slate-700/50">
          <p className="text-slate-400 text-sm">
            Powered by <span className="text-blue-400 font-semibold">ReelApps</span> - 
            Redefining talent showcase beyond traditional resumes
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicCV;