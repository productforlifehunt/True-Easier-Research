/**
 * Shared logic evaluation engine for all survey views.
 * Uses the research_logic table (one flat relational table for all logic rules).
 *
 * Supports 12 logic categories:
 * 1. Basic skip/show/hide/disqualify/end_survey
 * 2. Compound conditions (AND/OR groups via condition_group + group_operator)
 * 3. Required-before-next validation
 * 4. Answer piping (pipe_answer + piping_template)
 * 5. Calculated fields (calculate + calculation_formula)
 * 6. Advanced validation (regex, date, length, list matching)
 * 7. Cross-questionnaire logic (cross_questionnaire + target_questionnaire_id)
 * 8. Random question pool (randomize_questions + randomize_count)
 * 9. A/B variants (show_variant + variant_group)
 * 10. Quota control (quota_check + quota_limit + quota_field)
 * 11. Loop/repeat blocks (loop_block + loop_count + loop_source_question_id)
 * 12. URL parameter conditions (url_param_equals / url_param_contains)
 */

export type LogicAction =
  | 'skip' | 'show' | 'hide' | 'disqualify' | 'end_survey'
  | 'calculate' | 'pipe_answer' | 'require_before_next' | 'validate_format'
  | 'show_questionnaire' | 'hide_questionnaire'
  | 'randomize_questions' | 'show_variant' | 'quota_check' | 'loop_block';

export type LogicCondition =
  | 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  | 'is_empty' | 'is_not_empty' | 'any_selected' | 'none_selected'
  | 'date_before' | 'date_after' | 'date_between'
  | 'matches_regex' | 'length_greater' | 'length_less'
  | 'in_list' | 'not_in_list'
  | 'url_param_equals' | 'url_param_contains';

export interface LogicRule {
  id: string;
  projectId: string;
  questionnaireId: string;
  sourceQuestionId: string;
  condition: string;
  value: string;
  action: LogicAction;
  targetQuestionId: string | null;
  orderIndex: number;
  enabled: boolean;
  // Compound conditions (AND/OR groups)
  conditionGroup?: string | null;
  groupOperator?: 'and' | 'or';
  // Calculated fields
  calculationFormula?: string | null;
  // Answer piping
  pipingTemplate?: string | null;
  // Advanced validation
  validationRegex?: string | null;
  errorMessage?: string | null;
  // Cross-questionnaire logic
  crossQuestionnaire?: boolean;
  targetQuestionnaireId?: string | null;
  // Metadata
  description?: string | null;
  // Randomization
  randomizeCount?: number | null;
  // A/B Variants
  variantGroup?: string | null;
  // Quota control
  quotaLimit?: number | null;
  quotaField?: string | null;
  // Loop/repeat block
  loopSourceQuestionId?: string | null;
  loopCount?: number | null;
  // URL parameter condition
  urlParamKey?: string | null;
}

export interface LogicResult {
  visibleQuestionIds: Set<string>;
  skipTarget: string | null;
  disqualified: boolean;
  endSurvey: boolean;
  // Enhanced results
  calculatedValues: Record<string, number | string>;
  pipedTexts: Record<string, string>;
  validationErrors: Record<string, string>;
  requiredErrors: Record<string, string>;
  hiddenQuestionnaireIds: Set<string>;
  shownQuestionnaireIds: Set<string>;
  // Advanced results
  randomizedQuestionIds: Record<string, string[]>;
  activeVariants: Record<string, string>;
  quotaReached: boolean;
  loopIterations: Record<string, number>;
}

