-- Create team collaboration tables
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shared_objectives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  objective_id TEXT NOT NULL,
  objective_title TEXT NOT NULL,
  objective_description TEXT,
  shared_by TEXT NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tasks JSONB,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS public.performance_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  objective_id TEXT NOT NULL,
  predicted_completion_time INTEGER,
  confidence_score DECIMAL(3,2),
  recommended_optimizations JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view teams"
  ON public.teams FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Team creators can update"
  ON public.teams FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can view team members"
  ON public.team_members FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join teams"
  ON public.team_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view shared objectives"
  ON public.shared_objectives FOR SELECT
  USING (true);

CREATE POLICY "Anyone can share objectives"
  ON public.shared_objectives FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view predictions"
  ON public.performance_predictions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create predictions"
  ON public.performance_predictions FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_team_members_team ON public.team_members(team_id);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);
CREATE INDEX idx_shared_objectives_team ON public.shared_objectives(team_id);
CREATE INDEX idx_performance_predictions_objective ON public.performance_predictions(objective_id);

-- Triggers
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();