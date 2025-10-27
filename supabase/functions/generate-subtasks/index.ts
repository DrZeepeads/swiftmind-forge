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
    const { parentTask, objective, currentDepth } = await req.json();
    
    if (currentDepth >= 3) {
      return new Response(JSON.stringify({ 
        error: 'Maximum subtask depth reached (3 levels)' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }
    
    console.log('Generating subtasks for:', parentTask.title);
    
    const systemPrompt = `You are an AI subtask generator. Break down a specific task into 3-5 micro-tasks.

IMPORTANT RULES:
1. Generate exactly 3-5 subtasks
2. Each subtask should be very specific and granular
3. Focus ONLY on the parent task - don't expand scope
4. Order subtasks in logical execution order
5. Each subtask should take 5-15 minutes
6. Return ONLY valid JSON, no markdown formatting

Return format:
{
  "subtasks": [
    {
      "title": "Specific, actionable subtask",
      "priority": 1-10,
      "estimatedTime": "5-15 minutes"
    }
  ]
}`;

    const userPrompt = `Parent Task: ${parentTask.title}
Overall Objective: ${objective}
Current Depth: ${currentDepth}

Break this task into 3-5 concrete subtasks that will help complete it.`;

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
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI response:', aiResponse);

    let parsedResponse;
    try {
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, aiResponse];
      const jsonContent = jsonMatch[1] || aiResponse;
      parsedResponse = JSON.parse(jsonContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback subtasks
      parsedResponse = {
        subtasks: [
          { title: `Research for: ${parentTask.title}`, priority: 1, estimatedTime: "10 minutes" },
          { title: `Plan approach for: ${parentTask.title}`, priority: 2, estimatedTime: "10 minutes" },
          { title: `Execute: ${parentTask.title}`, priority: 3, estimatedTime: "15 minutes" }
        ]
      };
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-subtasks function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});