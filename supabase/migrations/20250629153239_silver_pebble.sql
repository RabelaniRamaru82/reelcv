/*
  # Video Analysis Database Schema

  1. New Tables
    - `video_analyses`
      - `id` (uuid, primary key)
      - `video_id` (uuid, references videos table)
      - `candidate_id` (uuid, references profiles table)
      - `analysis_data` (jsonb, complete analysis results)
      - `skills_detected` (jsonb, array of detected skills)
      - `traits_assessment` (jsonb, skill traits evaluation)
      - `confidence_scores` (jsonb, confidence metrics)
      - `processing_status` (text, analysis status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `skill_competency_frameworks`
      - `id` (uuid, primary key)
      - `skill_name` (text)
      - `category` (text)
      - `framework_data` (jsonb, competency definitions)
      - `industry_context` (text)
      - `created_at` (timestamp)

    - `analysis_benchmarks`
      - `id` (uuid, primary key)
      - `industry` (text)
      - `skill_category` (text)
      - `benchmark_data` (jsonb, statistical data)
      - `sample_size` (integer)
      - `last_updated` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for analysis processing
*/

-- Video analyses table
CREATE TABLE IF NOT EXISTS video_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL,
  candidate_id uuid NOT NULL,
  analysis_data jsonb NOT NULL,
  skills_detected jsonb DEFAULT '[]'::jsonb,
  traits_assessment jsonb DEFAULT '{}'::jsonb,
  confidence_scores jsonb DEFAULT '{}'::jsonb,
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_started_at timestamptz,
  processing_completed_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Skill competency frameworks table
CREATE TABLE IF NOT EXISTS skill_competency_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name text NOT NULL,
  category text NOT NULL,
  framework_data jsonb NOT NULL,
  industry_context text DEFAULT 'general',
  version integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(skill_name, category, industry_context, version)
);

-- Analysis benchmarks table
CREATE TABLE IF NOT EXISTS analysis_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL,
  skill_category text NOT NULL,
  benchmark_data jsonb NOT NULL,
  sample_size integer DEFAULT 0,
  percentile_data jsonb DEFAULT '{}'::jsonb,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(industry, skill_category)
);

-- Analysis processing queue table
CREATE TABLE IF NOT EXISTS analysis_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_analysis_id uuid REFERENCES video_analyses(id) ON DELETE CASCADE,
  priority integer DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  scheduled_for timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  status text DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  error_details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE video_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_competency_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_analyses
CREATE POLICY "Users can read own video analyses"
  ON video_analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = candidate_id);

CREATE POLICY "Users can insert own video analyses"
  ON video_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Users can update own video analyses"
  ON video_analyses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = candidate_id);

-- RLS Policies for skill_competency_frameworks (read-only for users)
CREATE POLICY "Users can read skill frameworks"
  ON skill_competency_frameworks
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for analysis_benchmarks (read-only for users)
CREATE POLICY "Users can read analysis benchmarks"
  ON analysis_benchmarks
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for analysis_queue (system use only)
CREATE POLICY "System can manage analysis queue"
  ON analysis_queue
  FOR ALL
  TO service_role
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_analyses_candidate_id ON video_analyses(candidate_id);
CREATE INDEX IF NOT EXISTS idx_video_analyses_video_id ON video_analyses(video_id);
CREATE INDEX IF NOT EXISTS idx_video_analyses_status ON video_analyses(processing_status);
CREATE INDEX IF NOT EXISTS idx_video_analyses_created_at ON video_analyses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_skill_frameworks_skill_name ON skill_competency_frameworks(skill_name);
CREATE INDEX IF NOT EXISTS idx_skill_frameworks_category ON skill_competency_frameworks(category);
CREATE INDEX IF NOT EXISTS idx_skill_frameworks_industry ON skill_competency_frameworks(industry_context);

CREATE INDEX IF NOT EXISTS idx_benchmarks_industry ON analysis_benchmarks(industry);
CREATE INDEX IF NOT EXISTS idx_benchmarks_category ON analysis_benchmarks(skill_category);

