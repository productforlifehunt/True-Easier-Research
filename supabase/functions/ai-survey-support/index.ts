import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured')
    }

    const body = await req.json()
    const { action, question, questionType, options, currentAnswer, questionConfig, messages } = body

    let systemPrompt = ''
    let userMessage = ''

    switch (action) {
      case 'ai_auto_answer': {
        // AI predicts what a typical participant would answer
        const optionsStr = options?.length
          ? `\nAvailable options:\n${options.map((o: any, i: number) => `${i + 1}. ${typeof o === 'string' ? o : o.option_text || o.text}`).join('\n')}`
          : ''
        const configStr = questionConfig ? `\nQuestion config: ${JSON.stringify(questionConfig)}` : ''

        systemPrompt = `You are an AI assistant helping a survey participant by suggesting the most likely or reasonable answer to a survey question. Your goal is to provide a sensible default answer that the participant can then review and correct.

Rules:
- For choice questions (single_choice, multiple_choice, yes_no, dropdown), return ONLY the exact option text or value, nothing else.
- For multiple_choice, return a JSON array of selected option texts.
- For text questions, provide a brief, natural-sounding response (1-2 sentences).
- For number questions, return just a number.
- For likert_scale, bipolar_scale, nps, rating, slider questions, return just the numeric value.
- For date questions, return today's date in YYYY-MM-DD format.
- For matrix questions, return a JSON object mapping row labels to column values.
- For ranking questions, return a JSON array with the items in suggested order.
- Do NOT include explanations, just the answer value.`

        userMessage = `Question type: ${questionType}\nQuestion: "${question}"${optionsStr}${configStr}\n\nProvide the most reasonable answer:`
        break
      }

      case 'ai_assist': {
        // Help participant understand or improve their answer
        systemPrompt = `You are a helpful survey assistant. Help the participant understand the question and provide a better answer. Be concise (2-3 sentences max). If they have a current answer, suggest improvements. Be supportive and clear.`
        userMessage = `Question: "${question}"\nQuestion type: ${questionType}\nCurrent answer: ${currentAnswer || 'None yet'}\n\nHelp me answer this question.`
        break
      }

      case 'ai_enhance': {
        // Enhance/improve a text answer
        systemPrompt = `You are a writing assistant. Improve the participant's survey answer by making it clearer, more detailed, and better written. Return ONLY the improved text, nothing else. Keep the same meaning and voice.`
        userMessage = `Question: "${question}"\nOriginal answer: "${currentAnswer}"\n\nImprove this answer:`
        break
      }

      case 'chat': {
        // Free-form chat about the survey question
        if (!messages || !Array.isArray(messages)) {
          throw new Error('Missing messages for chat action')
        }
        systemPrompt = `You are a helpful AI assistant for survey participants. Help them understand questions, elaborate answers, fix typos, and provide suggestions. Be concise and supportive.

Current question: "${question || 'Not provided'}"
Current answer: "${currentAnswer || 'No answer yet'}"
Question type: ${questionType || 'unknown'}`

        const fullMessages = [{ role: 'system', content: systemPrompt }, ...messages]
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://easierresearch.app',
            'X-Title': 'Easier Research AI'
          },
          body: JSON.stringify({
            model: 'google/gemma-3-27b-it',
            messages: fullMessages,
            temperature: 0.7,
            max_tokens: 1000
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('OpenRouter API error:', errorText)
          throw new Error(`OpenRouter API failed: ${response.status}`)
        }

        const aiResponse = await response.json()
        const aiMessage = aiResponse.choices?.[0]?.message?.content?.trim() || ''

        return new Response(
          JSON.stringify({ response: aiMessage }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    // Standard single-turn call
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://easierresearch.app',
        'X-Title': 'Easier Research AI'
      },
      body: JSON.stringify({
        model: 'google/gemma-3-27b-it',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: action === 'ai_auto_answer' ? 0.3 : 0.7,
        max_tokens: action === 'ai_auto_answer' ? 500 : 1000
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', errorText)
      throw new Error(`OpenRouter API failed: ${response.status}`)
    }

    const aiResponse = await response.json()
    const aiMessage = aiResponse.choices?.[0]?.message?.content?.trim() || ''

    return new Response(
      JSON.stringify({ response: aiMessage, action }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('AI survey support error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message || 'Failed to process AI support request'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
