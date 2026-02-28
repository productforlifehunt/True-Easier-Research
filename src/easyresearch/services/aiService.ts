import { supabase } from '../../lib/supabase';

// AI Service Configuration
const AI_CONFIG = {
  baseUrl: import.meta.env.VITE_SUPABASE_URL,
  endpoints: {
    surveySupport: '/functions/v1/ai-survey-support',
    voiceProcessing: '/functions/v1/process-voice-survey',
    entrySummary: '/functions/v1/summarize-entry',
    chatbot: '/functions/v1/how-to-chatbot'
  }
};

// Plan-based AI entitlements
export interface AIEntitlements {
  aiAssistEnabled: boolean;
  voiceInputEnabled: boolean;
  creditBalance: number;
  creditLimit: number;
}

export interface OrganizationPlan {
  plan: 'free' | 'professional' | 'team' | 'enterprise';
  ai_credit: number;
  setting: Record<string, any> | null;
}

// Plan-based credit limits
const PLAN_LIMITS: Record<string, { aiCredits: number; aiEnabled: boolean; voiceEnabled: boolean }> = {
  free: { aiCredits: 10, aiEnabled: true, voiceEnabled: false },
  professional: { aiCredits: 500, aiEnabled: true, voiceEnabled: true },
  team: { aiCredits: 2000, aiEnabled: true, voiceEnabled: true },
  enterprise: { aiCredits: 10000, aiEnabled: true, voiceEnabled: true }
};

// Check AI entitlements for organization
export async function getAIEntitlements(organizationId: string): Promise<AIEntitlements> {
  try {
    const { data: org, error } = await supabase
      .from('organization')
      .select('plan, ai_credit, setting')
      .eq('id', organizationId)
      .maybeSingle();

    if (error || !org) {
      return {
        aiAssistEnabled: false,
        voiceInputEnabled: false,
        creditBalance: 0,
        creditLimit: 0
      };
    }

    const limits = PLAN_LIMITS[org.plan] || PLAN_LIMITS.free;
    const aiEnabledBySetting = (org as any).ai_features_enabled !== false;
    const voiceEnabledBySetting = (org as any).voice_features_enabled !== false;

    return {
      aiAssistEnabled: aiEnabledBySetting && limits.aiEnabled,
      voiceInputEnabled: voiceEnabledBySetting && limits.voiceEnabled,
      creditBalance: org.ai_credit ?? 0,
      creditLimit: limits.aiCredits
    };
  } catch (error) {
    console.error('Failed to get AI entitlements:', error);
    return {
      aiAssistEnabled: false,
      voiceInputEnabled: false,
      creditBalance: 0,
      creditLimit: 0
    };
  }
}

// Check if AI feature usage is allowed
export async function checkAIUsageAllowed(organizationId: string, creditsRequired: number = 1): Promise<boolean> {
  const entitlements = await getAIEntitlements(organizationId);
  
  if (!entitlements.aiAssistEnabled) {
    throw new Error('AI features are not available on your current plan');
  }

  if (entitlements.creditBalance < creditsRequired) {
    throw new Error('AI credit limit reached. Upgrade your plan for more credits.');
  }

  return true;
}

// Decrement AI credit balance after successful usage
export async function decrementAICredit(organizationId: string, creditsUsed: number = 1): Promise<void> {
  try {
    const { data: current, error: readError } = await supabase
      .from('organization')
      .select('ai_credit')
      .eq('id', organizationId)
      .maybeSingle();

    if (readError) {
      console.error('Failed to read AI credit:', readError);
      return;
    }

    const nextValue = Math.max(0, (current?.ai_credit ?? 0) - creditsUsed);
    const { error } = await supabase
      .from('organization')
      .update({ ai_credit: nextValue })
      .eq('id', organizationId);

    if (error) {
      console.error('Failed to update AI credit:', error);
    }
  } catch (error) {
    console.error('Error decrementing AI credit:', error);
  }
}

// AI API call wrapper with entitlements check
export async function callAIEndpoint(
  organizationId: string,
  endpoint: keyof typeof AI_CONFIG.endpoints,
  payload: any,
  creditsRequired: number = 1
): Promise<any> {
  // Check entitlements first
  await checkAIUsageAllowed(organizationId, creditsRequired);

  // Get auth session
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  if (authError || !session) {
    throw new Error('Authentication required for AI features');
  }

  // Make API call
  const url = `${AI_CONFIG.baseUrl}${AI_CONFIG.endpoints[endpoint]}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      ...payload,
      organizationId // Include organization ID for server-side validation
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI service error: ${errorText}`);
  }

  const result = await response.json();

  // Decrement credit balance on successful call
  await decrementAICredit(organizationId, creditsRequired);

  return result;
}

// Specific AI service methods
export async function getAISurveySupport(
  organizationId: string,
  questionText: string,
  questionType: string,
  context?: any
): Promise<string> {
  const result = await callAIEndpoint(organizationId, 'surveySupport', {
    question: questionText,
    questionType,
    context
  });
  
  return result.suggestion || result.response || '';
}

export async function processVoiceInput(
  organizationId: string,
  audioBlob: Blob,
  questionText: string
): Promise<string> {
  // Check voice entitlements specifically
  const entitlements = await getAIEntitlements(organizationId);
  if (!entitlements.voiceInputEnabled) {
    throw new Error('Voice input is not available on your current plan');
  }

  // Convert blob to base64 for transmission
  const base64Audio = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(audioBlob);
  });

  const result = await callAIEndpoint(organizationId, 'voiceProcessing', {
    audio: base64Audio,
    question: questionText
  }, 2); // Voice processing costs more credits

  return result.transcription || '';
}

// Reset AI credits to plan default (to be called by a scheduled task)
export async function resetAICredits(): Promise<void> {
  try {
    // Reset each org's ai_credit to their plan's limit
    for (const [plan, limits] of Object.entries(PLAN_LIMITS)) {
      const { error } = await supabase
        .from('organization')
        .update({ ai_credit: limits.aiCredits })
        .eq('plan', plan);

      if (error) {
        console.error(`Failed to reset AI credits for plan ${plan}:`, error);
      }
    }
  } catch (error) {
    console.error('Error resetting AI credits:', error);
  }
}
