import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') || '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'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw new Error('Invalid authentication token')
    }
    
    const body = await req.json()
    const { messages, question, currentAnswer } = body

    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured')
    }

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Missing required field: messages')
    }

    // Build conversation context with system prompt
    const systemPrompt = {
      role: 'system',
      content: `You are a helpful AI assistant for survey participants. Your role is to:

1. **Explain Questions**: Help users understand what the survey question is asking for
2. **Elaborate Answers**: Help users provide more detailed and thoughtful responses
3. **Correct Typos**: Fix spelling and grammar mistakes
4. **Enhance Text**: Improve the clarity and quality of their written answers
5. **Provide Suggestions**: Offer constructive ideas for better responses

Current question: "${question || 'Not provided'}"
User's current answer: "${currentAnswer || 'No answer yet'}"

Guidelines:
- Be supportive and encouraging
- Provide specific, actionable suggestions
- Keep responses concise and helpful
- If asked to enhance/elaborate/correct text, provide the improved version directly
- Maintain a friendly, conversational tone
- Respect the user's voice and intent
- When providing improved text, make it ready to copy and use`
    }

    const fullMessages = [systemPrompt, ...messages]

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://careconnector.app',
        'X-Title': 'EasyResearch Survey Assistant'
      },
      body: JSON.stringify({
        model: 'google/gemma-2-9b-it',
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 1500
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', errorText)
      throw new Error(`OpenRouter API failed: ${response.status}`)
    }

    const aiResponse = await response.json()
    const aiMessage = aiResponse.choices[0].message.content.trim()

    return new Response(
      JSON.stringify({ 
        response: aiMessage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('AI survey support error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to process AI support request'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
