-- Add time window columns to interview_sessions table
-- This allows recruiters to set specific start and end times for interview links

ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS valid_from TIMESTAMP,
ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP;

-- Add comment for documentation
COMMENT ON COLUMN interview_sessions.valid_from IS 'Optional: Interview link becomes valid from this time';
COMMENT ON COLUMN interview_sessions.valid_until IS 'Optional: Interview link becomes invalid after this time';
