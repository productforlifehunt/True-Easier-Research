import { supabase } from '../../lib/supabase';
import { normalizeLegacyQuestionType } from '../constants/questionTypes';
import { loadLayoutFromDb, saveLayoutToDb } from '../utils/layoutSync';
import { loadTimeWindows, saveTimeWindows } from '../utils/timeWindowSync';

// ============================================================
// TEMPLATE SERVICE — Templates use the SAME tables as real data
// A template = a research_project / questionnaire / question
// with is_template = true
// ============================================================

export interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  template_category: string;
  template_is_public_or_private: boolean;
  project_type: string;
  methodology_type: string;
  researcher_id: string;
  created_at: string;
  // Joined counts
  questionnaire_count?: number;
  question_count?: number;
}

export interface QuestionnaireTemplate {
  id: string;
  title: string;
  description: string;
  template_category: string;
  template_is_public_or_private: boolean;
  questionnaire_type: string;
  estimated_duration: number;
  frequency: string;
  created_by: string | null;
  created_at: string;
  question_count?: number;
}

export interface QuestionTemplate {
  id: string;
  question_type: string;
  question_text: string;
  template_category: string;
  template_is_public_or_private: boolean;
  required: boolean;
  question_config: any;
  created_by: string | null;
  created_at: string;
}

// ── FETCH TEMPLATES ──

/** Fetch project templates: public ones + user's private ones */
export async function fetchProjectTemplates(userId?: string): Promise<ProjectTemplate[]> {
  let query = supabase
    .from('research_project')
    .select('id, title, description, template_category, template_is_public_or_private, project_type, methodology_type, researcher_id, created_at')
    .eq('is_template', true);

  if (userId) {
    // Show public + own private
    query = query.or(`template_is_public_or_private.eq.true,researcher_id.eq.${userId}`);
  } else {
    query = query.eq('template_is_public_or_private', true);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) { console.error('Failed to fetch project templates:', error); return []; }
  return data || [];
}

/** Fetch questionnaire templates: public ones + user's private ones */
export async function fetchQuestionnaireTemplates(userId?: string): Promise<QuestionnaireTemplate[]> {
  let query = supabase
    .from('questionnaire')
    .select('id, title, description, template_category, template_is_public_or_private, questionnaire_type, estimated_duration, frequency, created_by, created_at')
    .eq('is_template', true);

  if (userId) {
    query = query.or(`template_is_public_or_private.eq.true,created_by.eq.${userId}`);
  } else {
    query = query.eq('template_is_public_or_private', true);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) { console.error('Failed to fetch questionnaire templates:', error); return []; }
  return data || [];
}

/** Fetch question templates: public ones + user's private ones */
export async function fetchQuestionTemplates(userId?: string): Promise<QuestionTemplate[]> {
  let query = supabase
    .from('question')
    .select('id, question_type, question_text, template_category, template_is_public_or_private, required, question_config, created_by, created_at')
    .eq('is_template', true);

  if (userId) {
    query = query.or(`template_is_public_or_private.eq.true,created_by.eq.${userId}`);
  } else {
    query = query.eq('template_is_public_or_private', true);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) { console.error('Failed to fetch question templates:', error); return []; }
  return data || [];
}

// ── SAVE AS TEMPLATE ──

