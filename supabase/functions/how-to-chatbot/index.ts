import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

const OPENROUTER_API_KEY = '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'
const AI_MODEL = 'google/gemini-3.1-flash-lite-preview'
console.log('CHATBOT KEY PREFIX:', OPENROUTER_API_KEY.substring(0, 20))

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, language = 'en', conversation_history = [] } = await req.json()

    if (!message) {
      throw new Error('No message provided')
    }

    const systemPrompt = `You are a friendly research assistant helping people learn about a 7-day dementia caregiver experience study.

CRITICAL LANGUAGE RULE:
- Detect the language of the user's message and ALWAYS respond in that SAME language
- If user writes in Chinese, respond entirely in Chinese
- If user writes in English, respond entirely in English
- Never mix languages in your response

Study Information (only share when specifically asked):
- 7-day diary-style research study
- Takes 10-15 minutes per day to record caregiving experiences
- Features: voice input, AI writing assistant, automatic spelling correction
- All data is fully anonymized and encrypted
- Participation is completely voluntary

Participation Steps (only explain when asked):
1. Register: Fill out form on Join Study page
2. Confirmation: Our team contacts you via email or WeChat
3. Record: Document daily experiences for 7 days
4. Tools: Use voice input and AI assistance for easier recording

Behavior Rules:
- Act like a normal, conversational chatbot
- ONLY answer what the user asks - don't dump all information
- If they greet you (hi, hello, 你好), just greet back warmly and briefly
- Keep responses SHORT and conversational unless they ask for details
- Be helpful but NOT pushy or over-informative
- Wait for them to ask questions before explaining`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation_history,
      { role: 'user', content: message }
    ]

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://careconnector.app',
        'X-Title': 'Care Connector How-to Assistant'
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 800
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', errorText)
      throw new Error(`OpenRouter API failed: ${response.status}`)
    }

    const aiResponse = await response.json()
    const assistantMessage = aiResponse.choices[0].message.content.trim()

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: assistantMessage,
        conversation_history: [
          ...conversation_history,
          { role: 'user', content: message },
          { role: 'assistant', content: assistantMessage }
        ]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Chatbot error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message || 'Failed to process chatbot request'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})