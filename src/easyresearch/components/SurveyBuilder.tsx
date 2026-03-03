import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Save, ArrowLeft, Pencil, Bookmark } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import SurveySettings from './SurveySettings';
import SurveyLogic from './SurveyLogic';
import SurveyPreview from './SurveyPreview';
import ProjectResponsesTab from './ProjectResponsesTab';
import ProjectParticipantsTab from './ProjectParticipantsTab';
import QuestionnaireList, { type QuestionnaireConfig } from './QuestionnaireList';
import ParticipantTypeManager, { type ParticipantType } from './ParticipantTypeManager';
import LayoutBuilder, { type AppLayout, getDefaultLayout } from './LayoutBuilder';
import { loadLayoutFromDb, saveLayoutToDb } from '../utils/layoutSync';
import { questionConfigToDbCols, validationRuleToDbCols, hydrateQuestionRows } from '../utils/questionConfigSync';
import { saveTimeWindows, loadTimeWindowsBatch } from '../utils/timeWindowSync';
import ComponentBuilder from './ComponentBuilder';
import AIEditChatbot from './AIEditChatbot';
import SaveTemplateModal from './SaveTemplateModal';
import { useI18n } from '../hooks/useI18n';

import toast from 'react-hot-toast';

interface Question {
  id: string;
  question_type: string;
  question_text: string;
  question_description?: string;
  question_config: any;
  validation_rule: any;
  logic_rule: any;
  ai_config: any;
  order_index: number;
  section_name?: string;
  required: boolean;
  allow_voice: boolean;
  allow_ai_assist: boolean;
  options?: QuestionOption[];
}

interface QuestionOption {
  id: string;
  option_text: string;
  option_value?: string;
  order_index: number;
  is_other: boolean;
}

export interface SurveyProject {
  id?: string;
  organization_id?: string;
  researcher_id?: string;
  title: string;
  description: string;
  status?: string;
  project_type: string;
  methodology_type?: string;
  ai_enabled: boolean;
  voice_enabled: boolean;
  notification_enabled: boolean;
  // Consent (proper columns)
  consent_required?: boolean;
  consent_form_title?: string;
  consent_form_text?: string;
  consent_form_url?: string;
  // Screening
  screening_enabled?: boolean;
  // Compensation
  compensation_amount?: number;
  compensation_type?: string;
  // Participant config
  max_participant?: number;
  participant_numbering?: boolean;
  participant_number_prefix?: string;
  participant_relation_enabled?: boolean;
  participant_relation_options?: string[];
  // Schedule
  start_at?: string;
  end_at?: string;
  study_duration?: number;
  survey_frequency?: string;
  allow_participant_dnd?: boolean;
  allow_start_date_selection?: boolean;
  survey_code?: string;
  published_at?: string | null;
  // Onboarding
  onboarding_required?: boolean;
  onboarding_instruction?: string;
  // Display settings (proper columns)
  show_progress_bar?: boolean;
  disable_backtracking?: boolean;
  randomize_questions?: boolean;
  auto_advance?: boolean;
  // Ecogram (proper columns)
  ecogram_enabled?: boolean;
  ecogram_center_label?: string;
  ecogram_relationship_options?: string[];
  ecogram_support_categories?: string[];
  // Notification (proper columns)
  notification_frequency?: string;
  notification_times_per_day?: number;
  notification_times?: string[];
  notification_send_reminders?: boolean;
  notification_timezone?: string;
  // Sampling (proper columns)
  sampling_type?: string;
  sampling_prompts_per_day?: number;
  sampling_start_hour?: number;
  sampling_end_hour?: number;
  sampling_allow_late?: boolean;
  sampling_late_window_minutes?: number;
  // Recruitment
  recruitment_criteria_text?: string;
  // Layout theme/header (flat columns on research_project — no more JSONB)
  layout_show_header?: boolean;
  layout_header_title?: string;
  layout_theme_primary_color?: string;
  layout_theme_background_color?: string;
  layout_theme_card_style?: string;
  // Help
  help_information?: string;
  // Incentives
  incentive_enabled?: boolean;
  incentive_type?: string;
  incentive_amount?: number;
  incentive_currency?: string;
  incentive_description?: string;
  incentive_payment_method?: string;
  incentive_payment_instructions?: string;
  // Messaging
  messaging_enabled?: boolean;
}

type TabId = 'questionnaires' | 'components' | 'logic' | 'layout' | 'settings' | 'preview' | 'participants' | 'responses';

