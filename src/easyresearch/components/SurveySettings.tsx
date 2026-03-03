import React, { useState } from 'react';
import { Mic, Bell, Calendar, DollarSign, Users, Shield, Clock, Share2, Copy, Check, Link2, X, Settings, FileText, List, QrCode, Code, Mail, Download, Plus, Trash2, GripVertical, HelpCircle, ChevronDown, ChevronUp, ClipboardCheck, Hash, Network } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import QuestionnaireScheduler from './QuestionnaireScheduler';
import EcogramBuilder from './EcogramBuilder';
import ParticipantTypeManager, { type ParticipantType } from './ParticipantTypeManager';
import IncentiveConfig from './IncentiveConfig';
import { type SurveyProject } from './SurveyBuilder';

interface QuestionnaireRef {
  id: string;
  title: string;
  questionnaire_type: 'survey' | 'consent' | 'screening' | 'profile' | 'help' | 'custom';
  questions: any[];
}

interface SurveySettingsProps {
  project: SurveyProject;
  onUpdateProject: (updates: SurveyProject) => void;
  participantTypes: ParticipantType[];
  onUpdateParticipantTypes: (types: ParticipantType[]) => void;
  questionnaires: QuestionnaireRef[];
  onAddQuestionnaire: (type: 'consent' | 'screening') => void;
}

