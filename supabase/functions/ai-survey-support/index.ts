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
    const { action, question, questionType, options, currentAnswer, questionConfig, messages, questionnaire } = body

    let systemPrompt = ''
    let userMessage = ''

    switch (action) {
      case 'ai_auto_answer': {
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
        systemPrompt = `You are a helpful survey assistant. Help the participant understand the question and provide a better answer. Be concise (2-3 sentences max). If they have a current answer, suggest improvements. Be supportive and clear.`
        userMessage = `Question: "${question}"\nQuestion type: ${questionType}\nCurrent answer: ${currentAnswer || 'None yet'}\n\nHelp me answer this question.`
        break
      }

      case 'ai_enhance': {
        systemPrompt = `You are a writing assistant. Improve the participant's survey answer by making it clearer, more detailed, and better written. Return ONLY the improved text, nothing else. Keep the same meaning and voice.`
        userMessage = `Question: "${question}"\nOriginal answer: "${currentAnswer}"\n\nImprove this answer:`
        break
      }

      case 'chat': {
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

      case 'questionnaire_chatbot': {
        // Full questionnaire-aware chatbot that can fill answers
        if (!messages || !Array.isArray(messages)) {
          throw new Error('Missing messages for questionnaire_chatbot action')
        }
        if (!questionnaire) {
          throw new Error('Missing questionnaire context')
        }

        const { title, questions: allQuestions, responses: currentResponses } = questionnaire

        // Build question summary for context
        const questionSummary = (allQuestions || []).map((q: any, i: number) => {
          const qType = q.question_type || 'unknown'
          const opts = q.options?.map((o: any) => typeof o === 'string' ? o : o.option_text || o.text).join(', ')
          const currentAns = currentResponses?.[q.id]
          const ansStr = currentAns !== undefined && currentAns !== null && currentAns !== ''
            ? `Current answer: ${typeof currentAns === 'object' ? JSON.stringify(currentAns) : currentAns}`
            : 'Not answered yet'
          const reqStr = q.required ? ' (REQUIRED)' : ''
          return `Q${i + 1} [id:${q.id}] (${qType}${reqStr}): "${q.question_text}"${opts ? ` | Options: [${opts}]` : ''} | ${ansStr}`
        }).join('\n')

        // Find unanswered required questions
        const unanswered = (allQuestions || []).filter((q: any) => {
          const isRequired = q.required || q.response_required === 'force' || q.question_config?.response_required === 'force'
          const hasAnswer = currentResponses?.[q.id] !== undefined && currentResponses?.[q.id] !== null && currentResponses?.[q.id] !== ''
          return isRequired && !hasAnswer
        })

        const unansweredStr = unanswered.length > 0
          ? `\n\nUNANSWERED REQUIRED QUESTIONS (${unanswered.length}):\n${unanswered.map((q: any) => `- "${q.question_text}" [id:${q.id}]`).join('\n')}`
          : '\n\nAll required questions have been answered! ✅'

        systemPrompt = `You are an intelligent AI assistant helping a participant complete the questionnaire "${title || 'Untitled'}". You have full context of all questions and current answers.

YOUR CAPABILITIES:
1. Answer questions conversationally - when the user discusses a topic, you can suggest filling specific survey questions.
2. When you want to fill/update a survey answer, include a JSON block in your response using this format:
   <<<FILL_ANSWERS>>>
   [{"question_id": "uuid-here", "value": "the answer value"}]
   <<<END_FILL>>>
3. For choice questions, the value must be the exact option text.
4. For multiple_choice/checkbox_group, the value should be a JSON array of selected option texts.
5. For number/rating/likert/nps/slider, the value should be a number.
6. For yes_no, the value should be "Yes" or "No".
7. Inform the user about unanswered required questions when relevant.
8. Be conversational, friendly, and helpful. Explain what you're filling and why.
9. Always let the user know they can correct any AI-filled answer.

QUESTIONNAIRE QUESTIONS:
${questionSummary}
${unansweredStr}

RULES:
- When you fill answers, always explain what you're doing in natural language BEFORE the fill block.
- You can fill multiple questions at once if the conversation warrants it.
- If the user says something like "I'm 25 years old and male", find the relevant age and gender questions and fill them.
- If asked about progress, summarize which questions are answered and which aren't.
- Be proactive about mentioning unanswered required questions.`

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
            max_tokens: 2000
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('OpenRouter API error:', errorText)
          throw new Error(`OpenRouter API failed: ${response.status}`)
        }

        const aiResponse = await response.json()
        const aiMessage = aiResponse.choices?.[0]?.message?.content?.trim() || ''

        // Parse any fill commands from the response
        let fillCommands: any[] = []
        const fillMatch = aiMessage.match(/<<<FILL_ANSWERS>>>([\s\S]*?)<<<END_FILL>>>/)
        if (fillMatch) {
          try {
            fillCommands = JSON.parse(fillMatch[1].trim())
          } catch (e) {
            console.error('Failed to parse fill commands:', e)
          }
        }

        // Clean the display message (remove the fill block)
        const displayMessage = aiMessage
          .replace(/<<<FILL_ANSWERS>>>[\s\S]*?<<<END_FILL>>>/g, '')
          .trim()

        return new Response(
          JSON.stringify({ response: displayMessage, fillCommands }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'ai_build_project': {
        // AI generates entire project structure from description
        if (!messages || !Array.isArray(messages)) {
          throw new Error('Missing messages for ai_build_project action')
        }

        const currentProject = body.currentProject

        systemPrompt = `You are an expert research methodology AI. You help researchers design complete research projects by chatting with them.

YOUR TASK: Based on the researcher's description, generate a complete research project structure.

When you have enough information to generate a project, include a JSON block in your response:
<<<PROJECT_DATA>>>
{
  "title": "Project Title",
  "description": "Project description",
  "methodology": "single_survey|esm|ema|daily_diary|longitudinal",
  "duration_days": 7,
  "max_participants": 100,
  "consent_required": false,
  "questionnaires": [
    {
      "title": "Questionnaire Title",
      "description": "Description",
      "type": "survey",
      "frequency": "once|daily|weekly",
      "estimated_duration": 10,
      "questions": [
        {
          "question_text": "Your question here",
          "question_type": "text_short|text_long|single_choice|multiple_choice|likert_scale|nps|rating|slider|yes_no|number|date|dropdown|checkbox_group|bipolar_scale|matrix|ranking",
          "required": true,
          "options": ["Option 1", "Option 2"],
          "question_config": {}
        }
      ]
    }
  ]
}
<<<END_PROJECT>>>

RULES:
- Ask clarifying questions if the description is too vague
- Use appropriate question types for each question
- For likert_scale, set question_config.scale_type (e.g., "1-5", "1-7")
- For slider, set question_config.min_value, question_config.max_value, question_config.step
- For rating, set question_config.max_value
- For nps, no extra config needed
- For matrix, set question_config.columns array and use options for rows
- For bipolar_scale, set question_config.min_value, max_value, min_label, max_label
- Include options array only for choice-type questions
- Generate at least 5-10 well-thought-out questions per questionnaire
- Be conversational and explain your design choices
- If the user asks to modify, update the project data accordingly
${currentProject ? `\nCurrent project data:\n${JSON.stringify(currentProject, null, 2)}` : ''}`

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
            max_tokens: 4000
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('OpenRouter API error:', errorText)
          throw new Error(`OpenRouter API failed: ${response.status}`)
        }

        const aiResponse = await response.json()
        const aiMessage = aiResponse.choices?.[0]?.message?.content?.trim() || ''

        // Parse project data
        let projectData = null
        const projectMatch = aiMessage.match(/<<<PROJECT_DATA>>>([\s\S]*?)<<<END_PROJECT>>>/)
        if (projectMatch) {
          try {
            projectData = JSON.parse(projectMatch[1].trim())
          } catch (e) {
            console.error('Failed to parse project data:', e)
          }
        }

        const displayMessage = aiMessage
          .replace(/<<<PROJECT_DATA>>>[\s\S]*?<<<END_PROJECT>>>/g, '')
          .trim()

        return new Response(
          JSON.stringify({ response: displayMessage, projectData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'ai_edit_project': {
        // Researcher AI editor — modifies questionnaires/questions via chat
        if (!messages || !Array.isArray(messages)) {
          throw new Error('Missing messages for ai_edit_project action')
        }
        const projectStructure = body.projectStructure

        const structureSummary = (projectStructure?.questionnaires || []).map((q: any, qi: number) => {
          const qSummary = (q.questions || []).map((qu: any, i: number) => {
            const opts = qu.options?.join(', ')
            return `  Q${i + 1} [id:${qu.id}] (${qu.question_type}${qu.required ? ', required' : ''}): "${qu.question_text}"${opts ? ` | Options: [${opts}]` : ''}`
          }).join('\n')
          return `Questionnaire "${q.title}" [id:${q.id}] (${q.type || 'survey'}):\n${qSummary || '  (no questions)'}`
        }).join('\n\n')

        systemPrompt = `You are an expert research editor AI. You help researchers modify their existing research projects through natural language instructions.

PROJECT: "${projectStructure?.title || 'Untitled'}"

CURRENT STRUCTURE:
${structureSummary || 'Empty project'}

YOUR CAPABILITIES:
When you want to make changes, include a JSON block:
<<<EDIT_COMMANDS>>>
[
  {"action": "add_question", "questionnaire_id": "uuid", "data": {"question_text": "...", "question_type": "text_short|single_choice|multiple_choice|likert_scale|nps|rating|slider|yes_no|number|date|dropdown|text_long|checkbox_group|bipolar_scale|matrix|ranking", "required": true, "options": ["opt1", "opt2"], "question_config": {}}},
  {"action": "edit_question", "question_id": "uuid", "data": {"question_text": "new text", "question_type": "new_type", "required": true, "options": ["new opts"]}},
  {"action": "delete_question", "question_id": "uuid"},
  {"action": "add_questionnaire", "data": {"title": "...", "description": "...", "type": "survey", "questions": [...]}},
  {"action": "edit_questionnaire", "questionnaire_id": "uuid", "data": {"title": "new title", "description": "new desc"}}
]
<<<END_EDIT>>>

RULES:
- Always explain what you're doing in natural language BEFORE the edit block.
- Use real question IDs from the structure above when editing/deleting.
- When adding questions, target the correct questionnaire_id.
- You can make multiple edits at once.
- For choice questions, always include options array.
- For likert_scale, set question_config.scale_type (e.g., "1-5", "1-7").
- For slider, set question_config.min_value, max_value, step.
- Be specific about changes and confirm them.
- If the user's instruction is ambiguous, ask for clarification.`

        const fullMsgs = [{ role: 'system', content: systemPrompt }, ...messages]

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
            messages: fullMsgs,
            temperature: 0.7,
            max_tokens: 4000
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('OpenRouter API error:', errorText)
          throw new Error(`OpenRouter API failed: ${response.status}`)
        }

        const aiResponse = await response.json()
        const aiMessage = aiResponse.choices?.[0]?.message?.content?.trim() || ''

        let editCommands: any[] = []
        const editMatch = aiMessage.match(/<<<EDIT_COMMANDS>>>([\s\S]*?)<<<END_EDIT>>>/)
        if (editMatch) {
          try {
            editCommands = JSON.parse(editMatch[1].trim())
          } catch (e) {
            console.error('Failed to parse edit commands:', e)
          }
        }

        const displayMessage = aiMessage
          .replace(/<<<EDIT_COMMANDS>>>[\s\S]*?<<<END_EDIT>>>/g, '')
          .trim()

        return new Response(
          JSON.stringify({ response: displayMessage, editCommands }),
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