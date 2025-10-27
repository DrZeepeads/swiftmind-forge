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
    const { objectiveId, objectiveTitle, objectiveDescription, tasks } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Generate summary and key learnings with AI
    const completedTasks = tasks.filter((t: any) => t.status === 'completed');
    const totalTime = completedTasks.reduce((acc: number, t: any) => {
      return acc + (t.completedAt - t.createdAt);
    }, 0);
    
    const summaryPrompt = `Summarize this completed objective and extract key learnings:

Objective: ${objectiveTitle}
Description: ${objectiveDescription || 'None'}
Total Tasks: ${tasks.length}
Completed: ${completedTasks.length}
Total Time: ${(totalTime / 60000).toFixed(1)} minutes

Tasks:
${tasks.map((t: any) => `- ${t.title} (${t.status})`).join('\n')}

Provide:
1. A 2-3 sentence summary of what was accomplished
2. 3-5 key learnings or insights from this objective
3. What made this objective successful or challenging

Format as JSON:
{
  "summary": "Brief summary",
  "keyLearnings": ["learning 1", "learning 2", ...]
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an AI that extracts learnings from completed work. Always respond in valid JSON format.' },
          { role: 'user', content: summaryPrompt }
        ],
        temperature: 0.5,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    let summary = `Completed objective: ${objectiveTitle}`;
    let keyLearnings: string[] = ['Objective completed successfully'];
    
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      const jsonContent = jsonMatch[1] || content;
      const parsed = JSON.parse(jsonContent.trim());
      summary = parsed.summary || summary;
      keyLearnings = parsed.keyLearnings || keyLearnings;
    } catch {
      console.log('Could not parse AI response, using defaults');
    }
    
    // Generate embedding for semantic search
    const embeddingText = `${objectiveTitle}. ${objectiveDescription}. ${summary}. ${keyLearnings.join('. ')}`;
    
    const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: embeddingText,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error(`Embedding API error: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;
    
    // Store in database
    const { data: stored, error } = await supabase
      .from('objective_embeddings')
      .insert({
        objective_id: objectiveId,
        objective_title: objectiveTitle,
        objective_description: objectiveDescription,
        summary_text: summary,
        key_learnings: keyLearnings,
        embedding,
        metadata: {
          total_tasks: tasks.length,
          completed_tasks: completedTasks.length,
          total_time_ms: totalTime,
          categories: [...new Set(tasks.map((t: any) => t.category).filter(Boolean))]
        }
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return new Response(JSON.stringify({ 
      success: true,
      embedding: stored 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in store-knowledge:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});