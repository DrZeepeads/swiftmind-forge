import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { objective, description, agentProfile } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating tasks for objective:', objective);
    
    // Get learned insights from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: insights } = await supabase
      .from('learned_insights')
      .select('*')
      .order('confidence_score', { ascending: false })
      .limit(5);
    
    const historicalContext = insights && insights.length > 0
      ? '\n\nHistorical Learning (use this to adjust estimates):\n' + insights.map(i => `- ${i.insight_text}`).join('\n')
      : '';

const systemPrompt = `You are an AI task planning assistant. Your role is to break down objectives into actionable, specific tasks.

IMPORTANT RULES:
1. Generate exactly 8-12 tasks
2. Each task must be specific and actionable
3. Order tasks logically (dependencies first)
4. Assign priority 1-10 (1=highest, 10=lowest)
5. Include diverse task types: research, planning, execution, testing, documentation
6. Be realistic about what can be accomplished
7. Return ONLY valid JSON, no markdown formatting${historicalContext}

${agentProfile?.systemPrompt ? `\n\nAgent Style: ${agentProfile.systemPrompt}` : ''}

Return format:
{
  "tasks": [
    {
      "title": "Clear, actionable task description",
      "priority": 1-10,
      "category": "research|planning|execution|testing|documentation|optimization",
      "estimatedTime": "5-30 minutes"
    }
  ],
  "insights": "Brief analysis of the objective and approach"
}`;

    const userPrompt = `Objective: ${objective}
${description ? `Context: ${description}` : ''}

Generate a comprehensive task breakdown for this objective.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: agentProfile?.model || 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI response:', aiResponse);

    // Parse the JSON response (handle potential markdown wrapping)
    let parsedResponse;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, aiResponse];
      const jsonContent = jsonMatch[1] || aiResponse;
      parsedResponse = JSON.parse(jsonContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback to basic tasks if parsing fails
      parsedResponse = {
        tasks: [
          { title: "Research and gather information", priority: 1, category: "research", estimatedTime: "15 minutes" },
          { title: "Define success criteria and requirements", priority: 2, category: "planning", estimatedTime: "10 minutes" },
          { title: "Break down into actionable steps", priority: 3, category: "planning", estimatedTime: "15 minutes" },
          { title: "Identify required resources", priority: 4, category: "planning", estimatedTime: "10 minutes" },
          { title: "Create implementation plan", priority: 5, category: "planning", estimatedTime: "20 minutes" },
          { title: "Execute core functionality", priority: 6, category: "execution", estimatedTime: "30 minutes" },
          { title: "Test and validate results", priority: 7, category: "testing", estimatedTime: "15 minutes" },
          { title: "Document findings and process", priority: 8, category: "documentation", estimatedTime: "10 minutes" }
        ],
        insights: "AI parsing failed, using fallback task structure."
      };
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-tasks function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        fallback: true
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
