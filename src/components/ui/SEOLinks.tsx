import React from 'react';
import { ExternalLink, Zap, Target, Award, Users, TrendingUp, Globe } from 'lucide-react';

interface SEOLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
  title?: string;
}

const SEOLink: React.FC<SEOLinkProps> = ({ 
  href, 
  children, 
  className = '', 
  external = true,
  title 
}) => (
  <a
    href={href}
    target={external ? '_blank' : '_self'}
    rel={external ? 'noopener noreferrer' : undefined}
    className={`inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors ${className}`}
    title={title}
  >
    {children}
    {external && <ExternalLink size={12} />}
  </a>
);

export const ReelAppsMainLink: React.FC<{ className?: string }> = ({ className = '' }) => (
  <SEOLink 
    href="https://www.reelapps.co.za" 
    className={className}
    title="Visit ReelApps - The Future of Talent Management"
  >
    ReelApps Platform
  </SEOLink>
);

export const ReelCVDirectLink: React.FC<{ className?: string }> = ({ className = '' }) => (
  <SEOLink 
    href="https://reelcv.reelapps.co.za" 
    className={className}
    title="ReelCV - Create Your Skills Portfolio | Beyond Traditional Resumes"
  >
    <Globe size={14} />
    Create Your ReelCV Portfolio
  </SEOLink>
);

export const ReelHunterLink: React.FC<{ className?: string }> = ({ className = '' }) => (
  <SEOLink 
    href="https://www.reelapps.co.za/reelhunter" 
    className={className}
    title="ReelHunter - AI-Powered Recruitment Platform"
  >
    <Users size={14} />
    Find Top Talent with ReelHunter
  </SEOLink>
);

export const ReelSkillsLink: React.FC<{ className?: string }> = ({ className = '' }) => (
  <SEOLink 
    href="https://www.reelapps.co.za/reelskills" 
    className={className}
    title="ReelSkills - Skills Assessment & Verification Platform"
  >
    <Target size={14} />
    Verify Skills with ReelSkills
  </SEOLink>
);

export const ReelProjectsLink: React.FC<{ className?: string }> = ({ className = '' }) => (
  <SEOLink 
    href="https://www.reelapps.co.za/reelprojects" 
    className={className}
    title="ReelProjects - Project Portfolio & Documentation Platform"
  >
    <Award size={14} />
    Showcase Projects with ReelProjects
  </SEOLink>
);

export const ReelAppsCareerLink: React.FC<{ className?: string }> = ({ className = '' }) => (
  <SEOLink 
    href="https://www.reelapps.co.za/careers" 
    className={className}
    title="Join ReelApps - Careers in Tech Innovation"
  >
    <TrendingUp size={14} />
    Join Our Team
  </SEOLink>
);

export const ReelAppsBlogLink: React.FC<{ className?: string }> = ({ className = '' }) => (
  <SEOLink 
    href="https://www.reelapps.co.za/blog" 
    className={className}
    title="ReelApps Blog - Latest in Talent Management & Tech"
  >
    Latest Insights
  </SEOLink>
);

export const ReelAppsAboutLink: React.FC<{ className?: string }> = ({ className = '' }) => (
  <SEOLink 
    href="https://www.reelapps.co.za/about" 
    className={className}
    title="About ReelApps - Revolutionizing Talent Management"
  >
    About ReelApps
  </SEOLink>
);

export const ReelAppsSolutionsLink: React.FC<{ className?: string }> = ({ className = '' }) => (
  <SEOLink 
    href="https://www.reelapps.co.za/solutions" 
    className={className}
    title="ReelApps Solutions - Complete Talent Management Suite"
  >
    <Zap size={14} />
    Explore All Solutions
  </SEOLink>
);

// Contextual link components for specific use cases
export const SkillVerificationCTA: React.FC = () => (
  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 my-4">
    <p className="text-blue-300 text-sm mb-2">
      <strong>Want verified skills like these?</strong> Get your skills professionally assessed and verified.
    </p>
    <ReelSkillsLink className="text-sm font-medium" />
  </div>
);

export const ProjectShowcaseCTA: React.FC = () => (
  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 my-4">
    <p className="text-purple-300 text-sm mb-2">
      <strong>Ready to showcase your projects?</strong> Document and highlight your best work professionally.
    </p>
    <ReelProjectsLink className="text-sm font-medium" />
  </div>
);

export const RecruitmentCTA: React.FC = () => (
  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 my-4">
    <p className="text-green-300 text-sm mb-2">
      <strong>Looking to hire talent like this?</strong> Find and connect with top candidates efficiently.
    </p>
    <ReelHunterLink className="text-sm font-medium" />
  </div>
);

export const CreatePortfolioCTA: React.FC = () => (
  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 my-4">
    <p className="text-blue-300 text-sm mb-2">
      <strong>Want to create your own skills portfolio?</strong> Build a professional showcase beyond traditional resumes.
    </p>
    <ReelCVDirectLink className="text-sm font-medium" />
  </div>
);