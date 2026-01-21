-- Add "team" tier to the team_plan enum
-- This must be added before "pro" to maintain logical tier ordering
ALTER TYPE team_plan ADD VALUE IF NOT EXISTS 'team' BEFORE 'pro';
