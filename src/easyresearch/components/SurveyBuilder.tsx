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
import LayoutTabWrapper from './LayoutTabWrapper';
import { loadLayoutFromDb, saveLayoutToDb } from '../utils/layoutSync';
import { questionConfigToDbCols, validationRuleToDbCols, hydrateQuestionRows } from '../utils/questionConfigSync';
import { type LogicRule, dbRowToLogicRule, logicRuleToDbRow } from '../utils/logicEngine';
import { saveTimeWindows, loadTimeWindowsBatch } from '../utils/timeWindowSync';
import { loadNotificationConfigs, saveNotificationConfigs, type NotificationConfig } from '../utils/notificationConfigSync';
import ComponentBuilder from './ComponentBuilder';
import AIEditChatbot from './AIEditChatbot';
import SaveTemplateModal from './SaveTemplateModal';
import SurveyFlowVisualizer from './SurveyFlowVisualizer';
import SurveyTranslationManager from './SurveyTranslationManager';
import ParticipantPanel from './ParticipantPanel';
import QuotaManager from './QuotaManager';
import WebhookManager from './WebhookManager';
import CustomVariablesManager, { type CustomVariable } from './CustomVariablesManager';
import SurveyVersioning from './SurveyVersioning';
import ABTestingEngine from './ABTestingEngine';
import ResponseScheduler from './ResponseScheduler';
import SurveyThemingEngine from './SurveyThemingEngine';
import DistributionManager from './DistributionManager';
import AccessibilityChecker from './AccessibilityChecker';
import ConsentEthicsManager from './ConsentEthicsManager';
import CollaborationEngine from './CollaborationEngine';
import ParticipantJourneyTracker from './ParticipantJourneyTracker';
import DataPipelineAPI from './DataPipelineAPI';
import IncentiveManager from './IncentiveManager';
import CollectionMonitor from './CollectionMonitor';
import AuditTrail from './AuditTrail';
import PowerAnalysisCalculator from './PowerAnalysisCalculator';
import ResearchRepository from './ResearchRepository';
import DataCleaningStudio from './DataCleaningStudio';
import SessionReplayViewer from './SessionReplayViewer';
import PanelRecruitmentHub from './PanelRecruitmentHub';
import AdvancedSegmentation from './AdvancedSegmentation';
import PersonaBuilder from './PersonaBuilder';
import JourneyMapDesigner from './JourneyMapDesigner';
import ThemeAnnotator from './ThemeAnnotator';
import ResearchCalendar from './ResearchCalendar';
import StakeholderDashboard from './StakeholderDashboard';
import ParticipantCRM from './ParticipantCRM';
import ResearchTemplatesLibrary from './ResearchTemplatesLibrary';
import DataVisualizationStudio from './DataVisualizationStudio';
import ScreenerBuilder from './ScreenerBuilder';
import ResearchBriefGenerator from './ResearchBriefGenerator';
import MultiLangPreview from './MultiLangPreview';
import ABTestResults from './ABTestResults';
import PrototypeTestingEngine from './PrototypeTestingEngine';
import ConversationalSurveyMode from './ConversationalSurveyMode';
import ContactListEmailCampaign from './ContactListEmailCampaign';
import WorkflowAutomationBuilder from './WorkflowAutomationBuilder';
import SaveAndContinueManager from './SaveAndContinueManager';
import ShareableReportPortal from './ShareableReportPortal';
import CardSortingEngine from './CardSortingEngine';
import TreeTestingEngine from './TreeTestingEngine';
import InterceptSurveyWidget from './InterceptSurveyWidget';
import VideoResponseCapture from './VideoResponseCapture';
import IncentiveRewardManager from './IncentiveRewardManager';
import LivePollPresentation from './LivePollPresentation';
import PanelMarketplace from './PanelMarketplace';
import CustomScriptInjector from './CustomScriptInjector';
import IRBComplianceModule from './IRBComplianceModule';
import OfflineDataCollector from './OfflineDataCollector';
import VideoHighlightReels from './VideoHighlightReels';
import RegressionAnalysis from './RegressionAnalysis';
import { useI18n } from '../hooks/useI18n';

import toast from 'react-hot-toast';

