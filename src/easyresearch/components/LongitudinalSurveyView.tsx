import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Plus, Calendar, TrendingUp } from 'lucide-react';
import ParticipantOnboarding from './ParticipantOnboarding';

interface SurveyProject {
  id: string;
  title: string;
  description: string;
  consent_form: any;
  settings: any;
  project_type?: string;
  onboarding_required?: boolean;
  onboarding_instructions?: string;
  study_duration?: number;
  survey_frequency?: string;
}

const LongitudinalSurveyView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<SurveyProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'summary' | 'settings'>('timeline');

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const { data: project } = await supabase
        .from('research_project')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (project) {
        setProject({
          ...(project as any),
          settings: (project as any).settings ?? (project as any).setting,
          onboarding_instructions: (project as any).onboarding_instructions ?? (project as any).onboarding_instruction,
        });

        let existingEnrollmentId = localStorage.getItem(`enrollment_${projectId}`);
        
        if (existingEnrollmentId) {
          const { data: enrollment } = await supabase
            .from('enrollment')
            .select('*')
            .eq('id', existingEnrollmentId)
            .maybeSingle();

          if (enrollment) {
            setEnrollmentId(enrollment.id);
            setShowOnboarding(false);
          } else {
            existingEnrollmentId = null;
          }
        }
        
        if (!existingEnrollmentId) {
          if (project.onboarding_required) {
            setShowOnboarding(true);
          } else {
            // No enrollment and no onboarding required - create enrollment automatically
            const { data: newEnrollment } = await supabase
              .from('enrollment')
              .insert({
                project_id: projectId,
                participant_id: user?.id || null,
                participant_email: user?.email || 'anonymous@participant.com',
                status: 'active'
              })
              .select()
              .single();
            
            if (newEnrollment) {
              setEnrollmentId(newEnrollment.id);
              localStorage.setItem(`enrollment_${projectId}`, newEnrollment.id);
            }
            setShowOnboarding(false);
          }
        }
      }
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    loadProject();
  };

  const handleAddEntry = () => {
    navigate(`/easyresearch/participant/${projectId}/dashboard`);
  };

  const renderSettingsTab = () => {
    const enrollmentId = localStorage.getItem(`enrollment_${projectId}`);
    const startDate = enrollmentId ? new Date().toLocaleDateString() : 'Not started';
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Study Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Study Duration</p>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {project?.study_duration || 7} days
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Survey Frequency</p>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {project?.survey_frequency?.replace('_', ' ') || 'Daily'}
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Start Date</p>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {startDate}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Notification Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Survey Notifications</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Receive reminders for scheduled surveys</p>
              </div>
              <button className="w-12 h-6 rounded-full" style={{ backgroundColor: 'var(--color-green)' }}>
                <div className="w-5 h-5 bg-white rounded-full ml-6"></div>
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Do Not Disturb
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Set times when you don't want to receive survey notifications
          </p>
          <button className="px-4 py-2 rounded-lg border font-medium" style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}>
            Add DND Period
          </button>
        </div>
      </div>
    );
  };

  const renderSummaryTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <TrendingUp size={24} style={{ color: 'var(--color-green)' }} />
          Progress Summary
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>Your survey responses and progress will appear here.</p>
      </div>
    </div>
  );

  const renderTimelineTab = () => (
    <div className="space-y-6">
      <button
        onClick={handleAddEntry}
        className="w-full bg-white rounded-2xl p-6 flex items-center justify-center gap-3 hover:shadow-lg transition-shadow"
        style={{ border: '2px dashed var(--color-green)' }}
      >
        <Plus size={24} style={{ color: 'var(--color-green)' }} />
        <span className="font-semibold" style={{ color: 'var(--color-green)' }}>
          Add New Entry
        </span>
      </button>

      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Calendar size={24} style={{ color: 'var(--color-green)' }} />
          Your Entries
        </h3>
        <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
          No entries yet. Click "Add New Entry" to get started.
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-green)' }}></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Study Not Found
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            This study may have ended or been removed.
          </p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <>
        <ParticipantOnboarding projectId={projectId!} onComplete={handleOnboardingComplete} />
      </>
    );
  }

  return (
    <>
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {project.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
        </div>

        <div className="flex gap-4 mb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <button
            onClick={() => setActiveTab('timeline')}
            className="px-6 py-3 font-semibold transition-all"
            style={{
              color: activeTab === 'timeline' ? 'var(--color-green)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'timeline' ? '2px solid var(--color-green)' : '2px solid transparent'
            }}
          >
            Entries
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className="px-6 py-3 font-semibold transition-all"
            style={{
              color: activeTab === 'summary' ? 'var(--color-green)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'summary' ? '2px solid var(--color-green)' : '2px solid transparent'
            }}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className="px-6 py-3 font-semibold transition-all"
            style={{
              color: activeTab === 'settings' ? 'var(--color-green)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'settings' ? '2px solid var(--color-green)' : '2px solid transparent'
            }}
          >
            Settings
          </button>
        </div>

        {activeTab === 'timeline' && renderTimelineTab()}
        {activeTab === 'summary' && renderSummaryTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
    </>
  );
};

export default LongitudinalSurveyView;