/** Map a DB row from research_logic to in-memory LogicRule */
export function dbRowToLogicRule(row: any): LogicRule {
  return {
    id: row.id,
    projectId: row.project_id,
    questionnaireId: row.questionnaire_id,
    sourceQuestionId: row.source_question_id,
    condition: row.condition || 'equals',
    value: row.value || '',
    action: row.action || 'skip',
    targetQuestionId: row.target_question_id || null,
    orderIndex: row.order_index ?? 0,
    enabled: row.enabled !== false,
    conditionGroup: row.condition_group || null,
    groupOperator: row.group_operator || 'and',
    calculationFormula: row.calculation_formula || null,
    pipingTemplate: row.piping_template || null,
    validationRegex: row.validation_regex || null,
    errorMessage: row.error_message || null,
    crossQuestionnaire: row.cross_questionnaire || false,
    targetQuestionnaireId: row.target_questionnaire_id || null,
    description: row.description || null,
    randomizeCount: row.randomize_count ?? null,
    variantGroup: row.variant_group || null,
    quotaLimit: row.quota_limit ?? null,
    quotaField: row.quota_field || null,
    loopSourceQuestionId: row.loop_source_question_id || null,
    loopCount: row.loop_count ?? null,
    urlParamKey: row.url_param_key || null,
  };
}

/** Map an in-memory LogicRule to a DB row for research_logic */
export function logicRuleToDbRow(rule: LogicRule): Record<string, any> {
  return {
    id: rule.id,
    project_id: rule.projectId,
    questionnaire_id: rule.questionnaireId,
    source_question_id: rule.sourceQuestionId,
    condition: rule.condition || 'equals',
    value: rule.value || '',
    action: rule.action || 'skip',
    target_question_id: rule.targetQuestionId || null,
    order_index: rule.orderIndex ?? 0,
    enabled: rule.enabled !== false,
    condition_group: rule.conditionGroup || null,
    group_operator: rule.groupOperator || 'and',
    calculation_formula: rule.calculationFormula || null,
    piping_template: rule.pipingTemplate || null,
    validation_regex: rule.validationRegex || null,
    error_message: rule.errorMessage || null,
    cross_questionnaire: rule.crossQuestionnaire || false,
    target_questionnaire_id: rule.targetQuestionnaireId || null,
    description: rule.description || null,
    randomize_count: rule.randomizeCount ?? null,
    variant_group: rule.variantGroup || null,
    quota_limit: rule.quotaLimit ?? null,
    quota_field: rule.quotaField || null,
    loop_source_question_id: rule.loopSourceQuestionId || null,
    loop_count: rule.loopCount ?? null,
    url_param_key: rule.urlParamKey || null,
  };
}

// ─── Condition Evaluation ───────────────────────────────────────────