interface Question {
  id: string;
  question_type: string;
  question_text: string;
  question_description?: string;
  question_config: any;
  validation_rule: any;
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
  survey_code?: string;
  published_at?: string | null;
  // Feature toggles
  ai_enabled: boolean;
  voice_enabled: boolean;
  notification_enabled: boolean;
  allow_participant_dnd?: boolean;
  messaging_enabled?: boolean;
  // Participant config
  max_participant?: number;
  // Compensation
  compensation_amount?: number;
  compensation_type?: string;
  // Schedule
  start_at?: string;
  end_at?: string;
  allow_start_date_selection?: boolean;
  study_duration?: number;
  survey_frequency?: string;
  // Onboarding
  onboarding_required?: boolean;
  onboarding_instruction?: string;
  // Incentives
  incentive_enabled?: boolean;
  incentive_type?: string;
  incentive_amount?: number;
  incentive_currency?: string;
  incentive_description?: string;
  incentive_payment_method?: string;
  incentive_payment_instructions?: string;
  // Layout theme/header
  layout_show_header?: boolean;
  layout_header_title?: string;
  layout_theme_primary_color?: string;
  layout_theme_background_color?: string;
  layout_theme_card_style?: string;
}

type TabId = 'questionnaires' | 'components' | 'logic' | 'flow' | 'layout' | 'settings' | 'preview' | 'participants' | 'responses' | 'quotas' | 'translations' | 'panel' | 'webhooks' | 'variables' | 'versioning' | 'ab_testing' | 'scheduler' | 'theming' | 'distribute' | 'accessibility' | 'consent' | 'collaboration' | 'journeys' | 'api' | 'incentives' | 'monitor' | 'audit' | 'power_analysis' | 'repository' | 'data_cleaning' | 'sessions' | 'recruitment' | 'segmentation' | 'personas' | 'journey_maps' | 'annotations' | 'calendar' | 'stakeholder' | 'crm' | 'templates' | 'visualization' | 'screener' | 'brief' | 'lang_preview' | 'ab_results' | 'prototype_testing' | 'conversational' | 'contact_email' | 'workflows' | 'save_continue' | 'share_reports' | 'card_sorting' | 'tree_testing' | 'intercept' | 'video_capture' | 'reward_mgmt' | 'live_poll' | 'panel_market' | 'custom_scripts' | 'irb_compliance' | 'offline_collect' | 'video_reels' | 'regression';

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
  // Persist active tab in URL so it survives HMR / page reconnections
  const searchParams = new URLSearchParams(location.search);
  const urlTab = searchParams.get('tab') as TabId | null;
  const initialTab = urlTab || (location.state as any)?.activeTab as TabId | undefined;
  const [activeTab, setActiveTabRaw] = useState<TabId>(initialTab || 'settings');
  const setActiveTab = React.useCallback((tab: TabId) => {
    setActiveTabRaw(tab);
    const sp = new URLSearchParams(window.location.search);
    sp.set('tab', tab);
    window.history.replaceState(null, '', `${window.location.pathname}?${sp.toString()}`);
  }, []);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [logicRules, setLogicRules] = useState<LogicRule[]>([]);
  const [projectNotifications, setProjectNotifications] = useState<NotificationConfig[]>([]);

  // New state for multi-questionnaire architecture
  const [questionnaireConfigs, setQuestionnaireConfigs] = useState<QuestionnaireConfig[]>([]);
  const [participantTypes, setParticipantTypes] = useState<ParticipantType[]>([]);
  const [appLayout, setAppLayout] = useState<AppLayout | null>(null);
  const appLayoutInitializedRef = useRef(false);

  // Auto-save layout to flat DB tables whenever it changes (debounced)
  const layoutSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // Skip the initial mount and the first load from DB
    if (!appLayoutInitializedRef.current) return;
    if (!projectId || !appLayout) return;

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
    survey_code: row.survey_code,
    published_at: row.published_at,
    // Feature toggles
    ai_enabled: row.ai_enabled ?? false,
    voice_enabled: row.voice_enabled ?? false,
    notification_enabled: row.notification_enabled ?? true,
    allow_participant_dnd: row.allow_participant_dnd ?? false,
    messaging_enabled: row.messaging_enabled ?? false,
    // Participant config
    max_participant: row.max_participant,
    // Compensation
    compensation_amount: row.compensation_amount,
    compensation_type: row.compensation_type,
    // Schedule
    start_at: row.start_at,
    end_at: row.end_at,
    allow_start_date_selection: row.allow_start_date_selection ?? false,
    study_duration: row.study_duration,
    survey_frequency: row.survey_frequency,
    // Onboarding
    onboarding_required: row.onboarding_required ?? false,
    onboarding_instruction: row.onboarding_instruction,
    // Incentives
    incentive_enabled: row.incentive_enabled ?? false,
    incentive_type: row.incentive_type ?? 'fixed',
    incentive_amount: row.incentive_amount ?? 0,
    incentive_currency: row.incentive_currency ?? 'USD',
    incentive_description: row.incentive_description ?? '',
    incentive_payment_method: row.incentive_payment_method ?? 'manual',
    incentive_payment_instructions: row.incentive_payment_instructions ?? '',
    // Layout theme/header
    layout_show_header: row.layout_show_header ?? true,
    layout_header_title: row.layout_header_title || '',
    layout_theme_primary_color: row.layout_theme_primary_color || '#10b981',
    layout_theme_background_color: row.layout_theme_background_color || '#f5f5f4',
    layout_theme_card_style: row.layout_theme_card_style || 'elevated',
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
    survey_code: p.survey_code,
    // Feature toggles
    ai_enabled: p.ai_enabled,
    voice_enabled: p.voice_enabled,
    notification_enabled: p.notification_enabled,
    allow_participant_dnd: p.allow_participant_dnd,
    messaging_enabled: p.messaging_enabled ?? false,
    // Participant config
    max_participant: p.max_participant,
    // Compensation
    compensation_amount: p.compensation_amount,
    compensation_type: p.compensation_type,
    // Schedule
    start_at: p.start_at,
    end_at: p.end_at,
    allow_start_date_selection: p.allow_start_date_selection,
    study_duration: p.study_duration,
    survey_frequency: p.survey_frequency,
    // Onboarding
    onboarding_required: p.onboarding_required,
    onboarding_instruction: p.onboarding_instruction,
    // Incentives
    incentive_enabled: p.incentive_enabled ?? false,
    incentive_type: p.incentive_type ?? 'fixed',
    incentive_amount: p.incentive_amount ?? 0,
    incentive_currency: p.incentive_currency ?? 'USD',
    incentive_description: p.incentive_description ?? '',
    incentive_payment_method: p.incentive_payment_method ?? 'manual',
    incentive_payment_instructions: p.incentive_payment_instructions ?? '',
    // Layout theme/header
    layout_show_header: p.layout_show_header,
    layout_header_title: p.layout_header_title,
    layout_theme_primary_color: p.layout_theme_primary_color,
    layout_theme_background_color: p.layout_theme_background_color,
    layout_theme_card_style: p.layout_theme_card_style,
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
          } else {
            // Only set default if DB truly has nothing
            setAppLayout(getDefaultLayout([]));
          }
          // Mark layout as initialized so auto-save kicks in only after DB load
          setTimeout(() => { appLayoutInitializedRef.current = true; }, 100);

          // Load logic rules from research_logic table
          const { data: logicRows } = await supabase
            .from('research_logic')
            .select('*')
            .eq('project_id', projectId)
            .order('order_index');
          if (logicRows && mounted) {
            setLogicRules(logicRows.map(dbRowToLogicRule));
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

          // Load question participant types from junction table
          const questionIds = (questionsData || []).map((q: any) => q.id);
          const qptByQuestion = new Map<string, string[]>();
          if (questionIds.length > 0) {
            const { data: qptRows } = await supabase
              .from('question_participant_type')
              .select('question_id, participant_type_id')
              .in('question_id', questionIds);
            for (const row of (qptRows || [])) {
              if (!qptByQuestion.has(row.question_id)) qptByQuestion.set(row.question_id, []);
              qptByQuestion.get(row.question_id)!.push(row.participant_type_id);
            }
          }

          // Load notification configs from the new notification_config table
          const allNotifConfigs = await loadNotificationConfigs(projectId);
          const notifByQ = new Map<string, NotificationConfig[]>();
          const projNotifs: NotificationConfig[] = [];
          for (const nc of allNotifConfigs) {
            if (nc.questionnaire_id) {
              if (!notifByQ.has(nc.questionnaire_id)) notifByQ.set(nc.questionnaire_id, []);
              notifByQ.get(nc.questionnaire_id)!.push(nc);
            } else {
              projNotifs.push(nc);
            }
          }
          if (mounted) setProjectNotifications(projNotifs);

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
            assigned_participant_types: qptMap.get(qr.id) || [],
            order_index: qr.order_index || 0,
            tab_sections: qr.tab_sections || undefined,
            display_mode: qr.display_mode || 'one_per_page',
            questions_per_page: qr.questions_per_page ?? null,
            notifications: notifByQ.get(qr.id) || [],
            is_ab_test: qr.is_ab_test ?? false,
            ab_variant_name: qr.ab_variant_name || undefined,
            ab_group_id: qr.ab_group_id || undefined,
            ab_split_percentage: qr.ab_split_percentage ?? 50,
            randomize_questions: qr.randomize_questions ?? false,
            enable_piping: qr.enable_piping ?? false,
            track_time_per_question: qr.track_time_per_question ?? false,
            min_completion_time_seconds: qr.min_completion_time_seconds ?? undefined,
            detect_straightlining: qr.detect_straightlining ?? false,
            detect_gibberish: qr.detect_gibberish ?? false,
            custom_thank_you_message: qr.custom_thank_you_message || undefined,
            redirect_url: qr.redirect_url || undefined,
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
                // Attach participant types from junction table
                q.assigned_participant_types = qptByQuestion.get(q.id) || [];
                
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
            assigned_participant_types: [],
            order_index: 0,
            notifications: [],
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

        // Batch upsert all participant types at once
        const allPTPayloads = participantTypes.map(pt => ({
          id: pt.id,
          project_id: targetProjectId,
          name: pt.name,
          description: pt.description || '',
          relations: pt.relations || [],
          color: pt.color || '#10b981',
          order_index: pt.order_index ?? 0,
          numbering_enabled: pt.numbering_enabled ?? true,
          number_prefix: pt.number_prefix || '',
        }));
        if (allPTPayloads.length > 0) {
          await supabase.from('participant_type').upsert(allPTPayloads, { onConflict: 'id' });
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

        // Batch upsert all questionnaires at once
        const allQPayloads = questionnaireConfigs.map(qc => ({
          id: qc.id,
          project_id: targetProjectId,
          questionnaire_type: qc.questionnaire_type || 'survey',
          title: qc.title,
          description: qc.description || '',
          estimated_duration: qc.estimated_duration || 5,
          frequency: qc.frequency || 'once',
          time_windows: qc.time_windows || [{ start: '09:00', end: '21:00' }],
          order_index: qc.order_index ?? 0,
          tab_sections: qc.tab_sections || null,
          display_mode: qc.display_mode || 'one_per_page',
          questions_per_page: qc.questions_per_page ?? null,
          ai_chatbot_enabled: qc.ai_chatbot_enabled ?? false,
          is_ab_test: qc.is_ab_test ?? false,
          ab_variant_name: qc.ab_variant_name || null,
          ab_group_id: qc.ab_group_id || null,
          ab_split_percentage: qc.ab_split_percentage ?? 50,
          randomize_questions: qc.randomize_questions ?? false,
          enable_piping: qc.enable_piping ?? false,
          track_time_per_question: qc.track_time_per_question ?? false,
          min_completion_time_seconds: qc.min_completion_time_seconds ?? null,
          detect_straightlining: qc.detect_straightlining ?? false,
          detect_gibberish: qc.detect_gibberish ?? false,
          custom_thank_you_message: qc.custom_thank_you_message || null,
          redirect_url: qc.redirect_url || null,
        }));
        await supabase.from('questionnaire').upsert(allQPayloads, { onConflict: 'id' });

        // Parallel: save time windows + participant type assignments for all questionnaires
        const qcIds = questionnaireConfigs.map(qc => qc.id);
        const [, ...twResults] = await Promise.all([
          // Delete all existing participant_type assignments for these questionnaires, then re-insert
          supabase.from('questionnaire_participant_type').delete().in('questionnaire_id', qcIds).then(),
          // Save all time windows in parallel
          ...questionnaireConfigs.map(qc =>
            saveTimeWindows(qc.id, qc.time_windows || [{ start: '09:00', end: '21:00' }])
          ),
        ]);

        // Batch insert all participant_type assignments
        const allJunctionRows = questionnaireConfigs.flatMap(qc =>
          (qc.assigned_participant_types || []).map(ptId => ({
            questionnaire_id: qc.id,
            participant_type_id: ptId,
          }))
        );
        if (allJunctionRows.length > 0) {
          await supabase.from('questionnaire_participant_type').insert(allJunctionRows);
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

        // Batch sync question participant types: single delete + single insert
        const allQuestionIds = allQuestions.map(q => q.id);
        if (allQuestionIds.length > 0) {
          await supabase.from('question_participant_type').delete().in('question_id', allQuestionIds);
        }
        const allQPTRows = allQuestions.flatMap(question => {
          const assignedTypes = (question as any).assigned_participant_types || [];
          return assignedTypes.map((ptId: string) => ({
            question_id: question.id,
            participant_type_id: ptId,
          }));
        });
        if (allQPTRows.length > 0) {
          await supabase.from('question_participant_type').insert(allQPTRows);
        }
      };

      // ── Sync logic rules to research_logic table ──
      const syncLogicRules = async (targetProjectId: string) => {
        await supabase.from('research_logic').delete().eq('project_id', targetProjectId);
        if (logicRules.length > 0) {
          const rows = logicRules.map((r, i) => ({
            ...logicRuleToDbRow({ ...r, projectId: targetProjectId, orderIndex: i }),
          }));
          await supabase.from('research_logic').insert(rows);
        }
      };

      if (projectId) {
        const { error: projectUpdateError } = await supabase.from('research_project').update(toDbRow(project)).eq('id', projectId);
        if (projectUpdateError) throw projectUpdateError;
        // Participant types must come first (FK dependency), then questionnaires, then questions+logic in parallel
        await syncParticipantTypes(projectId);
        await syncQuestionnaires(projectId);
        await Promise.all([syncQuestions(projectId), syncLogicRules(projectId)]);
        // Save ALL notification configs (project-level + questionnaire-level) in one shot
        const allNotifs = [...projectNotifications, ...questionnaireConfigs.flatMap(qc => qc.notifications || [])];
        await saveNotificationConfigs(projectId, allNotifs);
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
          const allNotifs = [...projectNotifications, ...questionnaireConfigs.flatMap(qc => qc.notifications || [])];
          await saveNotificationConfigs(newProject.id, allNotifs);
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
    { id: 'flow', label: 'Flow / 流程' },
    { id: 'layout', label: t('project.layout') },
    { id: 'preview', label: t('project.preview') },
    { id: 'translations' as TabId, label: 'Translation / 翻译' },
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
              projectNotifications={projectNotifications}
              onUpdateProjectNotifications={setProjectNotifications}
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
          <SurveyLogic
            questionnaires={questionnaireConfigs}
            projectId={projectId}
            logicRules={logicRules}
            onUpdateLogic={setLogicRules}
          />
        )}

        {/* Flow Visualizer Tab / 流程可视化 */}
        {activeTab === 'flow' && (
          <SurveyFlowVisualizer
            questionnaires={questionnaireConfigs}
            logicRules={logicRules}
          />
        )}

        {/* Quotas Tab / 配额管理 */}
        {activeTab === 'quotas' && projectId && (
          <QuotaManager
            projectId={projectId}
            participantTypes={participantTypes}
            questions={questionnaireConfigs.flatMap(q => q.questions || [])}
          />
        )}

        {/* Layout Tab */}
        {activeTab === 'layout' && appLayout && (
          <LayoutTabWrapper
            projectId={projectId}
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
          />
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && appLayout && (
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
        {/* Translations Tab / 翻译 */}
        {activeTab === 'translations' && (
          <SurveyTranslationManager
            projectId={projectId || ''}
            questions={questionnaireConfigs.flatMap(q => q.questions || [])}
            onQuestionsUpdate={(updatedQuestions) => {
              // Map updated questions back to their questionnaires
              setQuestionnaireConfigs(prev => prev.map(qc => ({
                ...qc,
                questions: (qc.questions || []).map(q => {
                  const updated = updatedQuestions.find(uq => uq.id === q.id);
                  return updated || q;
                }),
              })));
            }}
          />
        )}

        {/* Panel Tab / 参与者面板 */}
        {activeTab === 'panel' && projectId && (
          <ParticipantPanel projectId={projectId} />
        )}

        {/* Webhooks Tab */}
        {activeTab === 'webhooks' && projectId && (
          <WebhookManager projectId={projectId} />
        )}

        {/* Variables Tab */}
        {activeTab === 'variables' && (
          <CustomVariablesManager
            projectId={projectId || ''}
            surveyCode={project.survey_code}
            variables={(project as any).custom_variables || []}
            onUpdate={(vars) => setProject(prev => ({ ...prev, custom_variables: vars } as any))}
          />
        )}

        {/* Versioning Tab / 版本管理 */}
        {activeTab === 'versioning' && projectId && (
          <SurveyVersioning
            projectId={projectId}
            questionnaires={questionnaireConfigs}
            questions={questionnaireConfigs.flatMap(q => q.questions || [])}
            onRestore={(snapshot) => {
              if (snapshot?.questionnaires) {
                setQuestionnaireConfigs(snapshot.questionnaires);
              }
            }}
          />
        )}

        {/* A/B Testing Tab / A/B测试 */}
        {activeTab === 'ab_testing' && projectId && (
          <ABTestingEngine
            projectId={projectId}
            questions={questionnaireConfigs.flatMap(q => q.questions || [])}
          />
        )}

        {/* Scheduler Tab / 调度 */}
        {activeTab === 'scheduler' && projectId && (
          <ResponseScheduler
            projectId={projectId}
            questionnaires={questionnaireConfigs}
          />
        )}

        {/* Theming Tab / 主题定制 */}
        {activeTab === 'theming' && (
          <SurveyThemingEngine
            projectId={projectId || ''}
            theme={(project as any).theme_config}
            onUpdate={(themeConfig) => setProject(prev => ({ ...prev, theme_config: themeConfig } as any))}
          />
        )}

        {/* Distribution Tab / 分发管理 */}
        {activeTab === 'distribute' && projectId && (
          <DistributionManager
            projectId={projectId}
            surveyCode={project.survey_code}
            surveyTitle={project.title}
          />
        )}

        {/* Accessibility Tab / 无障碍检查 */}
        {activeTab === 'accessibility' && (
          <AccessibilityChecker
            questions={questionnaireConfigs.flatMap(q => q.questions || [])}
            theme={(project as any).theme_config}
          />
        )}

        {/* Consent & Ethics Tab / 知情同意与伦理 */}
        {activeTab === 'consent' && projectId && (
          <ConsentEthicsManager projectId={projectId} />
        )}

        {/* Collaboration Tab / 协作 */}
        {activeTab === 'collaboration' && projectId && (
          <CollaborationEngine projectId={projectId} />
        )}

        {/* Participant Journeys Tab / 参与者旅程 */}
        {activeTab === 'journeys' && projectId && (
          <ParticipantJourneyTracker projectId={projectId} />
        )}

        {/* Incentives Tab / 激励 */}
        {activeTab === 'incentives' && projectId && (
          <IncentiveManager projectId={projectId} />
        )}

        {/* Live Monitor Tab / 实时监控 */}
        {activeTab === 'monitor' && projectId && (
          <CollectionMonitor projectId={projectId} />
        )}

        {/* Audit Trail Tab / 审计追踪 */}
        {activeTab === 'audit' && projectId && (
          <AuditTrail projectId={projectId} />
        )}

        {/* API Access Tab / API 访问 */}
        {activeTab === 'api' && projectId && (
          <DataPipelineAPI projectId={projectId} />
        )}

        {/* Power Analysis Tab / 功效分析 */}
        {activeTab === 'power_analysis' && projectId && (
          <PowerAnalysisCalculator projectId={projectId} />
        )}

        {/* Research Repository Tab / 研究仓库 */}
        {activeTab === 'repository' && projectId && (
          <ResearchRepository projectId={projectId} />
        )}

        {/* Data Cleaning Tab / 数据清洗 */}
        {activeTab === 'data_cleaning' && projectId && (
          <DataCleaningStudio projectId={projectId} questionnaires={questionnaireConfigs} />
        )}

        {/* Session Replay Tab / 会话回放 */}
        {activeTab === 'sessions' && projectId && (
          <SessionReplayViewer projectId={projectId} />
        )}

        {/* Panel Recruitment Tab / 面板招募 */}
        {activeTab === 'recruitment' && projectId && (
          <PanelRecruitmentHub projectId={projectId} surveyCode={project.survey_code} />
        )}

        {/* Advanced Segmentation Tab / 高级分群 */}
        {activeTab === 'segmentation' && projectId && (
          <AdvancedSegmentation projectId={projectId} questionnaires={questionnaireConfigs} />
        )}

        {/* Persona Builder Tab / 用户画像 */}
        {activeTab === 'personas' && projectId && (
          <PersonaBuilder projectId={projectId} questionnaires={questionnaireConfigs} />
        )}

        {/* Journey Map Tab / 旅程地图 */}
        {activeTab === 'journey_maps' && projectId && (
          <JourneyMapDesigner projectId={projectId} />
        )}

        {/* Theme Annotator Tab / 主题标注 */}
        {activeTab === 'annotations' && projectId && (
          <ThemeAnnotator projectId={projectId} questionnaires={questionnaireConfigs} />
        )}

        {/* Research Calendar Tab / 研究日历 */}
        {activeTab === 'calendar' && projectId && (
          <ResearchCalendar projectId={projectId} />
        )}

        {/* Stakeholder Dashboard Tab / 利益相关者仪表板 */}
        {activeTab === 'stakeholder' && projectId && (
          <StakeholderDashboard projectId={projectId} questionnaires={questionnaireConfigs} />
        )}

        {/* Participant CRM Tab / 参与者CRM */}
        {activeTab === 'crm' && projectId && (
          <ParticipantCRM projectId={projectId} />
        )}

        {/* Research Templates Library / 研究模板库 */}
        {activeTab === 'templates' && projectId && (
          <ResearchTemplatesLibrary projectId={projectId} />
        )}

        {/* Data Visualization Studio / 数据可视化工作室 */}
        {activeTab === 'visualization' && projectId && (
          <DataVisualizationStudio projectId={projectId} />
        )}

        {/* Screener Builder / 筛选器构建器 */}
        {activeTab === 'screener' && projectId && (
          <ScreenerBuilder projectId={projectId} />
        )}

        {/* Research Brief Generator / 研究简报生成器 */}
        {activeTab === 'brief' && projectId && (
          <ResearchBriefGenerator projectId={projectId} projectTitle={project.title} />
        )}

        {/* Multi-Language Preview / 多语言预览 */}
        {activeTab === 'lang_preview' && projectId && (
          <MultiLangPreview projectId={projectId} />
        )}

        {/* A/B Test Results / A/B测试结果 */}
        {activeTab === 'ab_results' && projectId && (
          <ABTestResults projectId={projectId} />
        )}
        {activeTab === 'prototype_testing' && projectId && (
          <PrototypeTestingEngine projectId={projectId} />
        )}
        {activeTab === 'conversational' && projectId && (
          <ConversationalSurveyMode projectId={projectId} />
        )}
        {activeTab === 'contact_email' && projectId && (
          <ContactListEmailCampaign projectId={projectId} />
        )}
        {activeTab === 'workflows' && projectId && (
          <WorkflowAutomationBuilder projectId={projectId} />
        )}
        {activeTab === 'save_continue' && projectId && (
          <SaveAndContinueManager projectId={projectId} />
        )}
        {activeTab === 'share_reports' && projectId && (
          <ShareableReportPortal projectId={projectId} />
        )}
        {activeTab === 'card_sorting' && projectId && <CardSortingEngine projectId={projectId} />}
        {activeTab === 'tree_testing' && projectId && <TreeTestingEngine projectId={projectId} />}
        {activeTab === 'intercept' && projectId && <InterceptSurveyWidget projectId={projectId} />}
        {activeTab === 'video_capture' && projectId && <VideoResponseCapture projectId={projectId} />}
        {activeTab === 'reward_mgmt' && projectId && <IncentiveRewardManager projectId={projectId} />}
        {activeTab === 'live_poll' && projectId && <LivePollPresentation projectId={projectId} />}
        {activeTab === 'panel_market' && projectId && <PanelMarketplace projectId={projectId} />}
        {activeTab === 'custom_scripts' && projectId && <CustomScriptInjector projectId={projectId} />}
        {activeTab === 'irb_compliance' && projectId && <IRBComplianceModule projectId={projectId} />}
        {activeTab === 'offline_collect' && projectId && <OfflineDataCollector projectId={projectId} />}
        {activeTab === 'video_reels' && projectId && <VideoHighlightReels projectId={projectId} />}
        {activeTab === 'regression' && projectId && <RegressionAnalysis projectId={projectId} />}

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