const SurveyBuilder: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const templateData = (location.state as any)?.template;

  React.useEffect(() => {
    if (!authLoading && !user) {
      const redirectTo = `/easyresearch/${projectId ? `project/${projectId}` : 'create-survey'}`;
      navigate(`/easyresearch/auth?redirectTo=${encodeURIComponent(redirectTo)}&redirect=researcher`, { replace: true });
    }
  }, [user, authLoading, navigate]);

  React.useEffect(() => {
    if (templateData || projectId) return;
    try {
      const raw = sessionStorage.getItem('easyresearch_pending_template');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.id) return;
      sessionStorage.removeItem('easyresearch_pending_template');
      navigate(location.pathname + location.search, {
        replace: true,
        state: { template: parsed },
      });
    } catch {
      // ignore
    }
  }, [templateData, projectId, navigate, location.pathname, location.search]);

  const [project, setProject] = useState<SurveyProject>({
    title: '',
    description: '',
    project_type: 'survey',
    ai_enabled: false,
    voice_enabled: false,
    notification_enabled: true,
  });
  const initialTab = (location.state as any)?.activeTab as TabId | undefined;
  const [activeTab, setActiveTab] = useState<TabId>(initialTab || 'settings');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [logicRules, setLogicRules] = useState<any[]>([]);

  // New state for multi-questionnaire architecture
  const [questionnaireConfigs, setQuestionnaireConfigs] = useState<QuestionnaireConfig[]>([]);
  const [participantTypes, setParticipantTypes] = useState<ParticipantType[]>([]);
  const [appLayout, setAppLayout] = useState<AppLayout>(getDefaultLayout([]));
  const appLayoutInitializedRef = useRef(false);

  // Auto-save layout to flat DB tables whenever it changes (debounced)
  const layoutSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // Skip the initial mount and the first load from DB
    if (!appLayoutInitializedRef.current) return;
    if (!projectId) return;

    if (layoutSaveTimerRef.current) clearTimeout(layoutSaveTimerRef.current);
    layoutSaveTimerRef.current = setTimeout(async () => {
      try {
        await saveLayoutToDb(projectId, appLayout);
        console.log('[AutoSave] layout persisted to flat tables');
      } catch (err) {
        console.error('[AutoSave] Failed to persist layout:', err);
      }
    }, 1500);

    return () => { if (layoutSaveTimerRef.current) clearTimeout(layoutSaveTimerRef.current); };
  }, [appLayout, projectId]);

  const projectStatus = (project as any)?.status || 'draft';

  // Direct DB row → frontend state. All columns are flat now, no JSONB normalization needed.
  const toProjectState = (row: any): SurveyProject => ({
    id: row.id,
    organization_id: row.organization_id,
    researcher_id: row.researcher_id,
    title: row.title || '',
    description: row.description || '',
    status: row.status || 'draft',
    project_type: row.project_type || 'survey',
    methodology_type: row.methodology_type,
    ai_enabled: row.ai_enabled ?? false,
    voice_enabled: row.voice_enabled ?? false,
    notification_enabled: row.notification_enabled ?? true,
    consent_required: row.consent_required ?? false,
    consent_form_title: row.consent_form_title,
    consent_form_text: row.consent_form_text,
    consent_form_url: row.consent_form_url,
    screening_enabled: row.screening_enabled ?? false,
    compensation_amount: row.compensation_amount,
    compensation_type: row.compensation_type,
    max_participant: row.max_participant,
    participant_numbering: row.participant_numbering ?? false,
    participant_number_prefix: row.participant_number_prefix || 'PP',
    participant_relation_enabled: row.participant_relation_enabled ?? false,
    participant_relation_options: row.participant_relation_options || [],
    start_at: row.start_at,
    end_at: row.end_at,
    study_duration: row.study_duration,
    survey_frequency: row.survey_frequency,
    allow_participant_dnd: row.allow_participant_dnd ?? false,
    allow_start_date_selection: row.allow_start_date_selection ?? false,
    survey_code: row.survey_code,
    published_at: row.published_at,
    onboarding_required: row.onboarding_required ?? false,
    onboarding_instruction: row.onboarding_instruction,
    show_progress_bar: row.show_progress_bar ?? true,
    disable_backtracking: row.disable_backtracking ?? false,
    randomize_questions: row.randomize_questions ?? false,
    auto_advance: row.auto_advance ?? false,
    ecogram_enabled: row.ecogram_enabled ?? false,
    ecogram_center_label: row.ecogram_center_label || 'Me',
    ecogram_relationship_options: row.ecogram_relationship_options || [],
    ecogram_support_categories: row.ecogram_support_categories || [],
    notification_frequency: row.notification_frequency,
    notification_times_per_day: row.notification_times_per_day,
    notification_times: row.notification_times || [],
    notification_send_reminders: row.notification_send_reminders ?? true,
    notification_timezone: row.notification_timezone,
    sampling_type: row.sampling_type,
    sampling_prompts_per_day: row.sampling_prompts_per_day,
    sampling_start_hour: row.sampling_start_hour ?? 8,
    sampling_end_hour: row.sampling_end_hour ?? 21,
    sampling_allow_late: row.sampling_allow_late ?? true,
    sampling_late_window_minutes: row.sampling_late_window_minutes ?? 60,
    recruitment_criteria_text: row.recruitment_criteria_text,
    layout_show_header: row.layout_show_header ?? true,
    layout_header_title: row.layout_header_title || '',
    layout_theme_primary_color: row.layout_theme_primary_color || '#10b981',
    layout_theme_background_color: row.layout_theme_background_color || '#f5f5f4',
    layout_theme_card_style: row.layout_theme_card_style || 'elevated',
    help_information: row.help_information,
    // Incentive fields
    incentive_enabled: row.incentive_enabled ?? false,
    incentive_type: row.incentive_type ?? 'fixed',
    incentive_amount: row.incentive_amount ?? 0,
    incentive_currency: row.incentive_currency ?? 'USD',
    incentive_description: row.incentive_description ?? '',
    incentive_payment_method: row.incentive_payment_method ?? 'manual',
    incentive_payment_instructions: row.incentive_payment_instructions ?? '',
    // Messaging
    messaging_enabled: row.messaging_enabled ?? false,
  });

  // Frontend state → DB row for upsert. Direct column mapping, no JSONB merging.
  const toDbRow = (p: SurveyProject) => ({
    organization_id: p.organization_id,
    researcher_id: p.researcher_id,
    title: p.title,
    description: p.description,
    status: p.status,
    published_at: p.published_at,
    project_type: p.project_type,
    methodology_type: p.methodology_type,
    ai_enabled: p.ai_enabled,
    voice_enabled: p.voice_enabled,
    notification_enabled: p.notification_enabled,
    consent_required: p.consent_required,
    consent_form_title: p.consent_form_title,
    consent_form_text: p.consent_form_text,
    consent_form_url: p.consent_form_url,
    screening_enabled: p.screening_enabled,
    compensation_amount: p.compensation_amount,
    compensation_type: p.compensation_type,
    max_participant: p.max_participant,
    participant_numbering: p.participant_numbering,
    participant_number_prefix: p.participant_number_prefix,
    participant_relation_enabled: p.participant_relation_enabled,
    participant_relation_options: p.participant_relation_options,
    start_at: p.start_at,
    end_at: p.end_at,
    study_duration: p.study_duration,
    survey_frequency: p.survey_frequency,
    allow_participant_dnd: p.allow_participant_dnd,
    allow_start_date_selection: p.allow_start_date_selection,
    survey_code: p.survey_code,
    onboarding_required: p.onboarding_required,
    onboarding_instruction: p.onboarding_instruction,
    show_progress_bar: p.show_progress_bar,
    disable_backtracking: p.disable_backtracking,
    randomize_questions: p.randomize_questions,
    auto_advance: p.auto_advance,
    ecogram_enabled: p.ecogram_enabled,
    ecogram_center_label: p.ecogram_center_label,
    ecogram_relationship_options: p.ecogram_relationship_options,
    ecogram_support_categories: p.ecogram_support_categories,
    notification_frequency: p.notification_frequency,
    notification_times_per_day: p.notification_times_per_day,
    notification_times: p.notification_times,
    notification_send_reminders: p.notification_send_reminders,
    notification_timezone: p.notification_timezone,
    sampling_type: p.sampling_type,
    sampling_prompts_per_day: p.sampling_prompts_per_day,
    sampling_start_hour: p.sampling_start_hour,
    sampling_end_hour: p.sampling_end_hour,
    sampling_allow_late: p.sampling_allow_late,
    sampling_late_window_minutes: p.sampling_late_window_minutes,
    recruitment_criteria_text: p.recruitment_criteria_text,
    layout_show_header: p.layout_show_header,
    layout_header_title: p.layout_header_title,
    layout_theme_primary_color: p.layout_theme_primary_color,
    layout_theme_background_color: p.layout_theme_background_color,
    layout_theme_card_style: p.layout_theme_card_style,
    help_information: p.help_information,
    // Incentive fields
    incentive_enabled: (p as any).incentive_enabled ?? false,
    incentive_type: (p as any).incentive_type ?? 'fixed',
    incentive_amount: (p as any).incentive_amount ?? 0,
    incentive_currency: (p as any).incentive_currency ?? 'USD',
    incentive_description: (p as any).incentive_description ?? '',
    incentive_payment_method: (p as any).incentive_payment_method ?? 'manual',
    incentive_payment_instructions: (p as any).incentive_payment_instructions ?? '',
    // Messaging
    messaging_enabled: p.messaging_enabled ?? false,
  });

  const generateSurveyCode = async () => {
    for (let i = 0; i < 5; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data, error } = await supabase
        .from('research_project')
        .select('id')
        .eq('survey_code', code)
        .limit(1);
      if (!error && (!data || data.length === 0)) {
        return code;
      }
    }
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const updatePublishStatus = async (nextStatus: 'draft' | 'published') => {
    if (!projectId) return;
    if (nextStatus === 'published') {
      if (questionnaireConfigs.length === 0 || questionnaireConfigs.every(q => q.questions.length === 0)) {
        toast.error('Cannot publish: Please add at least one question first.');
        return;
      }
      if (!project.title || project.title.trim() === '' || project.title === 'Untitled Project') {
        toast.error('Cannot publish: Please add a project title first.');
        return;
      }
    }
    setSaving(true);
    try {
      const updates: any = { status: nextStatus };
      if (nextStatus === 'published') {
        if (!project.survey_code) {
          updates.survey_code = await generateSurveyCode();
        }
        updates.published_at = new Date().toISOString();
      } else {
        updates.published_at = null;
      }
      const { error } = await supabase
        .from('research_project')
        .update(updates)
        .eq('id', projectId);
      if (error) throw error;
      setProject(prev => ({ ...(prev as any), ...updates }));
      if (nextStatus === 'published') {
        toast.success('Project published! Share the survey code with participants.');
      } else {
        toast.success('Project unpublished.');
      }
    } catch (error) {
      console.error('Error updating publish status:', error);
      toast.error('Failed to update publish status. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }
      try {
        const { data: projectData, error } = await supabase
          .from('research_project')
          .select('*')
          .eq('id', projectId)
          .maybeSingle();
        if (error) {
          setLoading(false);
          return;
        }
        if (projectData && mounted) {
          setProject(toProjectState(projectData));
          // Load layout from flat tables instead of JSONB
          const flatLayout = await loadLayoutFromDb(projectId);
          if (flatLayout && flatLayout.tabs.length > 0) {
            setAppLayout(flatLayout);
          }
          // Mark layout as initialized so auto-save kicks in only after DB load
          setTimeout(() => { appLayoutInitializedRef.current = true; }, 100);

          // Load logic rules from logic_rule table
          const { data: logicRows } = await supabase
            .from('logic_rule')
            .select('*')
            .eq('project_id', projectId)
            .order('order_index');
          if (logicRows && mounted) {
            setLogicRules(logicRows.map((r: any) => ({
              id: r.id,
              questionId: r.question_id,
              condition: r.condition,
              value: r.value,
              action: r.action,
              targetQuestionId: r.target_question_id,
            })));
          }

          // Load questionnaires from questionnaire table
          const { data: questionnaireRows } = await supabase
            .from('questionnaire')
            .select('*')
            .eq('project_id', projectId)
            .order('order_index');

          // Load participant types from participant_type table
          const { data: ptRows } = await supabase
            .from('participant_type')
            .select('*')
            .eq('project_id', projectId)
            .order('order_index');

          if (ptRows && mounted) {
            setParticipantTypes(ptRows.map((pt: any) => ({
              ...pt,
              relations: pt.relations || [],
              consent_forms: [],
              screening_questions: [],
            })));
          }

          // Load questionnaire<->participant_type assignments
          let qptMap = new Map<string, string[]>();
          if (questionnaireRows && questionnaireRows.length > 0) {
            const qIds = questionnaireRows.map((q: any) => q.id);
            const { data: qptRows } = await supabase
              .from('questionnaire_participant_type')
              .select('questionnaire_id, participant_type_id')
              .in('questionnaire_id', qIds);
            if (qptRows) {
              for (const row of qptRows) {
                if (!qptMap.has(row.questionnaire_id)) qptMap.set(row.questionnaire_id, []);
                qptMap.get(row.questionnaire_id)!.push(row.participant_type_id);
              }
            }
          }

          // Load time_windows from flat questionnaire_time_window table
          const twMap = questionnaireRows && questionnaireRows.length > 0
            ? await loadTimeWindowsBatch(questionnaireRows.map((q: any) => q.id))
            : new Map<string, { start: string; end: string }[]>();

          // Load questions from DB and distribute into questionnaires via questionnaire_id FK
          const { data: questionsData } = await supabase
            .from('question')
            .select('*, options:question_option(*)')
            .eq('project_id', projectId)
            .order('order_index');

          let qConfigs: QuestionnaireConfig[] = (questionnaireRows || []).map((qr: any) => ({
            id: qr.id,
            project_id: qr.project_id,
            questionnaire_type: qr.questionnaire_type || 'survey',
            title: qr.title,
            description: qr.description || '',
            questions: [],
            estimated_duration: qr.estimated_duration || 5,
            frequency: qr.frequency || 'once',
            time_windows: twMap.get(qr.id) || [{ start: '09:00', end: '21:00' }],
            notification_enabled: qr.notification_enabled || false,
            notification_minutes_before: qr.notification_minutes_before || 5,
            notification_title: qr.notification_title || 'Time for your survey!',
            notification_body: qr.notification_body || 'Please complete your questionnaire now.',
            notification_type: qr.notification_type || 'push',
            dnd_allowed: qr.dnd_allowed || false,
            dnd_default_start: qr.dnd_default_start || '22:00',
            dnd_default_end: qr.dnd_default_end || '08:00',
            assigned_participant_types: qptMap.get(qr.id) || [],
            order_index: qr.order_index || 0,
            consent_text: qr.consent_text,
            consent_url: qr.consent_url,
            consent_required: qr.consent_required,
            disqualify_logic: qr.disqualify_logic,
            tab_sections: qr.tab_sections || undefined,
            display_mode: qr.display_mode || 'one_per_page',
            questions_per_page: qr.questions_per_page ?? null,
          }));

          if (questionsData && mounted) {
            // Hydrate question_config from flat cfg_* columns
            const hydratedQuestions = hydrateQuestionRows(questionsData);
            if (qConfigs.length > 0) {
              const qMap = new Map<string, any[]>();
              qConfigs.forEach(qc => qMap.set(qc.id, []));
              for (const q of hydratedQuestions) {
                // Hydrate allow_other/allow_none from question_config
                if (q.question_config) {
                  if (q.question_config.allow_other !== undefined) q.allow_other = q.question_config.allow_other;
                  if (q.question_config.allow_none !== undefined) q.allow_none = q.question_config.allow_none;
                  if (q.question_config.response_required !== undefined) q.response_required = q.question_config.response_required;
                }
                const qId = q.questionnaire_id;
                if (qId && qMap.has(qId)) {
                  qMap.get(qId)!.push(q);
                } else if (qConfigs.length > 0) {
                  qMap.get(qConfigs[0].id)!.push(q);
                }
              }
              qConfigs = qConfigs.map(qc => ({ ...qc, questions: qMap.get(qc.id) || [] }));
            }
            setQuestionnaireConfigs(qConfigs);
          } else {
            setQuestionnaireConfigs(qConfigs);
          }

          // No legacy JSONB fallbacks — all data is in proper tables now
        }
        if (mounted) setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [projectId]);

  React.useEffect(() => {
    if (templateData && !projectId) {
      setProject(prev => ({
        ...prev,
        title: templateData.name || 'Untitled Project',
        description: templateData.description || ''
      }));
      import('../services/templateService').then(async ({ getTemplateQuestions, getTemplateSettings }) => {
        const templateQuestions = getTemplateQuestions(templateData.id);
        const settings = getTemplateSettings(templateData.id);
        
        // Build question objects from template
        const builtQuestions = (templateQuestions || []).map((q: any, index: number) => ({
          id: crypto.randomUUID(),
          question_type: q.type || 'text_short',
          question_text: q.text || 'Enter your question',
          question_description: '',
          question_config: q.config || {},
          validation_rule: {},
          logic_rule: {},
          ai_config: {},
          order_index: index,
          required: q.required || false,
          allow_voice: false,
          allow_ai_assist: false,
          options: q.options?.map((opt: any, i: number) => ({
            id: crypto.randomUUID(),
            option_text: opt.text || opt,
            option_value: '',
            order_index: i,
            is_other: false
          })) || []
        }));

        // Load questionnaire configs from template (in-memory only, saved to tables on save)
        const templateQConfigs = settings?.questionnaire_configs || [];

        // CRITICAL: Template uses string IDs like 'esm-hourly-log' but DB requires UUIDs.
        // Build a mapping from template string IDs → proper UUIDs.
        const templateIdToUuid = new Map<string, string>();
        templateQConfigs.forEach((c: any) => {
          templateIdToUuid.set(c.id, crypto.randomUUID());
        });

        let qConfigs: QuestionnaireConfig[] = templateQConfigs.map((c: any) => ({
          ...c,
          id: templateIdToUuid.get(c.id) || crypto.randomUUID(), // Replace string ID with UUID
          questionnaire_type: c.questionnaire_type || 'survey',
        }));

        if (qConfigs.length > 0 && builtQuestions.length > 0) {
          const qMap = new Map<string, any[]>();
          qConfigs.forEach(qc => qMap.set(qc.id, []));

          for (const q of builtQuestions) {
            // Match question to questionnaire using the TEMPLATE string ID, then remap to UUID
            const templateQId = q.question_config?.questionnaire_id;
            const realQId = templateQId ? templateIdToUuid.get(templateQId) : undefined;
            if (realQId && qMap.has(realQId)) {
              // Update question_config to use the real UUID
              q.question_config = { ...q.question_config, questionnaire_id: realQId };
              qMap.get(realQId)!.push(q);
            } else {
              // Fallback: assign to first questionnaire
              q.question_config = { ...q.question_config, questionnaire_id: qConfigs[0].id };
              qMap.get(qConfigs[0].id)!.push(q);
            }
          }
          qConfigs = qConfigs.map(qc => {
            const qs = qMap.get(qc.id) || [];
            qs.forEach((q, i) => q.order_index = i);
            return { ...qc, questions: qs };
          });
          setQuestionnaireConfigs(qConfigs);
        } else if (builtQuestions.length > 0) {
          const defaultQ: QuestionnaireConfig = {
            id: crypto.randomUUID(),
            questionnaire_type: 'survey',
            title: 'Main Questionnaire',
            description: '',
            questions: builtQuestions,
            estimated_duration: 5,
            frequency: 'once',
            time_windows: [{ start: '09:00', end: '21:00' }],
            notification_enabled: false,
            notification_minutes_before: 5,
            dnd_allowed: false,
            dnd_default_start: '22:00',
            dnd_default_end: '08:00',
            assigned_participant_types: [],
            order_index: 0,
          };
          setQuestionnaireConfigs([defaultQ]);
        }

        // Load template participant types — remap string IDs to UUIDs
        const ptIdMap = new Map<string, string>();
        if (settings?.participant_types) {
          const remappedPTs = settings.participant_types.map((pt: any) => {
            const newId = crypto.randomUUID();
            ptIdMap.set(pt.id, newId);
            return { ...pt, id: newId };
          });
          setParticipantTypes(remappedPTs);

          // Also remap assigned_participant_types in questionnaire configs
          setQuestionnaireConfigs(prev => prev.map(qc => ({
            ...qc,
            assigned_participant_types: (qc.assigned_participant_types || []).map(
              ptId => ptIdMap.get(ptId) || ptId
            ),
          })));
        }
        // Load template layout from flat tables and remap questionnaire IDs
        if (templateData.id) {
          const templateLayout = await loadLayoutFromDb(templateData.id);
          if (templateLayout && templateLayout.tabs.length > 0) {
            for (const tab of templateLayout.tabs) {
              for (const el of (tab.elements || [])) {
                if (el.config?.questionnaire_id && templateIdToUuid.has(el.config.questionnaire_id)) {
                  el.config.questionnaire_id = templateIdToUuid.get(el.config.questionnaire_id);
                }
              }
            }
            setAppLayout(templateLayout);
          }
        }
      });
      setLoading(false);
    }
  }, [templateData, projectId]);

  // All question management is now handled inside QuestionnaireList component

  const saveProject = async () => {
    setSaving(true);
    try {
      if (!user) {
        alert('Survey saved locally! Sign in to save to cloud and share with participants.');
        setSaving(false);
        return;
      }
      const { data: researcherData } = await supabase
        .from('researcher')
        .select('organization_id, id')
        .eq('user_id', user?.id)
        .maybeSingle();
      if (!researcherData) throw new Error('Researcher not found');

      // ── Sync participant types to participant_type table ──
      const syncParticipantTypes = async (targetProjectId: string) => {
        const { data: existingPTs } = await supabase.from('participant_type').select('id').eq('project_id', targetProjectId);
        const existingPTIds = new Set((existingPTs || []).map((pt: any) => pt.id));
        const currentPTIds = new Set(participantTypes.map(pt => pt.id));
        const removedPTIds = [...existingPTIds].filter(id => !currentPTIds.has(id));

        if (removedPTIds.length > 0) {
          await supabase.from('questionnaire_participant_type').delete().in('participant_type_id', removedPTIds);
          await supabase.from('participant_type').delete().in('id', removedPTIds);
        }

        for (const pt of participantTypes) {
          const ptPayload = {
            id: pt.id,
            project_id: targetProjectId,
            name: pt.name,
            description: pt.description || '',
            relations: pt.relations || [],
            color: pt.color || '#10b981',
            order_index: pt.order_index ?? 0,
            numbering_enabled: pt.numbering_enabled ?? true,
            number_prefix: pt.number_prefix || '',
          };
          await supabase.from('participant_type').upsert(ptPayload, { onConflict: 'id' });
        }
      };

      // ── Sync questionnaires to questionnaire table ──
      const syncQuestionnaires = async (targetProjectId: string) => {
        const { data: existingQs } = await supabase.from('questionnaire').select('id').eq('project_id', targetProjectId);
        const existingQIds = new Set((existingQs || []).map((q: any) => q.id));
        const currentQIds = new Set(questionnaireConfigs.map(q => q.id));
        const removedQIds = [...existingQIds].filter(id => !currentQIds.has(id));

        if (removedQIds.length > 0) {
          await supabase.from('questionnaire_participant_type').delete().in('questionnaire_id', removedQIds);
          // Nullify questionnaire_id on orphaned questions (don't delete them — they still belong to project)
          await supabase.from('question').update({ questionnaire_id: null }).in('questionnaire_id', removedQIds);
          await supabase.from('questionnaire').delete().in('id', removedQIds);
        }

        for (const qc of questionnaireConfigs) {
          const qPayload = {
            id: qc.id,
            project_id: targetProjectId,
            questionnaire_type: qc.questionnaire_type || 'survey',
            title: qc.title,
            description: qc.description || '',
            estimated_duration: qc.estimated_duration || 5,
            frequency: qc.frequency || 'once',
            time_windows: qc.time_windows || [{ start: '09:00', end: '21:00' }],
            notification_enabled: qc.notification_enabled || false,
            notification_minutes_before: qc.notification_minutes_before || 5,
            notification_title: qc.notification_title || 'Time for your survey!',
            notification_body: qc.notification_body || 'Please complete your questionnaire now.',
            notification_type: qc.notification_type || 'push',
            dnd_allowed: qc.dnd_allowed || false,
            dnd_default_start: qc.dnd_default_start || '22:00',
            dnd_default_end: qc.dnd_default_end || '08:00',
            order_index: qc.order_index ?? 0,
            consent_text: qc.consent_text || null,
            consent_url: qc.consent_url || null,
            consent_required: qc.consent_required ?? true,
            disqualify_logic: qc.disqualify_logic || {},
            tab_sections: qc.tab_sections || null,
            display_mode: qc.display_mode || 'one_per_page',
            questions_per_page: qc.questions_per_page ?? null,
            ai_chatbot_enabled: qc.ai_chatbot_enabled ?? false,
          };
          await supabase.from('questionnaire').upsert(qPayload, { onConflict: 'id' });

          // Save time_windows to flat questionnaire_time_window table
          await saveTimeWindows(qc.id, qc.time_windows || [{ start: '09:00', end: '21:00' }]);

          // Sync questionnaire<->participant_type assignments
          await supabase.from('questionnaire_participant_type').delete().eq('questionnaire_id', qc.id);
          if (qc.assigned_participant_types && qc.assigned_participant_types.length > 0) {
            const junctionRows = qc.assigned_participant_types.map(ptId => ({
              questionnaire_id: qc.id,
              participant_type_id: ptId,
            }));
            await supabase.from('questionnaire_participant_type').insert(junctionRows);
          }
        }
      };

      // ── Sync questions to question table (with proper questionnaire_id FK) ──
      const syncQuestions = async (targetProjectId: string) => {
        const allQuestions: Question[] = [];
        for (const qConfig of questionnaireConfigs) {
          for (const q of qConfig.questions) {
            allQuestions.push({
              ...q,
              questionnaire_id: qConfig.id,
              question_config: { ...q.question_config, questionnaire_id: qConfig.id },
            } as any);
          }
        }

        const { data: existingQuestions } = await supabase
          .from('question').select('id').eq('project_id', targetProjectId);
        const existingIds = new Set((existingQuestions || []).map((q: any) => q.id));
        const currentIds = new Set(allQuestions.map(q => q.id));
        const removedIds = [...existingIds].filter(id => !currentIds.has(id));
        const questionPayload = allQuestions.map((question) => {
          const { options, ...questionData } = question;
          // Only include columns that actually exist in the question table
          // Merge config with top-level overrides
          const mergedConfig = {
            ...((questionData as any).question_config || {}),
            allow_other: (questionData as any).allow_other ?? (questionData as any).question_config?.allow_other ?? false,
            allow_none: (questionData as any).allow_none ?? (questionData as any).question_config?.allow_none ?? false,
            response_required: (questionData as any).response_required ?? (questionData as any).question_config?.response_required ?? 'optional',
          };
          const dbQuestionData: any = {
            id: question.id,
            project_id: targetProjectId,
            questionnaire_id: (questionData as any).questionnaire_id || null,
            question_type: (questionData as any).question_type || 'text_short',
            question_text: (questionData as any).question_text || '',
            question_description: (questionData as any).question_description || '',
            question_config: mergedConfig,
            // Spread config into flat cfg_* columns for relational storage
            ...questionConfigToDbCols(mergedConfig),
            validation_rule: (questionData as any).validation_rule ?? (questionData as any).validation_rules ?? {},
            ...validationRuleToDbCols((questionData as any).validation_rule ?? (questionData as any).validation_rules),
            logic_rule: (questionData as any).logic_rule ?? (questionData as any).logic_rules ?? {},
            ai_config: (questionData as any).ai_config || {},
            order_index: (questionData as any).order_index ?? 0,
            required: (questionData as any).required || false,
            allow_voice: (questionData as any).allow_voice ?? false,
            allow_ai_assist: (questionData as any).allow_ai_assist ?? false,
            section_name: (questionData as any).section_name || null,
          };
          return dbQuestionData;
        });
        if (questionPayload.length > 0) {
          const { error: upsertError } = await supabase.from('question').upsert(questionPayload, { onConflict: 'id' });
          if (upsertError) throw upsertError;
        }
        if (removedIds.length > 0) {
          await supabase.from('question_option').delete().in('question_id', removedIds);
          await supabase.from('question').delete().in('id', removedIds);
        }

        // Batch all options into a single upsert + single cleanup query
        const allOptionPayloads: any[] = [];
        const allCurrentOptionIds = new Set<string>();
        const questionIdsWithOptions: string[] = [];

        for (const question of allQuestions) {
          const options = question.options || [];
          questionIdsWithOptions.push(question.id);
          for (const opt of options) {
            allCurrentOptionIds.add(opt.id);
            allOptionPayloads.push({ ...opt, question_id: question.id, id: opt.id });
          }
        }

        // Single batch upsert for all options
        if (allOptionPayloads.length > 0) {
          const { error: optionUpsertError } = await supabase.from('question_option').upsert(allOptionPayloads, { onConflict: 'id' });
          if (optionUpsertError) throw optionUpsertError;
        }

        // Single query to find stale options, then single delete
        if (questionIdsWithOptions.length > 0) {
          const { data: existingOptions } = await supabase
            .from('question_option')
            .select('id')
            .in('question_id', questionIdsWithOptions);
          const staleOptionIds = (existingOptions || [])
            .map((o: any) => o.id)
            .filter((id: string) => !allCurrentOptionIds.has(id));
          if (staleOptionIds.length > 0) {
            await supabase.from('question_option').delete().in('id', staleOptionIds);
          }
        }
      };

      // ── Sync logic rules to logic_rule table ──
      const syncLogicRules = async (targetProjectId: string) => {
        await supabase.from('logic_rule').delete().eq('project_id', targetProjectId);
        if (logicRules.length > 0) {
          const rows = logicRules.map((r, i) => ({
            project_id: targetProjectId,
            question_id: r.questionId || null,
            condition: r.condition || 'equals',
            value: r.value || '',
            action: r.action || 'skip',
            target_question_id: r.targetQuestionId || null,
            order_index: i,
          }));
          await supabase.from('logic_rule').insert(rows);
        }
      };

      if (projectId) {
        const { error: projectUpdateError } = await supabase.from('research_project').update(toDbRow(project)).eq('id', projectId);
        if (projectUpdateError) throw projectUpdateError;
        // Participant types must come first (FK dependency), then questionnaires, then questions+logic in parallel
        await syncParticipantTypes(projectId);
        await syncQuestionnaires(projectId);
        await Promise.all([syncQuestions(projectId), syncLogicRules(projectId)]);
      } else {
        const surveyCode = project.survey_code || await generateSurveyCode();
        const newProjectData = {
          ...toDbRow({
            ...project,
            organization_id: researcherData.organization_id,
            researcher_id: researcherData.id,
            survey_code: surveyCode,
            status: project.status || 'draft',
          }),
        };
        const { data: newProject } = await supabase.from('research_project').insert(newProjectData as any).select().single();
        if (newProject) {
          await syncParticipantTypes(newProject.id);
          await syncQuestionnaires(newProject.id);
          await Promise.all([syncQuestions(newProject.id), syncLogicRules(newProject.id)]);
          toast.success('Project created successfully!');
          navigate(`/easyresearch/project/${newProject.id}`);
        }
      }
      if (projectId) toast.success('Project saved successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Count responses for the tab label
  const [responseCount, setResponseCount] = useState(0);
  useEffect(() => {
    if (!projectId) return;
    supabase.from('survey_response').select('id', { count: 'exact', head: true }).eq('project_id', projectId)
      .then(({ count }) => setResponseCount(count || 0));
  }, [projectId]);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'settings', label: t('project.settings') },
    { id: 'questionnaires', label: t('project.questionnaires') },
    { id: 'components', label: t('project.components') },
    { id: 'logic', label: t('project.logic') },
    { id: 'layout', label: t('project.layout') },
    { id: 'preview', label: t('project.preview') },
    ...(projectId ? [{ id: 'participants' as TabId, label: t('project.participants') }] : []),
    ...(projectId ? [{ id: 'responses' as TabId, label: `${t('responses.title')} ${responseCount > 0 ? responseCount : ''}`.trim() }] : []),
  ];


  return (
    <div className="min-h-screen bg-stone-50/50">
      {/* Header */}
      <div className="border-b border-stone-200/60 bg-white/80 backdrop-blur-sm sticky top-14 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                onClick={() => navigate('/easyresearch/dashboard')}
                className="p-1.5 sm:p-2 rounded-xl hover:bg-stone-100 transition-colors shrink-0"
              >
                <ArrowLeft size={18} className="text-stone-500" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={project.title || ''}
                    onChange={(e) => setProject({ ...project, title: e.target.value })}
                    placeholder="Untitled Project"
                    className="text-base sm:text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-stone-800 placeholder:text-stone-300 min-w-0 w-full truncate"
                  />
                  <Pencil size={13} className="text-stone-400 shrink-0" />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    projectStatus === 'published' 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-stone-100 text-stone-500'
                  }`}>
                    {projectStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {projectId && questionnaireConfigs.some(q => q.questions.length > 0) && (
                <button
                  onClick={() => setShowSaveTemplate(true)}
                  className="p-1.5 sm:p-2 rounded-full border border-stone-200 text-stone-400 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 transition-all"
                  title={t('project.saveAsTemplate')}
                >
                  <Bookmark size={15} />
                </button>
              )}
              {projectId && (
                <button
                  onClick={() => updatePublishStatus(projectStatus === 'published' ? 'draft' : 'published')}
                  disabled={saving}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[12px] sm:text-[13px] font-medium border transition-all ${
                    projectStatus === 'published'
                      ? 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      : 'border-emerald-400 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {projectStatus === 'published' ? t('project.unpublish') : t('project.publish')}
                </button>
              )}
              <button
                onClick={saveProject}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[12px] sm:text-[13px] font-medium hover:shadow-lg hover:shadow-emerald-200/50 transition-all"
              >
                <Save size={14} />
                <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
                <span className="sm:hidden">{saving ? '...' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-px overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                }}
                className={`pb-2.5 px-3 text-[13px] font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Questionnaires Tab */}
        {activeTab === 'questionnaires' && (
          <>
            <QuestionnaireList
              questionnaires={questionnaireConfigs}
              participantTypes={participantTypes.map(pt => ({ id: pt.id, name: pt.name }))}
              onUpdate={setQuestionnaireConfigs}
              project={project}
              projectId={projectId}
              logicRules={logicRules}
              onUpdateLogic={setLogicRules}
            />
          </>
        )}

        {/* Components Tab */}
        {activeTab === 'components' && (
          <ComponentBuilder
            questionnaires={questionnaireConfigs}
            participantTypes={participantTypes.map(pt => ({ id: pt.id, name: pt.name }))}
            onUpdate={setQuestionnaireConfigs}
            project={project}
            projectId={projectId}
          />
        )}

        {/* Participants Tab */}
        {activeTab === 'participants' && projectId && (
          <ProjectParticipantsTab projectId={projectId} />
        )}

        {/* Participants tab removed - now in Settings */}

        {/* Logic Tab */}
        {activeTab === 'logic' && (
          <SurveyLogic questions={questionnaireConfigs.flatMap(q => q.questions)} projectId={projectId} onUpdateLogic={(rules) => setLogicRules(rules)} />
        )}

        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <LayoutBuilder
            layout={appLayout}
            questionnaires={questionnaireConfigs}
            participantTypes={participantTypes}
            studyDuration={project.study_duration || 7}
            onUpdate={setAppLayout}
            onUpdateQuestionnaire={(id, updates) => {
              setQuestionnaireConfigs(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
            }}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && project && (
          <SurveySettings
            project={project}
            onUpdateProject={(updates) => setProject(updates)}
            participantTypes={participantTypes}
            onUpdateParticipantTypes={setParticipantTypes}
            questionnaires={questionnaireConfigs}
            onAddQuestionnaire={(type) => {
              const newQ = {
                id: crypto.randomUUID(),
                questionnaire_type: type,
                title: type === 'consent' ? 'Consent Form' : 'Screening Questions',
                description: '',
                questions: [],
                estimated_duration: 5,
                frequency: 'once',
                time_windows: [{ start: '09:00', end: '21:00' }],
                notification_enabled: false,
                notification_minutes_before: 5,
                dnd_allowed: false,
                dnd_default_start: '22:00',
                dnd_default_end: '08:00',
                assigned_participant_types: participantTypes.map(pt => pt.id),
                order_index: questionnaireConfigs.length,
              };
              setQuestionnaireConfigs([...questionnaireConfigs, newQ]);
              setActiveTab('questionnaires');
            }}
          />
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <SurveyPreview
            questions={questionnaireConfigs.flatMap(q => q.questions)}
            projectTitle={project.title || ''}
            projectDescription={project.description || ''}
            appLayout={appLayout}
            questionnaires={questionnaireConfigs}
            participantTypes={participantTypes}
            studyDuration={project.study_duration || 7}
            onUpdateQuestionnaire={(id, updates) => {
              setQuestionnaireConfigs(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
            }}
          />
        )}
        {/* Responses Tab */}
        {activeTab === 'responses' && projectId && (
          <ProjectResponsesTab
            projectId={projectId}
            questionnaires={questionnaireConfigs}
          />
        )}
      </div>

      {/* AI Edit Chatbot */}
      <AIEditChatbot
        questionnaires={questionnaireConfigs}
        projectTitle={project.title || 'Untitled'}
        projectId={projectId}
        onUpdate={setQuestionnaireConfigs}
      />

      {/* Save as Template Modal */}
      {showSaveTemplate && (
        <SaveTemplateModal
          projectId={projectId}
          questionnaires={questionnaireConfigs}
          projectTitle={project.title}
          onClose={() => setShowSaveTemplate(false)}
        />
      )}
    </div>
  );
};

export default SurveyBuilder;
