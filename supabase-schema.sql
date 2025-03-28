-- Supabase Database Schema for Forum AI Platform
-- This script creates all database tables and relationships
-- It can be run directly against a Supabase project database

-- Core Tables

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  scope VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL
);

-- Role Permissions Junction Table
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE(role_id, permission_id)
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(100),
  avatar VARCHAR(255),
  is_admin BOOLEAN DEFAULT FALSE,
  is_ai BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Forums Table
CREATE TABLE IF NOT EXISTS forums (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  theme_color VARCHAR(50),
  primary_font VARCHAR(50),
  secondary_font VARCHAR(50),
  logo_url VARCHAR(255),
  custom_css TEXT,
  custom_js TEXT,
  domain VARCHAR(255),
  is_private BOOLEAN DEFAULT FALSE,
  requires_approval BOOLEAN DEFAULT FALSE
);

-- User Forum Roles Junction Table
CREATE TABLE IF NOT EXISTS user_forum_roles (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  forum_id INTEGER NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  UNIQUE(user_id, forum_id, role_id)
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  slug VARCHAR(100) NOT NULL,
  forum_id INTEGER NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  UNIQUE(forum_id, slug)
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  ai_persona_type VARCHAR(50)
);

-- Answers Table
CREATE TABLE IF NOT EXISTS answers (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  ai_persona_type VARCHAR(50),
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE
);

-- Answer Votes
CREATE TABLE IF NOT EXISTS answer_votes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answer_id INTEGER NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  is_upvote BOOLEAN,
  UNIQUE(user_id, answer_id)
);

-- Domain Verification Table
CREATE TABLE IF NOT EXISTS domain_verifications (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  forum_id INTEGER NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  verification_token VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(forum_id, domain)
);

-- SEO and Analytics Tables

-- Content Pages for Main Site (non-forum pages)
CREATE TABLE IF NOT EXISTS content_pages (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT,
  page_type VARCHAR(50) NOT NULL,
  featured_image VARCHAR(255)
);

-- SEO Metadata Links/Cross-references
CREATE TABLE IF NOT EXISTS content_links (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  source_type VARCHAR(50) NOT NULL,
  source_id INTEGER NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id INTEGER NOT NULL,
  anchor_text TEXT,
  relevance_score FLOAT,
  created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  automatic BOOLEAN DEFAULT FALSE,
  UNIQUE(source_type, source_id, target_type, target_id)
);

-- Lead Generation Tables

-- Lead Capture Forms
CREATE TABLE IF NOT EXISTS lead_capture_forms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  forum_id INTEGER NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  form_fields TEXT NOT NULL, -- JSON structure of form fields
  submit_button_text VARCHAR(100),
  success_message TEXT,
  redirect_url VARCHAR(255),
  form_type VARCHAR(50),
  gated_content_id INTEGER
);

-- Form Submissions
CREATE TABLE IF NOT EXISTS form_submissions (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  email VARCHAR(255) NOT NULL,
  form_id INTEGER NOT NULL REFERENCES lead_capture_forms(id) ON DELETE CASCADE,
  form_data TEXT NOT NULL, -- JSON structure of submission data
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  user_agent TEXT,
  ip_address VARCHAR(50),
  is_exported BOOLEAN DEFAULT FALSE
);

-- Form Analytics
CREATE TABLE IF NOT EXISTS form_analytics (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  form_id INTEGER NOT NULL REFERENCES lead_capture_forms(id) ON DELETE CASCADE,
  user_agent TEXT,
  ip_address VARCHAR(50),
  referrer TEXT,
  is_conversion BOOLEAN DEFAULT FALSE
);

-- Landing Pages
CREATE TABLE IF NOT EXISTS landing_pages (
  id SERIAL PRIMARY KEY,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  slug VARCHAR(255) NOT NULL,
  forum_id INTEGER NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT,
  featured_image VARCHAR(255),
  template VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  form_id INTEGER REFERENCES lead_capture_forms(id) ON DELETE SET NULL,
  UNIQUE(forum_id, slug)
);

-- Email Integration
CREATE TABLE IF NOT EXISTS email_integrations (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  forum_id INTEGER NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  provider VARCHAR(50) NOT NULL,
  api_key VARCHAR(255),
  api_secret VARCHAR(255),
  list_id VARCHAR(100),
  webhook_url VARCHAR(255),
  mapping_rules TEXT, -- JSON mapping between form fields and provider fields
  last_synced_at TIMESTAMP WITH TIME ZONE
);

