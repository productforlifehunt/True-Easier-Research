import React, { useState } from 'react';
import { Mic, Bell, Calendar, DollarSign, Users, Shield, Clock, Share2, Copy, Check, Link2, X, Settings, FileText, List, QrCode, Code, Mail, Download } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import QuestionnaireScheduler from './QuestionnaireScheduler';

interface SurveyProject {
  id?: string;
  title: string;
  description: string;
  project_type: string;
  ai_enabled: boolean;
  voice_enabled: boolean;
  notification_enabled: boolean;
  consent_required?: boolean;
  consent_form_url?: string;
  consent_form_text?: string;
  consent_form: any;
  recruitment_criteria: any;
  notification_settings: any;
  compensation_amount?: number;
  compensation_type?: string;
  max_participants?: number;
  starts_at?: string;
  ends_at?: string;
  survey_code?: string;
  study_duration?: number;
  survey_frequency?: string;
  allow_participant_dnd?: boolean;
  participant_numbering?: boolean;
  onboarding_required?: boolean;
  onboarding_instructions?: string;
  profile_questions?: Array<{
    id: string;
    question: string;
    type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
    options?: string[];
    required: boolean;
  }>;
  allow_start_date_selection?: boolean;
  show_progress_bar?: boolean;
  disable_backtracking?: boolean;
  randomize_questions?: boolean;
  auto_advance?: boolean;
}

interface SurveySettingsProps {
  project: SurveyProject;
  onUpdateProject: (updates: SurveyProject) => void;
}

const SurveySettings: React.FC<SurveySettingsProps> = ({ project, onUpdateProject }) => {
  const [copied, setCopied] = useState(false);
  const [questionnaireTab, setQuestionnaireTab] = useState<'library' | 'schedule'>('library');
  const canShare = Boolean(project.id);
  const participantLink = canShare ? `${window.location.origin}/easyresearch/participant/${project.id}` : '';
  const isLongitudinal = project.project_type === 'longitudinal' || project.project_type === 'esm';

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
      {/* Share */}
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
            <CustomDropdown options={[{value:'survey',label:'One-time Survey'},{value:'longitudinal',label:'Longitudinal Study'},{value:'clinical_trial',label:'Clinical Trial'}]} value={project.project_type} onChange={(v) => onUpdateProject({ ...project, project_type: v })} placeholder="Select type" />
          </div>
        </div>
      </SectionCard>

      {/* Features */}
      <SectionCard icon={Settings} iconBg="from-violet-50 to-purple-50" iconColor="text-violet-600" title="Features">
        <div className="divide-y divide-stone-100">
          <Toggle enabled={project.voice_enabled} onChange={(v) => onUpdateProject({ ...project, voice_enabled: v })} label="Voice Input" desc="Allow participants to respond via voice" />
          <Toggle enabled={project.notification_enabled} onChange={(v) => onUpdateProject({ ...project, notification_enabled: v })} label="Notifications" desc="Send reminders to participants" />
        </div>
      </SectionCard>

      {/* Consent */}
      <SectionCard icon={Shield} iconBg="from-amber-50 to-orange-50" iconColor="text-amber-600" title="Consent Form">
        <div className="space-y-3">
          <Toggle enabled={project.consent_required || false} onChange={(v) => onUpdateProject({ ...project, consent_required: v })} label="Require Consent" desc="Participants must accept before enrollment" />
          {project.consent_required && (
            <div className="space-y-3 pl-3 border-l-2 border-emerald-200">
              <InputField label="Consent Form URL" type="url" value={project.consent_form_url || ''} onChange={(e) => onUpdateProject({ ...project, consent_form_url: (e.target as HTMLInputElement).value })} placeholder="https://example.com/consent.pdf" />
              <div>
                <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Consent Text</label>
                <textarea value={project.consent_form_text || ''} onChange={(e) => onUpdateProject({ ...project, consent_form_text: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none" rows={5} placeholder="By participating in this research study, you agree to..." />
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Display & Behavior */}
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
          <InputField label="Start Date" type="datetime-local" value={project.starts_at || ''} onChange={(e) => onUpdateProject({ ...project, starts_at: (e.target as HTMLInputElement).value })} />
          <InputField label="End Date" type="datetime-local" value={project.ends_at || ''} onChange={(e) => onUpdateProject({ ...project, ends_at: (e.target as HTMLInputElement).value })} />
        </div>
      </SectionCard>

      {/* Participants */}
      <SectionCard icon={Users} iconBg="from-cyan-50 to-teal-50" iconColor="text-cyan-600" title="Participants">
        <div className="space-y-3">
          <InputField label="Max Participants" type="number" value={project.max_participants || ''} onChange={(e) => onUpdateProject({ ...project, max_participants: parseInt((e.target as HTMLInputElement).value) || undefined })} placeholder="Unlimited" />
          <div>
            <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Recruitment Criteria</label>
            <textarea value={project.recruitment_criteria?.description || ''} onChange={(e) => onUpdateProject({ ...project, recruitment_criteria: { ...project.recruitment_criteria, description: e.target.value } })} className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none" rows={2} placeholder="Eligibility criteria" />
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
              <Toggle enabled={project.participant_numbering || false} onChange={(v) => onUpdateProject({ ...project, participant_numbering: v })} label="Auto-Number" desc="Assign unique IDs (P001, P002...)" />
              <Toggle enabled={project.onboarding_required || false} onChange={(v) => onUpdateProject({ ...project, onboarding_required: v })} label="Onboarding" desc="Show instructions before starting" />
              <Toggle enabled={project.allow_start_date_selection || false} onChange={(v) => onUpdateProject({ ...project, allow_start_date_selection: v })} label="Custom Start Date" desc="Let participants choose when to begin" />
            </div>
            {project.onboarding_required && (
              <div>
                <label className="block text-[12px] font-medium text-stone-400 mb-1.5">Onboarding Instructions</label>
                <textarea value={project.onboarding_instructions || ''} onChange={(e) => onUpdateProject({ ...project, onboarding_instructions: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none" rows={3} placeholder="Welcome! This study will track..." />
              </div>
            )}
          </div>
        </SectionCard>
      )}

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
    </div>
  );
};

export default SurveySettings;
