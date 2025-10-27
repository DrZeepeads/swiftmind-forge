-- Phase 3.3: Subtask Chaining - Recursive task breakdown
-- Add parent_task_id to support task hierarchy
ALTER TABLE public.agent_logs ADD COLUMN IF NOT EXISTS parent_task_id uuid REFERENCES public.agent_logs(id) ON DELETE CASCADE;
ALTER TABLE public.agent_logs ADD COLUMN IF NOT EXISTS depth_level integer DEFAULT 0;
ALTER TABLE public.agent_logs ADD COLUMN IF NOT EXISTS has_subtasks boolean DEFAULT false;
ALTER TABLE public.agent_logs ADD COLUMN IF NOT EXISTS subtask_count integer DEFAULT 0;

-- Phase 3.4: Knowledge Base - Vector embeddings for objectives
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.objective_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  objective_title TEXT NOT NULL,
  objective_description TEXT,
  summary_text TEXT NOT NULL,
  key_learnings TEXT[],
  embedding vector(1536),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS objective_embeddings_embedding_idx 
ON public.objective_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Enable RLS
ALTER TABLE public.objective_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role can manage embeddings" ON public.objective_embeddings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view embeddings for their objectives" ON public.objective_embeddings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = objective_embeddings.objective_id
      AND agents.user_id = auth.uid()
    )
  );

-- Function to search similar objectives using cosine similarity
CREATE OR REPLACE FUNCTION search_similar_objectives(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  objective_id uuid,
  objective_title text,
  summary_text text,
  key_learnings text[],
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    oe.id,
    oe.objective_id,
    oe.objective_title,
    oe.summary_text,
    oe.key_learnings,
    1 - (oe.embedding <=> query_embedding) as similarity
  FROM objective_embeddings oe
  WHERE 1 - (oe.embedding <=> query_embedding) > match_threshold
  ORDER BY oe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_objective_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER objective_embeddings_updated_at
BEFORE UPDATE ON public.objective_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_objective_embeddings_updated_at();