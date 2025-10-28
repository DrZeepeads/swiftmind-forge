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
    const { teamId, objective, sharedBy } = await req.json();
    
    if (!teamId || !objective) {
      return new Response(
        JSON.stringify({ error: 'teamId and objective are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert shared objective
    const { data, error } = await supabase
      .from('shared_objectives')
      .insert({
        team_id: teamId,
        objective_id: objective.id,
        objective_title: objective.title,
        objective_description: objective.description,
        shared_by: sharedBy || 'anonymous',
        tasks: objective.tasks,
        status: objective.status
      })
      .select()
      .single();

    if (error) {
      console.error('Error sharing objective:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        sharedObjective: data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in share-objective function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});