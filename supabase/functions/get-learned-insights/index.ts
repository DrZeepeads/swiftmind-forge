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
    const { objectiveTitle } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get all learned insights
    const { data: insights, error: insightsError } = await supabase
      .from('learned_insights')
      .select('*')
      .order('confidence_score', { ascending: false })
      .limit(10);
      
    if (insightsError) throw insightsError;
    
    // Get recent reflections for similar objectives
    const { data: reflections, error: reflectionsError } = await supabase
      .from('objective_reflections')
      .select('*')
      .ilike('objective_title', `%${objectiveTitle.split(' ').slice(0, 2).join(' ')}%`)
      .order('created_at', { ascending: false })
      .limit(3);
      
    if (reflectionsError) throw reflectionsError;
    
    // Format context for AI
    const learnedContext = insights
      ? insights.map(i => `${i.insight_text} (confidence: ${Math.round(i.confidence_score * 100)}%)`).join('\n')
      : '';
      
    const pastExperiences = reflections
      ? reflections.map(r => `Past: "${r.objective_title}" - ${r.recommendations}`).join('\n')
      : '';
    
    return new Response(JSON.stringify({ 
      insights: insights || [],
      reflections: reflections || [],
      contextForAI: `Historical Learning:\n${learnedContext}\n\n${pastExperiences}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in get-learned-insights:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});