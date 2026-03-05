/**
 * Participant Type Filtering Utilities
 * 
 * Filters questions and questionnaires based on participant type assignments.
 * Supports 3-level filtering:
 * - Project level (via enrollment.participant_type_id)
 * - Questionnaire level (via questionnaire_participant_type junction table)
 * - Question level (via question_participant_type junction table)
 */

/**
 * Filter questions by participant type.
 * If a question has assigned_participant_types, only show it to those types.
 * If empty array or undefined, show to all types.
 */
export function filterQuestionsByParticipantType(
  questions: any[],
  participantTypeId: string | null | undefined
): any[] {
  if (!participantTypeId) {
    // No participant type assigned to enrollment - show all questions
    return questions;
  }

  return questions.filter(q => {
    const assignedTypes = q.assigned_participant_types || [];
    // If no types assigned, show to everyone
    if (assignedTypes.length === 0) return true;
    // Otherwise, only show if participant's type is in the list
    return assignedTypes.includes(participantTypeId);
  });
}

/**
 * Filter questionnaires by participant type.
 * If a questionnaire has assigned_participant_types, only show it to those types.
 * If empty array or undefined, show to all types.
 */
export function filterQuestionnairesByParticipantType(
  questionnaires: any[],
  participantTypeId: string | null | undefined
): any[] {
  if (!participantTypeId) {
    // No participant type assigned to enrollment - show all questionnaires
    return questionnaires;
  }

  return questionnaires.filter(q => {
    const assignedTypes = q.assigned_participant_types || [];
    // If no types assigned, show to everyone
    if (assignedTypes.length === 0) return true;
    // Otherwise, only show if participant's type is in the list
    return assignedTypes.includes(participantTypeId);
  });
}