/** Evaluate a single condition against a response value. Supports 17 condition types. */
export function evaluateCondition(condition: string, responseValue: any, ruleValue: string): boolean {
  if (condition === 'is_empty') {
    return responseValue === undefined || responseValue === null || String(responseValue).trim() === '' || (Array.isArray(responseValue) && responseValue.length === 0);
  }
  if (condition === 'is_not_empty') {
    return responseValue !== undefined && responseValue !== null && String(responseValue).trim() !== '' && !(Array.isArray(responseValue) && responseValue.length === 0);
  }
  if (responseValue === undefined || responseValue === null) return false;

  const valStr = String(responseValue).toLowerCase();
  const ruleStr = ruleValue.toLowerCase();

  switch (condition) {
    case 'equals':
      return valStr === ruleStr;
    case 'not_equals':
      return valStr !== ruleStr;
    case 'contains':
      return valStr.includes(ruleStr);
    case 'greater_than':
      return Number(responseValue) > Number(ruleValue);
    case 'less_than':
      return Number(responseValue) < Number(ruleValue);
    case 'any_selected':
      if (Array.isArray(responseValue)) {
        return responseValue.some(v => String(v).toLowerCase() === ruleStr);
      }
      return valStr === ruleStr;
    case 'none_selected':
      if (Array.isArray(responseValue)) {
        return !responseValue.some(v => String(v).toLowerCase() === ruleStr);
      }
      return valStr !== ruleStr;

    // ─── New date conditions ───
    case 'date_before': {
      const d = new Date(String(responseValue));
      const rd = ruleValue === 'today' ? new Date() : new Date(ruleValue);
      return !isNaN(d.getTime()) && !isNaN(rd.getTime()) && d < rd;
    }
    case 'date_after': {
      const d = new Date(String(responseValue));
      const rd = ruleValue === 'today' ? new Date() : new Date(ruleValue);
      return !isNaN(d.getTime()) && !isNaN(rd.getTime()) && d > rd;
    }
    case 'date_between': {
      const parts = ruleValue.split(',').map(s => s.trim());
      if (parts.length !== 2) return false;
      const d = new Date(String(responseValue));
      const start = new Date(parts[0]);
      const end = new Date(parts[1]);
      return !isNaN(d.getTime()) && !isNaN(start.getTime()) && !isNaN(end.getTime()) && d >= start && d <= end;
    }

    // ─── Regex matching ───
    case 'matches_regex': {
      try {
        return new RegExp(ruleValue).test(String(responseValue));
      } catch {
        return false;
      }
    }

    // ─── Text length conditions ───
    case 'length_greater':
      return String(responseValue).length > Number(ruleValue);
    case 'length_less':
      return String(responseValue).length < Number(ruleValue);

    // ─── List matching ───
    case 'in_list': {
      const list = ruleValue.split(',').map(s => s.trim().toLowerCase());
      return list.includes(valStr);
    }
    case 'not_in_list': {
      const list = ruleValue.split(',').map(s => s.trim().toLowerCase());
      return !list.includes(valStr);
    }

    // ─── URL parameter conditions ───
    // ruleValue format: "key=expected" OR use urlParamKey from rule (passed via responseValue)
    case 'url_param_equals': {
      try {
        const params = new URLSearchParams(window.location.search);
        // responseValue may carry the urlParamKey from the rule; ruleValue is the expected value
        const key = (responseValue && typeof responseValue === 'string' && responseValue.startsWith('__urlkey:'))
          ? responseValue.replace('__urlkey:', '')
          : ruleValue.split('=')[0] || '';
        const expected = (responseValue && typeof responseValue === 'string' && responseValue.startsWith('__urlkey:'))
          ? ruleValue
          : ruleValue.split('=')[1] || '';
        const paramVal = params.get(key) || '';
        return paramVal.toLowerCase() === expected.toLowerCase();
      } catch { return false; }
    }
    case 'url_param_contains': {
      try {
        const params = new URLSearchParams(window.location.search);
        const key = (responseValue && typeof responseValue === 'string' && responseValue.startsWith('__urlkey:'))
          ? responseValue.replace('__urlkey:', '')
          : ruleValue.split('=')[0] || '';
        const expected = (responseValue && typeof responseValue === 'string' && responseValue.startsWith('__urlkey:'))
          ? ruleValue
          : ruleValue.split('=')[1] || '';
        const paramVal = params.get(key) || '';
        return paramVal.toLowerCase().includes(expected.toLowerCase());
      } catch { return false; }
    }

    default:
      return false;
  }
}

// ─── Compound Condition Groups ──────────────────────────────────────

/** Evaluate a group of rules combined with AND/OR. Returns true if the group condition is met. */
function evaluateConditionGroup(groupRules: LogicRule[], responses: Record<string, any>): boolean {
  if (groupRules.length === 0) return false;
  const operator = groupRules[0].groupOperator || 'and';
  const results = groupRules.map(rule =>
    evaluateCondition(rule.condition, responses[rule.sourceQuestionId], rule.value)
  );
  return operator === 'or' ? results.some(r => r) : results.every(r => r);
}

/** Split rules into grouped and ungrouped. Grouped rules share the same conditionGroup. */
function partitionRulesByGroup(rules: LogicRule[]): { ungrouped: LogicRule[]; groups: Map<string, LogicRule[]> } {
  const ungrouped: LogicRule[] = [];
  const groups = new Map<string, LogicRule[]>();
  for (const rule of rules) {
    if (rule.conditionGroup) {
      if (!groups.has(rule.conditionGroup)) groups.set(rule.conditionGroup, []);
      groups.get(rule.conditionGroup)!.push(rule);
    } else {
      ungrouped.push(rule);
    }
  }
  return { ungrouped, groups };
}

// ─── Calculation Engine ─────────────────────────────────────────────

