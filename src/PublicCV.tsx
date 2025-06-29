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
import { 
  ReelAppsMainLink, 
  ReelSkillsLink, 
  ReelProjectsLink, 
  ReelHunterLink,
  RecruitmentCTA,
  CreatePortfolioCTA,
  ReelCVDirectLink
} from './components/ui';

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
  assessmentScore?: number;
}

interface ProjectData {
  title: string;
  description: string;
  technologies: string[];
  status: string;
  impact: string;
  link?: string;
  repositoryUrl?: string;
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

        // Load real skills data from database
        await loadSkillsFromDatabase(linkData.candidate_id);
        
        // Load real projects data from database
        await loadProjectsFromDatabase(linkData.candidate_id);

      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        setError('Failed to load portfolio data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [slug]);

  const loadSkillsFromDatabase = async (candidateId: string) => {
    try {
      const { data: skillsData, error } = await supabase
        .from('candidate_skills')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('endorsement_count', { ascending: false });

      if (!error && skillsData) {
        const formattedSkills: SkillData[] = skillsData.map(skill => ({
          name: skill.skill_name,
          level: skill.proficiency_level,
          verified: skill.verified,
          category: skill.skill_category,
          endorsements: skill.endorsement_count || 0,
          assessmentScore: skill.assessment_score
        }));
        
        setSkills(formattedSkills);
      }
    } catch (error) {
      console.error('Failed to load skills from database:', error);
    }
  };

  const loadProjectsFromDatabase = async (candidateId: string) => {
    try {
      const { data: projectsData, error } = await supabase
        .from('candidate_projects')
        .select('*')
        .eq('candidate_id', candidateId)
        .eq('project_status', 'completed')
        .order('completion_date', { ascending: false });

      if (!error && projectsData) {
        const formattedProjects: ProjectData[] = projectsData.map(project => ({
          title: project.project_title,
          description: project.project_description || '',
          technologies: Array.isArray(project.technologies) ? project.technologies : [],
          status: project.project_status,
          impact: project.impact_metrics || '',
          link: project.project_url,
          repositoryUrl: project.repository_url
        }));
        
        setProjects(formattedProjects);
      }
    } catch (error) {
      console.error('Failed to load projects from database:', error);
    }
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
            <div className="space-y-3">
              <Button as="a" href="https://reelcv.reelapps.co.za" variant="primary">
                Create Your ReelCV
              </Button>
              <div className="text-sm text-slate-500">
                <ReelAppsMainLink className="text-blue-400 hover:text-blue-300" /> - 
                The future of talent management
              </div>
            </div>
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
          <div className="text-xs text-slate-500">
            Powered by <ReelAppsMainLink className="text-blue-400 hover:text-blue-300" /> | 
            Create yours at <ReelCVDirectLink className="text-blue-400 hover:text-blue-300" />
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
                    From <ReelSkillsLink className="text-blue-400 hover:text-blue-300" />
                  </div>
                </div>
                
                {skills.length > 0 ? (
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
                          {skill.assessmentScore && (
                            <span className="ml-2">Score: {skill.assessmentScore}%</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Target size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No skills data available yet.</p>
                    <p className="text-sm mt-2">Skills will appear here when verified through ReelSkills.</p>
                  </div>
                )}
                
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-300">
                    <strong>Skills verified through <ReelSkillsLink className="text-blue-400 hover:text-blue-300" />:</strong> 
                    Professional assessments, peer endorsements, and real-world validation.
                  </p>
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
                    From <ReelProjectsLink className="text-purple-400 hover:text-purple-300" />
                  </div>
                </div>
                
                {projects.length > 0 ? (
                  <div className="space-y-6">
                    {projects.map((project, index) => (
                      <div key={index} className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                          <div className="flex gap-2">
                            {project.repositoryUrl && (
                              <Button 
                                as="a" 
                                href={project.repositoryUrl} 
                                target="_blank"
                                variant="outline"
                                size="small"
                                className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                              >
                                <Code size={14} className="mr-1" />
                                Code
                              </Button>
                            )}
                            {project.link && (
                              <Button 
                                as="a" 
                                href={project.link} 
                                target="_blank"
                                variant="outline"
                                size="small"
                                className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                              >
                                <ExternalLink size={14} className="mr-1" />
                                Live
                              </Button>
                            )}
                          </div>
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
                          {project.impact && (
                            <div className="flex items-center gap-1 text-slate-400">
                              <TrendingUp size={14} />
                              {project.impact}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Award size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No projects data available yet.</p>
                    <p className="text-sm mt-2">Projects will appear here when documented through ReelProjects.</p>
                  </div>
                )}
                
                <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-sm text-purple-300">
                    <strong>Projects documented through <ReelProjectsLink className="text-purple-400 hover:text-purple-300" />:</strong> 
                    Real impact metrics, technical details, and proven results.
                  </p>
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
            {skills.length > 0 && (
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
            )}

            {/* Create Portfolio CTA */}
            <CreatePortfolioCTA />

            {/* ReelApps Ecosystem Promotion */}
            <Card className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border-green-500/30">
              <div className="p-6">
                <h3 className="text-lg font-bold text-green-300 mb-3">Powered by ReelApps</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Target size={14} className="text-blue-400" />
                    <ReelSkillsLink className="text-blue-400 hover:text-blue-300" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-purple-400" />
                    <ReelProjectsLink className="text-purple-400 hover:text-purple-300" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-green-400" />
                    <ReelHunterLink className="text-green-400 hover:text-green-300" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="text-blue-400" />
                    <ReelCVDirectLink className="text-blue-400 hover:text-blue-300" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-green-500/20">
                  <ReelAppsMainLink className="text-blue-400 hover:text-blue-300 font-medium" />
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
                    className="bg-gradient-to-r from-blue-600 to-purple-600 w-full mb-3"
                  >
                    <Mail size={16} className="mr-2" />
                    Get in Touch
                  </Button>
                )}
                <div className="text-xs text-slate-500">
                  Or find similar talent through <ReelHunterLink className="text-green-400 hover:text-green-300" />
                </div>
              </div>
            </Card>

            {/* Recruitment CTA for employers */}
            <RecruitmentCTA />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-slate-700/50">
          <div className="mb-4">
            <ReelAppsMainLink className="text-blue-400 hover:text-blue-300 font-semibold text-lg" />
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Redefining talent showcase beyond traditional resumes
          </p>
          <div className="flex justify-center gap-6 text-sm flex-wrap">
            <ReelCVDirectLink className="text-blue-400 hover:text-blue-300" />
            <ReelSkillsLink className="text-blue-400 hover:text-blue-300" />
            <ReelProjectsLink className="text-purple-400 hover:text-purple-300" />
            <ReelHunterLink className="text-green-400 hover:text-green-300" />
          </div>
          <div className="mt-4 text-xs text-slate-500">
            Create your own portfolio at <ReelCVDirectLink className="text-blue-400 hover:text-blue-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCV;