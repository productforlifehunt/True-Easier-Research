/**
 * Submission Runtime — Webhook firing & Quota enforcement
 * 提交运行时 — Webhook 触发与配额执行
 */
import { supabase } from '../../lib/supabase';

// ===== WEBHOOK FIRING / Webhook 触发 =====

interface WebhookPayload {
  event: string;
  project_id: string;
  timestamp: string;
  data: Record<string, any>;
}

/**
 * Fire all active webhooks for a given event type
 * 为指定事件类型触发所有活跃的 Webhook
 */
export async function fireWebhooks(
  projectId: string,
  eventType: string,
  eventData: Record<string, any>
): Promise<void> {
  try {
    // Load webhook configs from project settings
    const { data: project } = await supabase
      .from('research_project')
      .select('setting')
      .eq('id', projectId)
      .maybeSingle();

    const webhooks = project?.setting?.webhooks || [];
    const activeWebhooks = webhooks.filter(
      (w: any) => w.is_active && w.events?.includes(eventType)
    );

    if (activeWebhooks.length === 0) return;

    const payload: WebhookPayload = {
      event: eventType,
      project_id: projectId,
      timestamp: new Date().toISOString(),
      data: eventData,
    };

    // Fire all webhooks concurrently, don't block submission
    // 并发触发所有 Webhook，不阻塞提交
    await Promise.allSettled(
      activeWebhooks.map(async (webhook: any) => {
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(webhook.headers || {}),
          };
          if (webhook.secret) {
            headers['X-Webhook-Secret'] = webhook.secret;
          }

          const response = await fetch(webhook.url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(10000), // 10s timeout
          });

          // Log delivery attempt / 记录投递尝试
          console.log(`[Webhook] ${eventType} → ${webhook.url}: ${response.status}`);
        } catch (err) {
          console.error(`[Webhook] Failed ${webhook.url}:`, err);
        }
      })
    );
  } catch (err) {
    // Never let webhook errors break submission flow
    // Webhook 错误不应中断提交流程
    console.error('[Webhook] System error:', err);
  }
}

// ===== QUOTA ENFORCEMENT / 配额执行 =====

interface QuotaCheckResult {
  allowed: boolean;
  reason?: string; // e.g. "Quota reached for segment: Male 18-24"
  quotaId?: string;
}

/**
 * Check if a submission should be allowed based on quota rules
 * 根据配额规则检查是否允许提交
 */
export async function checkQuotas(
  projectId: string,
  responseAnswers: Record<string, any>
): Promise<QuotaCheckResult> {
  try {
    const { data: project } = await supabase
      .from('research_project')
      .select('setting')
      .eq('id', projectId)
      .maybeSingle();

    const quotas = project?.setting?.quotas || [];
    if (quotas.length === 0) return { allowed: true };

    // Get current response counts / 获取当前响应计数
    const { count: totalResponses } = await supabase
      .from('survey_response')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', 'completed');

    for (const quota of quotas) {
      if (!quota.is_active) continue;

      if (quota.type === 'total') {
        // Total response cap / 总响应上限
        if ((totalResponses || 0) >= quota.target) {
          await fireWebhooks(projectId, 'quota.reached', { quota_id: quota.id, quota_name: quota.name });
          return { allowed: false, reason: `Total quota reached: ${quota.target}`, quotaId: quota.id };
        }
      } else if (quota.type === 'segment') {
        // Segment-based quota: check answers against segment criteria
        // 基于细分的配额：检查答案是否匹配细分条件
        const matchesSegment = evaluateSegmentMatch(responseAnswers, quota.criteria);
        if (matchesSegment) {
          // Count existing responses matching this segment
          const { data: segmentResponses } = await supabase
            .from('survey_response')
            .select('answers')
            .eq('project_id', projectId)
            .eq('status', 'completed');

          const segmentCount = (segmentResponses || []).filter(r =>
            evaluateSegmentMatch(r.answers || {}, quota.criteria)
          ).length;

          if (segmentCount >= quota.target) {
            await fireWebhooks(projectId, 'quota.reached', { quota_id: quota.id, quota_name: quota.name, segment: quota.criteria });
            return { allowed: false, reason: `Segment quota reached: ${quota.name} (${segmentCount}/${quota.target})`, quotaId: quota.id };
          }
        }
      }
    }

    return { allowed: true };
  } catch (err) {
    console.error('[Quota] Check error:', err);
    // On error, allow submission / 出错时允许提交
    return { allowed: true };
  }
}

/**
 * Evaluate if response answers match segment criteria
 * 评估响应答案是否匹配细分条件
 */
function evaluateSegmentMatch(
  answers: Record<string, any>,
  criteria: Record<string, any>
): boolean {
  if (!criteria || Object.keys(criteria).length === 0) return false;

  return Object.entries(criteria).every(([questionId, expectedValue]) => {
    const actual = answers[questionId];
    if (Array.isArray(expectedValue)) {
      return expectedValue.includes(actual);
    }
    return String(actual) === String(expectedValue);
  });
}

