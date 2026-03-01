import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Plus, Calendar, TrendingUp } from 'lucide-react';
import ParticipantOnboarding from './ParticipantOnboarding';

interface SurveyProject { id: string; title: string; description: string; consent_required?: boolean; consent_form_title?: string; consent_form_text?: string; project_type?: string; onboarding_required?: boolean; onboarding_instruction?: string; study_duration?: number; survey_frequency?: string; }

const LongitudinalSurveyView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<SurveyProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'summary' | 'settings'>('timeline');

  useEffect(() => { if (projectId) loadProject(); }, [projectId]);

  const loadProject = async () => {
    try {
      const { data: project } = await supabase.from('research_project').select('*').eq('id', projectId).maybeSingle();
      if (project) {
        setProject(project as any);
        let existingEnrollmentId = localStorage.getItem(`enrollment_${projectId}`);
        if (existingEnrollmentId) {
          const { data: enrollment } = await supabase.from('enrollment').select('*').eq('id', existingEnrollmentId).maybeSingle();
          if (enrollment) { setEnrollmentId(enrollment.id); setShowOnboarding(false); }
          else existingEnrollmentId = null;
        }
        if (!existingEnrollmentId) {
          if (project.onboarding_required) setShowOnboarding(true);
          else {
            const { data: newEnrollment } = await supabase.from('enrollment').insert({ project_id: projectId, participant_id: user?.id || null, participant_email: user?.email || 'anonymous@participant.com', status: 'active' }).select().single();
            if (newEnrollment) { setEnrollmentId(newEnrollment.id); localStorage.setItem(`enrollment_${projectId}`, newEnrollment.id); }
            setShowOnboarding(false);
          }
        }
      }
    } catch (error) { console.error('Error loading project:', error); }
    finally { setLoading(false); }
  };

  const handleOnboardingComplete = () => { setShowOnboarding(false); loadProject(); };
  const handleAddEntry = () => { navigate(`/easyresearch/participant/${projectId}`); };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50/50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-stone-50/50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-bold text-stone-800 mb-1">Study Not Found</h2>
          <p className="text-[13px] text-stone-400 font-light">This study may have ended.</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <ParticipantOnboarding projectId={projectId!} onComplete={handleOnboardingComplete} />;
  }

  const tabs = [
    { key: 'timeline' as const, label: 'Entries' },
    { key: 'summary' as const, label: 'Summary' },
    { key: 'settings' as const, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-stone-50/50 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-stone-800">{project.title}</h1>
          <p className="text-[13px] text-stone-400 font-light mt-1">{project.description}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-stone-100 rounded-full p-1">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                activeTab === tab.key ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <button onClick={handleAddEntry}
              className="w-full bg-white rounded-2xl border-2 border-dashed border-emerald-200 p-5 flex items-center justify-center gap-2 hover:bg-emerald-50/50 transition-colors">
              <Plus size={18} className="text-emerald-500" />
              <span className="text-[13px] font-medium text-emerald-500">Add New Entry</span>
            </button>
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <h3 className="text-[14px] font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-emerald-500" /> Your Entries
              </h3>
              <p className="text-center py-6 text-[13px] text-stone-400 font-light">No entries yet. Click "Add New Entry" to start.</p>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <h3 className="text-[14px] font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" /> Progress Summary
            </h3>
            <p className="text-[13px] text-stone-400 font-light">Your responses and progress will appear here.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <h3 className="text-[14px] font-semibold text-stone-800 mb-4">Study Information</h3>
              <div className="space-y-3">
                {[
                  { label: 'Duration', value: `${project?.study_duration || 7} days` },
                  { label: 'Frequency', value: project?.survey_frequency?.replace('_', ' ') || 'Daily' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                    <span className="text-[12px] text-stone-400 font-light">{item.label}</span>
                    <span className="text-[13px] font-medium text-stone-700">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LongitudinalSurveyView;
