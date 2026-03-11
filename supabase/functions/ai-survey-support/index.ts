import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

// OpenRouter direct — production key
// OpenRouter 直连 — 生产密钥
const OPENROUTER_API_KEY = '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'
const AI_MODEL = 'google/gemini-3.1-flash-lite-preview'
const AI_URL = 'https://openrouter.ai/api/v1/chat/completions'


async function callAI(messages: any[], temperature = 0.7, maxTokens = 1000) {
  const res = await fetch(AI_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://careconnector.app',
      'X-Title': 'EasyResearch AI Survey Support'
    },
    body: JSON.stringify({ model: AI_MODEL, messages, temperature, max_tokens: maxTokens })
  })
  if (!res.ok) {
    const errorText = await res.text()
    console.error('OpenRouter error:', errorText)
    throw new Error(`AI API failed: ${res.status}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() || ''
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action, question, questionType, options, currentAnswer, questionConfig, messages, questionnaire, language } = body

    // Build language instruction based on app language setting
    // 根据应用语言设置构建语言指令
    const langCode = language || 'en'
    const langInstruction = langCode === 'zh'
      ? `LANGUAGE RULE: The user's app is set to Chinese. You MUST respond in Chinese by default. However, be smart about it:
- If the user sends a full sentence entirely in English, they clearly prefer English for this message — respond in English.
- If the user mixes Chinese and English (e.g. uses English abbreviations like "AI", "APP", technical terms), still respond in Chinese.
- Short greetings like "hi", "hello" are universal — respond in Chinese since the app is set to Chinese.
- If you're unsure whether the user is writing in English or Chinese (ambiguous words), respond in Chinese and optionally ask: "你是想用英文交流吗？"
- NEVER mix languages in your response. Either fully Chinese or fully English.`
      : `LANGUAGE RULE: The user's app is set to English. You MUST respond in English by default. However:
- If the user sends a full sentence entirely in Chinese, respond in Chinese.
- If the user mixes languages, respond in English.
- Short greetings are universal — respond in English.
- NEVER mix languages in your response.`

    let systemPrompt = ''
    let userMessage = ''

    switch (action) {
      case 'ai_auto_answer': {
        const optionsStr = options?.length
          ? `\nAvailable options:\n${options.map((o: any, i: number) => `${i + 1}. ${typeof o === 'string' ? o : o.option_text || o.text}`).join('\n')}`
          : ''
        const configStr = questionConfig ? `\nQuestion config: ${JSON.stringify(questionConfig)}` : ''
        systemPrompt = `You are an AI assistant suggesting reasonable default answers to survey questions. Rules:\n- For choice questions, return ONLY the exact option text.\n- For multiple_choice, return a JSON array.\n- For text, provide 1-2 sentences.\n- For number, return just a number.\n- For scales/ratings, return the numeric value.\n- For date, return YYYY-MM-DD.\n- Do NOT include explanations.`
        userMessage = `Question type: ${questionType}\nQuestion: "${question}"${optionsStr}${configStr}\n\nProvide the most reasonable answer:`
        break
      }

      case 'ai_assist': {
        systemPrompt = `You are a helpful survey assistant. Help the participant understand the question and provide a better answer. Be concise (2-3 sentences max).\n\n${langInstruction}`
        userMessage = `Question: "${question}"\nQuestion type: ${questionType}\nCurrent answer: ${currentAnswer || 'None yet'}\n\nHelp me answer this question.`
        break
      }

      case 'ai_enhance': {
        systemPrompt = `You are a writing assistant. Improve the participant's survey answer. Return ONLY the improved text, nothing else.\n\n${langInstruction}`
        userMessage = `Question: "${question}"\nOriginal answer: "${currentAnswer}"\n\nImprove this answer:`
        break
      }

      case 'chat': {
        if (!messages || !Array.isArray(messages)) throw new Error('Missing messages for chat action')
        const { modeInstruction } = body
        const optionsStr = options?.length
          ? `\nAvailable options:\n${options.map((o: any, i: number) => `${i + 1}. ${typeof o === 'string' ? o : o.option_text || o.text}`).join('\n')}`
          : ''
        const configStr = questionConfig ? `\nQuestion config: ${JSON.stringify(questionConfig)}` : ''
        
        systemPrompt = `You are a helpful AI assistant for survey participants. Be concise and supportive.\n\n${langInstruction}\n\nCurrent question: "${question || 'N/A'}"\nQuestion type: ${questionType || 'unknown'}\nCurrent answer: "${currentAnswer || 'N/A'}"${optionsStr}${configStr}\n\n${modeInstruction || 'Help the user with this question. Be flexible and understand their intent.'}`
        
        const fullMessages = [{ role: 'system', content: systemPrompt }, ...messages]
        const aiMessage = await callAI(fullMessages, 0.7, 1000)
        return new Response(JSON.stringify({ response: aiMessage }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      case 'questionnaire_chatbot': {
        if (!messages || !Array.isArray(messages)) throw new Error('Missing messages')
        if (!questionnaire) throw new Error('Missing questionnaire context')
        const { title, questions: allQuestions, responses: currentResponses } = questionnaire
        const questionSummary = (allQuestions || []).map((q: any, i: number) => {
          const opts = q.options?.map((o: any) => typeof o === 'string' ? o : o.option_text || o.text).join(', ')
          const currentAns = currentResponses?.[q.id]
          const ansStr = currentAns != null && currentAns !== '' ? `Answer: ${typeof currentAns === 'object' ? JSON.stringify(currentAns) : currentAns}` : 'Not answered'
          return `Q${i+1} [${q.id}] (${q.question_type}${q.required?' REQ':''}): "${q.question_text}"${opts?` | Opts:[${opts}]`:''} | ${ansStr}`
        }).join('\n')
        const unanswered = (allQuestions || []).filter((q: any) => {
          const isReq = q.required || q.response_required === 'force' || q.question_config?.response_required === 'force'
          const hasAns = currentResponses?.[q.id] != null && currentResponses?.[q.id] !== ''
          return isReq && !hasAns
        })
        const unansweredStr = unanswered.length > 0
          ? `\n\nUNANSWERED REQUIRED (${unanswered.length}):\n${unanswered.map((q: any) => `- "${q.question_text}" [${q.id}]`).join('\n')}`
          : '\n\nAll required questions answered.'
        systemPrompt = `You are helping a participant complete "${title}".\n\n${langInstruction}\n\nQUESTIONS:\n${questionSummary}${unansweredStr}\n\nTo fill answers include:\n<<<FILL_ANSWERS>>>\n[{"question_id":"uuid","value":"answer"}]\n<<<END_FILL>>>\n\nExplain what you're filling before the block.`
        const fullMsgs = [{ role: 'system', content: systemPrompt }, ...messages]
        const aiMsg = await callAI(fullMsgs, 0.7, 2000)
        let fillCommands: any[] = []
        const fillMatch = aiMsg.match(/<<<FILL_ANSWERS>>>([\s\S]*?)<<<END_FILL>>>/)
        if (fillMatch) { try { fillCommands = JSON.parse(fillMatch[1].trim()) } catch(e) { console.error('Parse fill error:', e) } }
        return new Response(JSON.stringify({ response: aiMsg.replace(/<<<FILL_ANSWERS>>>[\s\S]*?<<<END_FILL>>>/g,'').trim(), fillCommands }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      case 'ai_build_project': {
        if (!messages || !Array.isArray(messages)) throw new Error('Missing messages')
        const currentProject = body.currentProject
        systemPrompt = `You are an expert research methodology AI. Help researchers design complete research projects.\n\nWhen ready, include:\n<<<PROJECT_DATA>>>\n{"title":"","description":"","methodology":"single_survey|esm|ema|daily_diary|longitudinal","duration_days":7,"max_participants":100,"questionnaires":[{"title":"","description":"","type":"survey","frequency":"once|daily|weekly","estimated_duration":10,"questions":[{"question_text":"","question_type":"text_short|text_long|single_choice|multiple_choice|likert_scale|nps|rating|slider|yes_no|number|date|dropdown|checkbox_group|bipolar_scale|matrix|ranking","required":true,"options":[],"question_config":{}}]}]}\n<<<END_PROJECT>>>\n\nRules: Use appropriate question types. For likert_scale set question_config.scale_type. For slider set min_value,max_value,step. Generate 5-10 questions per questionnaire.${currentProject ? `\nCurrent project:\n${JSON.stringify(currentProject, null, 2)}` : ''}`
        const fm2 = [{ role: 'system', content: systemPrompt }, ...messages]
        const am2 = await callAI(fm2, 0.7, 4000)
        let projectData = null
        const pm = am2.match(/<<<PROJECT_DATA>>>([\s\S]*?)<<<END_PROJECT>>>/)
        if (pm) { try { projectData = JSON.parse(pm[1].trim()) } catch(e) { console.error('Parse project error:', e) } }
        return new Response(JSON.stringify({ response: am2.replace(/<<<PROJECT_DATA>>>[\s\S]*?<<<END_PROJECT>>>/g,'').trim(), projectData }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      case 'ai_edit_project': {
        if (!messages || !Array.isArray(messages)) throw new Error('Missing messages')
        const ps = body.projectStructure
        const summary = (ps?.questionnaires || []).map((q: any) => {
          const qs = (q.questions || []).map((qu: any, i: number) => {
            const opts = qu.options?.join(', ')
            return `  Q${i+1} [id:${qu.id}] (${qu.question_type}${qu.required?', required':''}): "${qu.question_text}"${opts?` | Options: [${opts}]`:''}`
          }).join('\n')
          return `Questionnaire "${q.title}" [id:${q.id}] (${q.type || 'survey'}):\n${qs || '  (no questions)'}`
        }).join('\n\n')
        systemPrompt = `You are an expert research editor AI for project "${ps?.title || 'Untitled'}".\n\nCURRENT STRUCTURE:\n${summary || 'Empty project'}\n\nTo make changes include:\n<<<EDIT_COMMANDS>>>\n[\n  {"action": "add_question", "questionnaire_id": "uuid", "data": {"question_text": "...", "question_type": "TYPE", "required": true, "options": ["opt1", "opt2"], "question_config": {}}},\n  {"action": "edit_question", "question_id": "uuid", "data": {"question_text": "new text"}},\n  {"action": "delete_question", "question_id": "uuid"},\n  {"action": "add_questionnaire", "data": {"title": "...", "description": "...", "type": "survey|consent|screening|profile|help|custom", "frequency": "once|daily|hourly", "questions": [...]}},\n  {"action": "edit_questionnaire", "questionnaire_id": "uuid", "data": {"title": "new title", "description": "new desc"}}\n]\n<<<END_EDIT>>>\n\nSupported question_type values:\ntext_short, text_long, single_choice, multiple_choice, dropdown, checkbox_group, yes_no, image_choice,\nslider, bipolar_scale, rating, likert_scale, nps, number, date, time, email, phone,\nmatrix, ranking, file_upload, instruction, section_header, text_block, divider, image_block,\nconstant_sum, signature, address, slider_range\n\nquestion_config keys by type:\n- likert_scale: {"scale_type":"1-5" or "1-7", "min_label":"...", "max_label":"..."}\n- slider: {"min_value":0, "max_value":100, "step":1, "min_label":"...", "max_label":"..."}\n- bipolar_scale: {"min_value":-3, "max_value":3, "min_label":"...", "max_label":"..."}\n- rating: {"max_value":5}\n- yes_no: {"yes_label":"Yes", "no_label":"No"} (or True/False)\n- matrix: {"columns":["col1","col2"]} with options as row labels\n- section_header: use to group questions into sections/tabs\n\nRules:\n- Always explain changes before the edit block.\n- Use real question IDs when editing/deleting.\n- For choice questions (single_choice, multiple_choice, dropdown, checkbox_group), ALWAYS include options array.\n- Use section_header to create labeled sections/tabs.\n- Generate ALL requested questions — do NOT truncate or summarize.\n- For standardized scales (NPI-Q, MSPSS, SSCQ, ADKS, DAS, ADL, IADL etc.), include the FULL set of items with correct wording.\n- If ambiguous, ask for clarification.`
        const fm = [{ role: 'system', content: systemPrompt }, ...messages]
        const am = await callAI(fm, 0.7, 16000)
        let editCommands: any[] = []
        const em = am.match(/<<<EDIT_COMMANDS>>>([\s\S]*?)<<<END_EDIT>>>/)
        if (em) {
          try { editCommands = JSON.parse(em[1].trim()) } catch(e) { console.error('Parse edit error:', e) }
        }
        if (editCommands.length === 0) {
          const codeBlockMatch = am.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/)
          if (codeBlockMatch) {
            try { editCommands = JSON.parse(codeBlockMatch[1].trim()) } catch(e) { console.error('Parse code block edit error:', e) }
          }
        }
        if (editCommands.length === 0) {
          const rawArrayMatch = am.match(/(\[\s*\{[\s\S]*?"action"\s*:[\s\S]*?\}\s*\])/)
          if (rawArrayMatch) {
            try { editCommands = JSON.parse(rawArrayMatch[1].trim()) } catch(e) { console.error('Parse raw array edit error:', e) }
          }
        }
        const cleanResponse = am.replace(/<<<EDIT_COMMANDS>>>[\s\S]*?<<<END_EDIT>>>/g,'').replace(/```(?:json)?\s*\[[\s\S]*?\]\s*```/g,'').trim()
        return new Response(JSON.stringify({ response: cleanResponse, editCommands }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      case 'ai_editor_form_fill': {
        if (!messages || !Array.isArray(messages)) throw new Error('Missing messages')
        const { activeTab, pageContext, projectTitle: pt } = body
        const tabDesc = activeTab || 'unknown'

        const formFillInstructions = `You are an AI Editor assistant for the research project "${pt || 'Untitled'}".
You are currently on the "${tabDesc}" tab.

CURRENT PAGE STATE:
${pageContext || '(no context provided)'}

YOUR ROLE: Help the researcher fill out forms on the current page. You update React frontend form state ONLY — you never write to the database directly. The user will click "Save" when they're satisfied.

To fill/update form fields, include a JSON block:
<<<FORM_FILLS>>>
[
  {"target": "project", "action": "update_project", "data": {"field_name": "value", ...}},
  {"target": "questionnaire", "action": "add_questionnaire", "data": {"title": "...", "description": "...", "type": "survey", "questions": [{"question_text": "...", "question_type": "text_short", "required": true, "options": ["opt1"], "question_config": {}}]}},
  {"target": "questionnaire", "action": "edit_questionnaire", "questionnaire_id": "uuid", "data": {"title": "new title"}},
  {"target": "question", "action": "add_question", "questionnaire_id": "uuid", "data": {"question_text": "...", "question_type": "TYPE", "required": true, "options": ["opt1"], "question_config": {}}},
  {"target": "question", "action": "edit_question", "question_id": "uuid", "data": {"question_text": "new text"}},
  {"target": "question", "action": "delete_question", "question_id": "uuid"},
  {"target": "logic", "action": "add_rule", "data": {"questionnaire_id": "uuid", "source_question_id": "uuid", "condition": "equals", "value": "yes", "action": "skip", "target_question_id": "uuid", "description": "..."}},
  {"target": "logic", "action": "edit_rule", "rule_id": "uuid", "data": {"condition": "not_equals", "value": "no"}},
  {"target": "logic", "action": "delete_rule", "rule_id": "uuid"}
]
<<<END_FORM_FILLS>>>

Settings project fields: title, description, project_type (survey/esm/ema/daily_diary/longitudinal), methodology_type (single_time/multi_time), study_duration (number), survey_frequency (once/daily/weekly/hourly/custom), max_participant (number), ai_enabled (bool), voice_enabled (bool), notification_enabled (bool), compensation_type (string), compensation_amount (number), onboarding_required (bool), incentive_enabled (bool), incentive_type (fixed/variable/lottery), incentive_amount (number), incentive_currency (USD/CNY/EUR...).

Supported question_type values:
text_short, text_long, single_choice, multiple_choice, dropdown, checkbox_group, yes_no, image_choice,
slider, bipolar_scale, rating, likert_scale, nps, number, date, time, email, phone,
matrix, ranking, file_upload, instruction, section_header, text_block, divider, image_block,
constant_sum, signature, address, slider_range

question_config keys by type:
- likert_scale: {"scale_type":"1-5" or "1-7", "min_label":"...", "max_label":"..."}
- slider: {"min_value":0, "max_value":100, "step":1, "min_label":"...", "max_label":"..."}
- bipolar_scale: {"min_value":-3, "max_value":3, "min_label":"...", "max_label":"..."}
- rating: {"max_value":5}
- yes_no: {"yes_label":"Yes", "no_label":"No"}
- matrix: {"columns":["col1","col2"]} with options as row labels

Logic conditions: equals, not_equals, contains, greater_than, less_than, is_empty, is_not_empty, any_selected, none_selected
Logic actions: skip, show, hide, disqualify, end_survey, show_questionnaire, hide_questionnaire, calculate, pipe_answer

Rules:
- Always explain what you're about to fill BEFORE the <<<FORM_FILLS>>> block.
- Use real IDs from the page context when editing/deleting existing items.
- For choice questions, ALWAYS include options array.
- If no form changes are needed (just answering a question), omit the FORM_FILLS block entirely.
- Keep explanations concise (2-4 sentences).`

        const fm3 = [{ role: 'system', content: formFillInstructions }, ...messages]
        const am3 = await callAI(fm3, 0.7, 8000)
        let formFills: any[] = []
        const ffm = am3.match(/<<<FORM_FILLS>>>([\s\S]*?)<<<END_FORM_FILLS>>>/)
        if (ffm) { try { formFills = JSON.parse(ffm[1].trim()) } catch(e) { console.error('Parse form fill error:', e) } }
        if (formFills.length === 0) {
          const cbm = am3.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/)
          if (cbm) { try { formFills = JSON.parse(cbm[1].trim()) } catch(e) { console.error('Parse code block form fill error:', e) } }
        }
        if (formFills.length === 0) {
          const ram = am3.match(/(\[\s*\{[\s\S]*?"target"\s*:[\s\S]*?\}\s*\])/)
          if (ram) { try { formFills = JSON.parse(ram[1].trim()) } catch(e) { console.error('Parse raw form fill error:', e) } }
        }
        const cleanResp = am3.replace(/<<<FORM_FILLS>>>[\s\S]*?<<<END_FORM_FILLS>>>/g,'').replace(/```(?:json)?\s*\[[\s\S]*?\]\s*```/g,'').trim()
        return new Response(JSON.stringify({ response: cleanResp, formFills }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      // --- Frontend AI proxy actions (text analysis + translation) ---
      // These replace direct client-side OpenRouter calls
      case 'text_analysis': {
        const { prompt } = body
        if (!prompt) throw new Error('Missing prompt for text_analysis')
        const result = await callAI([{ role: 'user', content: prompt }], 0.3, 2000)
        return new Response(JSON.stringify({ response: result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      case 'translate': {
        const { prompt } = body
        if (!prompt) throw new Error('Missing prompt for translate')
        const result = await callAI([{ role: 'user', content: prompt }], 0.2, 4000)
        return new Response(JSON.stringify({ response: result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    // Standard single-turn (ai_auto_answer, ai_assist, ai_enhance)
    const aiMessage = await callAI(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
      action === 'ai_auto_answer' ? 0.3 : 0.7,
      action === 'ai_auto_answer' ? 500 : 1000
    )
    return new Response(JSON.stringify({ response: aiMessage, action }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('AI survey support error:', error)
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})