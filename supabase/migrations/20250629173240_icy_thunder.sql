/*
  # ReelCV Stats and Integration Tables

  1. New Tables
    - `candidate_skills`
      - Skills data that would come from ReelSkills
      - Verification status, endorsements, skill levels
    
    - `candidate_projects`
      - Project data that would come from ReelProjects
      - Technologies, impact metrics, completion status
    
    - `portfolio_analytics`
      - Track portfolio views, engagement metrics
      - Link performance data
    
    - `skill_endorsements`
      - Track skill endorsements from other users
      - Verification badges and peer validation

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Candidate skills table (simulates ReelSkills data)
CREATE TABLE IF NOT EXISTS candidate_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  skill_category text NOT NULL,
  proficiency_level text NOT NULL CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  verified boolean DEFAULT false,
  verification_date timestamptz,
  endorsement_count integer DEFAULT 0,
  assessment_score integer CHECK (assessment_score >= 0 AND assessment_score <= 100),
  source text DEFAULT 'reelskills',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(candidate_id, skill_name)
);

-- Candidate projects table (simulates ReelProjects data)
CREATE TABLE IF NOT EXISTS candidate_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_title text NOT NULL,
  project_description text,
  technologies jsonb DEFAULT '[]'::jsonb,
  project_status text DEFAULT 'completed' CHECK (project_status IN ('planning', 'in-progress', 'completed', 'archived')),
  impact_metrics text,
  project_url text,
  repository_url text,
  start_date date,
  completion_date date,
  source text DEFAULT 'reelprojects',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Portfolio analytics table
CREATE TABLE IF NOT EXISTS portfolio_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  metric_value integer DEFAULT 0,
  date_recorded date DEFAULT CURRENT_DATE,
  additional_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(candidate_id, metric_type, date_recorded)
);

-- Skill endorsements table
CREATE TABLE IF NOT EXISTS skill_endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid NOT NULL REFERENCES candidate_skills(id) ON DELETE CASCADE,
  endorser_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  endorsement_type text DEFAULT 'peer' CHECK (endorsement_type IN ('peer', 'manager', 'client', 'assessment')),
  endorsement_note text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(skill_id, endorser_id)
);

-- Enable Row Level Security
ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for candidate_skills
CREATE POLICY "Users can read own skills"
  ON candidate_skills
  FOR SELECT
  TO authenticated
  USING (auth.uid() = candidate_id);

CREATE POLICY "Users can manage own skills"
  ON candidate_skills
  FOR ALL
  TO authenticated
  USING (auth.uid() = candidate_id);

-- RLS Policies for candidate_projects
CREATE POLICY "Users can read own projects"
  ON candidate_projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = candidate_id);

CREATE POLICY "Users can manage own projects"
  ON candidate_projects
  FOR ALL
  TO authenticated
  USING (auth.uid() = candidate_id);

-- RLS Policies for portfolio_analytics
CREATE POLICY "Users can read own analytics"
  ON portfolio_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = candidate_id);

CREATE POLICY "Users can manage own analytics"
  ON portfolio_analytics
  FOR ALL
  TO authenticated
  USING (auth.uid() = candidate_id);

-- RLS Policies for skill_endorsements
CREATE POLICY "Users can read endorsements for their skills"
  ON skill_endorsements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM candidate_skills cs 
      WHERE cs.id = skill_endorsements.skill_id 
      AND cs.candidate_id = auth.uid()
    )
  );

CREATE POLICY "Users can endorse others' skills"
  ON skill_endorsements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = endorser_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidate_skills_candidate_id ON candidate_skills(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_category ON candidate_skills(skill_category);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_verified ON candidate_skills(verified);

CREATE INDEX IF NOT EXISTS idx_candidate_projects_candidate_id ON candidate_projects(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_projects_status ON candidate_projects(project_status);

CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_candidate_id ON portfolio_analytics(candidate_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_type ON portfolio_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_date ON portfolio_analytics(date_recorded DESC);

CREATE INDEX IF NOT EXISTS idx_skill_endorsements_skill_id ON skill_endorsements(skill_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_candidate_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_candidate_skills_updated_at
  BEFORE UPDATE ON candidate_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_candidate_data_updated_at();

CREATE TRIGGER update_candidate_projects_updated_at
  BEFORE UPDATE ON candidate_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_candidate_data_updated_at();

-- Function to update endorsement counts
CREATE OR REPLACE FUNCTION update_skill_endorsement_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE candidate_skills 
    SET endorsement_count = endorsement_count + 1 
    WHERE id = NEW.skill_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE candidate_skills 
    SET endorsement_count = GREATEST(0, endorsement_count - 1) 
    WHERE id = OLD.skill_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger to automatically update endorsement counts
CREATE TRIGGER update_endorsement_count_trigger
  AFTER INSERT OR DELETE ON skill_endorsements
  FOR EACH ROW
  EXECUTE FUNCTION update_skill_endorsement_count();

-- Insert sample data for demonstration
INSERT INTO candidate_skills (candidate_id, skill_name, skill_category, proficiency_level, verified, endorsement_count, assessment_score) 
SELECT 
  id,
  skill_name,
  category,
  level,
  true,
  FLOOR(RANDOM() * 20) + 5,
  FLOOR(RANDOM() * 30) + 70
FROM profiles,
UNNEST(
  ARRAY[
    ('React', 'Frontend', 'expert'),
    ('TypeScript', 'Programming', 'advanced'),
    ('Node.js', 'Backend', 'advanced'),
    ('Python', 'Programming', 'intermediate'),
    ('AWS', 'Cloud', 'intermediate'),
    ('PostgreSQL', 'Database', 'advanced'),
    ('Docker', 'DevOps', 'intermediate'),
    ('Git', 'Tools', 'expert'),
    ('JavaScript', 'Programming', 'expert'),
    ('CSS', 'Frontend', 'advanced')
  ]
) AS skills(skill_name, category, level)
WHERE profiles.role = 'candidate'
ON CONFLICT (candidate_id, skill_name) DO NOTHING;

-- Insert sample projects
INSERT INTO candidate_projects (candidate_id, project_title, project_description, technologies, project_status, impact_metrics, completion_date)
SELECT 
  id,
  project_title,
  description,
  technologies::jsonb,
  'completed',
  impact,
  CURRENT_DATE - INTERVAL '30 days' * FLOOR(RANDOM() * 12)
FROM profiles,
UNNEST(
  ARRAY[
    ('E-commerce Platform Redesign', 'Led the complete redesign of a high-traffic e-commerce platform, improving conversion rates and reducing load times.', '["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"]', '35% increase in conversion rate, 60% faster load times'),
    ('Real-time Analytics Dashboard', 'Built a real-time analytics dashboard for monitoring business KPIs with live data visualization.', '["React", "D3.js", "WebSocket", "Python", "Redis"]', 'Reduced decision-making time by 50%'),
    ('AI-Powered Content Recommendation', 'Developed a machine learning-based content recommendation system.', '["Python", "TensorFlow", "FastAPI", "Docker", "Kubernetes"]', '40% increase in user engagement'),
    ('Mobile Banking App', 'Created a secure mobile banking application with biometric authentication.', '["React Native", "Node.js", "MongoDB", "AWS"]', '99.9% uptime, 500K+ downloads'),
    ('Inventory Management System', 'Built a comprehensive inventory management system for retail chains.', '["Vue.js", "Express.js", "MySQL", "Docker"]', '30% reduction in inventory costs')
  ]
) AS projects(project_title, description, technologies, impact)
WHERE profiles.role = 'candidate'
LIMIT 3; -- Limit to 3 projects per candidate

-- Insert initial analytics data
INSERT INTO portfolio_analytics (candidate_id, metric_type, metric_value)
SELECT 
  id,
  metric_type,
  FLOOR(RANDOM() * 100) + 10
FROM profiles,
UNNEST(ARRAY['profile_views', 'skill_verifications', 'project_showcases', 'endorsements_received']) AS metrics(metric_type)
WHERE profiles.role = 'candidate'
ON CONFLICT (candidate_id, metric_type, date_recorded) DO NOTHING;