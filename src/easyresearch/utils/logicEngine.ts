/**
 * Shared logic evaluation engine for all survey views.
 * Uses the research_logic table (one flat relational table for all logic rules).
 * Questionnaire-scoped: rules only reference questions within the same questionnaire.
 */

export interface LogicRule {
  id: string;
  projectId: string;
  questionnaireId: string;
  sourceQuestionId: string;
  condition: string;
  value: string;
  action: 'skip' | 'show' | 'hide' | 'disqualify' | 'end_survey';
  targetQuestionId: string | null;
  orderIndex: number;
  enabled: boolean;
}

export interface LogicResult {
  visibleQuestionIds: Set<string>;
  skipTarget: string | null;
  disqualified: boolean;
  endSurvey: boolean;
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
  };
}

/** Evaluate a single condition against a response value */
function evaluateCondition(condition: string, responseValue: any, ruleValue: string): boolean {
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
    default:
      return false;
  }
}

/**
 * Evaluate all logic rules for a questionnaire against current responses.
 * Returns which questions are visible, skip target, and terminal actions.
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
  const shownByRule = new Set<string>(); // questions that have a show rule
  const shownMatched = new Set<string>(); // questions where the show rule matched
  let skipTarget: string | null = null;
  let disqualified = false;
  let endSurvey = false;

  for (const rule of enabledRules) {
    const matches = evaluateCondition(rule.condition, responses[rule.sourceQuestionId], rule.value);

    switch (rule.action) {
      case 'hide':
        if (matches && rule.targetQuestionId) {
          hiddenIds.add(rule.targetQuestionId);
        }
        break;

      case 'show':
        if (rule.targetQuestionId) {
          shownByRule.add(rule.targetQuestionId);
          if (matches) {
            shownMatched.add(rule.targetQuestionId);
          }
        }
        break;

      case 'skip':
        // Only evaluate skip for the current question
        if (currentQuestionId && rule.sourceQuestionId === currentQuestionId && matches && rule.targetQuestionId && !skipTarget) {
          skipTarget = rule.targetQuestionId;
        }
        break;

      case 'disqualify':
        if (matches && !disqualified) {
          disqualified = true;
        }
        break;

      case 'end_survey':
        if (matches && !endSurvey) {
          endSurvey = true;
        }
        break;
    }
  }

  // Build visible set: start with all, remove hidden, remove show-ruled but not matched
  const visibleQuestionIds = new Set<string>();
  for (const qId of allQuestionIds) {
    if (hiddenIds.has(qId)) continue;
    if (shownByRule.has(qId) && !shownMatched.has(qId)) continue;
    visibleQuestionIds.add(qId);
  }

  return { visibleQuestionIds, skipTarget, disqualified, endSurvey };
}

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
  const { visibleQuestionIds } = evaluateLogic(rules, allIds, responses);
  return questions.filter(q => visibleQuestionIds.has(q.id));
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