/** Save an existing project as a template (clones it with is_template=true) */
export async function saveProjectAsTemplate(
  projectId: string,
  userId: string,
  opts: { title?: string; description?: string; isPublic?: boolean; category?: string }
): Promise<{ templateId: string } | { error: string }> {
  try {
    // 1. Load the source project
    const { data: source, error: srcErr } = await supabase
      .from('research_project')
      .select('*')
      .eq('id', projectId)
      .single();
    if (srcErr || !source) return { error: 'Source project not found' };

    // 2. Clone project row with is_template = true
    const { id: _id, created_at: _ca, published_at: _pa, survey_code: _sc, ...rest } = source;
    const { data: tmpl, error: tmplErr } = await supabase
      .from('research_project')
      .insert({
        ...rest,
        title: opts.title || source.title,
        description: opts.description || source.description,
        is_template: true,
        template_is_public_or_private: opts.isPublic ?? false,
        template_category: opts.category || 'custom',
        source_template_id: projectId,
        status: 'draft',
        survey_code: null,
      })
      .select()
      .single();
    if (tmplErr || !tmpl) return { error: tmplErr?.message || 'Failed to clone project' };

    // 3. Clone participant types
    const { data: ptypes } = await supabase
      .from('participant_type')
      .select('*')
      .eq('project_id', projectId);

    const ptIdMap = new Map<string, string>();
    for (const pt of (ptypes || [])) {
      const newPtId = crypto.randomUUID();
      ptIdMap.set(pt.id, newPtId);
      await supabase.from('participant_type').insert({
        id: newPtId,
        project_id: tmpl.id,
        name: pt.name,
        description: pt.description,
        relations: pt.relations,
        color: pt.color,
        order_index: pt.order_index,
      });
    }

    // 4. Clone questionnaires
    const { data: questionnaires } = await supabase
      .from('questionnaire')
      .select('*')
      .eq('project_id', projectId);

    const qIdMap = new Map<string, string>();
    for (const q of (questionnaires || [])) {
      const newQId = crypto.randomUUID();
      qIdMap.set(q.id, newQId);
      const { id: _qid, created_at: _qca, project_id: _qpid, ...qRest } = q;
      await supabase.from('questionnaire').insert({
        ...qRest,
        id: newQId,
        project_id: tmpl.id,
        is_template: true,
        template_is_public_or_private: opts.isPublic ?? false,
        template_category: opts.category || 'custom',
        created_by: userId,
      });

      // Clone junction: questionnaire <-> participant_type
      const { data: junctions } = await supabase
        .from('questionnaire_participant_type')
        .select('*')
        .eq('questionnaire_id', q.id);
      for (const j of (junctions || [])) {
        const newPtId = ptIdMap.get(j.participant_type_id);
        if (newPtId) {
          await supabase.from('questionnaire_participant_type').insert({
            questionnaire_id: newQId,
            participant_type_id: newPtId,
          });
        }
      }

      // Clone time_windows from flat questionnaire_time_window table
      const srcTw = await loadTimeWindows(q.id);
      if (srcTw.length > 0) await saveTimeWindows(newQId, srcTw);
    }

    // 5. Clone questions + options
    const { data: questions } = await supabase
      .from('question')
      .select('*, question_option(*)')
      .eq('project_id', projectId);

    for (const q of (questions || [])) {
      const newQuestId = q.questionnaire_id ? qIdMap.get(q.questionnaire_id) : null;
      const { id: _qid, created_at: _qca, project_id: _qpid, question_option: options, ...qRest } = q;
      const { data: newQ } = await supabase
        .from('question')
        .insert({
          ...qRest,
          project_id: tmpl.id,
          questionnaire_id: newQuestId || null,
          is_template: true,
          template_is_public_or_private: opts.isPublic ?? false,
          template_category: opts.category || 'custom',
          created_by: userId,
        })
        .select()
        .single();

      // Clone options
      if (newQ && options && options.length > 0) {
        const optsToInsert = options.map((o: any) => ({
          question_id: newQ.id,
          option_text: o.option_text,
          option_value: o.option_value,
          order_index: o.order_index,
          is_other: o.is_other || false,
        }));
        await supabase.from('question_option').insert(optsToInsert);
      }
    }

    // 6. Clone layout (flat tables: app_tab, app_tab_element, child tables)
    const sourceLayout = await loadLayoutFromDb(projectId);
    if (sourceLayout && sourceLayout.tabs.length > 0) {
      // Remap questionnaire IDs in layout elements
      for (const tab of sourceLayout.tabs) {
        for (const el of tab.elements) {
          if (el.config?.questionnaire_id && qIdMap.has(el.config.questionnaire_id)) {
            el.config.questionnaire_id = qIdMap.get(el.config.questionnaire_id);
          }
          // Remap todo card questionnaire refs
          if (el.config?.todo_cards) {
            for (const card of el.config.todo_cards) {
              if (card.questionnaire_id && qIdMap.has(card.questionnaire_id)) {
                card.questionnaire_id = qIdMap.get(card.questionnaire_id);
              }
            }
          }
          // Remap participant type refs
          if (el.config?.participant_types) {
            el.config.participant_types = el.config.participant_types.map(
              ptId => ptIdMap.get(ptId) || ptId
            );
          }
        }
        // Assign new tab IDs
        tab.id = crypto.randomUUID();
      }
      // Rebuild bottom_nav from tabs
      sourceLayout.bottom_nav = sourceLayout.tabs.map(t => ({ icon: t.icon, label: t.label, tab_id: t.id }));
      // Assign new element IDs
      for (const tab of sourceLayout.tabs) {
        for (const el of tab.elements) {
          el.id = crypto.randomUUID();
        }
      }
      await saveLayoutToDb(tmpl.id, sourceLayout);
    }

    return { templateId: tmpl.id };
  } catch (err: any) {
    return { error: err.message || 'Failed to save template' };
  }
}

