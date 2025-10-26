-- Phase 3.1: Memory & Reflection System

-- Table for storing reflection insights after objective completion
CREATE TABLE IF NOT EXISTS public.objective_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  objective_id TEXT NOT NULL,
  objective_title TEXT NOT NULL,
  total_tasks INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  total_time_ms BIGINT,
  insights TEXT,
  what_worked TEXT,
  what_didnt_work TEXT,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for tracking task execution patterns
CREATE TABLE IF NOT EXISTS public.task_execution_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id TEXT NOT NULL,
  task_title TEXT NOT NULL,
  category TEXT,
  priority INTEGER,
  estimated_time TEXT,
  actual_time_ms BIGINT,
  objective_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for learned insights that influence future task generation
CREATE TABLE IF NOT EXISTS public.learned_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_type TEXT NOT NULL, -- 'timing', 'category_pattern', 'success_factor'
  category TEXT,
  insight_text TEXT NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  sample_size INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_objective_reflections_objective_id ON public.objective_reflections(objective_id);
CREATE INDEX IF NOT EXISTS idx_task_execution_history_objective_id ON public.task_execution_history(objective_id);
CREATE INDEX IF NOT EXISTS idx_task_execution_history_category ON public.task_execution_history(category);
CREATE INDEX IF NOT EXISTS idx_learned_insights_category ON public.learned_insights(category);
CREATE INDEX IF NOT EXISTS idx_learned_insights_type ON public.learned_insights(insight_type);

-- Enable Row Level Security
ALTER TABLE public.objective_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_execution_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learned_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public access for now, can be restricted later with auth)
CREATE POLICY "Public read access for reflections" 
ON public.objective_reflections FOR SELECT 
USING (true);

CREATE POLICY "Public insert access for reflections" 
ON public.objective_reflections FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public read access for execution history" 
ON public.task_execution_history FOR SELECT 
USING (true);

CREATE POLICY "Public insert access for execution history" 
ON public.task_execution_history FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public read access for learned insights" 
ON public.learned_insights FOR SELECT 
USING (true);

CREATE POLICY "Public insert/update access for learned insights" 
ON public.learned_insights FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public update access for learned insights" 
ON public.learned_insights FOR UPDATE 
USING (true);

-- Function to update learned insights timestamp
CREATE OR REPLACE FUNCTION public.update_learned_insights_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_learned_insights_updated_at
BEFORE UPDATE ON public.learned_insights
FOR EACH ROW
EXECUTE FUNCTION public.update_learned_insights_timestamp();