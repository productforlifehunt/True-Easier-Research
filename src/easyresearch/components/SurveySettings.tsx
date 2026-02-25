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
  // Longitudinal study settings
  study_duration?: number; // in days
  survey_frequency?: string; // hourly, daily, etc.
  allow_participant_dnd?: boolean;
  participant_numbering?: boolean;
  onboarding_required?: boolean;
  onboarding_instructions?: string;
  // Participant profile configuration
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

  return (
    <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
      <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
        Survey Settings
      </h2>

      <div className="space-y-8 max-w-3xl">
        {/* Survey Sharing */}
        <div className="bg-green-50 rounded-xl p-6" style={{ border: '2px solid var(--color-green)' }}>
          <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Share2 size={20} style={{ color: 'var(--color-green)' }} />
            Share Survey with Participants
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Share this code or link with participants to allow them to join your survey.
          </p>

          {!canShare && (
            <div className="mb-4 p-4 rounded-lg bg-white" style={{ border: '1px solid var(--border-light)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Save this survey to generate a share link and distribution options.
              </p>
            </div>
          )}

          {/* Survey Code */}
          {project.survey_code && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Survey Code
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 px-6 py-4 rounded-lg bg-white" style={{ border: '2px solid var(--color-green)' }}>
                  <span className="text-2xl font-bold tracking-wider" style={{ color: 'var(--color-green)' }}>
                    {project.survey_code}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(project.survey_code || '');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-4 py-3 rounded-lg flex items-center gap-2 font-medium text-white"
                  style={{ backgroundColor: 'var(--color-green)' }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Survey Link */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Survey Link
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg bg-white" style={{ border: '1px solid var(--border-light)' }}>
                <Link2 size={18} style={{ color: 'var(--color-green)' }} />
                <input
                  type="text"
                  value={participantLink}
                  readOnly
                  disabled={!canShare}
                  className="flex-1 bg-transparent border-none outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
            <button
              onClick={copyToClipboard}
              disabled={!canShare}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all ${
                canShare ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'
              }`}
              style={{ backgroundColor: copied ? 'var(--color-green)' : 'var(--color-green)' }}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Additional Distribution Options */}
        {canShare && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* QR Code */}
            <div className="bg-white rounded-lg p-4 text-center" style={{ border: '1px solid var(--border-light)' }}>
              <div className="w-24 h-24 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <QrCode size={48} style={{ color: 'var(--color-green)' }} />
              </div>
              <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--text-primary)' }}>QR Code</h4>
              <button
                onClick={() => {
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(participantLink)}`;
                  window.open(qrUrl, '_blank');
                }}
                className="text-sm px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--color-green)' }}
              >
                <Download size={14} /> Download
              </button>
            </div>

            {/* Embed Code */}
            <div className="bg-white rounded-lg p-4 text-center" style={{ border: '1px solid var(--border-light)' }}>
              <div className="w-24 h-24 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <Code size={48} style={{ color: 'var(--color-green)' }} />
              </div>
              <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--text-primary)' }}>Embed Code</h4>
              <button
                onClick={() => {
                  const embedCode = `<iframe src="${participantLink}" width="100%" height="600" frameborder="0"></iframe>`;
                  navigator.clipboard.writeText(embedCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-sm px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--color-green)' }}
              >
                <Copy size={14} /> Copy Embed
              </button>
            </div>

            {/* Email Invite */}
            <div className="bg-white rounded-lg p-4 text-center" style={{ border: '1px solid var(--border-light)' }}>
              <div className="w-24 h-24 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <Mail size={48} style={{ color: 'var(--color-green)' }} />
              </div>
              <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--text-primary)' }}>Email Invite</h4>
              <button
                onClick={() => {
                  const subject = encodeURIComponent(`You're invited to participate: ${project.title}`);
                  const body = encodeURIComponent(`Hello,\n\nYou're invited to participate in our survey.\n\nClick here to start: ${participantLink}\n\nThank you!`);
                  window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
                }}
                className="text-sm px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--color-green)' }}
              >
                <Mail size={14} /> Compose
              </button>
            </div>
          </div>
        )}
        </div>

        {/* Basic Information */}
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Survey Title
              </label>
              <input
                type="text"
                value={project.title}
                onChange={(e) => onUpdateProject({ ...project, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-light)' }}
                placeholder="Enter survey title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Description
              </label>
              <textarea
                value={project.description}
                onChange={(e) => onUpdateProject({ ...project, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border resize-none"
                style={{ borderColor: 'var(--border-light)' }}
                rows={4}
                placeholder="Describe your survey purpose and goals"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Survey Type
              </label>
              <CustomDropdown
                options={[
                  { value: 'survey', label: 'One-time Survey' },
                  { value: 'longitudinal', label: 'Longitudinal Study' },
                  { value: 'clinical_trial', label: 'Clinical Trial' }
                ]}
                value={project.project_type}
                onChange={(value) => onUpdateProject({ ...project, project_type: value })}
                placeholder="Select survey type"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
            Advanced Features
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors"
              style={{ borderColor: 'var(--border-light)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <input
                type="checkbox"
                checked={project.voice_enabled}
                onChange={(e) => onUpdateProject({ ...project, voice_enabled: e.target.checked })}
                className="rounded"
              />
              <Mic size={20} style={{ color: 'var(--color-green)' }} />
              <div className="flex-1">
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Enable Voice Input
                </span>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Allow participants to respond via voice recording
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors"
              style={{ borderColor: 'var(--border-light)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <input
                type="checkbox"
                checked={project.notification_enabled}
                onChange={(e) => onUpdateProject({ ...project, notification_enabled: e.target.checked })}
                className="rounded"
              />
              <Bell size={20} style={{ color: 'var(--color-green)' }} />
              <div className="flex-1">
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Enable Notifications
                </span>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Send reminders and updates to participants
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Consent Form Settings */}
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FileText size={20} style={{ color: 'var(--color-green)' }} />
            Consent Form (Optional)
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Require participants to accept a consent form before joining the study.
          </p>
          
          <label className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors mb-4"
            style={{ borderColor: 'var(--border-light)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <input
              type="checkbox"
              checked={project.consent_required || false}
              onChange={(e) => onUpdateProject({ ...project, consent_required: e.target.checked })}
              className="rounded"
            />
            <div className="flex-1">
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Require Consent Form
              </span>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Participants must accept consent before enrollment
              </p>
            </div>
          </label>

          {project.consent_required && (
            <div className="space-y-4 pl-4 border-l-2" style={{ borderColor: 'var(--color-green)' }}>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Consent Form URL (Optional)
                </label>
                <input
                  type="url"
                  value={project.consent_form_url || ''}
                  onChange={(e) => onUpdateProject({ ...project, consent_form_url: e.target.value })}
                  placeholder="https://example.com/consent.pdf"
                  className="w-full px-4 py-3 rounded-lg"
                  style={{ border: '1px solid var(--border-light)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Link to external consent form (PDF, Google Docs, etc.)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Consent Form Text
                </label>
                <textarea
                  value={project.consent_form_text || ''}
                  onChange={(e) => onUpdateProject({ ...project, consent_form_text: e.target.value })}
                  placeholder="Enter your consent form text here...&#10;&#10;Example:&#10;By participating in this research study, you agree to:&#10;- Provide accurate and honest responses&#10;- Allow researchers to analyze your data&#10;- Understand you can withdraw at any time"
                  rows={8}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{ border: '1px solid var(--border-light)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  This text will be displayed to participants before enrollment
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Survey Display Options */}
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Settings size={20} />
            Survey Display & Behavior
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors"
              style={{ borderColor: 'var(--border-light)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <input
                type="checkbox"
                checked={project.show_progress_bar !== false}
                onChange={(e) => onUpdateProject({ ...project, show_progress_bar: e.target.checked })}
                className="rounded"
              />
              <div className="flex-1">
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Show Progress Bar
                </span>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Display completion percentage to participants
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors"
              style={{ borderColor: 'var(--border-light)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <input
                type="checkbox"
                checked={project.disable_backtracking || false}
                onChange={(e) => onUpdateProject({ ...project, disable_backtracking: e.target.checked })}
                className="rounded"
              />
              <div className="flex-1">
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Disable Backtracking
                </span>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Prevent participants from going back to previous questions
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors"
              style={{ borderColor: 'var(--border-light)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <input
                type="checkbox"
                checked={project.randomize_questions || false}
                onChange={(e) => onUpdateProject({ ...project, randomize_questions: e.target.checked })}
                className="rounded"
              />
              <div className="flex-1">
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Randomize Question Order
                </span>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Reduce response bias by randomizing questions
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors"
              style={{ borderColor: 'var(--border-light)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <input
                type="checkbox"
                checked={project.auto_advance || false}
                onChange={(e) => onUpdateProject({ ...project, auto_advance: e.target.checked })}
                className="rounded"
              />
              <div className="flex-1">
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Auto-Advance Questions
                </span>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Automatically move to next question after selection
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Calendar size={20} />
            Schedule
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Start Date
              </label>
              <input
                type="datetime-local"
                value={project.starts_at || ''}
                onChange={(e) => onUpdateProject({ ...project, starts_at: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-light)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                End Date
              </label>
              <input
                type="datetime-local"
                value={project.ends_at || ''}
                onChange={(e) => onUpdateProject({ ...project, ends_at: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-light)' }}
              />
            </div>
          </div>
        </div>

        {/* Participants */}
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Users size={20} />
            Participants
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Maximum Participants
              </label>
              <input
                type="number"
                value={project.max_participants || ''}
                onChange={(e) => onUpdateProject({ ...project, max_participants: parseInt(e.target.value) || undefined })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-light)' }}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Recruitment Criteria
              </label>
              <textarea
                value={project.recruitment_criteria?.description || ''}
                onChange={(e) => onUpdateProject({ 
                  ...project, 
                  recruitment_criteria: { ...project.recruitment_criteria, description: e.target.value }
                })}
                className="w-full px-4 py-2 rounded-lg border resize-none"
                style={{ borderColor: 'var(--border-light)' }}
                rows={3}
                placeholder="Describe eligibility criteria for participants"
              />
            </div>
          </div>
        </div>

        {/* Compensation */}
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <DollarSign size={20} />
            Compensation
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Compensation Type
              </label>
              <CustomDropdown
                options={[
                  { value: 'none', label: 'No Compensation' },
                  { value: 'monetary', label: 'Monetary' },
                  { value: 'gift_card', label: 'Gift Card' },
                  { value: 'raffle', label: 'Raffle Entry' }
                ]}
                value={project.compensation_type || 'none'}
                onChange={(value) => onUpdateProject({ ...project, compensation_type: value })}
                placeholder="Select compensation type"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Amount ($)
              </label>
              <input
                type="number"
                value={project.compensation_amount || ''}
                onChange={(e) => onUpdateProject({ ...project, compensation_amount: parseFloat(e.target.value) || undefined })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-light)' }}
                placeholder="0.00"
                step="0.01"
                disabled={project.compensation_type === 'none'}
              />
            </div>
          </div>
        </div>


        {/* Longitudinal Study Settings - Only show when longitudinal is selected */}
        {project.project_type === 'longitudinal' && (
          <div className="bg-blue-50 rounded-xl p-6" style={{ border: '2px solid var(--color-blue, #3B82F6)' }}>
            <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Calendar size={20} style={{ color: 'var(--color-blue, #3B82F6)' }} />
              Longitudinal Study Configuration
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Study Duration
                  </label>
                  <CustomDropdown
                    options={[
                      { value: '1', label: '1 Day' },
                      { value: '3', label: '3 Days' },
                      { value: '7', label: '1 Week' },
                      { value: '14', label: '2 Weeks' },
                      { value: '30', label: '1 Month' },
                      { value: '90', label: '3 Months' }
                    ]}
                    value={String(project.study_duration || '7')}
                    onChange={(value) => onUpdateProject({ ...project, study_duration: parseInt(value) })}
                    placeholder="Select duration"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Survey Frequency
                  </label>
                  <CustomDropdown
                    options={[
                      { value: 'hourly', label: 'Every Hour' },
                      { value: '2hours', label: 'Every 2 Hours' },
                      { value: '4hours', label: 'Every 4 Hours' },
                      { value: 'daily', label: 'Once Daily' },
                      { value: 'twice_daily', label: 'Twice Daily' },
                      { value: 'weekly', label: 'Weekly' }
                    ]}
                    value={project.survey_frequency || 'daily'}
                    onChange={(value) => onUpdateProject({ ...project, survey_frequency: value })}
                    placeholder="Select frequency"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-lg bg-white">
                  <input
                    type="checkbox"
                    checked={project.allow_participant_dnd || false}
                    onChange={(e) => onUpdateProject({ ...project, allow_participant_dnd: e.target.checked })}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      Allow Participant Do Not Disturb Periods
                    </span>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Let participants set times when they won't receive survey notifications
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg bg-white">
                  <input
                    type="checkbox"
                    checked={project.participant_numbering || false}
                    onChange={(e) => onUpdateProject({ ...project, participant_numbering: e.target.checked })}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      Auto-Assign Participant Numbers
                    </span>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Automatically assign unique participant IDs (P001, P002, etc.)
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg bg-white">
                  <input
                    type="checkbox"
                    checked={project.onboarding_required || false}
                    onChange={(e) => onUpdateProject({ ...project, onboarding_required: e.target.checked })}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      Require Participant Onboarding
                    </span>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Show onboarding instructions before participants can start
                    </p>
                  </div>
                </label>
              </div>

              {project.onboarding_required && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Onboarding Instructions
                  </label>
                  <textarea
                    value={project.onboarding_instructions || ''}
                    onChange={(e) => onUpdateProject({ ...project, onboarding_instructions: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border resize-none"
                    style={{ borderColor: 'var(--border-light)' }}
                    rows={4}
                    placeholder="Welcome! This study will track your daily experiences over the next week. You'll receive hourly surveys between 9am-9pm. Each survey takes 2-3 minutes to complete..."
                  />
                </div>
              )}

              <label className="flex items-center gap-3 p-3 rounded-lg bg-white">
                <input
                  type="checkbox"
                  checked={project.allow_start_date_selection || false}
                  onChange={(e) => onUpdateProject({ ...project, allow_start_date_selection: e.target.checked })}
                  className="rounded"
                />
                <div className="flex-1">
                  <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    Allow Participants to Choose Start Date
                  </span>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Let participants select when they want to begin the study
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Questionnaire Management - Two-tab system for Longitudinal/ESM */}
        {isLongitudinal && project.id && (
          <div className="bg-white rounded-xl p-6" style={{ border: '2px solid var(--color-green)' }}>
            <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <List size={20} style={{ color: 'var(--color-green)' }} />
              Questionnaire Management
            </h3>
            
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <button
                onClick={() => setQuestionnaireTab('library')}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all"
                style={{
                  backgroundColor: questionnaireTab === 'library' ? 'var(--color-green)' : 'transparent',
                  color: questionnaireTab === 'library' ? 'white' : 'var(--text-secondary)'
                }}
              >
                <FileText size={16} className="inline mr-2" />
                Questionnaire Library
              </button>
              <button
                onClick={() => setQuestionnaireTab('schedule')}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all"
                style={{
                  backgroundColor: questionnaireTab === 'schedule' ? 'var(--color-green)' : 'transparent',
                  color: questionnaireTab === 'schedule' ? 'white' : 'var(--text-secondary)'
                }}
              >
                <Calendar size={16} className="inline mr-2" />
                Schedule
              </button>
            </div>

            {/* Tab Content */}
            {questionnaireTab === 'library' && (
              <div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Create and manage multiple questionnaires for your longitudinal study. Each questionnaire can contain different questions and be scheduled independently.
                </p>
                <QuestionnaireScheduler 
                  projectId={project.id} 
                  studyDuration={project.study_duration || 7}
                  showLibraryOnly={true}
                />
              </div>
            )}

            {questionnaireTab === 'schedule' && (
              <div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Drag and drop questionnaires from the library to schedule them on specific days and times. Use copy/paste to duplicate schedules across days.
                </p>
                <QuestionnaireScheduler 
                  projectId={project.id} 
                  studyDuration={project.study_duration || 7}
                  showScheduleOnly={true}
                />
              </div>
            )}
          </div>
        )}

        {/* Participant Profile Configuration */}
        {project.project_type === 'longitudinal' && (
          <div className="bg-purple-50 rounded-xl p-6" style={{ border: '2px solid var(--color-purple, #9333ea)' }}>
            <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Users size={20} style={{ color: 'var(--color-purple, #9333ea)' }} />
              Participant Profile Questions
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Collect custom information from participants during enrollment
            </p>
            
            <div className="space-y-3">
              {(project.profile_questions || []).map((q, index) => (
                <div key={q.id} className="p-4 rounded-lg bg-white border" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => {
                          const updated = [...(project.profile_questions || [])];
                          updated[index] = { ...q, question: e.target.value };
                          onUpdateProject({ ...project, profile_questions: updated });
                        }}
                        placeholder="Question text"
                        className="w-full px-3 py-2 rounded border text-sm mb-2"
                        style={{ borderColor: 'var(--border-light)' }}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <CustomDropdown
                          options={[
                            { value: 'text', label: 'Text' },
                            { value: 'number', label: 'Number' },
                            { value: 'date', label: 'Date' },
                            { value: 'select', label: 'Single Choice' },
                            { value: 'multiselect', label: 'Multiple Choice' }
                          ]}
                          value={q.type}
                          onChange={(value) => {
                            const updated = [...(project.profile_questions || [])];
                            updated[index] = { ...q, type: value as any };
                            onUpdateProject({ ...project, profile_questions: updated });
                          }}
                          placeholder="Type"
                        />
                        <label className="flex items-center gap-2 px-3 py-2 rounded border" style={{ borderColor: 'var(--border-light)' }}>
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) => {
                              const updated = [...(project.profile_questions || [])];
                              updated[index] = { ...q, required: e.target.checked };
                              onUpdateProject({ ...project, profile_questions: updated });
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">Required</span>
                        </label>
                      </div>
                      {(q.type === 'select' || q.type === 'multiselect') && (
                        <input
                          type="text"
                          value={q.options?.join(', ') || ''}
                          onChange={(e) => {
                            const updated = [...(project.profile_questions || [])];
                            updated[index] = { ...q, options: e.target.value.split(',').map(o => o.trim()) };
                            onUpdateProject({ ...project, profile_questions: updated });
                          }}
                          placeholder="Options (comma separated)"
                          className="w-full px-3 py-2 rounded border text-sm mt-2"
                          style={{ borderColor: 'var(--border-light)' }}
                        />
                      )}
                    </div>
                    <button
                      onClick={() => {
                        const updated = (project.profile_questions || []).filter((_, i) => i !== index);
                        onUpdateProject({ ...project, profile_questions: updated });
                      }}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => {
                  const newQuestion = {
                    id: `q_${Date.now()}`,
                    question: '',
                    type: 'text' as const,
                    required: false
                  };
                  onUpdateProject({ 
                    ...project, 
                    profile_questions: [...(project.profile_questions || []), newQuestion] 
                  });
                }}
                className="w-full py-3 rounded-lg border-2 border-dashed text-sm font-medium transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
              >
                + Add Profile Question
              </button>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {project.notification_enabled && (
          <div>
            <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Clock size={20} />
              Notification Schedule
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Reminder Frequency
                </label>
                <CustomDropdown
                  options={[
                    { value: 'hourly', label: 'Hourly' },
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'biweekly', label: 'Bi-weekly' },
                    { value: 'monthly', label: 'Monthly' }
                  ]}
                  value={project.notification_settings?.frequency || 'daily'}
                  onChange={(value) => onUpdateProject({ 
                    ...project, 
                    notification_settings: { ...project.notification_settings, frequency: value }
                  })}
                  placeholder="Select frequency"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Reminder Time
                </label>
                <input
                  type="time"
                  value={project.notification_settings?.time || '09:00'}
                  onChange={(e) => onUpdateProject({ 
                    ...project, 
                    notification_settings: { ...project.notification_settings, time: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border-light)' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveySettings;
