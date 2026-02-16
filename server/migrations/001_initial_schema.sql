-- INTERVUEX Database Schema
-- PostgreSQL Migration Script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Recruiters Table
CREATE TABLE IF NOT EXISTS recruiters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  resume_url TEXT,
  resume_parsed_data JSONB,
  skills JSONB,
  created_by UUID REFERENCES recruiters(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interview Sessions Table
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  recruiter_id UUID REFERENCES recruiters(id),
  access_token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, active, completed, terminated
  duration_seconds INTEGER DEFAULT 1800,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  valid_from TIMESTAMP, -- Optional: Interview link valid from this time
  valid_until TIMESTAMP, -- Optional: Interview link valid until this time
  device_fingerprint JSONB,
  ip_address VARCHAR(50),
  questions JSONB,
  answers JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Violations Table
CREATE TABLE IF NOT EXISTS violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- MULTIPLE_FACES, NO_FACE, SECOND_VOICE, TAB_SWITCH, etc.
  severity VARCHAR(50) NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
  details JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  screenshot TEXT
);

-- Scores Table
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
  technical_score INTEGER,
  problem_solving_score INTEGER,
  communication_score INTEGER,
  confidence_score INTEGER,
  resume_authenticity_score INTEGER,
  integrity_risk_score INTEGER,
  final_score INTEGER,
  shortlist_status VARCHAR(50), -- SHORTLISTED, REVIEW, REJECTED
  recruiter_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_candidate ON interview_sessions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_sessions_recruiter ON interview_sessions(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON interview_sessions(access_token);
CREATE INDEX IF NOT EXISTS idx_violations_session ON violations(session_id);
CREATE INDEX IF NOT EXISTS idx_violations_severity ON violations(severity);
CREATE INDEX IF NOT EXISTS idx_scores_session ON scores(session_id);
CREATE INDEX IF NOT EXISTS idx_scores_status ON scores(shortlist_status);
CREATE INDEX IF NOT EXISTS idx_audit_session ON audit_logs(session_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_recruiters_updated_at ON recruiters;
CREATE TRIGGER update_recruiters_updated_at BEFORE UPDATE ON recruiters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON interview_sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON interview_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scores_updated_at ON scores;
CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