// ===== QUALITY FLAG INJECTION / 质量标记注入 =====

interface QualityFlags {
  is_speeder: boolean;
  is_straightliner: boolean;
  is_bot_suspect: boolean;
  quality_score: number;
  flags: string[];
}

/**
 * Run quality checks on a completed response
 * 对已完成的响应运行质量检查
 */
export function runQualityChecks(
  answers: Record<string, any>,
  timings: Record<string, number>,
  totalTimeSeconds: number,
  minExpectedSeconds: number = 30
): QualityFlags {
  const flags: string[] = [];
  let score = 100;

  // 1. Speeder check / 快速答题检测
  const isSpeeder = totalTimeSeconds < minExpectedSeconds;
  if (isSpeeder) {
    flags.push('speeder');
    score -= 30;
  }

  // 2. Straightliner check / 直线答题检测
  const scaleAnswers = Object.values(answers).filter(
    v => typeof v === 'number' || (typeof v === 'string' && /^\d+$/.test(v))
  );
  if (scaleAnswers.length >= 5) {
    const uniqueValues = new Set(scaleAnswers.map(String));
    if (uniqueValues.size === 1) {
      flags.push('straightliner');
      score -= 25;
    }
  }

  // 3. Bot suspect / 机器人嫌疑
  const isBotSuspect = totalTimeSeconds < 10 && Object.keys(answers).length > 5;
  if (isBotSuspect) {
    flags.push('bot_suspect');
    score -= 40;
  }

  // 4. Gibberish text check / 无意义文本检测
  const textAnswers = Object.values(answers).filter(v => typeof v === 'string' && v.length > 10);
  for (const text of textAnswers) {
    const t = text as string;
    const charFreq = new Map<string, number>();
    for (const c of t.toLowerCase()) charFreq.set(c, (charFreq.get(c) || 0) + 1);
    const entropy = [...charFreq.values()].reduce((h, f) => {
      const p = f / t.length;
      return h - p * Math.log2(p);
    }, 0);
    if (entropy < 1.5) {
      flags.push('gibberish_text');
      score -= 15;
      break;
    }
  }

  return {
    is_speeder: isSpeeder,
    is_straightliner: flags.includes('straightliner'),
    is_bot_suspect: isBotSuspect,
    quality_score: Math.max(0, score),
    flags,
  };
}

// ===== COMBINED SUBMISSION HANDLER / 综合提交处理器 =====

/**
 * Full submission pipeline: quality check → quota check → save → webhooks
 * 完整提交流水线：质量检查 → 配额检查 → 保存 → Webhook
 */
export async function processSubmission(params: {
  projectId: string;
  participantId: string;
  questionnaireId: string;
  answers: Record<string, any>;
  timings: Record<string, number>;
  totalTimeSeconds: number;
  metadata?: Record<string, any>;
}): Promise<{ success: boolean; error?: string; responseId?: string }> {
  const { projectId, participantId, questionnaireId, answers, timings, totalTimeSeconds, metadata } = params;

  // Step 1: Quality checks / 步骤1：质量检查
  const qualityFlags = runQualityChecks(answers, timings, totalTimeSeconds);

  // Step 2: Quota checks / 步骤2：配额检查
  const quotaResult = await checkQuotas(projectId, answers);
  if (!quotaResult.allowed) {
    await fireWebhooks(projectId, 'submission.blocked', {
      reason: quotaResult.reason,
      participant_id: participantId,
    });
    return { success: false, error: quotaResult.reason };
  }

  // Step 3: Save response / 步骤3：保存响应
  const enrichedAnswers = {
    ...answers,
    __question_timings__: timings,
    __quality_flags__: qualityFlags,
    __metadata__: metadata || {},
  };

  const { data: saved, error: saveError } = await supabase
    .from('survey_response')
    .insert({
      project_id: projectId,
      questionnaire_id: questionnaireId,
      participant_id: participantId,
      answers: enrichedAnswers,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (saveError) {
    console.error('[Submission] Save error:', saveError);
    return { success: false, error: saveError.message };
  }

  // Step 4: Fire webhooks (non-blocking) / 步骤4：触发 Webhook（非阻塞）
  fireWebhooks(projectId, 'response.completed', {
    response_id: saved.id,
    participant_id: participantId,
    questionnaire_id: questionnaireId,
    quality_score: qualityFlags.quality_score,
    quality_flags: qualityFlags.flags,
  });

  if (qualityFlags.quality_score < 50) {
    fireWebhooks(projectId, 'quality.flagged', {
      response_id: saved.id,
      quality_score: qualityFlags.quality_score,
      flags: qualityFlags.flags,
    });
  }

  return { success: true, responseId: saved.id };
}