/** Save a single questionnaire as a template */
export async function saveQuestionnaireAsTemplate(
  questionnaireId: string,
  projectId: string,
  userId: string,
  opts: { title?: string; description?: string; isPublic?: boolean; category?: string }
): Promise<{ templateId: string } | { error: string }> {
  try {
    // 1. Load source questionnaire
    const { data: source, error: srcErr } = await supabase
      .from('questionnaire')
      .select('*')
      .eq('id', questionnaireId)
      .single();
    if (srcErr || !source) return { error: 'Source questionnaire not found' };

    // 2. Clone questionnaire row
    // Questionnaire templates have project_id = source project (for ownership) but is_template = true
    const { id: _id, created_at: _ca, ...rest } = source;
    const newQId = crypto.randomUUID();
    const { error: qErr } = await supabase.from('questionnaire').insert({
      ...rest,
      id: newQId,
      title: opts.title || source.title,
      description: opts.description || source.description,
      is_template: true,
      template_is_public_or_private: opts.isPublic ?? false,
      template_category: opts.category || 'custom',
      source_template_id: questionnaireId,
      created_by: userId,
    });
    if (qErr) return { error: qErr.message };

    // Clone time_windows from flat questionnaire_time_window table
    const srcTw = await loadTimeWindows(questionnaireId);
    if (srcTw.length > 0) await saveTimeWindows(newQId, srcTw);

    // 3. Clone questions + options for this questionnaire
    const { data: questions } = await supabase
      .from('question')
      .select('*, question_option(*)')
      .eq('questionnaire_id', questionnaireId);

    for (const q of (questions || [])) {
      const { id: _qid, created_at: _qca, project_id: _qpid, question_option: options, ...qRest } = q;
      const { data: newQ } = await supabase
        .from('question')
        .insert({
          ...qRest,
          project_id: projectId,
          questionnaire_id: newQId,
          is_template: true,
          template_is_public_or_private: opts.isPublic ?? false,
          template_category: opts.category || 'custom',
          created_by: userId,
        })
        .select()
        .single();

      if (newQ && options && options.length > 0) {
        await supabase.from('question_option').insert(
          options.map((o: any) => ({
            question_id: newQ.id,
            option_text: o.option_text,
            option_value: o.option_value,
            order_index: o.order_index,
            is_other: o.is_other || false,
          }))
        );
      }
    }

    return { templateId: newQId };
  } catch (err: any) {
    return { error: err.message || 'Failed to save questionnaire template' };
  }
}

// ── CREATE FROM TEMPLATE ──