/** Evaluate a calculation formula by substituting {{question_id}} with response values. */
export function evaluateFormula(formula: string, responses: Record<string, any>): number | string {
  let expr = formula;
  const regex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
  expr = expr.replace(regex, (_match, questionId) => {
    const val = responses[questionId];
    if (val === undefined || val === null || val === '') return '0';
    return String(val);
  });
  try {
    // Safe math evaluation: only allow numbers, operators, parens, decimals, spaces
    if (!/^[\d\s+\-*/().]+$/.test(expr)) return expr;
    const result = Function(`"use strict"; return (${expr})`)();
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return Math.round(result * 100) / 100;
    }
    return String(result);
  } catch {
    return 'Error';
  }
}

// ─── Answer Piping ──────────────────────────────────────────────────

/** Replace {{question_id}} placeholders in text with actual response values. */
export function applyPiping(template: string, responses: Record<string, any>): string {
  const regex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
  return template.replace(regex, (_match, questionId) => {
    const answer = responses[questionId];
    if (answer === undefined || answer === null) return '[未回答]';
    if (Array.isArray(answer)) return answer.join('、');
    return String(answer);
  });
}

// ─── Main Evaluation Engine ─────────────────────────────────────────

/**
 * Evaluate all logic rules for a questionnaire against current responses.
 * Supports all 7 logic categories including compound conditions, piping,
 * calculated fields, advanced validation, and cross-questionnaire logic.
 *
 * @param rules - All enabled logic rules for this questionnaire, sorted by order_index
 * @param allQuestionIds - All question IDs in the questionnaire, in order
 * @param responses - Current response values keyed by question ID
 * @param currentQuestionId - The question the participant just answered (for skip evaluation)
 */
