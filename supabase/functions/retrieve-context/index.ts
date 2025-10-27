import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { objective, description } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Generate embedding for the new objective
    const queryText = `${objective}. ${description || ''}`;
    
    const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: queryText,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error(`Embedding API error: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;
    
    // Search for similar objectives
    const { data: similar, error } = await supabase.rpc('search_similar_objectives', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 5
    });
    
    if (error) {
      console.error('Search error:', error);
      return new Response(JSON.stringify({ 
        similarObjectives: [],
        message: 'No similar objectives found'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Format results with insights
    const results = similar?.map((item: any) => ({
      title: item.objective_title,
      summary: item.summary_text,
      keyLearnings: item.key_learnings,
      similarity: Math.round(item.similarity * 100),
      id: item.objective_id
    })) || [];
    
    return new Response(JSON.stringify({ 
      similarObjectives: results,
      count: results.length,
      message: results.length > 0 
        ? `Found ${results.length} similar past objective(s)` 
        : 'No similar objectives found'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in retrieve-context:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      similarObjectives: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});