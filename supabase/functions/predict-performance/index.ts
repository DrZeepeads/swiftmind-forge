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
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get historical performance data
    const { data: historicalData } = await supabase
      .from('agent_logs')
      .select('*')
      .eq('status', 'completed')
      .order('timestamp', { ascending: false })
      .limit(50);

    const completedTasks = tasks.filter((t: any) => t.status === 'completed');
    const pendingTasks = tasks.filter((t: any) => t.status === 'pending');
    
    // Calculate average task completion time
    let avgCompletionTime = 3000; // default 3 seconds
    if (completedTasks.length > 0) {
      const times = completedTasks
        .filter((t: any) => t.completedAt && t.createdAt)
        .map((t: any) => t.completedAt - t.createdAt);
      if (times.length > 0) {
        avgCompletionTime = times.reduce((a: number, b: number) => a + b, 0) / times.length;
      }
    }

    const systemPrompt = `You are an AI performance prediction analyst. Analyze task execution patterns and predict completion times.

ANALYSIS RULES:
1. Consider task complexity and historical data
2. Identify bottlenecks and inefficiencies
3. Suggest concrete optimizations
4. Provide confidence score (0.0 to 1.0)
5. Return ONLY valid JSON

Response format:
{
  "predictedCompletionMinutes": number,
  "confidenceScore": 0.0-1.0,
  "optimizations": [
    {
      "type": "priority_reorder" | "task_merge" | "parallel_execution" | "resource_allocation",
      "description": "Specific recommendation",
      "expectedImprovement": "10% faster" | "20% efficiency gain"
    }
  ],
  "bottlenecks": ["description of issues"]
}`;

    const userPrompt = `Objective: ${objective}
Total Tasks: ${tasks.length}
Completed: ${completedTasks.length}
Pending: ${pendingTasks.length}
Average Completion Time: ${Math.round(avgCompletionTime / 1000)}s per task

Historical Performance:
${historicalData?.slice(0, 10).map((log: any) => 
  `- ${log.task_name}: ${log.result || 'completed'}`
).join('\n') || 'No historical data'}

Pending Tasks:
${pendingTasks.slice(0, 5).map((t: any) => 
  `- [P${t.priority}] ${t.title}`
).join('\n')}

Analyze and predict performance.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI prediction:', aiResponse);

    let parsedResponse;
    try {
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, aiResponse];
      const jsonContent = jsonMatch[1] || aiResponse;
      parsedResponse = JSON.parse(jsonContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      parsedResponse = {
        predictedCompletionMinutes: Math.ceil((pendingTasks.length * avgCompletionTime) / 60000),
        confidenceScore: 0.5,
        optimizations: [{
          type: 'priority_reorder',
          description: 'Consider reordering tasks by dependencies',
          expectedImprovement: '10% faster'
        }],
        bottlenecks: ['Unable to generate detailed analysis']
      };
    }

    // Store prediction
    await supabase.from('performance_predictions').insert({
      objective_id: objectiveId,
      predicted_completion_time: parsedResponse.predictedCompletionMinutes,
      confidence_score: parsedResponse.confidenceScore,
      recommended_optimizations: parsedResponse.optimizations
    });

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in predict-performance function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});