/** Create a new project by cloning a project template */
export async function createProjectFromTemplate(
  templateId: string,
  userId: string,
  userEmail: string
): Promise<{ projectId: string } | { error: string }> {
  try {
    // 1. Get or create researcher
    let { data: researcher } = await supabase
      .from('researcher')
      .select('organization_id, id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!researcher) {
      let { data: org } = await supabase
        .from('organization')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (!org) {
        const { data: newOrg } = await supabase
          .from('organization')
          .insert({ name: 'My Organization', slug: `org-${Date.now()}`, plan: 'free' })
          .select()
          .single();
        org = newOrg;
      }
      if (org) {
        const { data: newResearcher } = await supabase
          .from('researcher')
          .insert({ user_id: userId, organization_id: org.id, role: 'researcher' })
          .select()
          .single();
        researcher = newResearcher;
      }
    }
    if (!researcher) return { error: 'Failed to create researcher profile' };

    // 2. Load the template project
    const { data: tmpl, error: tmplErr } = await supabase
      .from('research_project')
      .select('*')
      .eq('id', templateId)
      .eq('is_template', true)
      .single();
    if (tmplErr || !tmpl) return { error: 'Template not found' };

    // 3. Clone project
    const surveyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { id: _id, created_at: _ca, published_at: _pa, survey_code: _sc, is_template: _it, template_is_public_or_private: _ip, template_category: _tc, source_template_id: _st, organization_id: _oid, researcher_id: _rid, ...projRest } = tmpl;
    const { data: newProj, error: projErr } = await supabase
      .from('research_project')
      .insert({
        ...projRest,
        organization_id: researcher.organization_id,
        researcher_id: researcher.id,
        is_template: false,
        template_is_public_or_private: false,
        source_template_id: templateId,
        survey_code: surveyCode,
        status: 'draft',
      })
      .select()
      .single();
    if (projErr || !newProj) return { error: projErr?.message || 'Failed to create project' };

    // 4. Clone participant types
    const { data: ptypes } = await supabase
      .from('participant_type')
      .select('*')
      .eq('project_id', templateId);

    const ptIdMap = new Map<string, string>();
    for (const pt of (ptypes || [])) {
      const newPtId = crypto.randomUUID();
      ptIdMap.set(pt.id, newPtId);
      await supabase.from('participant_type').insert({
        id: newPtId,
        project_id: newProj.id,
        name: pt.name,
        description: pt.description,
        relations: pt.relations,
        color: pt.color,
        order_index: pt.order_index,
      });
    }

    // 5. Clone questionnaires
    const { data: questionnaires } = await supabase
      .from('questionnaire')
      .select('*')
      .eq('project_id', templateId);

    const qIdMap = new Map<string, string>();
    for (const q of (questionnaires || [])) {
      const newQId = crypto.randomUUID();
      qIdMap.set(q.id, newQId);
      const { id: _qid, created_at: _qca, project_id: _qpid, is_template: _qit, template_is_public_or_private: _qip, template_category: _qtc, source_template_id: _qst, created_by: _qcb, ...qRest } = q;
      await supabase.from('questionnaire').insert({
        ...qRest,
        id: newQId,
        project_id: newProj.id,
        is_template: false,
        source_template_id: q.id,
      });

      // Clone junction
      const { data: junctions } = await supabase
        .from('questionnaire_participant_type')
        .select('*')
        .eq('questionnaire_id', q.id);
      for (const j of (junctions || [])) {
        const newPtId = ptIdMap.get(j.participant_type_id);
        if (newPtId) {
          await supabase.from('questionnaire_participant_type').insert({
            questionnaire_id: newQId,
            participant_type_id: newPtId,
          });
        }
      }

      // Clone time_windows from flat questionnaire_time_window table
      const srcTw = await loadTimeWindows(q.id);
      if (srcTw.length > 0) await saveTimeWindows(newQId, srcTw);
    }

    // 6. Clone questions + options
    const { data: questions } = await supabase
      .from('question')
      .select('*, question_option(*)')
      .eq('project_id', templateId);

    for (const q of (questions || [])) {
      const newQuestId = q.questionnaire_id ? qIdMap.get(q.questionnaire_id) : null;
      const { id: _qid, created_at: _qca, project_id: _qpid, question_option: options, is_template: _qit, template_is_public_or_private: _qip, template_category: _qtc, source_template_id: _qst, created_by: _qcb, ...qRest } = q;
      const { data: newQ } = await supabase
        .from('question')
        .insert({
          ...qRest,
          project_id: newProj.id,
          questionnaire_id: newQuestId || null,
          is_template: false,
          source_template_id: q.id,
        })
        .select()
        .single();

      if (newQ && options && options.length > 0) {
        await supabase.from('question_option').insert(
          options.map((o: any) => ({
            question_id: newQ.id,
            option_text: o.option_text,
            option_value: o.option_value,
            order_index: o.order_index,
            is_other: o.is_other || false,
          }))
        );
      }
    }

    return { projectId: newProj.id };
  } catch (err: any) {
    return { error: err.message || 'Failed to create from template' };
  }
}

