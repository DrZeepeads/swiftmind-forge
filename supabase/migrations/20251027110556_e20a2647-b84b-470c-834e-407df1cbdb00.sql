-- Phase 3.2: Continuous Loop Mode - Add evaluation tracking
CREATE TABLE IF NOT EXISTS public.objective_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  evaluation_type TEXT NOT NULL CHECK (evaluation_type IN ('scheduled', 'manual', 'triggered')),
  recommendations JSONB DEFAULT '[]'::jsonb,
  adjustments_made JSONB DEFAULT '[]'::jsonb,
  confidence_score NUMERIC(3,2) DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 4.1: Chat-driven Planning - Store conversation history
CREATE TABLE IF NOT EXISTS public.objective_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 4.2: Multi-Agent Roles - Agent profiles and performance
CREATE TABLE IF NOT EXISTS public.agent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('researcher', 'planner', 'executor', 'tester', 'documenter')),
  description TEXT,
  system_prompt TEXT NOT NULL,
  model_preference TEXT DEFAULT 'google/gemini-2.5-flash',
  color_theme TEXT DEFAULT '#8b5cf6',
  icon TEXT DEFAULT '🤖',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agent_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_profile_id UUID REFERENCES public.agent_profiles(id) ON DELETE CASCADE,
  task_category TEXT,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  avg_completion_time_ms INTEGER,
  success_rate NUMERIC(3,2),
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- Add agent assignment to tasks (via agents table relationship)
ALTER TABLE public.agent_logs ADD COLUMN IF NOT EXISTS agent_profile_id UUID REFERENCES public.agent_profiles(id);

-- Enable RLS
ALTER TABLE public.objective_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objective_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for objective_evaluations
CREATE POLICY "Service role can manage evaluations" ON public.objective_evaluations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view evaluations for their objectives" ON public.objective_evaluations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = objective_evaluations.objective_id
      AND agents.user_id = auth.uid()
    )
  );

-- RLS Policies for objective_chat_history
CREATE POLICY "Service role can manage chat history" ON public.objective_chat_history
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view chat for their objectives" ON public.objective_chat_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = objective_chat_history.objective_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chat for their objectives" ON public.objective_chat_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = objective_chat_history.objective_id
      AND agents.user_id = auth.uid()
    )
  );

-- RLS Policies for agent_profiles
CREATE POLICY "Public read access to agent profiles" ON public.agent_profiles
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage agent profiles" ON public.agent_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for agent_performance
CREATE POLICY "Public read access to agent performance" ON public.agent_performance
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage agent performance" ON public.agent_performance
  FOR ALL USING (auth.role() = 'service_role');

-- Insert default agent profiles
INSERT INTO public.agent_profiles (name, role, description, system_prompt, color_theme, icon, is_default) VALUES
  ('Research Specialist', 'researcher', 'Focuses on thorough information gathering and detailed research tasks', 'You are a meticulous research specialist. Generate detailed, comprehensive research tasks with clear sources and verification steps. Prioritize accuracy and depth.', '#3b82f6', '🔍', false),
  ('Strategic Planner', 'planner', 'Creates high-level roadmaps and strategic task breakdowns', 'You are a strategic planner. Break down objectives into logical, well-ordered phases. Focus on dependencies, milestones, and clear success criteria.', '#8b5cf6', '📋', true),
  ('Action Executor', 'executor', 'Generates practical, implementation-focused tasks', 'You are an action-oriented executor. Create concrete, actionable tasks with clear deliverables. Focus on practical implementation steps.', '#10b981', '⚡', false),
  ('Quality Tester', 'tester', 'Emphasizes validation, testing, and quality assurance', 'You are a quality assurance specialist. Generate thorough testing and validation tasks. Include edge cases, error handling, and verification steps.', '#f59e0b', '✓', false),
  ('Documentation Expert', 'documenter', 'Creates tasks focused on documentation and knowledge capture', 'You are a documentation specialist. Generate tasks for clear documentation, knowledge capture, and learning summaries. Focus on clarity and completeness.', '#ec4899', '📚', false)
ON CONFLICT DO NOTHING;