const SurveySettings: React.FC<SurveySettingsProps> = ({ project, onUpdateProject, participantTypes, onUpdateParticipantTypes, questionnaires, onAddQuestionnaire }) => {
  const [copied, setCopied] = useState(false);
  const [questionnaireTab, setQuestionnaireTab] = useState<'library' | 'schedule'>('library');
  const canShare = Boolean(project.id);
  const participantLink = canShare ? `${window.location.origin}/easyresearch/participant/${project.id}` : '';
  const isLongitudinal = ['longitudinal', 'esm', 'diary'].includes(project.project_type);

  const copyToClipboard = () => {
    if (!canShare) return;
    navigator.clipboard.writeText(participantLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Toggle = ({ enabled, onChange, label, desc }: { enabled: boolean; onChange: (v: boolean) => void; label: string; desc: string }) => (
    <div className="flex items-center justify-between py-3">
      <div><p className="text-[13px] font-medium text-stone-800">{label}</p><p className="text-[12px] text-stone-400 mt-0.5 font-light">{desc}</p></div>
      <button onClick={() => onChange(!enabled)} className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${enabled ? 'bg-emerald-500' : 'bg-stone-200'}`}>
        <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" style={{ left: enabled ? '22px' : '2px' }} />
      </button>
    </div>
  );

  const SectionCard = ({ icon: Icon, iconBg, iconColor, title, children }: { icon: any; iconBg: string; iconColor: string; title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center`}>
          <Icon size={16} className={iconColor} strokeWidth={1.5} />
        </div>
        <h3 className="text-[14px] font-semibold text-stone-800">{title}</h3>
      </div>
      {children}
    </div>
  );

  const InputField = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="block text-[12px] font-medium text-stone-400 mb-1.5">{label}</label>
      <input {...props} className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Basic Info */}
      <SectionCard icon={FileText} iconBg="from-emerald-50 to-teal-50" iconColor="text-emerald-600" title="Basic Info">
        <div className="space-y-3">
          <InputField label="Title" type="text" value={project.title} onChange={(e) => onUpdateProject({ ...project, title: (e.target as HTMLInputElement).value })} placeholder="Survey title" />
          <div>
            <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Description</label>
            <textarea value={project.description} onChange={(e) => onUpdateProject({ ...project, description: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none" rows={3} placeholder="Survey purpose and goals" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Survey Type</label>
            <CustomDropdown options={[{value:'survey',label:'One-time Survey'},{value:'longitudinal',label:'Longitudinal Study'},{value:'esm',label:'ESM (Experience Sampling)'},{value:'clinical_trial',label:'Clinical Trial'},{value:'diary',label:'Diary Study'}]} value={project.project_type} onChange={(v) => onUpdateProject({ ...project, project_type: v })} placeholder="Select type" />
          </div>
        </div>
      </SectionCard>

      {/* Participant Types — the core configuration */}
      <SectionCard icon={Users} iconBg="from-violet-50 to-purple-50" iconColor="text-violet-600" title="Participants & Enrollment">
        <div className="space-y-4">
          {/* Global toggles */}
          <div className="divide-y divide-stone-100">
            <Toggle enabled={project.consent_required || false} onChange={(v) => onUpdateProject({ ...project, consent_required: v })} label="Require Consent" desc="Participants must accept consent forms before enrollment" />
            {project.consent_required && (
              <div className="py-3 pl-3 border-l-2 border-emerald-200 ml-2">
                <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">Consent Forms</p>
                {questionnaires.filter(q => q.questionnaire_type === 'consent').length === 0 ? (
                  <p className="text-[12px] text-stone-400 italic mb-2">No consent forms yet.</p>
                ) : (
                  <div className="space-y-1 mb-2">
                    {questionnaires.filter(q => q.questionnaire_type === 'consent').map(q => (
                      <div key={q.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                        <Shield size={12} className="text-emerald-500 shrink-0" />
                        <span className="text-[12px] text-stone-700 flex-1 truncate">{q.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => onAddQuestionnaire('consent')} className="flex items-center gap-1 text-[12px] text-emerald-600 hover:text-emerald-700 font-medium">
                  <Plus size={12} /> Add Consent Form
                </button>
              </div>
            )}

            <Toggle enabled={project.screening_enabled || false} onChange={(v) => onUpdateProject({ ...project, screening_enabled: v })} label="Require Screening" desc="Ask eligibility questions before enrollment" />
            {project.screening_enabled && (
              <div className="py-3 pl-3 border-l-2 border-amber-200 ml-2">
                <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">Screening Questionnaires</p>
                {questionnaires.filter(q => q.questionnaire_type === 'screening').length === 0 ? (
                  <p className="text-[12px] text-stone-400 italic mb-2">No screening questionnaires yet.</p>
                ) : (
                  <div className="space-y-1 mb-2">
                    {questionnaires.filter(q => q.questionnaire_type === 'screening').map(q => (
                      <div key={q.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100">
                        <ClipboardCheck size={12} className="text-amber-500 shrink-0" />
                        <span className="text-[12px] text-stone-700 flex-1 truncate">{q.title}</span>
                        <span className="text-[10px] text-stone-400">{q.questions.length} q</span>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => onAddQuestionnaire('screening')} className="flex items-center gap-1 text-[12px] text-amber-600 hover:text-amber-700 font-medium">
                  <Plus size={12} /> Add Screening Questionnaire
                </button>
              </div>
            )}
          </div>

          {/* Global Participant Numbering — fallback when no participant types defined */}
          {participantTypes.length === 0 && (
            <div className="border-t border-stone-100 pt-3 space-y-2">
              <Toggle enabled={project.participant_numbering || false} onChange={(v) => onUpdateProject({ ...project, participant_numbering: v })} label="Auto-Number Participants" desc="Assign sequential IDs (e.g., PP001, PP002). When participant types are defined, numbering is configured per type." />
              {project.participant_numbering && (
                <div className="pl-3 border-l-2 border-indigo-200">
                  <InputField label="Number Prefix" type="text" value={project.participant_number_prefix || 'PP'} 
                    onChange={(e) => onUpdateProject({ ...project, participant_number_prefix: (e.target as HTMLInputElement).value })} placeholder="PP" />
                </div>
              )}
            </div>
          )}
          {participantTypes.length > 0 && (
            <div className="border-t border-stone-100 pt-3">
              <p className="text-[12px] text-stone-400 font-light">Auto-numbering is configured per participant type below. Each type has its own prefix (e.g., CG001 for Caregivers, FM001 for Family Members).</p>
            </div>
          )}

          {/* Participant Type Manager */}
          <div className="border-t border-stone-100 pt-4">
            <ParticipantTypeManager
              participantTypes={participantTypes}
              onUpdate={onUpdateParticipantTypes}
              questionnaires={questionnaires.map(q => ({ id: q.id, title: q.title, questionnaire_type: q.questionnaire_type, assigned_participant_types: (q as any).assigned_participant_types || [] }))}
            />
          </div>
        </div>
      </SectionCard>

      {/* Features */}
      <SectionCard icon={Settings} iconBg="from-sky-50 to-blue-50" iconColor="text-sky-600" title="Features">
        <div className="divide-y divide-stone-100">
          <Toggle enabled={project.voice_enabled} onChange={(v) => onUpdateProject({ ...project, voice_enabled: v })} label="Voice Input" desc="Allow participants to respond via voice" />
          <Toggle enabled={project.notification_enabled} onChange={(v) => onUpdateProject({ ...project, notification_enabled: v })} label="Notifications" desc="Send reminders to participants" />
          <Toggle enabled={(project as any).messaging_enabled || false} onChange={(v) => onUpdateProject({ ...project, messaging_enabled: v } as any)} label="Messaging" desc="Enable direct messaging between researcher and participants" />
        </div>
      </SectionCard>

      {/* Ecogram / Network Diagram */}
      <SectionCard icon={Network} iconBg="from-teal-50 to-cyan-50" iconColor="text-teal-600" title="Network Diagram (Ecogram)">
        <div className="space-y-3">
          <Toggle enabled={project.ecogram_enabled || false} onChange={(v) => onUpdateProject({ ...project, ecogram_enabled: v })} label="Enable Ecogram" desc="Let participants build a care network diagram" />
          {project.ecogram_enabled && (
            <div className="pl-3 border-l-2 border-teal-200 space-y-2">
              <InputField label="Center Label" type="text" value={project.ecogram_center_label || 'You'} 
                onChange={(e) => onUpdateProject({ ...project, ecogram_center_label: (e.target as HTMLInputElement).value })} placeholder="You / Patient" />
              <p className="text-[11px] text-stone-400">The ecogram will be available in participant settings. Data is stored per-enrollment.</p>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard icon={Settings} iconBg="from-sky-50 to-blue-50" iconColor="text-sky-600" title="Display & Behavior">
        <div className="divide-y divide-stone-100">
          <Toggle enabled={project.show_progress_bar !== false} onChange={(v) => onUpdateProject({ ...project, show_progress_bar: v })} label="Progress Bar" desc="Show completion percentage" />
          <Toggle enabled={project.disable_backtracking || false} onChange={(v) => onUpdateProject({ ...project, disable_backtracking: v })} label="Disable Backtracking" desc="Prevent going back to previous questions" />
          <Toggle enabled={project.randomize_questions || false} onChange={(v) => onUpdateProject({ ...project, randomize_questions: v })} label="Randomize Questions" desc="Reduce response bias" />
          <Toggle enabled={project.auto_advance || false} onChange={(v) => onUpdateProject({ ...project, auto_advance: v })} label="Auto-Advance" desc="Move to next question after selection" />
        </div>
      </SectionCard>

      {/* Schedule */}
      <SectionCard icon={Calendar} iconBg="from-rose-50 to-pink-50" iconColor="text-rose-600" title="Schedule">
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Start Date" type="datetime-local" value={project.start_at || ''} onChange={(e) => onUpdateProject({ ...project, start_at: (e.target as HTMLInputElement).value })} />
          <InputField label="End Date" type="datetime-local" value={project.end_at || ''} onChange={(e) => onUpdateProject({ ...project, end_at: (e.target as HTMLInputElement).value })} />
        </div>
      </SectionCard>

      {/* Participants limits */}
      <SectionCard icon={Users} iconBg="from-cyan-50 to-teal-50" iconColor="text-cyan-600" title="Capacity">
        <div className="space-y-3">
          <InputField label="Max Participants" type="number" value={project.max_participant || ''} onChange={(e) => onUpdateProject({ ...project, max_participant: parseInt((e.target as HTMLInputElement).value) || undefined })} placeholder="Unlimited" />
          <div>
            <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Recruitment Criteria</label>
            <textarea value={project.recruitment_criteria_text || ''} onChange={(e) => onUpdateProject({ ...project, recruitment_criteria_text: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none" rows={2} placeholder="Eligibility criteria" />
          </div>
        </div>
      </SectionCard>

      {/* Compensation */}
      <SectionCard icon={DollarSign} iconBg="from-amber-50 to-yellow-50" iconColor="text-amber-600" title="Compensation">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Type</label>
            <CustomDropdown options={[{value:'none',label:'None'},{value:'monetary',label:'Monetary'},{value:'gift_card',label:'Gift Card'},{value:'raffle',label:'Raffle'}]} value={project.compensation_type || 'none'} onChange={(v) => onUpdateProject({ ...project, compensation_type: v })} placeholder="Type" />
          </div>
          <InputField label="Amount ($)" type="number" value={project.compensation_amount || ''} onChange={(e) => onUpdateProject({ ...project, compensation_amount: parseFloat((e.target as HTMLInputElement).value) || undefined })} placeholder="0.00" disabled={project.compensation_type === 'none'} />
        </div>
      </SectionCard>

      {/* Longitudinal */}
      {isLongitudinal && (
        <SectionCard icon={Clock} iconBg="from-indigo-50 to-blue-50" iconColor="text-indigo-600" title="Longitudinal Configuration">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Duration</label>
                <CustomDropdown options={[{value:'1',label:'1 Day'},{value:'3',label:'3 Days'},{value:'7',label:'1 Week'},{value:'14',label:'2 Weeks'},{value:'30',label:'1 Month'},{value:'90',label:'3 Months'}]} value={String(project.study_duration || '7')} onChange={(v) => onUpdateProject({ ...project, study_duration: parseInt(v) })} placeholder="Duration" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Frequency</label>
                <CustomDropdown options={[{value:'hourly',label:'Hourly'},{value:'2hours',label:'Every 2h'},{value:'4hours',label:'Every 4h'},{value:'daily',label:'Daily'},{value:'twice_daily',label:'Twice Daily'},{value:'weekly',label:'Weekly'}]} value={project.survey_frequency || 'daily'} onChange={(v) => onUpdateProject({ ...project, survey_frequency: v })} placeholder="Frequency" />
              </div>
            </div>
            <div className="divide-y divide-stone-100">
              <Toggle enabled={project.allow_participant_dnd || false} onChange={(v) => onUpdateProject({ ...project, allow_participant_dnd: v })} label="Do Not Disturb" desc="Let participants set quiet hours" />
              <Toggle enabled={project.onboarding_required || false} onChange={(v) => onUpdateProject({ ...project, onboarding_required: v })} label="Onboarding" desc="Show instructions before starting" />
              <Toggle enabled={project.allow_start_date_selection || false} onChange={(v) => onUpdateProject({ ...project, allow_start_date_selection: v })} label="Custom Start Date" desc="Let participants choose when to begin" />
            </div>
            {project.onboarding_required && (
              <div>
                <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Onboarding Instructions</label>
                <textarea value={project.onboarding_instruction || ''} onChange={(e) => onUpdateProject({ ...project, onboarding_instruction: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none" rows={3} placeholder="Welcome! This study will track..." />
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Help & Study Information */}
      <SectionCard icon={HelpCircle} iconBg="from-cyan-50 to-sky-50" iconColor="text-cyan-600" title="Help & Study Information">
        <div className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Help Information</label>
            <textarea 
              value={(project as any).help_information || ''} 
              onChange={(e) => onUpdateProject({ ...project, help_information: e.target.value } as any)} 
              className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none" 
              rows={5} 
              placeholder="Study protocol, FAQ, contact info... Shown to participants in the Help tab." 
            />
          </div>
        </div>
      </SectionCard>

      {/* Completion Page */}
      <SectionCard icon={Check} iconBg="from-emerald-50 to-green-50" iconColor="text-emerald-600" title="Completion Page">
        <div className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Thank You Title</label>
            <input type="text" value={(project as any).completion_title || ''} 
              onChange={(e) => onUpdateProject({ ...project, completion_title: e.target.value } as any)}
              className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              placeholder="Thank you for participating!" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Thank You Message</label>
            <textarea value={(project as any).completion_message || ''} 
              onChange={(e) => onUpdateProject({ ...project, completion_message: e.target.value } as any)}
              className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
              rows={3} placeholder="Your responses have been recorded. You may now close this page." />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Redirect URL (optional)</label>
            <input type="url" value={(project as any).completion_redirect_url || ''} 
              onChange={(e) => onUpdateProject({ ...project, completion_redirect_url: e.target.value } as any)}
              className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              placeholder="https://example.com/next-steps" />
          </div>
        </div>
      </SectionCard>

      {/* Profile Questions Builder — TODO: wire to profile_question table instead of JSONB */}
      {/* Profile questions are now stored in the profile_question table, not on the project row */}

      {/* Questionnaire Management */}
      {isLongitudinal && project.id && (
        <SectionCard icon={List} iconBg="from-emerald-50 to-teal-50" iconColor="text-emerald-600" title="Questionnaire Management">
          <div className="flex gap-1 bg-stone-100 rounded-full p-0.5 mb-4">
            {[{key: 'library' as const, icon: FileText, label: 'Library'}, {key: 'schedule' as const, icon: Calendar, label: 'Schedule'}].map(t => (
              <button key={t.key} onClick={() => setQuestionnaireTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                  questionnaireTab === t.key ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400'
                }`}>
                <t.icon size={13} /> {t.label}
              </button>
            ))}
          </div>
          {questionnaireTab === 'library' && (
            <div className="text-center py-8">
              <p className="text-[13px] text-stone-400 font-light">Questionnaire library available after saving the project.</p>
            </div>
          )}
          {questionnaireTab === 'schedule' && project.id && (
            <QuestionnaireScheduler projectId={project.id} studyDuration={project.study_duration || 7} />
          )}
        </SectionCard>
      )}

      {/* Share Survey — last section */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <Share2 size={16} className="text-emerald-600" />
          <h3 className="text-[14px] font-semibold text-stone-800">Share Survey</h3>
        </div>
        <p className="text-[12px] text-stone-500 mb-4 font-light">Share this link or code with participants.</p>

        {!canShare && (
          <div className="p-3 rounded-xl bg-white/80 border border-emerald-100 mb-4">
            <p className="text-[12px] text-stone-500">Save the survey first to generate a share link.</p>
          </div>
        )}

        {project.survey_code && (
          <div className="mb-4">
            <label className="block text-[12px] font-medium text-stone-500 mb-1.5">Survey Code</label>
            <div className="flex items-center gap-2">
              <div className="px-4 py-2.5 rounded-xl bg-white border-2 border-emerald-300">
                <span className="text-xl font-bold tracking-widest text-emerald-600">{project.survey_code}</span>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(project.survey_code || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="px-3 py-2.5 rounded-xl text-[13px] font-medium text-white bg-emerald-500 hover:bg-emerald-600 flex items-center gap-1.5 transition-colors">
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-[12px] font-medium text-stone-500 mb-1.5">Survey Link</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-stone-200">
              <Link2 size={14} className="text-emerald-500 shrink-0" />
              <input type="text" value={participantLink} readOnly disabled={!canShare} className="flex-1 bg-transparent border-none outline-none text-[12px] text-stone-600" />
            </div>
            <button onClick={copyToClipboard} disabled={!canShare} className="px-3 py-2 rounded-xl text-[13px] font-medium text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-1.5 transition-colors">
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {canShare && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { icon: QrCode, label: 'QR Code', action: () => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(participantLink)}`, '_blank'), actionLabel: 'Download' },
              { icon: Code, label: 'Embed', action: () => { navigator.clipboard.writeText(`<iframe src="${participantLink}" width="100%" height="600" frameborder="0"></iframe>`); setCopied(true); setTimeout(() => setCopied(false), 2000); }, actionLabel: 'Copy' },
              { icon: Mail, label: 'Email', action: () => window.open(`mailto:?subject=${encodeURIComponent(`Participate: ${project.title}`)}&body=${encodeURIComponent(`Join: ${participantLink}`)}`, '_blank'), actionLabel: 'Compose' },
            ].map(d => (
              <div key={d.label} className="bg-white rounded-xl p-3 text-center border border-emerald-100">
                <d.icon size={20} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-[12px] font-medium text-stone-700 mb-2">{d.label}</p>
                <button onClick={d.action} className="text-[11px] px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">{d.actionLabel}</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incentives */}
      <IncentiveConfig project={project} onUpdateProject={onUpdateProject} />
    </div>
  );
};

// ─── Profile Questions Builder ──────────────────────────────────
interface ProfileQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'scale' | 'section';
  options?: string[];
  required: boolean;
  config?: {
    min?: number;
    max?: number;
    min_label?: string;
    max_label?: string;
    scale_type?: string;
    placeholder?: string;
  };
}

const ProfileQuestionsBuilder: React.FC<{
  questions: ProfileQuestion[];
  onChange: (questions: ProfileQuestion[]) => void;
}> = ({ questions, onChange }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addQuestion = (type: ProfileQuestion['type']) => {
    const newQ: ProfileQuestion = {
      id: crypto.randomUUID(),
      question: type === 'section' ? 'Section Title' : '',
      type,
      options: ['select', 'multiselect'].includes(type) ? ['Option 1', 'Option 2'] : undefined,
      required: false,
      config: type === 'scale' ? { min: 1, max: 5, min_label: '', max_label: '' } : undefined,
    };
    onChange([...questions, newQ]);
    setExpandedId(newQ.id);
  };

  const updateQuestion = (id: string, updates: Partial<ProfileQuestion>) => {
    onChange(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    onChange(questions.filter(q => q.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const moveQuestion = (id: string, dir: 'up' | 'down') => {
    const idx = questions.findIndex(q => q.id === id);
    if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === questions.length - 1)) return;
    const newQ = [...questions];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    [newQ[idx], newQ[swapIdx]] = [newQ[swapIdx], newQ[idx]];
    onChange(newQ);
  };

  const typeLabels: Record<string, string> = {
    text: 'Text', number: 'Number', date: 'Date', select: 'Dropdown', multiselect: 'Multi-Select', scale: 'Scale', section: '§ Section'
  };

  return (
    <div className="space-y-2">
      {questions.map((q, idx) => (
        <div key={q.id} className={`rounded-xl border ${q.type === 'section' ? 'border-emerald-200 bg-emerald-50/30' : 'border-stone-200 bg-white'}`}>
          <div className="flex items-center gap-2 px-3 py-2 cursor-pointer" onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}>
            <GripVertical size={12} className="text-stone-300 shrink-0" />
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 shrink-0">
              {typeLabels[q.type] || q.type}
            </span>
            <span className="flex-1 text-[13px] text-stone-700 truncate">{q.question || 'Untitled'}</span>
            {q.required && <span className="text-red-500 text-[11px]">*</span>}
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={(e) => { e.stopPropagation(); moveQuestion(q.id, 'up'); }} className="p-0.5 hover:bg-stone-100 rounded" disabled={idx === 0}>
                <ChevronUp size={12} className="text-stone-400" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); moveQuestion(q.id, 'down'); }} className="p-0.5 hover:bg-stone-100 rounded" disabled={idx === questions.length - 1}>
                <ChevronDown size={12} className="text-stone-400" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); removeQuestion(q.id); }} className="p-0.5 hover:bg-red-50 rounded">
                <Trash2 size={12} className="text-red-400" />
              </button>
            </div>
          </div>
          {expandedId === q.id && (
            <div className="px-3 pb-3 space-y-2 border-t border-stone-100 pt-2">
              <input
                type="text"
                value={q.question}
                onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                placeholder={q.type === 'section' ? 'Section heading' : 'Question text'}
              />
              {q.type !== 'section' && (
                <div className="flex items-center gap-3">
                  <select value={q.type} onChange={(e) => {
                    const newType = e.target.value as ProfileQuestion['type'];
                    const updates: Partial<ProfileQuestion> = { type: newType };
                    if (['select', 'multiselect'].includes(newType) && !q.options?.length) updates.options = ['Option 1', 'Option 2'];
                    if (newType === 'scale' && !q.config) updates.config = { min: 1, max: 5 };
                    if (!['select', 'multiselect'].includes(newType)) updates.options = undefined;
                    onChange(questions.map(qq => qq.id === q.id ? { ...qq, ...updates } : qq));
                  }} className="px-2 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white">
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Dropdown</option>
                    <option value="multiselect">Multi-Select</option>
                    <option value="scale">Scale</option>
                  </select>
                  <label className="flex items-center gap-1.5 text-[12px] text-stone-600">
                    <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(q.id, { required: e.target.checked })} className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500" />
                    Required
                  </label>
                </div>
              )}
              {q.config?.placeholder !== undefined || q.type === 'text' ? (
                <input type="text" value={q.config?.placeholder || ''} onChange={(e) => updateQuestion(q.id, { config: { ...q.config, placeholder: e.target.value } })}
                  className="w-full px-3 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Placeholder text (optional)" />
              ) : null}
              {['select', 'multiselect'].includes(q.type) && (
                <div className="space-y-1">
                  {(q.options || []).map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-1.5">
                      <input type="text" value={opt} onChange={(e) => {
                        const newOpts = [...(q.options || [])];
                        newOpts[oi] = e.target.value;
                        updateQuestion(q.id, { options: newOpts });
                      }} className="flex-1 px-2 py-1 rounded-lg text-[12px] border border-stone-200" />
                      <button onClick={() => updateQuestion(q.id, { options: (q.options || []).filter((_, i) => i !== oi) })} className="p-0.5 hover:bg-red-50 rounded">
                        <X size={10} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => updateQuestion(q.id, { options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] })}
                    className="text-[11px] text-emerald-500 hover:text-emerald-600">+ Add option</button>
                </div>
              )}
              {q.type === 'scale' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-stone-400">Min</label>
                    <input type="number" value={q.config?.min ?? 1} onChange={(e) => updateQuestion(q.id, { config: { ...q.config, min: Number(e.target.value) } })}
                      className="w-full px-2 py-1 rounded-lg text-[12px] border border-stone-200" />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-400">Max</label>
                    <input type="number" value={q.config?.max ?? 5} onChange={(e) => updateQuestion(q.id, { config: { ...q.config, max: Number(e.target.value) } })}
                      className="w-full px-2 py-1 rounded-lg text-[12px] border border-stone-200" />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-400">Min Label</label>
                    <input type="text" value={q.config?.min_label || ''} onChange={(e) => updateQuestion(q.id, { config: { ...q.config, min_label: e.target.value } })}
                      className="w-full px-2 py-1 rounded-lg text-[12px] border border-stone-200" placeholder="e.g. Strongly Disagree" />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-400">Max Label</label>
                    <input type="text" value={q.config?.max_label || ''} onChange={(e) => updateQuestion(q.id, { config: { ...q.config, max_label: e.target.value } })}
                      className="w-full px-2 py-1 rounded-lg text-[12px] border border-stone-200" placeholder="e.g. Strongly Agree" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add Question Buttons */}
      <div className="flex flex-wrap gap-1.5 pt-2">
        {[
          { type: 'section' as const, label: '§ Section', color: 'emerald' },
          { type: 'text' as const, label: 'Text', color: 'stone' },
          { type: 'number' as const, label: 'Number', color: 'stone' },
          { type: 'date' as const, label: 'Date', color: 'stone' },
          { type: 'select' as const, label: 'Dropdown', color: 'stone' },
          { type: 'multiselect' as const, label: 'Multi-Select', color: 'stone' },
          { type: 'scale' as const, label: 'Scale', color: 'stone' },
        ].map(t => (
          <button key={t.type} onClick={() => addQuestion(t.type)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-dashed border-stone-200 text-stone-500 hover:border-emerald-300 hover:text-emerald-600 transition-colors">
            <Plus size={10} /> {t.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SurveySettings;
