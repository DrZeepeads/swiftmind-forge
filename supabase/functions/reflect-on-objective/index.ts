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
    const { objectiveId, objectiveTitle, tasks } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Calculate metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
    const totalTime = tasks.reduce((acc: number, t: any) => {
      if (t.completedAt && t.createdAt) {
        return acc + (t.completedAt - t.createdAt);
      }
      return acc;
    }, 0);
    
    // Store task execution history
    for (const task of tasks) {
      if (task.status === 'completed' && task.completedAt) {
        await supabase.from('task_execution_history').insert({
          task_id: task.id,
          task_title: task.title,
          category: task.category || 'general',
          priority: task.priority,
          estimated_time: task.estimatedTime,
          actual_time_ms: task.completedAt - task.createdAt,
          objective_id: objectiveId
        });
      }
    }
    
    // Use AI to generate reflection insights
    let insights = '';
    let whatWorked = '';
    let whatDidntWork = '';
    let recommendations = '';
    
    if (lovableApiKey && completedTasks > 0) {
      const prompt = `Analyze this completed objective and provide insights:
      
Objective: ${objectiveTitle}
Total Tasks: ${totalTasks}
Completed: ${completedTasks}
Total Time: ${(totalTime / 60000).toFixed(1)} minutes

Task Categories: ${tasks.map((t: any) => t.category).filter(Boolean).join(', ')}

Provide a brief reflection with:
1. What worked well (2-3 sentences)
2. What could be improved (2-3 sentences)  
3. Recommendations for similar future objectives (2-3 sentences)`;

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are a productivity coach analyzing completed objectives. Be concise and actionable.' },
            { role: 'user', content: prompt }
          ],
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const fullReflection = aiData.choices[0].message.content;
        
        // Parse the reflection
        const sections = fullReflection.split('\n\n');
        insights = fullReflection.substring(0, 200);
        whatWorked = sections.find((s: string) => s.includes('worked'))?.substring(0, 200) || '';
        whatDidntWork = sections.find((s: string) => s.includes('improve'))?.substring(0, 200) || '';
        recommendations = sections.find((s: string) => s.includes('Recommend'))?.substring(0, 200) || '';
      }
    }
    
    // Store reflection
    const { data: reflection, error } = await supabase
      .from('objective_reflections')
      .insert({
        objective_id: objectiveId,
        objective_title: objectiveTitle,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        total_time_ms: totalTime,
        insights,
        what_worked: whatWorked,
        what_didnt_work: whatDidntWork,
        recommendations
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Update learned insights based on execution history
    const categoryStats = await supabase
      .from('task_execution_history')
      .select('category, actual_time_ms')
      .not('category', 'is', null);
    
    if (categoryStats.data) {
      const avgByCategory = categoryStats.data.reduce((acc: any, row: any) => {
        if (!acc[row.category]) {
          acc[row.category] = { sum: 0, count: 0 };
        }
        acc[row.category].sum += row.actual_time_ms;
        acc[row.category].count += 1;
        return acc;
      }, {});
      
      for (const [category, stats] of Object.entries(avgByCategory) as any) {
        const avgTime = Math.round(stats.sum / stats.count / 60000); // Convert to minutes
        await supabase
          .from('learned_insights')
          .upsert({
            insight_type: 'timing',
            category,
            insight_text: `${category} tasks typically take ${avgTime} minutes`,
            confidence_score: Math.min(0.9, stats.count / 10),
            sample_size: stats.count
          }, {
            onConflict: 'insight_type,category',
            ignoreDuplicates: false
          });
      }
    }
    
    return new Response(JSON.stringify({ reflection }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in reflect-on-objective:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});