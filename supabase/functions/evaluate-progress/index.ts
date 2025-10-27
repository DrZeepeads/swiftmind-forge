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
    const { objectiveId, tasks, objective } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Analyze current progress
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
    const executingTasks = tasks.filter((t: any) => t.status === 'executing').length;
    const stuckTasks = tasks.filter((t: any) => {
      if (t.status !== 'executing') return false;
      const elapsed = Date.now() - t.startedAt;
      const estimated = parseInt(t.estimatedTime) * 60000; // Convert to ms
      return elapsed > estimated * 3; // 3x over estimate
    });
    
    const recommendations: any[] = [];
    const adjustments: any[] = [];
    let confidenceScore = 0.7;
    
    // Use AI for intelligent evaluation
    if (lovableApiKey && executingTasks > 0) {
      const prompt = `Evaluate this in-progress objective and provide recommendations:

Objective: ${objective}
Total Tasks: ${totalTasks}
Completed: ${completedTasks} (${Math.round(completedTasks/totalTasks*100)}%)
Currently Executing: ${executingTasks}
Stuck Tasks (3x over estimate): ${stuckTasks.length}

Task Status:
${tasks.map((t: any) => `- [${t.status}] ${t.title} (${t.priority}) - Est: ${t.estimatedTime}`).join('\n')}

Provide:
1. Should we adjust remaining task estimates? (yes/no + reasoning)
2. Should we reorder tasks? (yes/no + which tasks)
3. Should we add new tasks? (yes/no + suggestions)
4. Is the objective still achievable? (yes/no + confidence 0-1)
5. Any tasks to pause or skip?

Format as JSON with keys: adjustEstimates, reorderTasks, addTasks, achievable, confidence, reasoning`;

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are an AI project management advisor. Provide concise, actionable recommendations in JSON format.' },
            { role: 'user', content: prompt }
          ],
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const content = aiData.choices[0].message.content;
        
        try {
          // Try to parse JSON response
          const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
          const jsonContent = jsonMatch[1] || content;
          const analysis = JSON.parse(jsonContent.trim());
          
          if (analysis.adjustEstimates === 'yes') {
            recommendations.push({
              type: 'adjust_estimates',
              message: analysis.reasoning || 'AI recommends adjusting task estimates',
              priority: 'medium'
            });
          }
          
          if (analysis.reorderTasks === 'yes') {
            recommendations.push({
              type: 'reorder_tasks',
              message: analysis.reasoning || 'AI recommends reordering tasks',
              priority: 'low'
            });
          }
          
          if (analysis.addTasks === 'yes') {
            recommendations.push({
              type: 'add_tasks',
              message: analysis.reasoning || 'AI suggests adding new tasks',
              priority: 'medium'
            });
          }
          
          confidenceScore = analysis.confidence || 0.7;
        } catch {
          // Fallback to text analysis
          if (content.toLowerCase().includes('adjust') || content.toLowerCase().includes('estimate')) {
            recommendations.push({
              type: 'adjust_estimates',
              message: 'Consider adjusting time estimates based on current progress',
              priority: 'medium'
            });
          }
        }
      }
    }
    
    // Rule-based recommendations
    if (stuckTasks.length > 0) {
      recommendations.push({
        type: 'stuck_tasks',
        message: `${stuckTasks.length} task(s) are taking 3x longer than estimated. Consider breaking them down or seeking help.`,
        priority: 'high',
        tasks: stuckTasks.map((t: any) => t.id)
      });
    }
    
    if (completedTasks / totalTasks > 0.7 && executingTasks === 0) {
      recommendations.push({
        type: 'near_completion',
        message: 'Objective is 70% complete. Consider starting next steps or final review tasks.',
        priority: 'low'
      });
    }
    
    // Store evaluation
    const { data: evaluation, error } = await supabase
      .from('objective_evaluations')
      .insert({
        objective_id: objectiveId,
        evaluation_type: 'scheduled',
        recommendations,
        adjustments_made: adjustments,
        confidence_score: confidenceScore
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return new Response(JSON.stringify({ 
      evaluation,
      recommendations,
      shouldContinue: recommendations.length > 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in evaluate-progress:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});