-- Content Planning Tables

-- Content Calendar
CREATE TABLE IF NOT EXISTS content_calendar (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'draft',
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  forum_id INTEGER NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  content_type VARCHAR(50) NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  keyword VARCHAR(255),
  target_audience TEXT,
  social_copy TEXT,
  question_ids TEXT -- comma-separated list of question IDs to include
);

-- SEO Tables

-- Keywords to Track
CREATE TABLE IF NOT EXISTS tracked_keywords (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  forum_id INTEGER NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  keyword VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  search_volume INTEGER,
  difficulty INTEGER,
  priority INTEGER,
  notes TEXT,
  serp_features TEXT,
  intent VARCHAR(50),
  stage VARCHAR(50),
  UNIQUE(forum_id, keyword)
);

-- Keyword Rankings History
CREATE TABLE IF NOT EXISTS keyword_rankings (
  id SERIAL PRIMARY KEY,
  date VARCHAR(10) NOT NULL, -- YYYY-MM-DD format
  keyword_id INTEGER NOT NULL REFERENCES tracked_keywords(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  previous_position INTEGER,
  change INTEGER,
  clicks INTEGER,
  impressions INTEGER,
  ctr FLOAT,
  device VARCHAR(20),
  location VARCHAR(100),
  UNIQUE(keyword_id, date, device, location)
);

-- URL Analysis
CREATE TABLE IF NOT EXISTS url_analysis (
  id SERIAL PRIMARY KEY,
  forum_id INTEGER NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  url VARCHAR(255) NOT NULL,
  incoming_links INTEGER,
  outgoing_links INTEGER,
  total_word_count INTEGER,
  meta_quality_score INTEGER,
  keyword_density JSONB, -- JSON object with keyword -> density mapping
  h1_usage VARCHAR(255),
  h2_usage TEXT,
  image_count INTEGER,
  image_alt_text_quality INTEGER,
  content_quality_score INTEGER,
  UNIQUE(forum_id, url)
);

-- Content Gaps
CREATE TABLE IF NOT EXISTS content_gaps (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  forum_id INTEGER NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  search_volume INTEGER,
  topic VARCHAR(255) NOT NULL,
  competitor_coverage TEXT,
  opportunity_score INTEGER,
  recommended_keywords TEXT,
  content_suggestion TEXT,
  is_addressed BOOLEAN DEFAULT FALSE,
  UNIQUE(forum_id, topic)
);

-- SEO Reports
CREATE TABLE IF NOT EXISTS seo_reports (
  id SERIAL PRIMARY KEY,
  forum_id INTEGER NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  clicks INTEGER,
  impressions INTEGER,
  ctr FLOAT,
  report_date VARCHAR(10) NOT NULL, -- YYYY-MM-DD format
  organic_traffic INTEGER,
  avg_position FLOAT,
  top_ten_keywords INTEGER,
  gained_keywords INTEGER,
  lost_keywords INTEGER,
  top_landing_pages TEXT, -- JSON array of top landing pages
  top_keywords TEXT, -- JSON array of top keywords
  issues_found TEXT, -- JSON array of issues
  report_data JSONB, -- Additional report data in JSON format
  UNIQUE(forum_id, report_date)
);

-- Analytics Tables

-- Daily Metrics
CREATE TABLE IF NOT EXISTS daily_metrics (
  id SERIAL PRIMARY KEY,
  date VARCHAR(10) NOT NULL, -- YYYY-MM-DD format
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  forum_id INTEGER NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  total_visits INTEGER,
  unique_visitors INTEGER,
  page_views INTEGER,
  avg_session_duration FLOAT,
  bounce_rate FLOAT,
  new_users INTEGER,
  returning_users INTEGER,
  question_views INTEGER,
  answer_views INTEGER,
  question_submissions INTEGER,
  answer_submissions INTEGER,
  search_queries INTEGER,
  answer_engagements INTEGER,
  UNIQUE(forum_id, date)
);

-- Content Performance
CREATE TABLE IF NOT EXISTS content_performance (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  forum_id INTEGER NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  title TEXT,
  content_type VARCHAR(50) NOT NULL,
  url TEXT,
  clicks INTEGER,
  impressions INTEGER,
  ctr FLOAT,
  avg_position FLOAT,
  social_shares INTEGER,
  comment_count INTEGER,
  engagement_rate FLOAT,
  conversion_count INTEGER,
  score_date VARCHAR(10) NOT NULL, -- YYYY-MM-DD format
  performance JSONB -- Additional performance metrics in JSON format
);

-- Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  forum_id INTEGER NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  ip_address VARCHAR(50),
  referrer TEXT,
  event_type VARCHAR(50) NOT NULL,
  event_category VARCHAR(50),
  event_action VARCHAR(50),
  event_label TEXT,
  event_value INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  session_id VARCHAR(100),
  path VARCHAR(255),
  additional_data JSONB
);

