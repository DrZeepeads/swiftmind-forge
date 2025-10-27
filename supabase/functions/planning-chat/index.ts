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
    const { objectiveId, message, tasks, objective } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Store user message
    await supabase.from('objective_chat_history').insert({
      objective_id: objectiveId,
      role: 'user',
      content: message
    });
    
    // Get chat history
    const { data: history } = await supabase
      .from('objective_chat_history')
      .select('*')
      .eq('objective_id', objectiveId)
      .order('created_at', { ascending: true })
      .limit(20);
    
    // Build context
    const systemPrompt = `You are an AI planning assistant helping to refine an objective and its tasks.

Current Objective: ${objective}

Current Tasks (${tasks.length}):
${tasks.map((t: any, i: number) => `${i + 1}. [${t.status}] ${t.title} (Priority: ${t.priority}, Est: ${t.estimatedTime})`).join('\n')}

You can help the user by:
- Suggesting new tasks to add
- Recommending task reordering
- Clarifying task descriptions
- Adjusting priorities or estimates
- Breaking down complex tasks
- Removing redundant tasks

When suggesting changes, use this JSON format at the end of your response:
{
  "action": "add_task" | "remove_task" | "update_task" | "reorder" | "none",
  "data": { relevant data for the action }
}

Be conversational and helpful. Explain your reasoning before suggesting changes.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-10).map((h: any) => ({
        role: h.role,
        content: h.content
      })),
      { role: 'user', content: message }
    ];
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices[0].message.content;
    
    // Store assistant response
    await supabase.from('objective_chat_history').insert({
      objective_id: objectiveId,
      role: 'assistant',
      content: assistantMessage
    });
    
    // Try to extract action JSON
    let suggestedAction = null;
    try {
      const jsonMatch = assistantMessage.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        suggestedAction = JSON.parse(jsonMatch[1].trim());
      } else {
        // Try to find JSON in the text
        const jsonInText = assistantMessage.match(/\{[\s\S]*"action"[\s\S]*\}/);
        if (jsonInText) {
          suggestedAction = JSON.parse(jsonInText[0]);
        }
      }
    } catch {
      // No action suggested, that's okay
    }
    
    return new Response(JSON.stringify({ 
      message: assistantMessage,
      suggestedAction
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in planning-chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});