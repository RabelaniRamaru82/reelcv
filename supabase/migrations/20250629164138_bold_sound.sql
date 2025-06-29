/*
  # Portfolio Settings and Public Links Tables

  1. New Tables
    - `portfolio_settings`
      - `candidate_id` (uuid, primary key, references profiles)
      - `track_analytics` (boolean, default true)
      - `allow_public_indexing` (boolean, default false)
      - `include_reel_skills` (boolean, default true)
      - `include_reel_projects` (boolean, default true)
      - `show_verification_badges` (boolean, default true)
      - `link_expiration` (text, default '1-year')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `public_cv_links`
      - `id` (uuid, primary key)
      - `candidate_id` (uuid, references profiles)
      - `slug` (text, unique)
      - `expires_at` (timestamp)
      - `view_count` (integer, default 0)
      - `revoked` (boolean, default false)
      - `settings` (jsonb, link-specific settings)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Portfolio settings table
CREATE TABLE IF NOT EXISTS portfolio_settings (
  candidate_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  track_analytics boolean DEFAULT true,
  allow_public_indexing boolean DEFAULT false,
  include_reel_skills boolean DEFAULT true,
  include_reel_projects boolean DEFAULT true,
  show_verification_badges boolean DEFAULT true,
  link_expiration text DEFAULT '1-year' CHECK (link_expiration IN ('3-months', '6-months', '1-year', 'never')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Public CV links table
CREATE TABLE IF NOT EXISTS public_cv_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  view_count integer DEFAULT 0,
  revoked boolean DEFAULT false,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_cv_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolio_settings
CREATE POLICY "Users can manage own portfolio settings"
  ON portfolio_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = candidate_id);

-- RLS Policies for public_cv_links
CREATE POLICY "Users can manage own public links"
  ON public_cv_links
  FOR ALL
  TO authenticated
  USING (auth.uid() = candidate_id);

-- Allow public read access to non-revoked, non-expired links
CREATE POLICY "Public can read active CV links"
  ON public_cv_links
  FOR SELECT
  TO anon, authenticated
  USING (
    revoked = false 
    AND expires_at > now()
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_settings_candidate_id ON portfolio_settings(candidate_id);
CREATE INDEX IF NOT EXISTS idx_public_cv_links_candidate_id ON public_cv_links(candidate_id);
CREATE INDEX IF NOT EXISTS idx_public_cv_links_slug ON public_cv_links(slug);
CREATE INDEX IF NOT EXISTS idx_public_cv_links_active ON public_cv_links(revoked, expires_at) WHERE revoked = false;

-- Function for updating timestamps
CREATE OR REPLACE FUNCTION update_portfolio_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER update_portfolio_settings_updated_at
  BEFORE UPDATE ON portfolio_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_portfolio_settings_updated_at();