-- Conversion Funnels
CREATE TABLE IF NOT EXISTS conversion_funnels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  forum_id INTEGER NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  steps JSONB NOT NULL, -- JSON array of funnel steps
  conversion_goal VARCHAR(100) NOT NULL,
  target_conversion_rate FLOAT,
  funnel_type VARCHAR(50),
  additional_settings JSONB
);

-- Funnel Analytics
CREATE TABLE IF NOT EXISTS funnel_analytics (
  id SERIAL PRIMARY KEY,
  date VARCHAR(10) NOT NULL, -- YYYY-MM-DD format
  notes TEXT,
  device_breakdown JSONB,
  conversion_rate FLOAT,
  funnel_id INTEGER NOT NULL REFERENCES conversion_funnels(id) ON DELETE CASCADE,
  entrances INTEGER,
  step_conversions JSONB, -- JSON object with step -> conversion count mapping
  completions INTEGER,
  drop_offs INTEGER,
  avg_time_to_conversion INTEGER, -- in seconds
  referrer_breakdown JSONB,
  source_breakdown JSONB,
  UNIQUE(funnel_id, date)
);

-- Initial Data - Basic Roles
INSERT INTO roles (name, description) 
VALUES 
  ('Admin', 'Full system administrator with all permissions'),
  ('Moderator', 'Forum moderator with content management permissions'),
  ('User', 'Regular user with basic forum access'),
  ('Ai', 'AI-powered user account')
ON CONFLICT (id) DO NOTHING;

-- Initial Data - Basic Permissions
INSERT INTO permissions (name, description, scope, action) 
VALUES 
  ('manage_forums', 'Create and manage forums', 'forums', 'manage'),
  ('create_content', 'Create new content', 'content', 'create'),
  ('edit_content', 'Edit existing content', 'content', 'edit'),
  ('delete_content', 'Delete content', 'content', 'delete'),
  ('manage_users', 'Manage users', 'users', 'manage'),
  ('view_analytics', 'View analytics data', 'analytics', 'view'),
  ('manage_settings', 'Manage system settings', 'settings', 'manage'),
  ('api_access', 'Access APIs', 'api', 'access')
ON CONFLICT (id) DO NOTHING;

-- Initial Data - Role Permissions
INSERT INTO role_permissions (role_id, permission_id)
VALUES
  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), -- Admin has all permissions
  (2, 2), (2, 3), (2, 4), (2, 6), -- Moderator permissions
  (3, 2), -- Regular user can create content
  (4, 2) -- AI user can create content
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Add appropriate indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_questions_category_id ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_user_id ON answers(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_forum_id ON categories(forum_id);
CREATE INDEX IF NOT EXISTS idx_user_forum_roles_user_id ON user_forum_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_forum_roles_forum_id ON user_forum_roles(forum_id);
CREATE INDEX IF NOT EXISTS idx_answer_votes_answer_id ON answer_votes(answer_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_tracked_keywords_forum_id ON tracked_keywords(forum_id);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_keyword_id ON keyword_rankings(keyword_id);
CREATE INDEX IF NOT EXISTS idx_content_links_source ON content_links(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_content_links_target ON content_links(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_forum_id_date ON daily_metrics(forum_id, date);
CREATE INDEX IF NOT EXISTS idx_analytics_events_forum_id ON analytics_events(forum_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);

-- Enable Row-Level Security (RLS) for multi-tenant isolation
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_forum_roles ENABLE ROW LEVEL SECURITY;

-- Create policies (advanced security)
-- Note: These would be customized based on actual security needs
CREATE POLICY forums_isolation ON forums 
  USING (user_id = auth.uid() OR is_private = false)
  WITH CHECK (user_id = auth.uid());

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modtime
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_forums_modtime
  BEFORE UPDATE ON forums
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_lead_forms_modtime
  BEFORE UPDATE ON lead_capture_forms
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_landing_pages_modtime
  BEFORE UPDATE ON landing_pages
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_content_pages_modtime
  BEFORE UPDATE ON content_pages
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();