CREATE INDEX IF NOT EXISTS idx_analysis_queue_status ON analysis_queue(status);
CREATE INDEX IF NOT EXISTS idx_analysis_queue_scheduled ON analysis_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_analysis_queue_priority ON analysis_queue(priority DESC);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_video_analyses_updated_at
  BEFORE UPDATE ON video_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_frameworks_updated_at
  BEFORE UPDATE ON skill_competency_frameworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default skill competency frameworks
INSERT INTO skill_competency_frameworks (skill_name, category, framework_data, industry_context) VALUES
('React', 'framework', '{
  "levels": {
    "beginner": {
      "description": "Basic understanding of React components and JSX",
      "indicators": ["Can create functional components", "Understands props", "Basic event handling"],
      "typicalExperience": "0-6 months"
    },
    "intermediate": {
      "description": "Comfortable with React ecosystem and state management",
      "indicators": ["Uses hooks effectively", "Manages component state", "Understands lifecycle"],
      "typicalExperience": "6 months - 2 years"
    },
    "advanced": {
      "description": "Deep React knowledge with performance optimization",
      "indicators": ["Custom hooks", "Performance optimization", "Advanced patterns"],
      "typicalExperience": "2-5 years"
    },
    "expert": {
      "description": "React expert with architectural decision-making ability",
      "indicators": ["Framework contributions", "Architectural decisions", "Team mentoring"],
      "typicalExperience": "5+ years"
    }
  },
  "assessmentCriteria": {
    "technical": ["Code quality", "Best practices", "Performance awareness"],
    "practical": ["Real-world application", "Problem-solving", "Debugging skills"],
    "communication": ["Explanation clarity", "Teaching ability", "Documentation"]
  }
}', 'software-development'),

('JavaScript', 'programming', '{
  "levels": {
    "beginner": {
      "description": "Basic JavaScript syntax and concepts",
      "indicators": ["Variables and functions", "Basic DOM manipulation", "Simple algorithms"],
      "typicalExperience": "0-6 months"
    },
    "intermediate": {
      "description": "Solid JavaScript fundamentals with ES6+ features",
      "indicators": ["Async/await", "Array methods", "Object-oriented concepts"],
      "typicalExperience": "6 months - 2 years"
    },
    "advanced": {
      "description": "Advanced JavaScript with design patterns",
      "indicators": ["Closures and scope", "Design patterns", "Performance optimization"],
      "typicalExperience": "2-5 years"
    },
    "expert": {
      "description": "JavaScript expert with deep language knowledge",
      "indicators": ["Engine internals", "Language specification", "Framework development"],
      "typicalExperience": "5+ years"
    }
  },
  "assessmentCriteria": {
    "technical": ["Language mastery", "Best practices", "Modern features"],
    "practical": ["Problem-solving", "Code efficiency", "Debugging"],
    "communication": ["Concept explanation", "Code readability", "Documentation"]
  }
}', 'software-development');

-- Insert default industry benchmarks
INSERT INTO analysis_benchmarks (industry, skill_category, benchmark_data, sample_size) VALUES
('software-development', 'programming', '{
  "averageScores": {
    "technical": 75,
    "communication": 68,
    "presentation": 72,
    "overall": 71
  },
  "percentiles": {
    "25th": 60,
    "50th": 71,
    "75th": 82,
    "90th": 90
  },
  "topSkills": ["JavaScript", "React", "Node.js", "Python", "Git"],
  "commonWeaknesses": ["System Design", "Testing", "Documentation", "Public Speaking"]
}', 1500),

('software-development', 'framework', '{
  "averageScores": {
    "technical": 72,
    "communication": 65,
    "presentation": 70,
    "overall": 69
  },
  "percentiles": {
    "25th": 58,
    "50th": 69,
    "75th": 80,
    "90th": 88
  },
  "topSkills": ["React", "Angular", "Vue.js", "Express.js", "Spring Boot"],
  "commonWeaknesses": ["Performance Optimization", "Testing Frameworks", "Architecture"]
}', 1200);