export function evaluateLogic(
  rules: LogicRule[],
  allQuestionIds: string[],
  responses: Record<string, any>,
  currentQuestionId?: string,
): LogicResult {
  const enabledRules = rules.filter(r => r.enabled);
  const hiddenIds = new Set<string>();
  const shownByRule = new Set<string>();
  const shownMatched = new Set<string>();
  let skipTarget: string | null = null;
  let disqualified = false;
  let endSurvey = false;
  const calculatedValues: Record<string, number | string> = {};
  const pipedTexts: Record<string, string> = {};
  const validationErrors: Record<string, string> = {};
  const requiredErrors: Record<string, string> = {};
  const hiddenQuestionnaireIds = new Set<string>();
  const shownQuestionnaireIds = new Set<string>();
  const randomizedQuestionIds: Record<string, string[]> = {};
  const activeVariants: Record<string, string> = {};
  let quotaReached = false;
  const loopIterations: Record<string, number> = {};

  // Partition into grouped and ungrouped rules
  const { ungrouped, groups } = partitionRulesByGroup(enabledRules);

  // Helper: apply the action of a rule/group when its condition matches
  const applyAction = (rule: LogicRule, matches: boolean) => {
    switch (rule.action) {
      case 'hide':
        if (matches && rule.targetQuestionId) hiddenIds.add(rule.targetQuestionId);
        break;
      case 'show':
        if (rule.targetQuestionId) {
          shownByRule.add(rule.targetQuestionId);
          if (matches) shownMatched.add(rule.targetQuestionId);
        }
        break;
      case 'skip':
        if (currentQuestionId && rule.sourceQuestionId === currentQuestionId && matches && rule.targetQuestionId && !skipTarget) {
          skipTarget = rule.targetQuestionId;
        }
        break;
      case 'disqualify':
        if (matches && !disqualified) disqualified = true;
        break;
      case 'end_survey':
        if (matches && !endSurvey) endSurvey = true;
        break;
      case 'calculate':
        if (rule.calculationFormula && rule.targetQuestionId) {
          calculatedValues[rule.targetQuestionId] = evaluateFormula(rule.calculationFormula, responses);
        }
        break;
      case 'pipe_answer':
        if (rule.pipingTemplate && rule.targetQuestionId) {
          pipedTexts[rule.targetQuestionId] = applyPiping(rule.pipingTemplate, responses);
        }
        break;
      case 'require_before_next':
        if (matches) {
          requiredErrors[rule.sourceQuestionId] = rule.errorMessage || '此题为必填项，请回答后继续';
        }
        break;
      case 'validate_format':
        if (rule.validationRegex) {
          try {
            const valid = new RegExp(rule.validationRegex).test(String(responses[rule.sourceQuestionId] || ''));
            if (!valid && responses[rule.sourceQuestionId] !== undefined && responses[rule.sourceQuestionId] !== '') {
              validationErrors[rule.sourceQuestionId] = rule.errorMessage || '格式不正确';
            }
          } catch { /* invalid regex, skip */ }
        } else if (matches) {
          validationErrors[rule.sourceQuestionId] = rule.errorMessage || '验证失败';
        }
        break;
      case 'show_questionnaire':
        if (matches && rule.targetQuestionnaireId) shownQuestionnaireIds.add(rule.targetQuestionnaireId);
        break;
      case 'hide_questionnaire':
        if (matches && rule.targetQuestionnaireId) hiddenQuestionnaireIds.add(rule.targetQuestionnaireId);
        break;
      case 'randomize_questions': {
        const count = rule.randomizeCount || allQuestionIds.length;
        const pool = [...allQuestionIds];
        // Deterministic shuffle seeded by rule ID to keep stable across re-renders
        const seed = rule.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        for (let i = pool.length - 1; i > 0; i--) {
          const j = (seed * (i + 1) + 7) % (i + 1);
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        randomizedQuestionIds[rule.questionnaireId] = pool.slice(0, Math.min(count, pool.length));
        break;
      }
      case 'show_variant': {
        if (rule.variantGroup && rule.targetQuestionId) {
          // Pick variant deterministically based on participant session
          const variantRules = enabledRules.filter(r => r.action === 'show_variant' && r.variantGroup === rule.variantGroup);
          if (variantRules.length > 0) {
            const seed = (rule.variantGroup || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            const sessionSeed = Object.keys(responses).length; // varies per participant
            const picked = variantRules[(seed + sessionSeed) % variantRules.length];
            activeVariants[rule.variantGroup] = picked.targetQuestionId || '';
            // Hide all variants except the picked one
            for (const vr of variantRules) {
              if (vr.targetQuestionId && vr.targetQuestionId !== picked.targetQuestionId) {
                hiddenIds.add(vr.targetQuestionId);
              }
            }
          }
        }
        break;
      }
      case 'quota_check': {
        if (matches && rule.quotaLimit) {
          quotaReached = true;
        }
        break;
      }
      case 'loop_block': {
        if (rule.loopSourceQuestionId) {
          const loopAnswer = responses[rule.loopSourceQuestionId];
          if (Array.isArray(loopAnswer)) {
            loopIterations[rule.sourceQuestionId] = loopAnswer.length;
          } else if (rule.loopCount) {
            loopIterations[rule.sourceQuestionId] = rule.loopCount;
          }
        } else if (rule.loopCount) {
          loopIterations[rule.sourceQuestionId] = rule.loopCount;
        }
        break;
      }
    }
  };

  // 1. Evaluate ungrouped rules (single condition each)
  for (const rule of ungrouped) {
    // For URL param conditions, pass urlParamKey as a special response value
    const responseVal = (rule.condition === 'url_param_equals' || rule.condition === 'url_param_contains') && rule.urlParamKey
      ? `__urlkey:${rule.urlParamKey}`
      : responses[rule.sourceQuestionId];
    const matches = evaluateCondition(rule.condition, responseVal, rule.value);
    applyAction(rule, matches);
  }

  // 2. Evaluate grouped rules (compound AND/OR conditions)
  for (const [, groupRules] of groups) {
    const groupMatches = evaluateConditionGroup(groupRules, responses);
    // Use the first rule in the group for the action (all rules in a group share the same action)
    applyAction(groupRules[0], groupMatches);
  }

  // Build visible set: start with all, remove hidden, remove show-ruled but not matched
  const visibleQuestionIds = new Set<string>();
  for (const qId of allQuestionIds) {
    if (hiddenIds.has(qId)) continue;
    if (shownByRule.has(qId) && !shownMatched.has(qId)) continue;
    visibleQuestionIds.add(qId);
  }

  return {
    visibleQuestionIds, skipTarget, disqualified, endSurvey,
    calculatedValues, pipedTexts, validationErrors, requiredErrors,
    hiddenQuestionnaireIds, shownQuestionnaireIds,
    randomizedQuestionIds, activeVariants, quotaReached, loopIterations,
  };
}

// ─── Convenience Wrappers ───────────────────────────────────────────

/**
 * Get visible questions list (convenience wrapper).
 * Used by survey views to filter questions before rendering.
 */
export function getVisibleQuestions<T extends { id: string }>(
  questions: T[],
  rules: LogicRule[],
  responses: Record<string, any>,
): T[] {
  if (rules.length === 0) return questions;
  const allIds = questions.map(q => q.id);
  const result = evaluateLogic(rules, allIds, responses);
  let visible = questions.filter(q => result.visibleQuestionIds.has(q.id));

  // Apply randomization: if any randomize_questions rule produced a subset, filter to that subset
  const randomizedSets = Object.values(result.randomizedQuestionIds);
  if (randomizedSets.length > 0) {
    const allowedIds = new Set(randomizedSets.flat());
    visible = visible.filter(q => allowedIds.has(q.id));
  }

  return visible;
}

/**
 * Find skip target index for the current question.
 * Returns the index in the visible questions array, or null if no skip.
 */
export function findSkipTarget(
  currentQuestionId: string,
  visibleQuestions: { id: string }[],
  rules: LogicRule[],
  responses: Record<string, any>,
): number | null {
  const allIds = visibleQuestions.map(q => q.id);
  const { skipTarget } = evaluateLogic(rules, allIds, responses, currentQuestionId);
  if (!skipTarget) return null;
  const idx = visibleQuestions.findIndex(q => q.id === skipTarget);
  return idx >= 0 ? idx : null;
}

/**
 * Check for terminal actions (disqualify / end_survey) after a response change.
 */
export function checkTerminalActions(
  rules: LogicRule[],
  allQuestionIds: string[],
  responses: Record<string, any>,
): { disqualified: boolean; endSurvey: boolean } {
  const { disqualified, endSurvey } = evaluateLogic(rules, allQuestionIds, responses);
  return { disqualified, endSurvey };
}

/**
 * Check require_before_next rules for the current question.
 * Returns error message or null if OK to proceed.
 */
export function checkRequiredBeforeNext(
  currentQuestionId: string,
  rules: LogicRule[],
  responses: Record<string, any>,
): string | null {
  const enabledRules = rules.filter(r => r.enabled && r.action === 'require_before_next' && r.sourceQuestionId === currentQuestionId);
  for (const rule of enabledRules) {
    const matches = evaluateCondition(rule.condition, responses[rule.sourceQuestionId], rule.value);
    if (matches) return rule.errorMessage || '此题为必填项，请回答后继续';
  }
  return null;
}

/**
 * Check validate_format rules for a question.
 * Returns error message or null if validation passes.
 */
export function checkValidation(
  questionId: string,
  rules: LogicRule[],
  responses: Record<string, any>,
): string | null {
  const enabledRules = rules.filter(r => r.enabled && r.action === 'validate_format' && r.sourceQuestionId === questionId);
  for (const rule of enabledRules) {
    if (rule.validationRegex) {
      try {
        const val = String(responses[questionId] || '');
        if (val !== '' && !new RegExp(rule.validationRegex).test(val)) {
          return rule.errorMessage || '格式不正确';
        }
      } catch { /* invalid regex, skip */ }
    }
  }
  return null;
}

/**
 * Get all calculated values for the current responses.
 */
export function getCalculatedValues(
  rules: LogicRule[],
  responses: Record<string, any>,
): Record<string, number | string> {
  const calculatedValues: Record<string, number | string> = {};
  const calcRules = rules.filter(r => r.enabled && r.action === 'calculate' && r.calculationFormula && r.targetQuestionId);
  for (const rule of calcRules) {
    calculatedValues[rule.targetQuestionId!] = evaluateFormula(rule.calculationFormula!, responses);
  }
  return calculatedValues;
}

/**
 * Get piped text for a question (if any pipe_answer rule targets it).
 */
export function getPipedText(
  questionId: string,
  rules: LogicRule[],
  responses: Record<string, any>,
): string | null {
  const pipingRule = rules.find(r => r.enabled && r.action === 'pipe_answer' && r.targetQuestionId === questionId && r.pipingTemplate);
  if (!pipingRule?.pipingTemplate) return null;
  return applyPiping(pipingRule.pipingTemplate, responses);
}

/**
 * Get cross-questionnaire visibility results.
 * Call with ALL project rules (not just one questionnaire).
 */
export function getCrossQuestionnaireVisibility(
  allProjectRules: LogicRule[],
  allResponses: Record<string, any>,
): { hiddenQuestionnaireIds: Set<string>; shownQuestionnaireIds: Set<string> } {
  const crossRules = allProjectRules.filter(r => r.enabled && r.crossQuestionnaire);
  const hiddenQuestionnaireIds = new Set<string>();
  const shownQuestionnaireIds = new Set<string>();

  for (const rule of crossRules) {
    const matches = evaluateCondition(rule.condition, allResponses[rule.sourceQuestionId], rule.value);
    if (rule.action === 'hide_questionnaire' && matches && rule.targetQuestionnaireId) {
      hiddenQuestionnaireIds.add(rule.targetQuestionnaireId);
    }
    if (rule.action === 'show_questionnaire' && matches && rule.targetQuestionnaireId) {
      shownQuestionnaireIds.add(rule.targetQuestionnaireId);
    }
  }
  return { hiddenQuestionnaireIds, shownQuestionnaireIds };
}

/**
 * Check if quota has been reached for the current survey.
 * Views should call this before allowing submission.
 * Returns true if the survey should be blocked (quota full).
 */
export function checkQuotaReached(
  rules: LogicRule[],
  allQuestionIds: string[],
  responses: Record<string, any>,
): boolean {
  if (rules.length === 0) return false;
  const { quotaReached } = evaluateLogic(rules, allQuestionIds, responses);
  return quotaReached;
}

/**
 * Expand questions for loop blocks.
 * Returns the expanded question list with loop iterations appended.
 * Each looped question gets a synthetic ID: `{originalId}__loop_{iteration}`.
 *
 * @param questions - Original question list
 * @param rules - Logic rules
 * @param responses - Current responses
 * @returns Expanded question list with loop copies
 */
export function expandLoopQuestions<T extends { id: string; question_text?: string }>(
  questions: T[],
  rules: LogicRule[],
  responses: Record<string, any>,
): T[] {
  if (rules.length === 0) return questions;
  const allIds = questions.map(q => q.id);
  const { loopIterations } = evaluateLogic(rules, allIds, responses);

  if (Object.keys(loopIterations).length === 0) return questions;

  const expanded: T[] = [];
  for (const q of questions) {
    expanded.push(q);
    const iterations = loopIterations[q.id];
    if (iterations && iterations > 1) {
      // Find the loop rule to get loop source labels
      const loopRule = rules.find(r => r.enabled && r.action === 'loop_block' && r.sourceQuestionId === q.id);
      const loopSourceAnswers = loopRule?.loopSourceQuestionId
        ? (Array.isArray(responses[loopRule.loopSourceQuestionId]) ? responses[loopRule.loopSourceQuestionId] as string[] : null)
        : null;

      for (let i = 1; i < iterations; i++) {
        const label = loopSourceAnswers ? loopSourceAnswers[i] || `#${i + 1}` : `#${i + 1}`;
        expanded.push({
          ...q,
          id: `${q.id}__loop_${i}`,
          question_text: q.question_text ? `${q.question_text} (${label})` : undefined,
        } as T);
      }
    }
  }
  return expanded;
}