/** Import a questionnaire template into an existing project */
export async function importQuestionnaireTemplate(
  templateQId: string,
  targetProjectId: string
): Promise<{ questionnaireId: string; questions: any[] } | { error: string }> {
  try {
    // 1. Load template questionnaire
    const { data: tmplQ, error: qErr } = await supabase
      .from('questionnaire')
      .select('*')
      .eq('id', templateQId)
      .eq('is_template', true)
      .single();
    if (qErr || !tmplQ) return { error: 'Template questionnaire not found' };

    // 2. Clone questionnaire into target project
    const newQId = crypto.randomUUID();
    const { id: _id, created_at: _ca, project_id: _pid, is_template: _it, template_is_public_or_private: _ip, template_category: _tc, source_template_id: _st, created_by: _cb, ...qRest } = tmplQ;
    await supabase.from('questionnaire').insert({
      ...qRest,
      id: newQId,
      project_id: targetProjectId,
      is_template: false,
      source_template_id: templateQId,
    });

    // Clone time_windows from flat questionnaire_time_window table
    const srcTw = await loadTimeWindows(templateQId);
    if (srcTw.length > 0) await saveTimeWindows(newQId, srcTw);

    // 3. Clone questions + options
    const { data: questions } = await supabase
      .from('question')
      .select('*, question_option(*)')
      .eq('questionnaire_id', templateQId);

    const clonedQuestions: any[] = [];
    for (const q of (questions || [])) {
      const { id: _qid, created_at: _qca, project_id: _qpid, question_option: options, is_template: _qit, template_is_public_or_private: _qip, template_category: _qtc, source_template_id: _qst, created_by: _qcb, ...qRest2 } = q;
      const { data: newQ } = await supabase
        .from('question')
        .insert({
          ...qRest2,
          project_id: targetProjectId,
          questionnaire_id: newQId,
          is_template: false,
          source_template_id: q.id,
        })
        .select()
        .single();

      if (newQ) {
        if (options && options.length > 0) {
          const { data: newOpts } = await supabase.from('question_option').insert(
            options.map((o: any) => ({
              question_id: newQ.id,
              option_text: o.option_text,
              option_value: o.option_value,
              order_index: o.order_index,
              is_other: o.is_other || false,
            }))
          ).select();
          newQ.options = newOpts || [];
        }
        clonedQuestions.push(newQ);
      }
    }

    return { questionnaireId: newQId, questions: clonedQuestions };
  } catch (err: any) {
    return { error: err.message || 'Failed to import questionnaire template' };
  }
}

/** Delete a template (only if user owns it) */
export async function deleteTemplate(
  type: 'project' | 'questionnaire' | 'question',
  templateId: string,
  userId: string
): Promise<{ success: boolean } | { error: string }> {
  try {
    if (type === 'project') {
      const { error } = await supabase
        .from('research_project')
        .delete()
        .eq('id', templateId)
        .eq('is_template', true);
      if (error) return { error: error.message };
    } else if (type === 'questionnaire') {
      const { error } = await supabase
        .from('questionnaire')
        .delete()
        .eq('id', templateId)
        .eq('is_template', true)
        .eq('created_by', userId);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase
        .from('question')
        .delete()
        .eq('id', templateId)
        .eq('is_template', true)
        .eq('created_by', userId);
      if (error) return { error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete template' };
  }
}

// ── LEGACY COMPATIBILITY ──
// These are kept temporarily so existing imports don't break during migration
// They return empty — all data should come from DB

/** @deprecated Use fetchQuestionTemplates instead */
export function getTemplateQuestions(_templateId: string): any[] {
  return [];
}

/** @deprecated Use fetchProjectTemplates instead */
export function getTemplateSettings(_templateId: string): any {
  return null;
}

/** @deprecated Use createProjectFromTemplate instead */
export async function createSurveyFromTemplate(
  userId: string,
  userEmail: string,
  templateId: string,
  _templateName: string,
  _templateDescription: string
): Promise<{ projectId: string } | { error: string }> {
  return createProjectFromTemplate(templateId, userId, userEmail);
}
