import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { corsHeaders } from '../_shared/cors.ts'

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY_V2') || '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'

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
    
    const contentType = req.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      const body = await req.json()
      const { text, language = 'en', user_id, action } = body

      if (!OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not configured')
      }

      if (action === 'enhance_text') {
        const systemPrompt = language === 'zh' 
          ? `你是一位专业的痴呆症照护文字助手，拥有丰富的医疗护理和写作经验。你的任务是改善用户提供的照护描述，使其更加清晰、详细、专业且富有同理心。\n\n改善要求:\n1. 保持原始含义和关键信息完整不变\n2. 提高文本的清晰度和可读性\n3. 添加适当的细节使描述更完整\n4. 使用专业但温暖的语言风格\n5. 确保文字流畅自然\n6. 保持尊重和关怀的语气\n\n请直接返回改善后的文本，不要添加任何解释或前缀。`
          : `You are a professional dementia caregiving writing assistant with extensive experience in healthcare and compassionate communication. Your task is to enhance the user's caregiving description to make it clearer, more detailed, professional, and empathetic.\n\nEnhancement requirements:\n1. Preserve the original meaning and key information\n2. Improve clarity and readability\n3. Add appropriate details to make the description more complete\n4. Use professional yet warm language\n5. Ensure natural flow and coherence\n6. Maintain a respectful and caring tone\n\nReturn only the enhanced text without any explanations or prefixes.`

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://careconnector.app',
            'X-Title': 'Care Connector Survey Assistant'
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: text }
            ],
            temperature: 0.3,
            max_tokens: 800
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('OpenRouter API error:', errorText)
          throw new Error(`OpenRouter API failed: ${response.status}`)
        }

        const aiResponse = await response.json()
        const enhancedText = aiResponse.choices[0].message.content.trim()

        return new Response(
          JSON.stringify({ success: true, enhanced_text: enhancedText, user_id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'improve_text') {
        const systemPrompt = language === 'zh' 
          ? `你是一位经验丰富的痴呆症照护顾问和写作指导专家。基于用户提供的照护描述，你需要提供3个不同角度的具体改进建议。\n\n建议要求:\n1. 每个建议都应该从不同角度改进描述（如：增加细节、改善结构、强调重要信息等）\n2. 建议要具体、可操作、有实质性帮助\n3. 保持专业性和同理心\n4. 每个建议应该是完整的改写版本，而非修改指导\n5. 建议长度适中，不要过短或过长\n\n请以JSON数组格式返回3个建议，格式如下:\n[\"第一个改进版本\", \"第二个改进版本\", \"第三个改进版本\"]\n\n只返回JSON数组，不要添加任何其他文字。`
          : `You are an experienced dementia care consultant and writing coach. Based on the user's caregiving description, provide 3 different improvement suggestions from various perspectives.\n\nRequirements:\n1. Each suggestion should improve the description from a different angle (e.g., adding details, improving structure, emphasizing key points)\n2. Suggestions must be specific, actionable, and genuinely helpful\n3. Maintain professionalism and empathy\n4. Each suggestion should be a complete rewrite, not editing instructions\n5. Keep suggestions at a moderate length\n\nReturn 3 suggestions as a JSON array in this format:\n[\"First improved version\", \"Second improved version\", \"Third improved version\"]\n\nReturn only the JSON array without any additional text.`

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://careconnector.app',
            'X-Title': 'Care Connector Survey Assistant'
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: text }
            ],
            temperature: 0.7,
            max_tokens: 1200
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('OpenRouter API error:', errorText)
          throw new Error(`OpenRouter API failed: ${response.status}`)
        }

        const aiResponse = await response.json()
        const content = aiResponse.choices[0].message.content.trim()
        
        let suggestions
        try {
          const jsonMatch = content.match(/\[[\s\S]*\]/)
          const jsonString = jsonMatch ? jsonMatch[0] : content
          suggestions = JSON.parse(jsonString)
          if (!Array.isArray(suggestions) || suggestions.length === 0) {
            suggestions = [content]
          }
        } catch {
          const lines = content.split('\n').filter((line: string) => line.trim().length > 20)
          suggestions = lines.length > 0 ? lines.slice(0, 3) : [content]
        }

        return new Response(
          JSON.stringify({ success: true, suggestions, user_id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const language = formData.get('language') as string || 'en'
    const userId = formData.get('user_id') as string

    if (!audioFile) {
      throw new Error('No audio file provided')
    }

    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured')
    }

    const whisperFormData = new FormData()
    whisperFormData.append('file', audioFile)
    whisperFormData.append('model', 'whisper-1')
    whisperFormData.append('language', language === 'zh' ? 'zh' : 'en')
    whisperFormData.append('response_format', 'json')

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      },
      body: whisperFormData
    })

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text()
      console.error('Whisper transcription error:', errorText)
      throw new Error(`Transcription failed: ${transcriptionResponse.status}`)
    }

    const transcriptionData = await transcriptionResponse.json()
    const transcribedText = transcriptionData.text?.trim() || ''

    if (!transcribedText) {
      throw new Error('No transcription received from audio')
    }

    const analysisPrompt = language === 'zh'
      ? `你是一位专业的痴呆症照护数据分析助手。用户刚才通过语音描述了他们的照护经历。转录文本如下:\n\n"${transcribedText}"\n\n请分析这段描述并提取以下结构化信息:\n\n1. description: 对用户描述的内容进行清晰、完整的总结（保持关键细节，使用专业但温暖的语言）\n2. person_doing_with: 如果提到与他人一起进行照护活动，提取相关人员信息（例如："母亲"、"父亲"、"护工"、"家人"等）。如果没有提到他人，返回空字符串。\n3. type: 判断这段描述的主要类型:\n   - "care_activity" (照护活动) - 描述具体的照护行动或日常活动\n   - "care_need" (照护需求) - 表达需要的帮助或资源\n   - "struggle" (困难挣扎) - 描述遇到的挑战、困难或情感压力\n\n请以JSON格式返回，只包含这三个字段。格式示例:\n{\n  "description": "详细的描述内容",\n  "person_doing_with": "相关人员或空字符串",\n  "type": "care_activity 或 care_need 或 struggle"\n}\n\n只返回JSON对象，不要添加任何其他文字或解释。`
      : `You are a professional dementia caregiving data analysis assistant. The user just described their caregiving experience via voice. The transcribed text is:\n\n"${transcribedText}"\n\nPlease analyze this description and extract the following structured information:\n\n1. description: A clear, complete summary of what the user described (maintain key details, use professional yet warm language)\n2. person_doing_with: If they mentioned doing caregiving activities with others, extract relevant person information (e.g., "mother", "father", "caregiver", "family"). If no one else was mentioned, return an empty string.\n3. type: Determine the primary type of this description:\n   - "care_activity" - Describes specific caregiving actions or daily activities\n   - "care_need" - Expresses needed help or resources\n   - "struggle" - Describes challenges, difficulties, or emotional stress\n\nReturn in JSON format with only these three fields. Format example:\n{\n  "description": "detailed description content",\n  "person_doing_with": "relevant person or empty string",\n  "type": "care_activity or care_need or struggle"\n}\n\nReturn only the JSON object without any additional text or explanations.`

    const analysisResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://careconnector.app',
        'X-Title': 'Care Connector Voice Assistant'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'You are an expert dementia caregiving assistant specializing in analyzing and structuring caregiving descriptions. Always respond with valid JSON only.'
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' }
      })
    })

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text()
      console.error('Analysis API error:', errorText)
      throw new Error(`Analysis failed: ${analysisResponse.status} ${analysisResponse.statusText}`)
    }

    const analysisData = await analysisResponse.json()
    
    if (!analysisData.choices || analysisData.choices.length === 0) {
      throw new Error('No analysis response from AI model')
    }

    const analysisContent = analysisData.choices[0].message.content.trim()
    
    let parsedData
    try {
      const jsonMatch = analysisContent.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : analysisContent
      parsedData = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Failed to parse AI analysis as JSON:', analysisContent)
      parsedData = {
        type: 'care_activity',
        description: transcribedText,
        person_doing_with: ''
      }
    }

    const validatedData = {
      type: ['care_activity', 'care_need', 'struggle'].includes(parsedData.type) 
        ? parsedData.type 
        : 'care_activity',
      description: String(parsedData.description || transcribedText || '').trim(),
      person_doing_with: String(parsedData.person_doing_with || '').trim()
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: validatedData,
        transcription: transcribedText,
        raw_analysis: analysisContent,
        user_id: userId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Voice processing error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message || 'Failed to process voice input'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
